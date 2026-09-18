/**
 * Which Doctordle case is today's, and which ones you are allowed to go back to.
 *
 * The rotation is pure arithmetic on the date — there is no server picking a
 * puzzle. Everyone on a given day gets the same case, it works offline, and a
 * day that has already happened can never change, which is what makes an archive
 * trustworthy.
 *
 * Two decisions worth knowing about:
 *
 * Order is the numeric filename prefix, not a shuffle. A shuffle would have to
 * be stored and appended to forever, because reshuffling on every new case would
 * silently rewrite history — yesterday's puzzle would become a different one. It
 * buys nothing anyway: puzzles.json ships every answer to the browser regardless,
 * exactly as Wordle shipped its word list.
 *
 * Days are counted in Europe/London, not UTC. In British Summer Time a UTC
 * rollover lands at 1am, so a student playing late on a summer evening would get
 * tomorrow's case an hour early and lose an hour of their own day.
 */
import MANIFEST from './doctordle-manifest.json';

/** Day 0 of the rotation, stamped in by scripts/extract-doctordle.mjs. */
export const EPOCH = MANIFEST.epoch;

/** Cases in rotation order. New cases get a higher prefix and land at the end. */
export const PUZZLES = [...MANIFEST.puzzles].sort((a, b) => a.number - b.number);

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

/** Whole days from the epoch to `key`. Negative before launch. */
export function dayIndexFor(key) {
  return Math.round((utcMidnight(key) - utcMidnight(EPOCH)) / DAY_MS);
}

/** The day key `n` days before `key`. */
export function shiftDayKey(key, n) {
  return new Date(utcMidnight(key) + n * DAY_MS).toISOString().slice(0, 10);
}

/**
 * The case for a given day, or null for a day before the epoch.
 *
 * Once the list is exhausted it cycles, so `round` counts how many times round
 * we have been — 1 on the first pass. The UI uses it to be honest that a case is
 * a repeat rather than pretending it is new.
 */
export function puzzleForDay(key) {
  const index = dayIndexFor(key);
  if (index < 0 || PUZZLES.length === 0) return null;

  return {
    ...PUZZLES[index % PUZZLES.length],
    dayKey: key,
    dayNumber: index + 1,
    round: Math.floor(index / PUZZLES.length) + 1,
  };
}

/** Today's case. */
export function todaysPuzzle(now = new Date()) {
  return puzzleForDay(londonDayKey(now));
}

/**
 * Every past day, newest first — what the archive lists once it is unlocked.
 * Capped because the list is rendered in full, and a year is more than anyone
 * scrolls; raise it if that stops being true.
 */
export function archiveDays(today = londonDayKey(), limit = 365) {
  const count = Math.min(dayIndexFor(today), limit);
  const days = [];
  for (let i = 1; i <= count; i++) {
    const puzzle = puzzleForDay(shiftDayKey(today, -i));
    if (puzzle) days.push(puzzle);
  }
  return days;
}

/**
 * Milliseconds until the next case unlocks, for a countdown.
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

/* ───────────────────────────── results ───────────────────────────── */

/**
 * Where the game engine records each day's play. The engine is iframed from
 * this origin, so the two share localStorage directly rather than the dashboard
 * having to catch a message it might not be mounted for.
 * Kept in step with public/doctordle/index.html.
 */
const STORAGE_KEY = 'mla:doctordle:v1';

/**
 * Every day played, keyed `YYYY-MM-DD`.
 *
 * Guarded because localStorage throws rather than returning null in a private
 * window or with site data blocked — and a student in that state should still
 * see the dashboard, just without their history.
 */
export function readResults() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

/** A day's result, or null if it has not been played. */
export function resultFor(results, key) {
  const saved = results[key];
  return saved && typeof saved.solved === 'boolean' ? saved : null;
}

/**
 * Whether today's case has been finished, which is what opens the archive.
 *
 * Finished, not solved: someone who used all six attempts has seen the answer
 * and spent the day's case, so holding the archive back would only punish them
 * for losing. This is the Wordle bargain — today first, then the back catalogue.
 */
export function archiveUnlocked(results, today = londonDayKey()) {
  return resultFor(results, today) !== null;
}
