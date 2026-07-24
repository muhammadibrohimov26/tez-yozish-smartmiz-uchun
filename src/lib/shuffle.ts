/**
 * Uniform (Fisher-Yates) shuffle. Returns a new array; does not mutate the input.
 *
 * Replaces the biased `arr.sort(() => Math.random() - 0.5)` idiom which is not a
 * uniform permutation and skews word/pairing selection.
 */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
