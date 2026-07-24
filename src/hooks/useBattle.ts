import { useState, useEffect } from 'react';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Battle, BattleParticipant, Difficulty } from '../types';
import { generatePairings, getRandomWords, BATTLE_WORDS_PER_ROUND } from '../lib/battle';

function newParticipant(userId: string, displayName: string, photoURL: string): BattleParticipant {
  return {
    userId,
    displayName,
    photoURL,
    progress: 0,
    wpm: 0,
    isFinished: false,
    roundWpms: [],
    roundAccuracies: [],
    totalCorrectChars: 0,
  };
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

    const words = getRandomWords(BATTLE_WORDS_PER_ROUND, difficulty);

    // Not annotated as `Battle` because createdAt/roundStartAt are written as
    // Firestore FieldValues (serverTimestamp) rather than resolved Timestamps.
    const newBattle = {
      groupId,
      creatorId: userId,
      creatorName: userName,
      status: 'waiting',
      type,
      difficulty,
      totalRounds,
      currentRound: 1,
      words,
      pairings: {}, // Populated on start if 1v1
      participants: {
        [userId]: newParticipant(userId, userName, ''),
      },
      roundStartAt: null,
      createdAt: serverTimestamp(),
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
    const unsub = onSnapshot(doc(db, 'groups', groupId, 'battles', battleId), (snap) => {
      setBattle(snap.exists() ? ({ id: snap.id, ...snap.data() } as Battle) : null);
    });
    return unsub;
  }, [groupId, battleId]);

  const battleRef = () =>
    groupId && battleId ? doc(db, 'groups', groupId, 'battles', battleId) : null;

  const joinBattle = async () => {
    const ref = battleRef();
    if (!ref || !userId || !battle) return;
    if (battle.participants[userId]) return; // Already joined
    if (battle.status !== 'waiting') return; // Cannot join

    await updateDoc(ref, {
      [`participants.${userId}`]: newParticipant(userId, userName || 'Foydalanuvchi', photoURL || ''),
    });
  };

  const leaveBattle = async () => {
    const ref = battleRef();
    if (!ref || !userId || !battle) return;
    if (battle.creatorId === userId && battle.status === 'waiting') {
      await deleteDoc(ref);
    }
  };

  const startBattle = async () => {
    const ref = battleRef();
    if (!ref || !userId || !battle) return;
    if (battle.creatorId !== userId) return;

    const pairings = battle.type === '1v1' ? generatePairings(Object.keys(battle.participants)) : {};

    // Single write: server-timestamped anchor drives every client's countdown.
    await updateDoc(ref, {
      status: 'round_active',
      pairings,
      roundStartAt: serverTimestamp(),
    });
  };

  const updateProgress = async (progress: number, wpm: number) => {
    const ref = battleRef();
    if (!ref || !userId || !battle || battle.status !== 'round_active') return;
    await updateDoc(ref, {
      [`participants.${userId}.progress`]: progress, // chars typed (for visuals)
      [`participants.${userId}.wpm`]: wpm,
    });
  };

  const finishRound = async (wpm: number, accuracy: number, chars: number) => {
    const ref = battleRef();
    if (!ref || !userId || !battle || battle.status !== 'round_active') return;

    const p = battle.participants[userId];
    if (!p || p.isFinished) return;

    await updateDoc(ref, {
      [`participants.${userId}.isFinished`]: true,
      [`participants.${userId}.wpm`]: wpm,
      [`participants.${userId}.roundWpms`]: [...p.roundWpms, wpm],
      [`participants.${userId}.roundAccuracies`]: [...p.roundAccuracies, accuracy],
      [`participants.${userId}.totalCorrectChars`]: p.totalCorrectChars + chars,
    });
  };

  /**
   * Flip a live round to the results screen. Idempotent and callable by ANY
   * participant (not just the creator) so the battle never gets stuck if the
   * creator has left. No-ops once the status has already moved on.
   */
  const finishRoundForAll = async () => {
    const ref = battleRef();
    if (!ref || !battle || battle.status !== 'round_active') return;
    await updateDoc(ref, { status: 'round_finished' });
  };

  const nextRound = async () => {
    const ref = battleRef();
    if (!ref || !userId || !battle) return;
    if (battle.creatorId !== userId) return;

    if (battle.currentRound >= battle.totalRounds) {
      await updateDoc(ref, { status: 'finished' });
      return;
    }

    const words = getRandomWords(BATTLE_WORDS_PER_ROUND, battle.difficulty);
    const pairings = battle.type === '1v1' ? generatePairings(Object.keys(battle.participants)) : (battle.pairings || {});

    const updates: Record<string, unknown> = {
      status: 'round_active',
      currentRound: battle.currentRound + 1,
      words,
      pairings,
      roundStartAt: serverTimestamp(),
    };

    Object.keys(battle.participants).forEach(uid => {
      updates[`participants.${uid}.progress`] = 0;
      updates[`participants.${uid}.wpm`] = 0;
      updates[`participants.${uid}.isFinished`] = false;
    });

    await updateDoc(ref, updates);
  };

  return { battle, joinBattle, leaveBattle, startBattle, updateProgress, finishRound, finishRoundForAll, nextRound };
}
