import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import posthog from 'posthog-js';
import { awardGame, dayKey, deriveState, loadProgress, mergeRecords, saveProgress } from './progress.js';
import { fetchRemoteProgress, pushRemoteProgress } from './progressRemote.js';

/**
 * Owns the player's career progress and hands back an `award` callback for the
 * dashboard to fire when a mini-game is finished.
 *
 * Storage is local-first: every award is written to localStorage and shown
 * immediately, then pushed to Supabase in the background. A student on the tube
 * keeps earning; the points reach their other devices when the connection does.
 *
 * Level-ups and promotions are surfaced as a one-shot `celebration` rather than
 * being derived by the map, because the map only ever sees the new state — it
 * cannot tell a fresh promotion from a rank the student earned last week.
 */
export default function useProgress(session) {
  const userId = session?.user?.id ?? null;
  const [record, setRecord] = useState(() => loadProgress(userId));
  const [celebration, setCelebration] = useState(null);

  // Signing in or out swaps which record is in play; loadProgress folds anything
  // earned while signed out into the account on the way through. Done during
  // render so the first paint after sign-in already shows the merged total; the
  // merge is idempotent, so a double-invoked render reaches the same record.
  const [loadedFor, setLoadedFor] = useState(userId);
  if (loadedFor !== userId) {
    setLoadedFor(userId);
    setRecord(loadProgress(userId));
  }

  // Pull whatever the account earned on other devices and fold it in, then push
  // the union back so both sides agree. Signed-out students stay local-only.
  const syncedFor = useRef(null);
  useEffect(() => {
    if (!userId || syncedFor.current === userId) return;
    syncedFor.current = userId;

    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteProgress(userId);
      if (cancelled) return;

      setRecord((local) => {
        const merged = remote ? mergeRecords(local, remote) : local;
        saveProgress(userId, merged);
        pushRemoteProgress(userId, merged);
        return merged;
      });
    })();

    return () => { cancelled = true; };
  }, [userId]);

  const state = useMemo(() => deriveState(record), [record]);

  const award = useCallback((gameId) => {
    setRecord((prev) => {
      const today = dayKey();
      const next = awardGame(prev, gameId, today);
      if (next === prev) return prev;

      saveProgress(userId, next);
      if (userId) pushRemoteProgress(userId, next);

      const before = deriveState(prev, today);
      const after = deriveState(next, today);
      const promoted = after.rankIndex > before.rankIndex;
      const levelledUp = after.level > before.level;

      posthog.capture('progress_awarded', {
        game: gameId,
        xp: after.xp,
        level: after.level,
        rank: after.rank.name,
        levelled_up: levelledUp,
        promoted,
        swept_today: after.sweptToday && !before.sweptToday,
      });

      if (promoted) setCelebration({ kind: 'rank', level: after.level, rank: after.rank, at: Date.now() });
      else if (levelledUp) setCelebration({ kind: 'level', level: after.level, rank: after.rank, at: Date.now() });
      else setCelebration({ kind: 'xp', gameId, level: after.level, rank: after.rank, at: Date.now() });

      return next;
    });
  }, [userId]);

  // Celebrations are transient; a promotion lingers longer than a plain point.
  useEffect(() => {
    if (!celebration) return;
    const ms = celebration.kind === 'rank' ? 6000 : celebration.kind === 'level' ? 4000 : 2200;
    const timer = setTimeout(() => setCelebration(null), ms);
    return () => clearTimeout(timer);
  }, [celebration]);

  return { state, award, celebration };
}
