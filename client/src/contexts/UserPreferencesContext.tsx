import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
];

export interface TimezoneOption {
  value: string;
  label: string;
  city: string;
  offset: string;
  market: string;
}

export const SUPPORTED_TIMEZONES: TimezoneOption[] = [
  { value: "Asia/Dhaka", label: "Dhaka (BST, UTC+6)", city: "Dhaka", offset: "+06:00", market: "Local Market" },
  { value: "UTC", label: "UTC (London Winter, UTC+0)", city: "London/UTC", offset: "+00:00", market: "Forex Benchmark" },
  { value: "America/New_York", label: "New York (EST/EDT, UTC-5)", city: "New York", offset: "-05:00", market: "NYSE / Wall Street" },
  { value: "Europe/London", label: "London (GMT/BST, UTC+0/1)", city: "London", offset: "+00:00", market: "LSE / London Session" },
  { value: "Asia/Tokyo", label: "Tokyo (JST, UTC+9)", city: "Tokyo", offset: "+09:00", market: "TSE / Asian Session" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)", city: "Singapore", offset: "+08:00", market: "Asian Forex Center" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)", city: "Dubai", offset: "+04:00", market: "Gulf Financial Hub" },
  { value: "Asia/Kolkata", label: "Mumbai / India (IST, UTC+5:30)", city: "Mumbai", offset: "+05:30", market: "NSE / India" },
  { value: "Europe/Berlin", label: "Frankfurt / Berlin (CET, UTC+1)", city: "Frankfurt", offset: "+01:00", market: "Frankfurt / ECB" },
  { value: "Australia/Sydney", label: "Sydney (AEST, UTC+10)", city: "Sydney", offset: "+10:00", market: "ASX / Sydney Session" },
];

interface UserPreferencesContextType {
  timezone: string;
  setTimezone: (tz: string) => Promise<void>;
  currency: string;
  setCurrency: (cur: string) => Promise<void>;
  currentCurrency: CurrencyConfig;
  currentTimezone: TimezoneOption;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, customDecimals?: number) => string;
  allTimezones: TimezoneOption[];
  allCurrencies: CurrencyConfig[];
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const DEFAULT_TIMEZONE = "Asia/Dhaka";
const DEFAULT_CURRENCY = "BDT";

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TIMEZONE;
    return localStorage.getItem("cycle_user_timezone") || DEFAULT_TIMEZONE;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_CURRENCY;
    return localStorage.getItem("cycle_user_currency") || DEFAULT_CURRENCY;
  });

  const updatePreferencesMutation = trpc.auth.updatePreferences.useMutation();

  // Load preferences from backend when user logs in
  const settingsQuery = trpc.auth.getSettings.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (settingsQuery.data?.preferences) {
      const serverTz = settingsQuery.data.preferences.timezone;
      const serverCur = settingsQuery.data.preferences.currency;
      if (serverTz && SUPPORTED_TIMEZONES.some((t) => t.value === serverTz)) {
        setTimezoneState(serverTz);
        localStorage.setItem("cycle_user_timezone", serverTz);
      }
      if (serverCur && SUPPORTED_CURRENCIES.some((c) => c.code === serverCur)) {
        setCurrencyState(serverCur);
        localStorage.setItem("cycle_user_currency", serverCur);
      }
    }
  }, [settingsQuery.data]);

  const setTimezone = useCallback(
    async (tz: string) => {
      setTimezoneState(tz);
      localStorage.setItem("cycle_user_timezone", tz);
      if (user) {
        try {
          await updatePreferencesMutation.mutateAsync({ timezone: tz });
          await utils.auth.getSettings.invalidate();
        } catch (e) {
          console.warn("[Failed to sync timezone with backend]:", e);
        }
      }
    },
    [user, updatePreferencesMutation, utils]
  );

  const setCurrency = useCallback(
    async (cur: string) => {
      setCurrencyState(cur);
      localStorage.setItem("cycle_user_currency", cur);
      if (user) {
        try {
          await updatePreferencesMutation.mutateAsync({ currency: cur });
          await utils.auth.getSettings.invalidate();
        } catch (e) {
          console.warn("[Failed to sync currency with backend]:", e);
        }
      }
    },
    [user, updatePreferencesMutation, utils]
  );

  const currentCurrency = useMemo(() => {
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === currency) ||
      SUPPORTED_CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY)!
    );
  }, [currency]);

  const currentTimezone = useMemo(() => {
    return (
      SUPPORTED_TIMEZONES.find((t) => t.value === timezone) ||
      SUPPORTED_TIMEZONES.find((t) => t.value === DEFAULT_TIMEZONE)!
    );
  }, [timezone]);

  const formatTime = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === "object" ? date : new Date(date);
        return new Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          ...options,
        }).format(d);
      } catch (err) {
        return String(date);
      }
    },
    [timezone]
  );

  const formatCurrency = useCallback(
    (amount: number, customDecimals?: number): string => {
      const decimals =
        customDecimals !== undefined
          ? customDecimals
          : currentCurrency.code === "BDT" || currentCurrency.code === "INR"
          ? 0
          : 2;
      const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount);
      return `${currentCurrency.symbol} ${formatted}`;
    },
    [currentCurrency]
  );

  return (
    <UserPreferencesContext.Provider
      value={{
        timezone,
        setTimezone,
        currency,
        setCurrency,
        currentCurrency,
        currentTimezone,
        formatTime,
        formatCurrency,
        allTimezones: SUPPORTED_TIMEZONES,
        allCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}
