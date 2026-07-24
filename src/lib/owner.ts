/** The single hard-coded owner/admin account. */
export const OWNER_EMAIL = 'muhammadibrohimov0306@gmail.com';

interface HasEmail {
  email?: string | null;
}
interface HasProfileFlags {
  email?: string | null;
  isAdmin?: boolean;
}

/**
 * Whether the current user has owner/dev privileges.
 *
 * NOTE: this also gates the intentional score "boost" mechanic — its behaviour
 * must stay identical to the previous inline checks, so it still honours the
 * `dev_cheat_mode` localStorage flag toggled via Ctrl+Shift+H.
 */
export function isOwnerUser(
  user?: HasEmail | null,
  profile?: HasProfileFlags | null,
): boolean {
  const devCheat =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('dev_cheat_mode') === 'true';
  return (
    user?.email === OWNER_EMAIL ||
    profile?.email === OWNER_EMAIL ||
    profile?.isAdmin === true ||
    devCheat
  );
}
