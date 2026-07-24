import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'smartmiz_dark_mode';

function getInitial(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return true; // default: dark
}

/**
 * Dark-mode state persisted to localStorage. Also toggles the `dark` class on
 * `<html>` so Tailwind `dark:` variants stay in sync with the JS-conditional
 * `isDarkMode ? ... : ...` styling used across the app.
 */
export function useDarkMode(): [boolean, (v: boolean) => void] {
  const [isDarkMode, setDark] = useState<boolean>(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem(STORAGE_KEY, String(isDarkMode));
    } catch {
      /* ignore quota/availability errors */
    }
  }, [isDarkMode]);

  const setIsDarkMode = useCallback((v: boolean) => setDark(v), []);
  return [isDarkMode, setIsDarkMode];
}
