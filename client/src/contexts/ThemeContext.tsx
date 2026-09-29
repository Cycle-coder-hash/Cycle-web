import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export type Theme = "light" | "dark";
export type ThemeMode = "auto" | "light" | "dark";

export interface ThemeContextType {
  theme: Theme; // Current resolved active theme: "light" | "dark"
  themeMode: ThemeMode; // User preference: "auto" | "light" | "dark"
  systemTheme: Theme; // Current device/OS theme: "light" | "dark"
  isAuto: boolean; // True if themeMode === "auto"
  toggleTheme: () => void; // Cycle or switch between modes
  setTheme: (theme: ThemeMode) => void; // Backward-compatible & supports "auto" | "light" | "dark"
  setThemeMode: (mode: ThemeMode) => void; // Explicit setter for "auto" | "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultTheme?: ThemeMode;
}

const THEME_MODE_KEY = "cycle-theme-mode";
const THEME_LEGACY_KEY = "cycle-theme";

// Helper to detect current device / OS system preference
const getSystemTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark"; // Institutional default fallback
};

export function ThemeProvider({
  children,
  defaultMode,
  defaultTheme = "auto",
}: ThemeProviderProps) {
  const fallbackMode = defaultMode || defaultTheme;

  // 1. Current OS / device theme state
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  // 2. Active theme mode preference ("auto" | "light" | "dark")
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return fallbackMode;
    const storedMode = localStorage.getItem(THEME_MODE_KEY);
    if (storedMode === "auto" || storedMode === "light" || storedMode === "dark") {
      return storedMode as ThemeMode;
    }
    // Check legacy key if someone had previously saved "light" or "dark"
    const legacy = localStorage.getItem(THEME_LEGACY_KEY);
    if (legacy === "light" || legacy === "dark") {
      return legacy as ThemeMode;
    }
    return fallbackMode; // Defaults to "auto" (Device mode)
  });

  // 3. Listen to live OS / device theme changes (e.g. sunrise/sunset or system setting change)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (matches: boolean) => {
      setSystemTheme(matches ? "dark" : "light");
    };

    updateTheme(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      updateTheme(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handler);
      return () => (mediaQuery as any).removeListener(handler);
    }
  }, []);

  // 4. Resolved theme: if "auto", follow device systemTheme; otherwise use explicit themeMode
  const theme: Theme = themeMode === "auto" ? systemTheme : themeMode;

  // 5. Apply active theme class and attributes to document root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-mode", themeMode);
    root.style.colorScheme = theme;

    // Persist user selection
    localStorage.setItem(THEME_MODE_KEY, themeMode);
    localStorage.setItem(THEME_LEGACY_KEY, theme);
  }, [theme, themeMode]);

  // 6. Set theme mode explicitly
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  // 7. Backward-compatible setter (accepts "auto" | "light" | "dark")
  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeModeState(nextTheme);
  }, []);

  // 8. Professional toggle cycle:
  // - If in "auto" mode: flip to the opposite of current resolved theme (e.g. if dark, switch to light)
  // - If in "light" mode: switch to "dark"
  // - If in "dark" mode: switch back to "auto" (Device mode)
  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === "auto") {
        return theme === "dark" ? "light" : "dark";
      }
      if (prev === "light") {
        return "dark";
      }
      return "auto";
    });
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      systemTheme,
      isAuto: themeMode === "auto",
      toggleTheme,
      setTheme,
      setThemeMode,
    }),
    [theme, themeMode, systemTheme, toggleTheme, setTheme, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

