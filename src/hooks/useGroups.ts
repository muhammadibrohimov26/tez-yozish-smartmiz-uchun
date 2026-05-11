import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { Group, GroupMember, TestResult } from '../types';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function useGroups(userId?: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setGroups([]); setLoading(false); return; }
    const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const createGroup = async (name: string, displayName: string) => {
    if (!userId) throw new Error('Login kerak');
    const code = generateCode();
    const ref = await addDoc(collection(db, 'groups'), {
      name, code, ownerId: userId, ownerName: displayName,
      memberIds: [userId], memberCount: 1, createdAt: serverTimestamp(),
    });
    // Add creator as member
    await addDoc(collection(db, 'groups', ref.id, 'members'), {
      userId, displayName, photoURL: '', averageWpm: 0, bestWpm: 0, totalTests: 0,
    });
    return { id: ref.id, code };
  };

  const joinGroup = async (code: string, displayName: string, photoURL: string) => {
    if (!userId) throw new Error('Login kerak');
    const q = query(collection(db, 'groups'), where('code', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Guruh topilmadi');
    const groupDoc = snap.docs[0];
    const data = groupDoc.data();
    if (data.memberIds?.includes(userId)) throw new Error('Siz allaqachon a\'zosiz');
    await updateDoc(doc(db, 'groups', groupDoc.id), {
      memberIds: arrayUnion(userId), memberCount: (data.memberCount || 0) + 1,
    });
    await addDoc(collection(db, 'groups', groupDoc.id, 'members'), {
      userId, displayName, photoURL, averageWpm: 0, bestWpm: 0, totalTests: 0,
    });
    return groupDoc.id;
  };

  const leaveGroup = async (groupId: string) => {
    if (!userId) return;
    await updateDoc(doc(db, 'groups', groupId), { memberIds: arrayRemove(userId) });
    // Remove member doc
    const memQ = query(collection(db, 'groups', groupId, 'members'), where('userId', '==', userId));
    const memSnap = await getDocs(memQ);
    for (const d of memSnap.docs) await deleteDoc(d.ref);
  };

  return { groups, loading, createGroup, joinGroup, leaveGroup };
}

export function useGroupDetail(groupId: string | undefined) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    // Group info
    const unsub1 = onSnapshot(doc(db, 'groups', groupId), (snap) => {
      if (snap.exists()) setGroup({ id: snap.id, ...snap.data() } as Group);
    });
    // Members
    const unsub2 = onSnapshot(collection(db, 'groups', groupId, 'members'), (snap) => {
      const m = snap.docs.map(d => d.data() as GroupMember);
      m.sort((a, b) => b.averageWpm - a.averageWpm);
      setMembers(m);
      setLoading(false);
    });
    // Recent results
    const rq = query(collection(db, 'groups', groupId, 'results'), orderBy('createdAt', 'desc'), limit(50));
    const unsub3 = onSnapshot(rq, (snap) => {
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult)));
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [groupId]);

  // Recalculate member averages from results
  const recalcMemberStats = useCallback(async () => {
    if (!groupId) return;
    const resSnap = await getDocs(collection(db, 'groups', groupId, 'results'));
    const byUser: Record<string, { total: number; count: number; best: number }> = {};
    resSnap.docs.forEach(d => {
      const r = d.data();
      if (!byUser[r.userId]) byUser[r.userId] = { total: 0, count: 0, best: 0 };
      byUser[r.userId].total += r.wpm;
      byUser[r.userId].count++;
      if (r.wpm > byUser[r.userId].best) byUser[r.userId].best = r.wpm;
    });
    const memSnap = await getDocs(collection(db, 'groups', groupId, 'members'));
    for (const memDoc of memSnap.docs) {
      const uid = memDoc.data().userId;
      if (byUser[uid]) {
        await updateDoc(memDoc.ref, {
          averageWpm: Math.round(byUser[uid].total / byUser[uid].count),
          bestWpm: byUser[uid].best,
          totalTests: byUser[uid].count,
        });
      }
    }
  }, [groupId]);

  return { group, members, results, loading, recalcMemberStats };
}
