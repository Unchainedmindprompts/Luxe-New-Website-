/**
 * Safe originating-path helpers for conversion analytics.
 *
 * Only a site pathname is retained. Query strings, hashes, protocols, and
 * anything that could carry PII are stripped. Agent consultation APIs do not
 * use this field.
 */

export const ORIGINATING_PATH_STORAGE_KEY = "luxe_originating_path";
export const ORIGINATING_PATH_MAX = 200;

const PATH_ONLY = /^\/[A-Za-z0-9/_-]*$/;

/**
 * Accepts a browser pathname and returns a storeable path, or "" if it is not
 * a safe internal path. Never keeps `?` or `#` fragments.
 */
export function sanitizeOriginatingPath(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "";
  const pathOnly = trimmed.split("?")[0].split("#")[0];
  if (pathOnly.length === 0 || pathOnly.length > ORIGINATING_PATH_MAX) return "";
  if (!PATH_ONLY.test(pathOnly)) return "";
  return pathOnly;
}

export function rememberOriginatingPath(pathname: string): string {
  if (typeof window === "undefined") return "";
  const existing = sanitizeOriginatingPath(
    window.sessionStorage.getItem(ORIGINATING_PATH_STORAGE_KEY)
  );
  if (existing) return existing;
  const next = sanitizeOriginatingPath(pathname);
  if (next) {
    window.sessionStorage.setItem(ORIGINATING_PATH_STORAGE_KEY, next);
  }
  return next;
}

export function readOriginatingPath(fallbackPathname?: string): string {
  if (typeof window === "undefined") {
    return sanitizeOriginatingPath(fallbackPathname);
  }
  const stored = sanitizeOriginatingPath(
    window.sessionStorage.getItem(ORIGINATING_PATH_STORAGE_KEY)
  );
  if (stored) return stored;
  return rememberOriginatingPath(fallbackPathname ?? window.location.pathname);
}
