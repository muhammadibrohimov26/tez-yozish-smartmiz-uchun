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

/** The first lesson is always unlocked; every other lesson needs the previous one completed. */
export function isLessonUnlocked(lessonId: string, allLessons: Lesson[]): boolean {
  const index = allLessons.findIndex(l => l.id === lessonId);
  if (index <= 0) return true;
  const progress = getLessonProgress();
  return Boolean(progress[allLessons[index - 1].id]);
}
