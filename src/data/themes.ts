import type { ThemeColor } from '../types';

export const THEMES: Record<ThemeColor, { primary: string; glow: string; bg: string; text: string; gradient: string; hover: string; shadow: string; border: string; activeBg: string; lightBg: string }> = {
  blue:    { primary: 'rgb(59,130,246)',  glow: 'rgba(59,130,246,0.4)',  bg: 'bg-blue-600',    text: 'text-blue-500',    gradient: 'from-blue-500 to-indigo-600', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-600/30', border: 'border-blue-500', activeBg: 'bg-blue-500/10', lightBg: 'bg-blue-50' },
  emerald: { primary: 'rgb(16,185,129)',  glow: 'rgba(16,185,129,0.4)',  bg: 'bg-emerald-600', text: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-600', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-600/30', border: 'border-emerald-500', activeBg: 'bg-emerald-500/10', lightBg: 'bg-emerald-50' },
  violet:  { primary: 'rgb(139,92,246)',  glow: 'rgba(139,92,246,0.4)',  bg: 'bg-violet-600',  text: 'text-violet-500',  gradient: 'from-violet-500 to-purple-600', hover: 'hover:bg-violet-700', shadow: 'shadow-violet-600/30', border: 'border-violet-500', activeBg: 'bg-violet-500/10', lightBg: 'bg-violet-50' },
  rose:    { primary: 'rgb(244,63,94)',   glow: 'rgba(244,63,94,0.4)',   bg: 'bg-rose-600',    text: 'text-rose-500',    gradient: 'from-rose-500 to-pink-600', hover: 'hover:bg-rose-700', shadow: 'shadow-rose-600/30', border: 'border-rose-500', activeBg: 'bg-rose-500/10', lightBg: 'bg-rose-50' },
  amber:   { primary: 'rgb(245,158,11)',  glow: 'rgba(245,158,11,0.4)',  bg: 'bg-amber-600',   text: 'text-amber-500',   gradient: 'from-amber-500 to-orange-600', hover: 'hover:bg-amber-700', shadow: 'shadow-amber-600/30', border: 'border-amber-500', activeBg: 'bg-amber-500/10', lightBg: 'bg-amber-50' },
  cyan:    { primary: 'rgb(6,182,212)',   glow: 'rgba(6,182,212,0.4)',   bg: 'bg-cyan-600',    text: 'text-cyan-500',    gradient: 'from-cyan-500 to-sky-600', hover: 'hover:bg-cyan-700', shadow: 'shadow-cyan-600/30', border: 'border-cyan-500', activeBg: 'bg-cyan-500/10', lightBg: 'bg-cyan-50' },
};

export const DEFAULT_THEME: ThemeColor = 'blue';

/** Whether a stored string is a theme we actually have. */
export function isThemeColor(value: string | null): value is ThemeColor {
  return value !== null && Object.prototype.hasOwnProperty.call(THEMES, value);
}

export function getTheme(): ThemeColor {
  // The stored value was cast straight to ThemeColor and trusted. A stale or
  // hand-edited key (an old palette name, junk) then reached applyTheme, where
  // THEMES[color] is undefined and reading `.primary` throws — taking down every
  // page that resolves the theme on mount. Fall back to the default instead.
  try {
    const saved = localStorage.getItem('smartmiz_theme');
    return isThemeColor(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function setTheme(color: ThemeColor) {
  localStorage.setItem('smartmiz_theme', color);
  // Apply CSS custom properties
  applyTheme(color);
}

export function applyTheme(color: ThemeColor) {
  const t = THEMES[color] ?? THEMES[DEFAULT_THEME];
  document.documentElement.style.setProperty('--accent', t.primary);
  document.documentElement.style.setProperty('--accent-glow', t.glow);
}
