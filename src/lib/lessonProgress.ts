import { readLocal } from './storage';
import type { Lesson } from '../data/lessons';

const STORAGE_KEY = 'lesson_progress';

export interface LessonResult {
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  completedAt: string;
}

export function getLessonProgress(): Record<string, LessonResult> {
  return readLocal<Record<string, LessonResult>>(STORAGE_KEY, {});
}

export function saveLessonResult(lessonId: string, wpm: number, accuracy: number): void {
  const progress = getLessonProgress();
  const prev = progress[lessonId];
  progress[lessonId] = {
    bestWpm: Math.max(prev?.bestWpm ?? 0, wpm),
    bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
    attempts: (prev?.attempts ?? 0) + 1,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Accuracy needed to count a lesson as passed. Finishing alone is not enough:
 * without a bar, a learner can hammer through every lesson with the wrong
 * fingers and never build the habit the drills exist to teach.
 */
export const LESSON_PASS_ACCURACY = 90;

/** Whether this lesson has been passed (finished at or above the accuracy bar). */
export function isLessonPassed(lessonId: string): boolean {
  const result = getLessonProgress()[lessonId];
  return Boolean(result && result.bestAccuracy >= LESSON_PASS_ACCURACY);
}

/** The first lesson is always unlocked; every other one needs the previous lesson passed. */
export function isLessonUnlocked(lessonId: string, allLessons: Lesson[]): boolean {
  const index = allLessons.findIndex(l => l.id === lessonId);
  if (index <= 0) return true;
  return isLessonPassed(allLessons[index - 1].id);
}
