import { useEffect, useSyncExternalStore } from 'react';
import { isOwnerUser } from '../lib/owner';

/**
 * The owner-only score boost.
 *
 * The switch lives in memory ONLY — it is never written to localStorage, a
 * cookie, or the URL, so there is nothing a user can set by hand to turn it on.
 * It starts off on every page load and can only be flipped by Ctrl+Shift+H
 * while signed in as the owner. For anyone else the shortcut is not even
 * listening, and `useCheatMode` returns false no matter what.
 */
let enabled = false;
const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

const getSnapshot = () => enabled;

function setEnabled(next: boolean): void {
  if (enabled === next) return;
  enabled = next;
  listeners.forEach(fn => fn());
}

// Older builds persisted the switch in localStorage, which let anyone enable it.
// Clear that key once at startup so no stale copy lingers in a user's browser.
try {
  localStorage.removeItem('dev_cheat_mode');
} catch {}

interface HasEmail {
  email?: string | null;
}

export function useCheatMode(user?: HasEmail | null, profile?: HasEmail | null): boolean {
  const isOwner = isOwnerUser(user, profile);
  const on = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    if (!isOwner) {
      // Covers signing out, or switching from the owner to another account.
      setEnabled(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setEnabled(!enabled);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOwner]);

  // Both halves required: the owner account AND the switch turned on.
  return isOwner && on;
}
