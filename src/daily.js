/**
 * The machinery behind a once-a-day puzzle. Doctordle and the crossword both run
 * on it; anything specific to either belongs in their own module.
 *
 * Rotation is pure arithmetic on the date — no server picks a puzzle. Everyone
 * on a given day gets the same one, it works offline, and a day that has already
 * happened can never change, which is what makes an archive trustworthy.
 *
 * Two decisions worth knowing about:
 *
 * Order is the numeric filename prefix, not a shuffle. A shuffle would have to
 * be stored and appended to forever, because reshuffling on every new puzzle
 * would silently rewrite history — yesterday's puzzle would become a different
 * one. It buys nothing anyway: the puzzle file ships every answer to the browser
 * regardless, exactly as Wordle shipped its word list.
 *
 * Days are counted in Europe/London, not UTC. In British Summer Time a UTC
 * rollover lands at 1am, so a student playing late on a summer evening would get
 * tomorrow's puzzle an hour early and lose an hour of their own day.
 */

const DAY_MS = 86400000;

const LONDON = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's date in Europe/London as `YYYY-MM-DD`. en-CA formats in that order. */
export function londonDayKey(date = new Date()) {
  return LONDON.format(date);
}

/**
 * A day key as a UTC timestamp. Both sides of every subtraction below go through
 * here, so the arithmetic is on fixed 24-hour steps and DST cannot make a day
 * 23 or 25 hours long halfway through a sum.
 */
function utcMidnight(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days between two day keys. Negative when `key` is the earlier one. */
export function dayIndexFor(key, epoch) {
  return Math.round((utcMidnight(key) - utcMidnight(epoch)) / DAY_MS);
}

/** The day key `n` days after `key`. */
export function shiftDayKey(key, n) {
  return new Date(utcMidnight(key) + n * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Milliseconds until the next puzzle unlocks, for a countdown.
 *
 * Found by bisection rather than by adding 24 hours: the length of a London day
 * changes twice a year, and the clock-change days are precisely when a wrong
 * countdown would be noticed.
 */
export function msUntilNextPuzzle(now = new Date()) {
  const today = londonDayKey(now);
  let lo = now.getTime();
  let hi = lo + 26 * 3600000; // always past the next midnight, DST or not

  while (hi - lo > 1000) {
    const mid = Math.floor((lo + hi) / 2);
    if (londonDayKey(new Date(mid)) === today) lo = mid;
    else hi = mid;
  }
  return hi - now.getTime();
}

/**
 * A day's result, or null if it has not been played. Shared rather than built
 * per game: it only reads the record a game engine wrote.
 */
export function resultFor(results, key) {
  const saved = results[key];
  return saved && typeof saved.solved === 'boolean' ? saved : null;
}

/**
 * Builds one daily game from its generated manifest.
 *
 * `manifest` is `{ epoch, puzzles: [{ id, number, ... }] }`, written by the
 * extractor script for that game. `storageKey` is where the game engine records
 * each day's play — the engine is iframed from this origin, so the dashboard
 * reads that key directly rather than relying on a message it might not be
 * mounted to catch.
 */
export function createDailyGame({ manifest, storageKey }) {
  const EPOCH = manifest.epoch;

  /** Puzzles in rotation order. New ones get a higher prefix and land at the end. */
  const PUZZLES = [...manifest.puzzles].sort((a, b) => a.number - b.number);

  /**
   * The puzzle for a given day, or null for a day before the epoch.
   *
   * Once the list is exhausted it cycles, so `round` counts how many times round
   * we have been — 1 on the first pass. The UI uses it to be honest that a
   * puzzle is a repeat rather than pretending it is new.
   */
  function puzzleForDay(key) {
    const index = dayIndexFor(key, EPOCH);
    if (index < 0 || PUZZLES.length === 0) return null;

    return {
      ...PUZZLES[index % PUZZLES.length],
      dayKey: key,
      dayNumber: index + 1,
      round: Math.floor(index / PUZZLES.length) + 1,
    };
  }

  /**
   * Every past day, newest first — what the archive lists once it is unlocked.
   * Capped because the list is rendered in full, and a year is more than anyone
   * scrolls; raise it if that stops being true.
   */
  function archiveDays(today = londonDayKey(), limit = 365) {
    const count = Math.min(dayIndexFor(today, EPOCH), limit);
    const days = [];
    for (let i = 1; i <= count; i++) {
      const puzzle = puzzleForDay(shiftDayKey(today, -i));
      if (puzzle) days.push(puzzle);
    }
    return days;
  }

  /**
   * Every day played, keyed `YYYY-MM-DD`.
   *
   * Guarded because localStorage throws rather than returning null in a private
   * window or with site data blocked — and a student in that state should still
   * see the dashboard, just without their history.
   */
  function readResults() {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey));
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  }

  /**
   * Whether today's puzzle has been finished, which is what opens the archive.
   *
   * Finished, not solved: someone who gave up has already seen the answers and
   * spent the day's puzzle, so holding the archive back would only punish them
   * for losing. This is the Wordle bargain — today first, then the back catalogue.
   */
  function archiveUnlocked(results, today = londonDayKey()) {
    return resultFor(results, today) !== null;
  }

  return {
    EPOCH,
    PUZZLES,
    STORAGE_KEY: storageKey,
    puzzleForDay,
    todaysPuzzle: (now = new Date()) => puzzleForDay(londonDayKey(now)),
    archiveDays,
    readResults,
    resultFor,
    archiveUnlocked,
  };
}
