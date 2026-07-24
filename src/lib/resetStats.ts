import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/** The zeroed stat fields written when a user's results are reset. */
export const ZERO_STATS = {
  averageWpm: 0,
  bestWpm: 0,
  totalTests: 0,
  totalCorrectChars: 0,
} as const;

/**
 * Reset a single user's stats (Firestore doc + local history) after a
 * confirmation prompt, then reload. Shared by the Home, Profile and Admin
 * "reset my stats" actions so the behaviour stays identical everywhere.
 */
export async function resetOwnerStats(uid: string | undefined): Promise<void> {
  if (!uid) return;
  if (!window.confirm('Barcha statistikalaringizni 0 ga tushirishni tasdiqlaysizmi? (Firestore va Mahalliy tarix tozalanadi)')) return;
  try {
    await updateDoc(doc(db, 'typingUsers', uid), ZERO_STATS);
    localStorage.removeItem('typing_history');
    localStorage.removeItem('typing_streak_dates');
    window.location.reload();
  } catch (e) {
    console.error('Xatolik reytingni tozalashda:', e);
  }
}
