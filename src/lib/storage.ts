/**
 * Safely parse a JSON string (e.g. from localStorage). Returns `fallback` on a
 * null/empty input or any parse error, so corrupt storage can never crash the UI.
 */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Read and parse a localStorage key, falling back safely on missing/corrupt data. */
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  return safeParse(localStorage.getItem(key), fallback);
}
