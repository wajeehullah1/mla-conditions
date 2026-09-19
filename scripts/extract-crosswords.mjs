/**
 * Turns the standalone crossword HTML files in Crosswords/puzzles/ into data.
 *
 * Same story as the Doctordle cases: every file was a full copy of the game —
 * the grid renderer, the scoring, the clue navigation — wrapped around one
 * PUZZLE object worth about two kilobytes. Thirty-one files, thirty-one copies
 * of the same engine.
 *
 * So this reads the puzzle out of each one and throws the rest away, leaving a
 * single engine (public/crosswords/index.html) to render them:
 *
 *   public/crosswords/puzzles.json — every puzzle, fetched by the engine
 *   src/crossword-manifest.json    — title and clue counts, imported by the
 *                                    dashboard so it can list and date puzzles
 *
 * Unlike Doctordle the manifest may name the puzzle: a crossword's topic is its
 * theme, not its answer, so "Cardiology" spoils nothing and is the useful label.
 *
 * The source files are the input, not the output: keep them, edit them, re-run
 *   npm run build:crosswords
 * after adding one. Ordering is by the numeric filename prefix, which is what
 * fixes each puzzle to its calendar day — see src/daily.js.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = resolve(root, 'Crosswords/puzzles');
const PUZZLES_OUT = resolve(root, 'public/crosswords/puzzles.json');
const MANIFEST_OUT = resolve(root, 'src/crossword-manifest.json');

/** Source files are `NN_topic_crossword.html`; NN fixes the order. */
const SOURCE_RE = /^(\d+)_(.+)_crossword\.html$/;

/**
 * Day 0 of the rotation, and the single place it is written down — both the
 * dashboard and the engine date puzzles from it, so it is stamped into both
 * outputs rather than declared twice and left to drift.
 *
 * Matches the Doctordle epoch so both dailies count from the same morning.
 * Once real students have played, moving it re-dates every puzzle.
 */
const EPOCH = '2026-09-01';

/**
 * Finds `const <name> = { ... };` and returns the object literal as source text.
 *
 * A regex cannot do this: the clues are prose full of braces and apostrophes, so
 * the closing brace has to be found by scanning with an eye on string state
 * rather than by matching the first `};`.
 */
function sliceObjectLiteral(html, name) {
  const start = html.indexOf(`const ${name} = {`);
  if (start === -1) return null;

  const open = html.indexOf('{', start);
  let depth = 0;
  let quote = null;

  for (let i = open; i < html.length; i++) {
    const ch = html[i];

    if (quote) {
      if (ch === '\\') { i++; continue; }        // escaped char — skip the pair
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return html.slice(open, i + 1);
  }
  return null;
}

/** Evaluates an extracted literal with no access to anything. */
function evalLiteral(source, file) {
  try {
    return vm.runInNewContext(`(${source})`, Object.create(null), { timeout: 1000 });
  } catch (error) {
    throw new Error(`${file}: could not read PUZZLE — ${error.message}`);
  }
}

/** Pulls the text out of a one-off element, e.g. the subtitle or source note. */
function textOf(html, className) {
  const match = html.match(new RegExp(`<div class="${className}">([^<]*)</div>`));
  return match ? match[1].trim() : '';
}

const files = readdirSync(SRC_DIR).filter((f) => SOURCE_RE.test(f)).sort();
if (files.length === 0) throw new Error(`no crossword sources found in ${SRC_DIR}`);

const puzzles = [];
const manifest = [];

for (const file of files) {
  const [, number] = file.match(SOURCE_RE);
  const html = readFileSync(resolve(SRC_DIR, file), 'utf8');

  const source = sliceObjectLiteral(html, 'PUZZLE');
  if (!source) throw new Error(`${file}: no 'const PUZZLE = {' block`);

  const puzzle = evalLiteral(source, file);
  if (!puzzle.title) throw new Error(`${file}: PUZZLE has no title`);
  if (!puzzle.clues?.across?.length) throw new Error(`${file}: no across clues`);
  if (!puzzle.clues?.down?.length) throw new Error(`${file}: no down clues`);

  for (const [direction, clues] of Object.entries(puzzle.clues)) {
    for (const clue of clues) {
      for (const field of ['number', 'answer', 'row', 'col', 'text']) {
        if (clue[field] === undefined) {
          throw new Error(`${file}: ${direction} clue ${clue.number} is missing '${field}'`);
        }
      }
      if (!/^[A-Z]+$/.test(clue.answer)) {
        throw new Error(`${file}: answer "${clue.answer}" is not plain uppercase letters`);
      }
    }
  }

  const id = `c${number}`;
  const wordCount = puzzle.clues.across.length + puzzle.clues.down.length;

  puzzles.push({
    id,
    title: puzzle.title,
    // The three bits of per-puzzle chrome the old files carried outside PUZZLE.
    subtitle: textOf(html, 'subtitle') || `${puzzle.title} Edition`,
    sources: textOf(html, 'source-note'),
    revision: (html.match(/gm\s*=\s*'(Review [^']*)'/) || [])[1] || '',
    clues: puzzle.clues,
  });

  manifest.push({ id, number: Number(number), title: puzzle.title, words: wordCount });
}

mkdirSync(dirname(PUZZLES_OUT), { recursive: true });
writeFileSync(PUZZLES_OUT, `${JSON.stringify({ v: 1, epoch: EPOCH, puzzles }, null, 2)}\n`);
writeFileSync(MANIFEST_OUT, `${JSON.stringify({ epoch: EPOCH, puzzles: manifest }, null, 2)}\n`);

const kb = (p) => (readFileSync(p).length / 1024).toFixed(0);
console.log(`${puzzles.length} crosswords`);
console.log(`  public/crosswords/puzzles.json  ${kb(PUZZLES_OUT)} KB`);
console.log(`  src/crossword-manifest.json     ${kb(MANIFEST_OUT)} KB`);
