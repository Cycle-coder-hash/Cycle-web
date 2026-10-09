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
    const isMobile =
      typeof window !== "undefined" &&
      (!window.matchMedia("(pointer: fine)").matches || window.innerWidth < 768);

    const startTime = window.__cycle_preloader_start || Date.now();
    const elapsed = Date.now() - startTime;

    // Minimum display duration allows the user to experience the brand reveal.
    // On mobile devices, accelerate reveal to 250ms so the interface is immediately interactive
    // without feeling like the device is hanging.
    const minDisplayDuration = prefersReducedMotion ? 50 : isMobile ? 250 : 950;
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

