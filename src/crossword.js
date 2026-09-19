/**
 * The crossword's daily rotation — one puzzle a day, plus an archive of the days
 * you missed. All the machinery is in daily.js; this only names the manifest and
 * the key the game engine writes its results to.
 *
 * Unlike Doctordle the manifest carries the puzzle's title: a crossword's topic
 * is its theme rather than its answer, so "Cardiology" spoils nothing and is the
 * label worth showing. See scripts/extract-crosswords.mjs.
 */
import { createDailyGame } from './daily.js';
import MANIFEST from './crossword-manifest.json';

/** Kept in step with public/crosswords/index.html. */
const STORAGE_KEY = 'mla:crossword:v1';

const crossword = createDailyGame({ manifest: MANIFEST, storageKey: STORAGE_KEY });

export const { EPOCH, PUZZLES } = crossword;
export const {
  puzzleForDay,
  todaysPuzzle,
  archiveDays,
  readResults,
  resultFor,
  archiveUnlocked,
} = crossword;
