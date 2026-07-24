import { useCallback, useEffect, useRef } from 'react';

/**
 * Derives a shared `serverNow()` clock from a server-written anchor timestamp
 * (e.g. `battle.roundStartAt` set with Firestore `serverTimestamp()`).
 *
 * All clients anchor their countdown to the same server value the moment they
 * receive it, so per-machine wall-clock skew (which can be minutes) no longer
 * causes desync — only network-latency variance (sub-second) remains.
 *
 * Re-anchors automatically whenever `anchorMs` changes (i.e. each new round).
 *
 * @param anchorMs the anchor time in epoch milliseconds, or `null` if not set yet.
 */
export function useServerClock(anchorMs: number | null) {
  const anchorRef = useRef<{ server: number; local: number } | null>(null);

  useEffect(() => {
    if (anchorMs == null) {
      anchorRef.current = null;
      return;
    }
    anchorRef.current = { server: anchorMs, local: Date.now() };
  }, [anchorMs]);

  const serverNow = useCallback(() => {
    const a = anchorRef.current;
    return a ? a.server + (Date.now() - a.local) : Date.now();
  }, []);

  return serverNow;
}
