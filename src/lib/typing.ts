export interface WordComparison {
  /** Characters typed at a position that matched the target. */
  correctChars: number;
  /** Characters that were wrong, missing, or extra vs the target. */
  incorrectChars: number;
  /** Whether the trimmed input exactly equals the target word. */
  isCorrect: boolean;
  /** Target characters that were mistyped — feeds the keyboard error heatmap. */
  errorChars: string[];
}

/**
 * Character-by-character comparison of a typed word against its target word.
 *
 * Shared by the solo typing test ({@link useTypingTest}) and the battle room
 * (`BattleRoom`) so scoring stays identical in both. Callers add their own
 * word-completion bonus (+1 for the space) and any score multiplier on top of
 * the raw counts returned here.
 */
export function compareWord(typed: string, target: string): WordComparison {
  const trimmed = typed.trim();
  const isCorrect = trimmed === target;
  let correctChars = 0;
  let incorrectChars = 0;
  const errorChars: string[] = [];
  const maxLength = Math.max(trimmed.length, target.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < trimmed.length && i < target.length) {
      if (trimmed[i] === target[i]) {
        correctChars++;
      } else {
        incorrectChars++;
        errorChars.push(target[i]);
      }
    } else {
      incorrectChars++;
    }
  }

  return { correctChars, incorrectChars, isCorrect, errorChars };
}
