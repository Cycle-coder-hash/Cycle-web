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

  it("verifies ACTIVE_LANGUAGES constant contains strictly [bn, en, ur]", async () => {
    const { ACTIVE_LANGUAGES, isSupportedLanguage, normalizeLanguage } = await import("../client/src/i18n/types");
    expect(ACTIVE_LANGUAGES).toEqual(["bn", "en", "ur"]);

    expect(isSupportedLanguage("bn")).toBe(true);
    expect(isSupportedLanguage("en")).toBe(true);
    expect(isSupportedLanguage("ur")).toBe(true);
    expect(isSupportedLanguage("es")).toBe(false);
    expect(isSupportedLanguage("ar")).toBe(false);
    expect(isSupportedLanguage("fr")).toBe(false);

    expect(normalizeLanguage("bn")).toBe("bn");
    expect(normalizeLanguage("Bangla")).toBe("bn");
    expect(normalizeLanguage("bd-bn")).toBe("bn");
    expect(normalizeLanguage("ur")).toBe("ur");
    expect(normalizeLanguage("Urdu")).toBe("ur");
    expect(normalizeLanguage("pk-ur")).toBe("ur");
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage("English")).toBe("en");
    expect(normalizeLanguage("us-en")).toBe("en");

    // Unsupported languages must normalize safely to English
    expect(normalizeLanguage("es")).toBe("en");
    expect(normalizeLanguage("spanish")).toBe("en");
    expect(normalizeLanguage("ar")).toBe("en");
    expect(normalizeLanguage("arabic")).toBe("en");
    expect(normalizeLanguage("hi")).toBe("en");
    expect(normalizeLanguage("hindi")).toBe("en");
    expect(normalizeLanguage("invalid_code")).toBe("en");
    expect(normalizeLanguage(null)).toBe("en");
    expect(normalizeLanguage(undefined)).toBe("en");
  });

  it("verifies server normalizeUserLanguage normalizes unsupported languages to en", async () => {
    const { normalizeUserLanguage } = await import("./db");
    expect(normalizeUserLanguage("bn")).toBe("bn");
    expect(normalizeUserLanguage("ur")).toBe("ur");
    expect(normalizeUserLanguage("en")).toBe("en");
    expect(normalizeUserLanguage("es")).toBe("en");
    expect(normalizeUserLanguage("ar")).toBe("en");
    expect(normalizeUserLanguage("fr")).toBe("en");
    expect(normalizeUserLanguage("hi")).toBe("en");
    expect(normalizeUserLanguage(null)).toBe("en");
    expect(normalizeUserLanguage(undefined)).toBe("en");
  }, 15000);

  it("verifies complete translation key symmetry between bn, en, and ur without missing keys", () => {
    function getKeys(obj: any, prefix = ""): string[] {
      let keys: string[] = [];
      for (const k of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof obj[k] === "object" && obj[k] !== null) {
          keys = keys.concat(getKeys(obj[k], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    const enKeys = getKeys(LOCALES_MAP.en);
    const bnKeys = getKeys(LOCALES_MAP.bn);
    const urKeys = getKeys(LOCALES_MAP.ur);

    expect(bnKeys).toEqual(enKeys);
    expect(urKeys).toEqual(enKeys);
  });
});
