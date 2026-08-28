/**
 * The career-progression system behind the dashboard's quest map.
 *
 * Two loops run at once, which is what keeps a long climb engaging:
 *
 *   Levels — 45 of them, cheap at first and slowly more expensive. A student who
 *            plays two games on their first evening levels up that evening.
 *   Ranks  — nine career grades, one every five levels, from preclinical student
 *            to consultant. These are the milestones worth screenshotting.
 *
 * XP is earned by *finishing* a mini-game, one point per game per day. Seven
 * games means seven points a day, plus a bonus for sweeping all seven, so a
 * committed day is worth ten. Reaching consultant costs 389 XP — roughly eleven
 * weeks at a realistic five points a day, or six weeks for someone going flat out.
 */

/** Every mini-game that can pay out a daily point, in dashboard order. */
export const GAMES = [
  { id: 'conditions-wheel', label: 'Conditions Wheel', emoji: '🎯', tint: 'rgba(74,222,128,0.9)' },
  { id: 'presentations',    label: 'Presentations',    emoji: '🩺', tint: 'rgba(56,189,248,0.9)' },
  { id: 'crossword',        label: 'Crossword',        emoji: '🔤', tint: 'rgba(253,224,71,0.9)' },
  { id: 'doctordle',        label: 'Doctordle',        emoji: '🩻', tint: 'rgba(251,146,60,0.9)' },
  { id: 'medmatch',         label: 'MedMatch',         emoji: '🧩', tint: 'rgba(129,140,248,0.9)' },
  { id: 'rapid-recall',     label: 'Rapid Recall',     emoji: '⚡', tint: 'rgba(45,212,191,0.9)' },
  { id: 'abg-ninja',        label: 'ABG Ninja',        emoji: '🥷', tint: 'rgba(251,113,133,0.9)' },
];

const GAME_IDS = new Set(GAMES.map((g) => g.id));

/** The nine career grades, five levels apart. */
export const RANKS = [
  { name: 'Preclinical Student', short: 'Preclinical', emoji: '📗', color: '#22c55e' },
  { name: 'Clinical Student',    short: 'Clinical',    emoji: '🩺', color: '#14b8a6' },
  { name: 'Final Year',          short: 'Final Year',  emoji: '📚', color: '#0ea5e9' },
  { name: 'FY1',                 short: 'FY1',         emoji: '🏥', color: '#6366f1' },
  { name: 'FY2',                 short: 'FY2',         emoji: '💉', color: '#8b5cf6' },
  { name: 'Core Trainee',        short: 'Core Trainee',emoji: '🧠', color: '#a855f7' },
  { name: 'Registrar',           short: 'Registrar',   emoji: '🩻', color: '#d946ef' },
  { name: 'Senior Registrar',    short: 'Senior Reg',  emoji: '⚕️', color: '#ec4899' },
  { name: 'Consultant',          short: 'Consultant',  emoji: '👑', color: '#f59e0b' },
];

export const LEVELS_PER_RANK = 5;
export const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK;

/** Completing every game in one day is worth this much on top of the seven points. */
export const SWEEP_BONUS = 3;

/**
 * How many days of per-game history to keep before folding them into a total.
 * Generous on purpose: a day costs about 90 bytes, so more than a year of play
 * still fits comfortably in a row, and archiving is the one operation that two
 * devices can disagree about. See mergeRecords for how that disagreement is
 * settled.
 */
const HISTORY_DAYS = 400;

const STORAGE_PREFIX = 'mla:progress:v1:';
const GUEST_KEY = 'guest';

/**
 * XP to get from `level` to the next one. Two points — one evening's play — buys
 * the first few levels; the cost creeps up by one every third level so the later
 * ranks feel earned without ever stalling.
 */
export function levelCost(level) {
  if (level >= TOTAL_LEVELS) return 0;
  return 2 + Math.floor((level - 1) / 3);
}

/** CUMULATIVE[n] is the total XP needed to stand on level n. Index 0 is unused. */
const CUMULATIVE = (() => {
  const out = [0, 0];
  for (let level = 1; level < TOTAL_LEVELS; level++) out[level + 1] = out[level] + levelCost(level);
  return out;
})();

export const XP_TO_CONSULTANT = CUMULATIVE[TOTAL_LEVELS];

/** Total XP a student needs before they can stand on `level`. */
export function xpToReachLevel(level) {
  return CUMULATIVE[Math.min(Math.max(level, 1), TOTAL_LEVELS)];
}

/** The rank index a given level sits in. */
export function rankIndexForLevel(level) {
  return Math.min(RANKS.length - 1, Math.floor((level - 1) / LEVELS_PER_RANK));
}

/** True when this level is the first of a rank — the milestones the map calls out. */
export function isRankMilestone(level) {
  return (level - 1) % LEVELS_PER_RANK === 0;
}

/** Local calendar day, not UTC — a point earned at 11pm belongs to that evening. */
export function dayKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function shiftDay(key, days) {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

function emptyRecord() {
  return { v: 1, archivedXp: 0, archivedThrough: '', days: {} };
}

/** What a day's play is worth: a point a game, plus the bonus for a clean sweep. */
function dayValue(games) {
  const n = games.length;
  return n + (n >= GAMES.length ? SWEEP_BONUS : 0);
}

/**
 * Drop day-by-day detail older than the history window, keeping the XP it earned.
 * Without this the record grows without bound for a daily user.
 *
 * `archivedThrough` records the cutoff the total covers. Keeping it is what lets
 * two devices merge safely: without it, a phone that had archived a day and a
 * laptop that still listed it would count that day twice.
 */
function prune(record) {
  const cutoff = shiftDay(dayKey(), -HISTORY_DAYS);
  if (cutoff <= record.archivedThrough) return record;

  let archivedXp = record.archivedXp;
  const days = {};
  for (const [key, games] of Object.entries(record.days)) {
    if (key < cutoff) archivedXp += dayValue(games);
    else days[key] = games;
  }
  return { v: 1, archivedXp, archivedThrough: cutoff, days };
}

function storageKey(userId) {
  return STORAGE_PREFIX + (userId || GUEST_KEY);
}

function readRecord(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.days !== 'object') return null;
    return normaliseRecord(parsed);
  } catch {
    return null;
  }
}

function writeRecord(key, record) {
  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Private browsing or a full quota — progress still works for this session.
  }
}

/** Coerce anything record-shaped — a parsed string, a Supabase row — into shape. */
export function normaliseRecord(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.days !== 'object' || !raw.days) return emptyRecord();
  const days = {};
  for (const [key, games] of Object.entries(raw.days)) {
    if (Array.isArray(games)) days[key] = games.filter((g) => GAME_IDS.has(g));
  }
  return {
    v: 1,
    archivedXp: Number(raw.archivedXp) || 0,
    archivedThrough: typeof raw.archivedThrough === 'string' ? raw.archivedThrough : '',
    days,
  };
}

/**
 * Combine two histories of the same student — the phone's and the laptop's, or a
 * signed-out session and the account it just signed into.
 *
 * A day's games are unioned, so playing MedMatch on the bus and ABG Ninja at
 * home both count and neither pays twice. The archived total is taken from
 * whichever record archived further, and days already inside that total are
 * dropped from the union rather than added on top of it.
 */
export function mergeRecords(a, b) {
  const [base, other] = a.archivedThrough >= b.archivedThrough ? [a, b] : [b, a];

  const days = {};
  for (const source of [other.days, base.days]) {
    for (const [key, games] of Object.entries(source)) {
      if (key < base.archivedThrough) continue; // already inside base.archivedXp
      days[key] = [...new Set([...(days[key] || []), ...games])];
    }
  }
  return { v: 1, archivedXp: base.archivedXp, archivedThrough: base.archivedThrough, days };
}

/**
 * Load a user's progress. Anything earned while signed out is folded in on first
 * load after sign-in, so a student who plays before making an account keeps it.
 */
export function loadProgress(userId) {
  if (typeof window === 'undefined') return emptyRecord();
  const mine = readRecord(storageKey(userId)) || emptyRecord();
  if (!userId) return prune(mine);

  const guest = readRecord(storageKey(null));
  if (!guest) return prune(mine);

  const merged = prune(mergeRecords(mine, guest));
  writeRecord(storageKey(userId), merged);
  try { window.localStorage.removeItem(storageKey(null)); } catch { /* ignore */ }
  return merged;
}

export function saveProgress(userId, record) {
  if (typeof window === 'undefined') return;
  writeRecord(storageKey(userId), record);
}

/**
 * Record that `gameId` was finished today. Returns the same record untouched if
 * the game has already paid out today, so a second run is fun but not farmable.
 */
export function awardGame(record, gameId, today = dayKey()) {
  if (!GAME_IDS.has(gameId)) return record;
  const played = record.days[today] || [];
  if (played.includes(gameId)) return record;
  return { ...record, days: { ...record.days, [today]: [...played, gameId] } };
}

/** Consecutive days of play, counting back from today (or yesterday, mid-streak). */
function currentStreak(days, today) {
  let cursor = days[today]?.length ? today : shiftDay(today, -1);
  let streak = 0;
  while (days[cursor]?.length) { streak++; cursor = shiftDay(cursor, -1); }
  return streak;
}

/** Everything the quest map needs, derived fresh from the stored history. */
export function deriveState(record, today = dayKey()) {
  const xp = Object.values(record.days).reduce((sum, games) => sum + dayValue(games), record.archivedXp);

  let level = 1;
  while (level < TOTAL_LEVELS && xp >= CUMULATIVE[level + 1]) level++;

  const xpForLevel = levelCost(level);
  const xpIntoLevel = xp - CUMULATIVE[level];
  const rankIndex = rankIndexForLevel(level);
  const nextRankIndex = rankIndex + 1;
  const nextRankLevel = (rankIndex + 1) * LEVELS_PER_RANK + 1;
  const todayGames = record.days[today] || [];

  return {
    xp,
    level,
    isMaxLevel: level >= TOTAL_LEVELS,
    xpForLevel,
    xpIntoLevel,
    xpToNextLevel: Math.max(0, xpForLevel - xpIntoLevel),
    rankIndex,
    rank: RANKS[rankIndex],
    nextRank: RANKS[nextRankIndex] || null,
    levelsToNextRank: nextRankIndex < RANKS.length ? nextRankLevel - level : 0,
    todayGames,
    todayXp: dayValue(todayGames),
    sweptToday: todayGames.length >= GAMES.length,
    streak: currentStreak(record.days, today),
    xpToConsultant: Math.max(0, XP_TO_CONSULTANT - xp),
  };
}
