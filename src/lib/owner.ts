/** The single hard-coded owner/admin account. */
export const OWNER_EMAIL = 'muhammadibrohimov0306@gmail.com';

/** localStorage key behind the Ctrl+Shift+H toggle. Only meaningful for the owner. */
export const CHEAT_STORAGE_KEY = 'dev_cheat_mode';

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

/** Raw state of the Ctrl+Shift+H toggle, independent of who is signed in. */
export function readCheatFlag(): boolean {
  try {
    return typeof localStorage !== 'undefined'
      && localStorage.getItem(CHEAT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setCheatFlag(enabled: boolean): void {
  try {
    localStorage.setItem(CHEAT_STORAGE_KEY, String(enabled));
  } catch {}
}

/**
 * Whether the intentional score "boost" mechanic is live right now.
 *
 * Two conditions, both required: the account is the owner AND the owner has
 * switched the toggle on with Ctrl+Shift+H. A normal user setting the
 * localStorage flag by hand gets nothing, and the owner scores like everyone
 * else while the toggle is off.
 */
export function isCheatActive(
  user?: HasEmail | null,
  profile?: HasEmail | null,
): boolean {
  return isOwnerUser(user, profile) && readCheatFlag();
}
