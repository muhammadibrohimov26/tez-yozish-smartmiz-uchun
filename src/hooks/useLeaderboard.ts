import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  averageWpm: number;
  bestWpm: number;
  totalTests: number;
  totalCorrectChars: number;
}

/** Shape a raw `typingUsers` document into a leaderboard row. */
function toEntry(id: string, raw: Record<string, any>): LeaderboardEntry {
  return {
    userId: id,
    displayName: raw.displayName || 'Foydalanuvchi',
    photoURL: raw.photoURL || '',
    averageWpm: raw.averageWpm || 0,
    bestWpm: raw.bestWpm || 0,
    totalTests: raw.totalTests || 0,
    totalCorrectChars: raw.totalCorrectChars || 0,
  };
}

/** Only players with a recorded test, fastest first. */
function toRankedEntries(docs: { id: string; data: () => Record<string, any> }[]): LeaderboardEntry[] {
  return docs
    .map(d => toEntry(d.id, d.data()))
    .filter(e => e.totalTests > 0)
    .sort((a, b) => b.bestWpm - a.bestWpm);
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Server-side ordering by bestWpm (single-field index is automatic); the
    // error handler below still falls back to a client-side sort just in case.
    const q = query(collection(db, 'typingUsers'), orderBy('bestWpm', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setEntries(toRankedEntries(snap.docs));
      setLoading(false);
    }, (error) => {
      console.error('Leaderboard error:', error);
      // Fallback: fetch once without ordering. This needs its own catch — when
      // the retry failed too, nothing cleared `loading` and the page sat on
      // "Yuklanmoqda..." forever instead of saying the list was unavailable.
      getDocs(collection(db, 'typingUsers'))
        .then(snap => setEntries(toRankedEntries(snap.docs)))
        .catch(err => {
          console.error('Leaderboard fallback error:', err);
          setEntries([]);
        })
        .finally(() => setLoading(false));
    });
    return unsub;
  }, []);

  return { entries, loading };
}
