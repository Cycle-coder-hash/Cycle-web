import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { hashPassword } from "./_core/password";
import { upsertUser, getUserByOpenId } from "./db";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

describe("Settings System & API Procedures", () => {
  it(
    "manages user profile, username uniqueness, preferences, password change and global logout",
    async () => {
      const clearedCookies: CookieCall[] = [];
      const testOpenId = `usr_settings_${Date.now()}`;
      const testEmail = `settings_test_${Date.now()}@example.com`;
      const initialPassword = "initial_password_123";
      const initialHash = hashPassword(initialPassword);

      await upsertUser({
        openId: testOpenId,
        name: "Initial Student",
        email: testEmail,
        passwordHash: initialHash,
        emailVerified: true,
        role: "user",
        language: "en",
      });

      const createdUser = (await getUserByOpenId(testOpenId))!;

      const ctx: TrpcContext = {
        user: createdUser,
        req: {
          protocol: "https",
          headers: {},
        } as any,
        res: {
          clearCookie: (name: string, options: Record<string, unknown>) => {
            clearedCookies.push({ name, options });
          },
        } as any,
      };

      const caller = appRouter.createCaller(ctx);

      // 1. Check initial getSettings
      const initialSettings = await caller.auth.getSettings();
      expect(initialSettings.name).toBe("Initial Student");
      expect(initialSettings.email).toBe(testEmail);
      expect(initialSettings.preferences).toBeDefined();

      // 2. Check username availability
      const uniqueUsername = `trader_${Date.now().toString(36)}`;
      const checkResult = await caller.auth.checkUsername({ username: uniqueUsername });
      expect(checkResult.available).toBe(true);

      // 3. Update profile with new name, username, and custom avatar
      await caller.auth.updateProfile({
        name: "Institutional Trader Pro",
        username: uniqueUsername,
        avatar: "https://example.com/avatar1.webp",
      });

      const updatedSettings = await caller.auth.getSettings();
      expect(updatedSettings.name).toBe("Institutional Trader Pro");
      expect(updatedSettings.username).toBe(uniqueUsername);
      expect(updatedSettings.avatar).toBe("https://example.com/avatar1.webp");

      // 4. Test username uniqueness enforcement:
      // Create another user and attempt to claim the exact same username
      const anotherOpenId = `usr_another_${Date.now()}`;
      await upsertUser({
        openId: anotherOpenId,
        name: "Another Trader",
        email: `another_${Date.now()}@example.com`,
        passwordHash: initialHash,
        emailVerified: true,
        role: "user",
        language: "en",
      });
      const anotherUser = (await getUserByOpenId(anotherOpenId))!;

      const anotherCaller = appRouter.createCaller({
        ...ctx,
        user: anotherUser,
      });

      const anotherCheck = await anotherCaller.auth.checkUsername({ username: uniqueUsername });
      expect(anotherCheck.available).toBe(false);
      expect(anotherCheck.reason).toContain("already taken");

      await expect(
        anotherCaller.auth.updateProfile({ username: uniqueUsername })
      ).rejects.toThrow();

      // 5. Test Avatar Removal (null)
      await caller.auth.updateProfile({ avatar: null });
      const settingsAfterRemoval = await caller.auth.getSettings();
      expect(settingsAfterRemoval.avatar).toBeNull();

      // 6. Test Preferences (Timezone and Currency)
      await caller.auth.updatePreferences({
        timezone: "America/New_York",
        currency: "USD",
        theme: "dark",
      });
      const prefSettings = await caller.auth.getSettings();
      expect(prefSettings.preferences.timezone).toBe("America/New_York");
      expect(prefSettings.preferences.currency).toBe("USD");
      expect(prefSettings.preferences.theme).toBe("dark");

      // 7. Test Password Change
      // Reject wrong current password
      await expect(
        caller.auth.changePassword({
          currentPassword: "wrong_password_999",
          newPassword: "new_secure_password_456",
        })
      ).rejects.toThrow("Current password is incorrect");

      // Accept valid current password
      const pwResult = await caller.auth.changePassword({
        currentPassword: initialPassword,
        newPassword: "new_secure_password_456",
      });
      expect(pwResult.success).toBe(true);

      // Verify password was changed on user account
      const userInDb = await getUserByOpenId(testOpenId);
      expect(userInDb?.passwordHash).not.toBe(initialHash);

      // 8. Test Logout From All Devices
      const logoutAllResult = await caller.auth.logoutAllDevices();
      expect(logoutAllResult.success).toBe(true);
      expect(clearedCookies.some((c) => c.name === COOKIE_NAME)).toBe(true);
    },
    60000
  );
});
