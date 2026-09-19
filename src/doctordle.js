/**
 * Doctordle's daily rotation — one clinical case a day, plus an archive of the
 * days you missed. All the machinery is in daily.js; this only names the
 * manifest and the key the game engine writes its results to.
 *
 * The manifest holds a patient stem per case and never a diagnosis, so listing
 * and dating cases on the dashboard cannot spoil one you have not played.
 * See scripts/extract-doctordle.mjs.
 */
import { createDailyGame } from './daily.js';
import MANIFEST from './doctordle-manifest.json';

/** Kept in step with public/doctordle/index.html. */
const STORAGE_KEY = 'mla:doctordle:v1';

const doctordle = createDailyGame({ manifest: MANIFEST, storageKey: STORAGE_KEY });

export const { EPOCH, PUZZLES } = doctordle;
export const {
  puzzleForDay,
  todaysPuzzle,
  archiveDays,
  readResults,
  resultFor,
  archiveUnlocked,
} = doctordle;

export { londonDayKey, msUntilNextPuzzle, shiftDayKey } from './daily.js';
