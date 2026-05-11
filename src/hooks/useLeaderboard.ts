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

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try with orderBy first, fallback to client-side sort if index missing
    const q = query(collection(db, 'typingUsers'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          userId: d.id,
          displayName: raw.displayName || 'Foydalanuvchi',
          photoURL: raw.photoURL || '',
          averageWpm: raw.averageWpm || 0,
          bestWpm: raw.bestWpm || 0,
          totalTests: raw.totalTests || 0,
          totalCorrectChars: raw.totalCorrectChars || 0,
        };
      })
      .filter(e => e.totalTests > 0)
      .sort((a, b) => b.bestWpm - a.bestWpm);
      setEntries(data);
      setLoading(false);
    }, (error) => {
      console.error('Leaderboard error:', error);
      // Fallback: fetch once without ordering
      getDocs(collection(db, 'typingUsers')).then(snap => {
        const data = snap.docs.map(d => {
          const raw = d.data();
          return {
            userId: d.id,
            displayName: raw.displayName || 'Foydalanuvchi',
            photoURL: raw.photoURL || '',
            averageWpm: raw.averageWpm || 0,
            bestWpm: raw.bestWpm || 0,
            totalTests: raw.totalTests || 0,
            totalCorrectChars: raw.totalCorrectChars || 0,
          };
        })
        .filter(e => e.totalTests > 0)
        .sort((a, b) => b.bestWpm - a.bestWpm);
        setEntries(data);
        setLoading(false);
      });
    });
    return unsub;
  }, []);

  return { entries, loading };
}
