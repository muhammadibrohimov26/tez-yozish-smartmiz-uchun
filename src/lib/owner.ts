/** The single hard-coded owner/admin account. */
export const OWNER_EMAIL = 'muhammadibrohimov0306@gmail.com';

interface HasEmail {
  email?: string | null;
}

/**
 * Whether the signed-in account is the owner.
 *
 * Identity comes from the account email only. A `isAdmin` flag on the Firestore
 * profile is NOT accepted here: that document is client-writable, so trusting it
 * would let any user grant themselves owner powers.
 */
export function isOwnerUser(
  user?: HasEmail | null,
  profile?: HasEmail | null,
): boolean {
  return user?.email === OWNER_EMAIL || profile?.email === OWNER_EMAIL;
}

// The score "boost" switch itself lives in src/hooks/useCheatMode.ts — in memory
// only, so it cannot be enabled from the browser console.
