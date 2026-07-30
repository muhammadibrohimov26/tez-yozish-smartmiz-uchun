/** Above this many correct characters, celebratory fireworks show in the background. */
export const FIREWORKS_THRESHOLD = 120;

/**
 * Fastest speed treated as humanly plausible. Sustained world-record typing sits
 * around 210 WPM, so anything past this is tampering rather than talent.
 */
export const MAX_PLAUSIBLE_WPM = 200;

/**
 * Hard cap on correct characters for a test of the given length. Scores are
 * clamped to it, and a genuine attempt to exceed it is reported to the admin
 * (see `cheatAlerts`). The owner's boost mechanic is exempt.
 *
 * The cap scales with duration. A flat 190 punished the honest: it allowed
 * ~152 WPM on a 15-second test but only ~38 WPM on a 60-second one and ~19 WPM
 * over 120 seconds, so ordinary typists were silently clamped — and reported.
 */
export function maxCorrectChars(durationSeconds: number): number {
  return Math.round((MAX_PLAUSIBLE_WPM * 5 * durationSeconds) / 60);
}
