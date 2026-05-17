import { useState, useEffect } from 'react';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Battle, BattleParticipant } from '../types';
import { WORDS } from '../data/words';

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

  const createBattle = async (userId: string, userName: string, totalRounds: 3 | 5) => {
    if (!groupId) return;
    const battleRef = doc(collection(db, 'groups', groupId, 'battles'));
    
    // Generate initial words for round 1
    const baseWords = WORDS.uz.medium;
    const shuffled = [...baseWords].sort(() => Math.random() - 0.5).slice(0, 50); // 50 words per round

    const newBattle: Omit<Battle, 'id'> = {
      groupId,
      creatorId: userId,
      creatorName: userName,
      status: 'waiting',
      totalRounds,
      currentRound: 1,
      words: shuffled,
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
        
        // Check if round should transition to round_finished
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

    await updateDoc(doc(db, 'groups', groupId, 'battles', battleId), {
      status: 'starting'
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
      [`participants.${userId}.progress`]: progress,
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
      [`participants.${userId}.progress`]: 100,
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

    const baseWords = WORDS.uz.medium;
    const shuffled = [...baseWords].sort(() => Math.random() - 0.5).slice(0, 50);

    const startT = new Date(Date.now() + 5000);
    const updates: any = {
      status: 'round_active',
      currentRound: battle.currentRound + 1,
      words: shuffled,
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
