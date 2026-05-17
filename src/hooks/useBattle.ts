import { useState, useEffect } from 'react';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Battle, BattleParticipant, Difficulty } from '../types';
import { UZBEK_WORDS } from '../data/uzbek_words';

function generatePairings(participantIds: string[]): Record<string, string> {
  const shuffled = [...participantIds].sort(() => Math.random() - 0.5);
  const pairings: Record<string, string> = {};
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1];
      pairings[p1] = p2;
      pairings[p2] = p1;
    } else {
      // Odd one out plays solo this round
      pairings[shuffled[i]] = 'solo';
    }
  }
  return pairings;
}

function getRandomWords(count: number, difficulty: Difficulty): string[] {
  let filtered = UZBEK_WORDS;
  if (difficulty === 'easy') {
    filtered = UZBEK_WORDS.filter(w => w.length <= 5);
  } else if (difficulty === 'medium') {
    filtered = UZBEK_WORDS.filter(w => w.length >= 6 && w.length <= 8);
  } else if (difficulty === 'hard') {
    filtered = UZBEK_WORDS.filter(w => w.length > 8);
  }

  // Duplicate to ensure we have enough words
  let pool: string[] = [];
  while (pool.length < count) {
    pool = [...pool, ...filtered];
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function useBattle(groupId?: string) {
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);

  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, 'groups', groupId, 'battles'), where('status', 'in', ['waiting', 'starting', 'round_active', 'round_finished']));
    const unsub = onSnapshot(q, (snap) => {
      setActiveBattles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Battle)));
    });
    return unsub;
  }, [groupId]);

  const createBattle = async (userId: string, userName: string, type: 'group' | '1v1', difficulty: Difficulty, totalRounds: 3 | 5) => {
    if (!groupId) return;
    const battleRef = doc(collection(db, 'groups', groupId, 'battles'));
    
    // Generate initial words for round 1 (300 words is plenty for 60 seconds)
    const words = getRandomWords(300, difficulty);

    const newBattle: Omit<Battle, 'id'> = {
      groupId,
      creatorId: userId,
      creatorName: userName,
      status: 'waiting',
      type,
      difficulty,
      totalRounds,
      currentRound: 1,
      words,
      pairings: {}, // Will be populated on start if 1v1
      participants: {
        [userId]: {
          userId,
          displayName: userName,
          photoURL: '',
          progress: 0,
          wpm: 0,
          isFinished: false,
          roundWpms: [],
          roundAccuracies: [],
          totalCorrectChars: 0
        }
      },
      startTime: null,
      createdAt: serverTimestamp()
    };
    await setDoc(battleRef, newBattle);
    return battleRef.id;
  };

  return { activeBattles, createBattle };
}

export function useBattleRoom(groupId: string | undefined, battleId: string | undefined, userId: string | undefined, userName: string | undefined, photoURL: string | undefined) {
  const [battle, setBattle] = useState<Battle | null>(null);
  
  useEffect(() => {
    if (!groupId || !battleId) return;
    const unsub = onSnapshot(doc(db, 'groups', groupId, 'battles', battleId), (doc) => {
      if (doc.exists()) {
        const b = { id: doc.id, ...doc.data() } as Battle;
        
        // The server-side logic for finishing round is handled by clients now when timer runs out.
        // We just sync state.
        if (b.status === 'round_active') {
          const allFinished = Object.values(b.participants).every(p => p.isFinished);
          if (allFinished && b.creatorId === userId) {
            updateDoc(doc.ref, { status: 'round_finished' });
          }
        }
        
        setBattle(b);
      } else {
        setBattle(null);
      }
    });
    return unsub;
  }, [groupId, battleId, userId]);

  const joinBattle = async () => {
    if (!groupId || !battleId || !userId || !battle) return;
    if (battle.participants[userId]) return; // Already joined
    if (battle.status !== 'waiting') return; // Cannot join

    const p: BattleParticipant = {
      userId,
      displayName: userName || 'Foydalanuvchi',
      photoURL: photoURL || '',
      progress: 0,
      wpm: 0,
      isFinished: false,
      roundWpms: [],
      roundAccuracies: [],
      totalCorrectChars: 0
    };

    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
      [`participants.${userId}`]: p
    });
  };

  const leaveBattle = async () => {
    if (!groupId || !battleId || !userId || !battle) return;
    if (battle.creatorId === userId && battle.status === 'waiting') {
       await deleteDoc(doc(db, 'groups', groupId, 'battles', battleId));
    }
  };

  const startBattle = async () => {
    if (!groupId || !battleId || !userId || !battle) return;
    if (battle.creatorId !== userId) return;

    let pairings = {};
    if (battle.type === '1v1') {
      pairings = generatePairings(Object.keys(battle.participants));
    }

    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
      status: 'starting',
      pairings
    });
    
    // Set start time 5 seconds in the future
    const startT = new Date(Date.now() + 5000);
    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
      status: 'round_active',
      startTime: startT
    });
  };

  const updateProgress = async (progress: number, wpm: number) => {
    if (!groupId || !battleId || !userId || !battle || battle.status !== 'round_active') return;
    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
      [`participants.${userId}.progress`]: progress, // progress is now chars typed (for visuals)
      [`participants.${userId}.wpm`]: wpm
    });
  };

  const finishRound = async (wpm: number, accuracy: number, chars: number) => {
    if (!groupId || !battleId || !userId || !battle || battle.status !== 'round_active') return;

    const p = battle.participants[userId];
    if (p.isFinished) return;

    const newRoundWpms = [...p.roundWpms, wpm];
    const newRoundAccuracies = [...p.roundAccuracies, accuracy];
    
    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
      [`participants.${userId}.isFinished`]: true,
      [`participants.${userId}.wpm`]: wpm,
      [`participants.${userId}.roundWpms`]: newRoundWpms,
      [`participants.${userId}.roundAccuracies`]: newRoundAccuracies,
      [`participants.${userId}.totalCorrectChars`]: p.totalCorrectChars + chars
    });
  };

  const nextRound = async () => {
    if (!groupId || !battleId || !userId || !battle) return;
    if (battle.creatorId !== userId) return;

    if (battle.currentRound >= battle.totalRounds) {
      await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
        status: 'finished'
      });
      return;
    }

    const words = getRandomWords(300, battle.difficulty);
    const startT = new Date(Date.now() + 5000);
    
    let pairings = battle.pairings || {};
    if (battle.type === '1v1') {
      pairings = generatePairings(Object.keys(battle.participants));
    }

    const updates: any = {
      status: 'round_active',
      currentRound: battle.currentRound + 1,
      words,
      pairings,
      startTime: startT
    };
    
    Object.keys(battle.participants).forEach(uid => {
      updates[`participants.${uid}.progress`] = 0;
      updates[`participants.${uid}.wpm`] = 0;
      updates[`participants.${uid}.isFinished`] = false;
    });

    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), updates);
  };

  return { battle, joinBattle, leaveBattle, startBattle, updateProgress, finishRound, nextRound };
}
