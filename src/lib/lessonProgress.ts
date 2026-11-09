import { useEffect, useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { readLocal } from './storage';
import { lessonsInTrack, type Lesson, type LessonTrack } from '../data/lessons';

/** Firestore collection holding one progress document per user, keyed by uid. */
export const LESSON_PROGRESS_COLLECTION = 'lessonProgress';

/** Where progress lived before lessons required an account (browser only, no owner). */
const LEGACY_STORAGE_KEY = 'lesson_progress';

export interface LessonResult {
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  completedAt: string;
}

/**
 * The document stored in `lessonProgress/{uid}`. Besides the per-lesson results
 * it carries ready-made totals, so the statistics page can rank everyone from
 * one read per user without replaying each lesson list.
 */
export interface LessonProgressDoc {
  uid: string;
  displayName: string;
  photoURL: string;
  progress: Record<string, LessonResult>;
  passedTranslit: number;
  passedTouch: number;
  totalAttempts: number;
  lastLessonId: string;
  updatedAt?: { toDate(): Date } | null;
}

/**
 * Accuracy needed to count a lesson as passed. Finishing alone is not enough:
 * without a bar, a learner can hammer through every lesson with the wrong
 * fingers and never build the habit the drills exist to teach.
 */
export const LESSON_PASS_ACCURACY = 90;

export const isResultPassed = (result?: LessonResult) =>
  Boolean(result && result.bestAccuracy >= LESSON_PASS_ACCURACY);

// ---------------------------------------------------------------------------
// In-memory store for the signed-in user's progress. Firestore is the source
// of truth; this mirrors it so every lesson page reads the same, live copy.
// ---------------------------------------------------------------------------

interface ProgressState {
  uid: string | null;
  progress: Record<string, LessonResult>;
  loaded: boolean;
}

let state: ProgressState = { uid: null, progress: {}, loaded: false };
let profile = { displayName: 'Foydalanuvchi', photoURL: '' };
let loadingFor: string | null = null;
/**
 * Whether the remote document was actually read. If it was not (offline, rules
 * not deployed), the local copy may be missing lessons, so saves write only the
 * lesson itself — never totals computed from an incomplete list.
 */
let remoteLoaded = false;
const listeners = new Set<() => void>();

function setState(next: ProgressState) {
  state = next;
  listeners.forEach(fn => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Keeps the better of two results for the same lesson. */
function mergeResult(a: LessonResult | undefined, b: LessonResult | undefined): LessonResult | undefined {
  if (!a) return b;
  if (!b) return a;
  return {
    bestWpm: Math.max(a.bestWpm, b.bestWpm),
    bestAccuracy: Math.max(a.bestAccuracy, b.bestAccuracy),
    attempts: Math.max(a.attempts, b.attempts),
    completedAt: a.completedAt > b.completedAt ? a.completedAt : b.completedAt,
  };
}

function countPassed(progress: Record<string, LessonResult>, track: LessonTrack): number {
  return lessonsInTrack(track).filter(l => isResultPassed(progress[l.id])).length;
}

function summary(progress: Record<string, LessonResult>) {
  return {
    passedTranslit: countPassed(progress, 'translit'),
    passedTouch: countPassed(progress, 'touch'),
    totalAttempts: Object.values(progress).reduce((sum, r) => sum + (r.attempts || 0), 0),
  };
}

interface ProgressUser {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
}

/**
 * Loads a user's progress from Firestore (once per sign-in). Progress saved in
 * this browser before lessons needed an account is folded into the first
 * account that signs in here, then the old key is removed so it is never
 * claimed twice.
 */
async function loadFor(user: ProgressUser): Promise<void> {
  if (loadingFor === user.uid) return;
  loadingFor = user.uid;
  setState({ uid: user.uid, progress: {}, loaded: false });

  let remote: Record<string, LessonResult> = {};
  remoteLoaded = false;
  try {
    const snap = await getDoc(doc(db, LESSON_PROGRESS_COLLECTION, user.uid));
    if (snap.exists()) remote = (snap.data() as LessonProgressDoc).progress ?? {};
    remoteLoaded = true;
  } catch (err) {
    console.error('Dars natijalarini yuklab bo\'lmadi:', err);
  }
  if (loadingFor !== user.uid) return; // signed out or switched account meanwhile

  const legacy = readLocal<Record<string, LessonResult>>(LEGACY_STORAGE_KEY, {});
  const merged: Record<string, LessonResult> = { ...remote };
  let migrated = false;
  for (const [id, result] of Object.entries(legacy)) {
    const best = mergeResult(merged[id], result);
    if (best && JSON.stringify(best) !== JSON.stringify(merged[id])) migrated = true;
    if (best) merged[id] = best;
  }

  setState({ uid: user.uid, progress: merged, loaded: true });

  if (migrated && remoteLoaded) {
    try {
      await setDoc(doc(db, LESSON_PROGRESS_COLLECTION, user.uid), {
        uid: user.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        progress: merged,
        ...summary(merged),
        lastLessonId: '',
        updatedAt: serverTimestamp(),
      }, { merge: true });
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (err) {
      console.error('Eski natijalarni ko\'chirib bo\'lmadi:', err);
    }
  } else if (remoteLoaded && Object.keys(legacy).length > 0) {
    try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch {}
  }
}

/**
 * The signed-in user's lesson progress, live. Pass the auth user (and the
 * profile name, if any); `loaded` stays false until Firestore has answered.
 */
export function useLessonProgress(user: ProgressUser | null | undefined, displayName?: string) {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);

  useEffect(() => {
    if (!user) {
      loadingFor = null;
      if (state.uid !== null) setState({ uid: null, progress: {}, loaded: false });
      return;
    }
    profile = {
      displayName: displayName || user.displayName || 'Foydalanuvchi',
      photoURL: user.photoURL || '',
    };
    if (state.uid !== user.uid || (!state.loaded && loadingFor !== user.uid)) {
      void loadFor(user);
    }
  }, [user, displayName]);

  const ready = Boolean(user) && snapshot.uid === user?.uid && snapshot.loaded;
  return { progress: ready ? snapshot.progress : {}, loaded: ready };
}

/** The current user's progress (empty until loaded). */
export function getLessonProgress(): Record<string, LessonResult> {
  return state.progress;
}

/**
 * Records a finished drill: keeps the best WPM and accuracy, counts the attempt,
 * and writes the lesson plus fresh totals to Firestore. The local copy updates
 * first, so the next lesson unlocks immediately even on a slow connection.
 */
export function saveLessonResult(lessonId: string, wpm: number, accuracy: number): void {
  const uid = state.uid;
  if (!uid) return;
  const prev = state.progress[lessonId];
  const result: LessonResult = {
    bestWpm: Math.max(prev?.bestWpm ?? 0, wpm),
    bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
    attempts: (prev?.attempts ?? 0) + 1,
    completedAt: new Date().toISOString(),
  };
  const progress = { ...state.progress, [lessonId]: result };
  setState({ ...state, progress });

  setDoc(doc(db, LESSON_PROGRESS_COLLECTION, uid), {
    uid,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    // merge: true merges map keys, so only this lesson's entry is written.
    progress: { [lessonId]: result },
    ...(remoteLoaded ? summary(progress) : {}),
    lastLessonId: lessonId,
    updatedAt: serverTimestamp(),
  }, { merge: true }).catch(err => console.error('Dars natijasini saqlab bo\'lmadi:', err));
}

/** Whether this lesson has been passed (finished at or above the accuracy bar). */
export function isLessonPassed(lessonId: string, progress = state.progress): boolean {
  return isResultPassed(progress[lessonId]);
}

/** The first lesson is always unlocked; every other one needs the previous lesson passed. */
export function isLessonUnlocked(lessonId: string, allLessons: Lesson[], progress = state.progress): boolean {
  const index = allLessons.findIndex(l => l.id === lessonId);
  if (index <= 0) return true;
  return isLessonPassed(allLessons[index - 1].id, progress);
}
