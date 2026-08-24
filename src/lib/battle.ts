import type { Difficulty } from '../types';
import { UZBEK_WORDS } from '../data/uzbek_words';
import { shuffle } from './shuffle';

/** Countdown shown before each round starts (ms). */
export const BATTLE_COUNTDOWN_MS = 5000;
/** Length of a single typing round (ms). */
export const BATTLE_ROUND_MS = 60000;
/** Words generated per round — plenty for 60 seconds of fast typing. */
export const BATTLE_WORDS_PER_ROUND = 300;

/**
 * Pair participants for a 1v1 round. Odd participant out plays `'solo'`.
 * Uses a uniform shuffle so pairings are unbiased round to round.
 */
export function generatePairings(participantIds: string[]): Record<string, string> {
  const shuffled = shuffle(participantIds);
  const pairings: Record<string, string> = {};

  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      pairings[shuffled[i]] = shuffled[i + 1];
      pairings[shuffled[i + 1]] = shuffled[i];
    } else {
      pairings[shuffled[i]] = 'solo';
    }
  }
  return pairings;
}

/** Words of the length this difficulty drills. */
function byDifficulty(difficulty: Difficulty): string[] {
  if (difficulty === 'easy') return UZBEK_WORDS.filter((w) => w.length <= 5);
  if (difficulty === 'medium') return UZBEK_WORDS.filter((w) => w.length >= 6 && w.length <= 8);
  if (difficulty === 'hard') return UZBEK_WORDS.filter((w) => w.length > 8);
  return UZBEK_WORDS;
}

/** Pick `count` random Uzbek words filtered by difficulty (by word length). */
export function getRandomWords(count: number, difficulty: Difficulty): string[] {
  const filtered = byDifficulty(difficulty);
  // An empty bucket used to hang `while (pool.length < count)` forever, freezing
  // the tab — one edit to the word list is all that would take. Falling back to
  // the full list keeps the battle playable; returning nothing would leave every
  // player staring at a round with no words to type.
  const source = filtered.length > 0 ? filtered : UZBEK_WORDS;
  if (source.length === 0) return [];

  // Duplicate the pool until it is large enough, then shuffle uniformly.
  const pool: string[] = [];
  while (pool.length < count) {
    pool.push(...source);
  }
  return shuffle(pool).slice(0, count);
}
