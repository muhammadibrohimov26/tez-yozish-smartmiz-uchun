/** Above this many correct characters, celebratory fireworks show in the background. */
export const FIREWORKS_THRESHOLD = 120;

/**
 * Hard cap on correct characters a normal user can reach in a test. Scores are
 * clamped to this value; a genuine attempt to exceed it is reported to the admin
 * (see `cheatAlerts`). The owner is exempt (their intentional boost stays).
 */
export const MAX_CORRECT_CHARS = 190;
