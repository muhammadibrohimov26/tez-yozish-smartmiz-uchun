import { addDoc, collection, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Difficulty, Duration } from '../types';

interface GroupResultInput {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  difficulty: Difficulty;
  duration: Duration;
}

/**
 * Record a solo test taken from inside a group (the `/groups/:id/test` route).
 *
 * Two writes, and both matter. The `results` document is the group's history;
 * the member aggregate is what the group ranking actually reads. Only the first
 * used to exist — in fact neither did, because the hook took a `groupId` and
 * never used it — so `members` kept the zeroes written at join time and every
 * group leaderboard showed 0 WPM for everyone, forever.
 *
 * The aggregate is rolled forward from the member document rather than
 * recomputed over the whole `results` collection: one extra read instead of one
 * per stored test. `recalcMemberStats` in `useGroups` remains the repair path if
 * an aggregate ever drifts.
 */
export async function saveGroupResult(
  groupId: string,
  userId: string,
  result: GroupResultInput,
): Promise<void> {
  await addDoc(collection(db, 'groups', groupId, 'results'), {
    userId,
    wpm: result.wpm,
    accuracy: result.accuracy,
    correctChars: result.correctChars,
    incorrectChars: result.incorrectChars,
    difficulty: result.difficulty,
    duration: result.duration,
    createdAt: serverTimestamp(),
  });

  const memberQuery = query(
    collection(db, 'groups', groupId, 'members'),
    where('userId', '==', userId),
  );
  const memberSnap = await getDocs(memberQuery);

  for (const memberDoc of memberSnap.docs) {
    const data = memberDoc.data();
    const prevTests = data.totalTests || 0;
    const prevAverage = data.averageWpm || 0;
    await updateDoc(memberDoc.ref, {
      totalTests: prevTests + 1,
      averageWpm: Math.round((prevAverage * prevTests + result.wpm) / (prevTests + 1)),
      bestWpm: Math.max(data.bestWpm || 0, result.wpm),
      lastTestDate: serverTimestamp(),
    });
  }
}
