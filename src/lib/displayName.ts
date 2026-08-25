import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Rename a user everywhere their name is stored.
 *
 * `typingUsers` is the source of truth, but the name is denormalised into two
 * more places written once at join/create time: `groups/{id}/members`, which the
 * group ranking and podium read, and `groups/{id}.ownerName`, shown on every
 * group card. Renaming touched only the profile, so the old name stayed on every
 * group page indefinitely — the user saw the change on their profile and nowhere
 * else.
 *
 * The profile write comes first and is awaited on its own: if a group write
 * fails on permissions, the rename the user asked for still stands.
 */
export async function updateDisplayName(uid: string, displayName: string): Promise<void> {
  await updateDoc(doc(db, 'typingUsers', uid), { displayName });

  const groupsSnap = await getDocs(
    query(collection(db, 'groups'), where('memberIds', 'array-contains', uid)),
  );

  const writes: Promise<void>[] = [];
  for (const groupDoc of groupsSnap.docs) {
    if (groupDoc.data().ownerId === uid) {
      writes.push(updateDoc(groupDoc.ref, { ownerName: displayName }));
    }
    const memberSnap = await getDocs(
      query(collection(db, 'groups', groupDoc.id, 'members'), where('userId', '==', uid)),
    );
    for (const memberDoc of memberSnap.docs) {
      writes.push(updateDoc(memberDoc.ref, { displayName }));
    }
  }
  await Promise.all(writes);
}
