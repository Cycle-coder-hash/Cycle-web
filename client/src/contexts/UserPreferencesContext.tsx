import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateAgainstUsd: number;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩", rateAgainstUsd: 122 },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rateAgainstUsd: 1 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰", rateAgainstUsd: 280 },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rateAgainstUsd: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rateAgainstUsd: 0.78 },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪", rateAgainstUsd: 3.67 },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦", rateAgainstUsd: 3.75 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rateAgainstUsd: 87 },
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
  { value: "Asia/Karachi", label: "Karachi / Pakistan (PKT, UTC+5)", city: "Karachi", offset: "+05:00", market: "PSX / Pakistan" },
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
  setTimezone: (tz: string | null) => Promise<void>;
  manualTimezone: string | null;
  isAutoTimezone: boolean;
  deviceTimezone: string;
  currency: string;
  setCurrency: (cur: string) => Promise<void>;
  currentCurrency: CurrencyConfig;
  currentTimezone: TimezoneOption;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, customDecimals?: number) => string;
  convertAmount: (amount: number, fromCurrency?: "USD" | "BDT") => number;
  formatPrice: (params: { bdt?: number | string; usd?: number | string; fallback?: string }) => string;
  allTimezones: TimezoneOption[];
  allCurrencies: CurrencyConfig[];
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const DEFAULT_CURRENCY = "BDT";

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const deviceTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const [manualTimezone, setManualTimezoneState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("cycle_user_timezone");
    return stored && stored !== "auto" ? stored : null;
  });

  const timezone = manualTimezone || deviceTimezone;
  const isAutoTimezone = !manualTimezone;

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
      if (serverTz && serverTz !== "auto") {
        setManualTimezoneState(serverTz);
        localStorage.setItem("cycle_user_timezone", serverTz);
      } else if (serverTz === null || serverTz === "auto") {
        setManualTimezoneState(null);
        localStorage.removeItem("cycle_user_timezone");
      }
      if (serverCur && SUPPORTED_CURRENCIES.some((c) => c.code === serverCur)) {
        setCurrencyState(serverCur);
        localStorage.setItem("cycle_user_currency", serverCur);
      }
    }
  }, [settingsQuery.data]);

  const setTimezone = useCallback(
    async (tz: string | null) => {
      const isAuto = tz === null || tz === "auto" || tz === "";
      if (isAuto) {
        setManualTimezoneState(null);
        localStorage.removeItem("cycle_user_timezone");
      } else {
        setManualTimezoneState(tz);
        localStorage.setItem("cycle_user_timezone", tz);
      }

      if (user) {
        try {
          await updatePreferencesMutation.mutateAsync({ timezone: isAuto ? null : tz });
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

  const currentTimezone = useMemo<TimezoneOption>(() => {
    const predefined = SUPPORTED_TIMEZONES.find((t) => t.value === timezone);

    let dynamicOffset = "+00:00";
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" }).formatToParts(new Date());
      const longTz = parts.find((p) => p.type === "timeZoneName")?.value || "";
      const match = longTz.match(/GMT([+-]\d{2}:\d{2})/);
      if (match) {
        dynamicOffset = match[1];
      }
    } catch {}

    if (predefined) {
      return {
        ...predefined,
        offset: dynamicOffset || predefined.offset,
      };
    }

    const city = timezone.split("/").pop()?.replace(/_/g, " ") || timezone;
    return {
      value: timezone,
      label: `${city} (UTC${dynamicOffset})`,
      city,
      offset: dynamicOffset,
      market: "Financial Market",
    };
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
          : currentCurrency.code === "BDT" || currentCurrency.code === "INR" || currentCurrency.code === "PKR"
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

  const convertAmount = useCallback(
    (amount: number, fromCurrency: "USD" | "BDT" = "BDT"): number => {
      if (isNaN(amount) || amount === 0) return 0;
      if (fromCurrency === "BDT") {
        if (currency === "BDT") return amount;
        const inUsd = amount / 122;
        return inUsd * currentCurrency.rateAgainstUsd;
      } else {
        if (currency === "USD") return amount;
        return amount * currentCurrency.rateAgainstUsd;
      }
    },
    [currency, currentCurrency]
  );

  const formatPrice = useCallback(
    (params: { bdt?: number | string; usd?: number | string; fallback?: string }): string => {
      const bdtNum =
        params.bdt !== undefined && params.bdt !== null
          ? parseFloat(String(params.bdt).replace(/[^\d.]/g, "") || "0")
          : undefined;
      const usdNum =
        params.usd !== undefined && params.usd !== null
          ? parseFloat(String(params.usd).replace(/[^\d.]/g, "") || "0")
          : undefined;

      if ((bdtNum === 0 || usdNum === 0) && (bdtNum !== undefined || usdNum !== undefined)) {
        return `${currentCurrency.symbol} 0`;
      }

      if (currency === "BDT" && bdtNum !== undefined) {
        return `৳${Math.round(bdtNum).toLocaleString()}`;
      }

      if (currency === "USD" && usdNum !== undefined) {
        return `$${usdNum % 1 === 0 ? usdNum : usdNum.toFixed(2)}`;
      }

      let converted: number;
      if (usdNum !== undefined && usdNum > 0) {
        converted = usdNum * currentCurrency.rateAgainstUsd;
      } else if (bdtNum !== undefined && bdtNum > 0) {
        converted = (bdtNum / 122) * currentCurrency.rateAgainstUsd;
      } else {
        return params.fallback || `${currentCurrency.symbol} 0`;
      }

      const noDecimal =
        currentCurrency.code === "BDT" || currentCurrency.code === "PKR" || currentCurrency.code === "INR";
      const decimals = noDecimal ? 0 : 2;
      const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(converted);

      return `${currentCurrency.symbol} ${formatted}`;
    },
    [currency, currentCurrency]
  );

  return (
    <UserPreferencesContext.Provider
      value={{
        timezone,
        setTimezone,
        manualTimezone,
        isAutoTimezone,
        deviceTimezone,
        currency,
        setCurrency,
        currentCurrency,
        currentTimezone,
        formatTime,
        formatCurrency,
        convertAmount,
        formatPrice,
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
