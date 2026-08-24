/**
 * A day's storage key: local `YYYY-MM-DD`.
 *
 * Local rather than UTC, because "did I practise today" is a local-calendar
 * question: `toISOString()` credits a late-evening session in UTC+5 to the
 * previous day and can break a streak the user actually kept.
 *
 * One shared helper because the streak used to be written with
 * `toISOString().split('T')[0]` ("2026-08-24") and read back with
 * `toDateString()` ("Mon Aug 24 2026"), so no stored day ever matched and every
 * streak — and all three streak badges — sat at zero.
 */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
