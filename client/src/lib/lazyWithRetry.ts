import { ComponentType, lazy, LazyExoticComponent } from "react";

const RELOAD_STORAGE_KEY = "coc_stale_chunk_reload_ts";
const RELOAD_COOLDOWN_MS = 20000; // 20-second cooldown to strictly prevent infinite reload loops

/**
 * Checks whether an error is caused by a missing/stale dynamic import chunk
 * from a previous deployment. Handles error variations across all major browsers
 * (Chromium, Firefox, Safari/WebKit, Edge, and iOS WebKit).
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;

  const msg = (
    typeof error === "object" && error !== null && "message" in error
      ? String((error as any).message)
      : String(error)
  ).toLowerCase();

  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as any).name).toLowerCase()
      : "";

  return (
    name === "chunkloaderror" ||
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    msg.includes("dynamically imported module") ||
    msg.includes("chunkloaderror") ||
    msg.includes("mime type") ||
    msg.includes("disallowed mime type") ||
    msg.includes("expected a javascript module script")
  );
}

/**
 * Safe recovery handler for stale deployment chunk mismatches.
 * Reloads the window once to fetch the latest index.html and current asset chunks.
 * Enforces a cooldown window to prevent infinite reload loops if network is offline.
 */
export function handleStaleChunkError(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const lastReloadStr = sessionStorage.getItem(RELOAD_STORAGE_KEY);
    const now = Date.now();
    const lastReload = lastReloadStr ? Number(lastReloadStr) : 0;

    if (!lastReload || now - lastReload > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));
      console.warn(
        "[Cycle of Chart] Deployment update detected (stale chunk). Reloading page to fetch latest application assets..."
      );
      window.location.reload();
      return true;
    } else {
      console.error(
        "[Cycle of Chart] Dynamic import error persisted after recent reload. Cooldown active to prevent reload loop."
      );
      return false;
    }
  } catch {
    // Fallback if sessionStorage is blocked
    window.location.reload();
    return true;
  }
}

/**
 * Enhanced React.lazy wrapper with automatic stale-chunk recovery.
 *
 * When a deployment replaces chunks on the server, existing client sessions
 * attempting to load lazy routes will catch the stale chunk rejection, trigger
 * a clean reload to sync with the current build, and suspend rendering smoothly
 * during the transition rather than crashing the page.
 */
export function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err: unknown) {
      if (isChunkLoadError(err)) {
        const reloaded = handleStaleChunkError();
        if (reloaded) {
          // Return a hanging promise so React Suspense remains suspended
          // with the preloader/fallback while the browser reloads the page
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });
}
