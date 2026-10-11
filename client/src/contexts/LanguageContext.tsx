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
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export interface LanguageContextType {
  currentOption: CountryLanguageOption;
  language: SupportedLanguage;
  dir: TextDirection;
  isRTL: boolean;
  isBn: boolean;
  isUr: boolean;
  isEn: boolean;
  setCountryLanguage: (optionId: string) => void;
  setLanguage: (lang: string) => void;
  t: (path: string, fallback?: string) => string;
  selectText: <T = string>(options: { en: T; bn?: T; ur?: T }) => T;
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
  const { user } = useAuth();
  const [currentOptionId, setCurrentOptionId] = useState<string>(resolveInitialOptionId);

  const settingsQuery = trpc.auth.getSettings.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const updatePreferencesMutation = trpc.auth.updatePreferences.useMutation();

  const currentOption = useMemo(() => {
    return getOptionById(currentOptionId);
  }, [currentOptionId]);

  const language = currentOption.langCode;
  const dir = currentOption.dir;
  const isRTL = dir === "rtl";
  const isBn = language === "bn";
  const isUr = language === "ur";
  const isEn = language === "en";

  // Sync server preference when user logs in or settings query data arrives
  useEffect(() => {
    if (settingsQuery.data?.preferences?.language) {
      const serverLang = settingsQuery.data.preferences.language;
      const normalized = normalizeLanguage(serverLang);
      const opt = getOptionByLanguage(normalized);
      if (opt && opt.id !== currentOptionId) {
        setCurrentOptionId(opt.id);
      }
    }
  }, [settingsQuery.data?.preferences?.language, currentOptionId]);

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

  const setCountryLanguage = useCallback(
    (optionId: string) => {
      const exists = COUNTRY_LANGUAGE_OPTIONS.some((o) => o.id === optionId);
      const targetId = exists ? optionId : DEFAULT_OPTION_ID;
      setCurrentOptionId(targetId);
      const opt = getOptionById(targetId);
      if (user) {
        updatePreferencesMutation.mutate({ language: opt.langCode });
      }
    },
    [user, updatePreferencesMutation]
  );

  const setLanguage = useCallback(
    (lang: string) => {
      const normalized = normalizeLanguage(lang);
      const opt = getOptionByLanguage(normalized);
      setCurrentOptionId(opt.id);
      if (user) {
        updatePreferencesMutation.mutate({ language: opt.langCode });
      }
    },
    [user, updatePreferencesMutation]
  );

  const selectText = useCallback(
    <T = string,>(options: { en: T; bn?: T; ur?: T }): T => {
      if (language === "bn") {
        return options.bn !== undefined && options.bn !== null ? options.bn : options.en;
      }
      if (language === "ur") {
        return options.ur !== undefined && options.ur !== null ? options.ur : options.en;
      }
      return options.en;
    },
    [language]
  );

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
      isBn,
      isUr,
      isEn,
      setCountryLanguage,
      setLanguage,
      t,
      selectText,
      allOptions: COUNTRY_LANGUAGE_OPTIONS,
      activeLanguages: ACTIVE_LANGUAGES,
    }),
    [
      currentOption,
      language,
      dir,
      isRTL,
      isBn,
      isUr,
      isEn,
      setCountryLanguage,
      setLanguage,
      t,
      selectText,
    ]
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
