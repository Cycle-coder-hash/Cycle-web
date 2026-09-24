import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  ACTIVE_LANGUAGES,
  SupportedLanguage,
  TextDirection,
  CountryLanguageOption,
  COUNTRY_LANGUAGE_OPTIONS,
  DEFAULT_LANGUAGE,
  DEFAULT_OPTION_ID,
  isSupportedLanguage,
  normalizeLanguage,
  getOptionByLanguage,
  getOptionById,
} from "../i18n/types";
import { LOCALES_MAP } from "../i18n/locales";

interface LanguageContextType {
  currentOption: CountryLanguageOption;
  language: SupportedLanguage;
  dir: TextDirection;
  isRTL: boolean;
  setCountryLanguage: (optionId: string) => void;
  setLanguage: (lang: string) => void;
  t: (path: string, fallback?: string) => string;
  allOptions: CountryLanguageOption[];
  activeLanguages: readonly ["bn", "en", "ur"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to sanitize cookie values
function sanitizeCookies() {
  if (typeof document === "undefined") return;
  const cookieNames = ["cycle-language", "cycle_language", "language", "locale", "i18nextLng"];
  for (const name of cookieNames) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
    if (match) {
      const val = decodeURIComponent(match[3]).toLowerCase();
      if (!ACTIVE_LANGUAGES.includes(val as any)) {
        // Clear or normalize unsupported language cookie
        document.cookie = `${name}=en; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  }
}

function resolveInitialOptionId(): string {
  if (typeof window === "undefined") return DEFAULT_OPTION_ID;

  // 1. Check URL parameters for explicit language/locale
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang") || params.get("locale");
    if (urlLang) {
      const normalized = normalizeLanguage(urlLang);
      const matched = COUNTRY_LANGUAGE_OPTIONS.find((o) => o.langCode === normalized || o.id === urlLang);
      if (matched) return matched.id;
    }
  } catch (e) {
    // Ignore URL parse failure
  }

  // 2. Check localStorage for country selection
  try {
    const storedCountryId = localStorage.getItem("cycle_selected_country");
    if (storedCountryId && COUNTRY_LANGUAGE_OPTIONS.some((o) => o.id === storedCountryId)) {
      return storedCountryId;
    }

    const legacyLang = localStorage.getItem("cycle-language");
    if (legacyLang) {
      const normalized = normalizeLanguage(legacyLang);
      const match = COUNTRY_LANGUAGE_OPTIONS.find((o) => o.langCode === normalized);
      if (match) return match.id;
    }
  } catch (e) {
    // Ignore storage failure
  }

  return DEFAULT_OPTION_ID;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentOptionId, setCurrentOptionId] = useState<string>(resolveInitialOptionId);

  const currentOption = useMemo(() => {
    return getOptionById(currentOptionId);
  }, [currentOptionId]);

  const language = currentOption.langCode;
  const dir = currentOption.dir;
  const isRTL = dir === "rtl";

  // Enforce DOM, cookies, and localStorage normalization
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      if (isRTL) {
        document.documentElement.classList.add("direction-rtl");
      } else {
        document.documentElement.classList.remove("direction-rtl");
      }
    }

    try {
      localStorage.setItem("cycle_selected_country", currentOption.id);
      localStorage.setItem("cycle-language", language);
      // Clean up any legacy or unsupported keys
      const legacyKeys = ["i18nextLng", "user-locale", "lang"];
      for (const k of legacyKeys) {
        const val = localStorage.getItem(k);
        if (val && !ACTIVE_LANGUAGES.includes(val as any)) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      // Storage unavailable
    }

    sanitizeCookies();
  }, [currentOption, language, dir, isRTL]);

  const setCountryLanguage = useCallback((optionId: string) => {
    const exists = COUNTRY_LANGUAGE_OPTIONS.some((o) => o.id === optionId);
    if (exists) {
      setCurrentOptionId(optionId);
    } else {
      // Fallback safely to English if unsupported option passed
      setCurrentOptionId(DEFAULT_OPTION_ID);
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    const normalized = normalizeLanguage(lang);
    const opt = getOptionByLanguage(normalized);
    setCurrentOptionId(opt.id);
  }, []);

  const getNestedValue = (obj: any, path: string): string | undefined => {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") {
        return undefined;
      }
      current = current[part];
    }
    return typeof current === "string" ? current : undefined;
  };

  const t = useCallback(
    (path: string, fallback?: string): string => {
      const currentLocale = LOCALES_MAP[language] || LOCALES_MAP.en;
      const translated = getNestedValue(currentLocale, path);
      if (translated) return translated;

      // Fallback to English
      const enVal = getNestedValue(LOCALES_MAP.en, path);
      if (enVal) return enVal;

      return fallback !== undefined ? fallback : path;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      currentOption,
      language,
      dir,
      isRTL,
      setCountryLanguage,
      setLanguage,
      t,
      allOptions: COUNTRY_LANGUAGE_OPTIONS,
      activeLanguages: ACTIVE_LANGUAGES,
    }),
    [currentOption, language, dir, isRTL, setCountryLanguage, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
