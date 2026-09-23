import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  SupportedLanguage,
  TextDirection,
  CountryLanguageOption,
  COUNTRY_LANGUAGE_OPTIONS,
  TranslationSchema,
} from "../i18n/types";
import { LOCALES_MAP } from "../i18n/locales";

interface LanguageContextType {
  currentOption: CountryLanguageOption;
  language: SupportedLanguage;
  dir: TextDirection;
  isRTL: boolean;
  setCountryLanguage: (optionId: string) => void;
  t: (path: string, fallback?: string) => string;
  allOptions: CountryLanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_OPTION_ID = "us-en";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentOptionId, setCurrentOptionId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_OPTION_ID;

    const storedCountryId = localStorage.getItem("cycle_selected_country");
    if (storedCountryId && COUNTRY_LANGUAGE_OPTIONS.some((o) => o.id === storedCountryId)) {
      return storedCountryId;
    }

    const legacyLang = localStorage.getItem("cycle-language");
    if (legacyLang) {
      const match = COUNTRY_LANGUAGE_OPTIONS.find((o) => o.langCode === legacyLang);
      if (match) return match.id;
    }

    return DEFAULT_OPTION_ID;
  });

  const currentOption = useMemo(() => {
    return (
      COUNTRY_LANGUAGE_OPTIONS.find((o) => o.id === currentOptionId) ||
      COUNTRY_LANGUAGE_OPTIONS.find((o) => o.id === DEFAULT_OPTION_ID)!
    );
  }, [currentOptionId]);

  const language = currentOption.langCode;
  const dir = currentOption.dir;
  const isRTL = dir === "rtl";

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
    localStorage.setItem("cycle_selected_country", currentOption.id);
    localStorage.setItem("cycle-language", language);
  }, [currentOption, language, dir, isRTL]);

  const setCountryLanguage = useCallback((optionId: string) => {
    const exists = COUNTRY_LANGUAGE_OPTIONS.some((o) => o.id === optionId);
    if (exists) {
      setCurrentOptionId(optionId);
    }
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
      t,
      allOptions: COUNTRY_LANGUAGE_OPTIONS,
    }),
    [currentOption, language, dir, isRTL, setCountryLanguage, t]
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
