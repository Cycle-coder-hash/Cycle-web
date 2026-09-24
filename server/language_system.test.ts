import { describe, expect, it } from "vitest";
import { COUNTRY_LANGUAGE_OPTIONS, SupportedLanguage } from "../client/src/i18n/types";
import { LOCALES_MAP } from "../client/src/i18n/locales";

describe("Language System Integrity (Bangla, English, Urdu Only)", () => {
  it("contains strictly 3 active language options in COUNTRY_LANGUAGE_OPTIONS", () => {
    expect(COUNTRY_LANGUAGE_OPTIONS).toHaveLength(3);

    const langCodes = COUNTRY_LANGUAGE_OPTIONS.map((o) => o.langCode);
    expect(langCodes).toEqual(["bn", "en", "ur"]);

    const ids = COUNTRY_LANGUAGE_OPTIONS.map((o) => o.id);
    expect(ids).toEqual(["bd-bn", "us-en", "pk-ur"]);
  });

  it("verifies Bangla (বাংলা) configuration", () => {
    const bnOption = COUNTRY_LANGUAGE_OPTIONS.find((o) => o.langCode === "bn");
    expect(bnOption).toBeDefined();
    expect(bnOption?.countryName).toBe("Bangladesh");
    expect(bnOption?.langName).toBe("Bangla");
    expect(bnOption?.nativeName).toBe("বাংলা");
    expect(bnOption?.flag).toBe("🇧🇩");
    expect(bnOption?.dir).toBe("ltr");
  });

  it("verifies English configuration", () => {
    const enOption = COUNTRY_LANGUAGE_OPTIONS.find((o) => o.langCode === "en");
    expect(enOption).toBeDefined();
    expect(enOption?.langName).toBe("English");
    expect(enOption?.nativeName).toBe("English");
    expect(enOption?.dir).toBe("ltr");
  });

  it("verifies Urdu (اردو) configuration and RTL text direction", () => {
    const urOption = COUNTRY_LANGUAGE_OPTIONS.find((o) => o.langCode === "ur");
    expect(urOption).toBeDefined();
    expect(urOption?.countryName).toBe("Pakistan");
    expect(urOption?.langName).toBe("Urdu");
    expect(urOption?.nativeName).toBe("اردو");
    expect(urOption?.flag).toBe("🇵🇰");
    expect(urOption?.dir).toBe("rtl");
  });

  it("verifies LOCALES_MAP has full translation schemas for bn, en, and ur", () => {
    const mappedLangs = Object.keys(LOCALES_MAP);
    expect(mappedLangs.sort()).toEqual(["bn", "en", "ur"].sort());

    const requiredSections = [
      "nav",
      "hero",
      "shift",
      "roadmap",
      "freeBasics",
      "store",
      "platforms",
      "founder",
      "footer",
      "dashboard",
      "journal",
      "discipline",
      "auth",
      "support",
      "common",
    ];

    for (const code of ["bn", "en", "ur"] as SupportedLanguage[]) {
      const locale = LOCALES_MAP[code];
      expect(locale).toBeDefined();
      for (const sec of requiredSections) {
        expect(locale[sec as keyof typeof locale]).toBeDefined();
      }
      expect(locale.nav.roadmap.length).toBeGreaterThan(0);
      expect(locale.nav.dashboard.length).toBeGreaterThan(0);
      expect(locale.hero.title.length).toBeGreaterThan(0);
    }
  });

  it("ensures all other 15 languages are completely removed and unavailable", () => {
    const removedCodes = ["hi", "ar", "es", "fr", "de", "it", "ja", "ru", "zh", "ko", "pt", "tr", "id", "th", "vi"];
    for (const code of removedCodes) {
      expect(COUNTRY_LANGUAGE_OPTIONS.some((o) => o.langCode === (code as any))).toBe(false);
      expect((LOCALES_MAP as any)[code]).toBeUndefined();
    }
  });
});
