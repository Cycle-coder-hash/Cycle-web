import { useEffect } from "react";

export interface CyclePreloaderController {
  hide: () => void;
  isActive: () => boolean;
}

declare global {
  interface Window {
    __cycle_preloader?: CyclePreloaderController;
    __cycle_preloader_start?: number;
  }
}

/**
 * GlobalPreloader
 * Coordinates the brand loading animation lifecycle:
 * 1. Guarantees the initial 850ms brand reveal plays smoothly on cold start / full reload.
 * 2. Smoothly dismisses the overlay once ready.
 * 3. Does NOT re-trigger during normal client-side page navigation.
 */
export function GlobalPreloader() {
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startTime = window.__cycle_preloader_start || Date.now();
    const elapsed = Date.now() - startTime;

    // Minimum display duration allows the user to experience the 850ms brand reveal
    // Reduced motion bypasses immediately
    const minDisplayDuration = prefersReducedMotion ? 50 : 950;
    const delay = Math.max(0, minDisplayDuration - elapsed);

    const timer = setTimeout(() => {
      if (window.__cycle_preloader) {
        window.__cycle_preloader.hide();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

/**
 * Hook to imperatively interact with the preloader if needed
 */
export function useGlobalPreloader() {
  return {
    hide: () => window.__cycle_preloader?.hide(),
    isActive: () => window.__cycle_preloader?.isActive() ?? false,
  };
}

export default GlobalPreloader;

