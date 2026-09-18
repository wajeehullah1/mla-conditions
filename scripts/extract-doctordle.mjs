/**
 * Turns the standalone Doctordle HTML files in public/doctordle/ into data.
 *
 * Every one of those files was a full copy of the game — the CSS, the scoring
 * engine, the autocomplete list — wrapped around a single case worth about a
 * kilobyte. That made a daily puzzle impractical: a year of content would have
 * been sixteen megabytes of near-identical markup, and fixing the engine would
 * have meant editing every file.
 *
 * So this reads the two data declarations out of each one and throws the rest
 * away, leaving a single engine (public/doctordle/index.html) to render them:
 *
 *   public/doctordle/puzzles.json  — every case plus the union of the
 *                                    autocomplete lists. Fetched by the engine,
 *                                    so the answers never enter the React bundle.
 *   src/doctordle-manifest.json    — id and patient stem only, no diagnosis.
 *                                    Imported by the dashboard, which needs to
 *                                    list and date puzzles without spoiling them.
 *
 * The source files are the input, not the output: keep them, edit them, re-run
 *   npm run build:doctordle
 * after adding a case. Ordering is by the numeric filename prefix, which is what
 * fixes each puzzle to its calendar day — see src/doctordle.js.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = resolve(root, 'Doctordle/cases');
const PUZZLES_OUT = resolve(root, 'public/doctordle/puzzles.json');
const MANIFEST_OUT = resolve(root, 'src/doctordle-manifest.json');

/** Source files are `NN_condition_name_clerking_style.html`; NN fixes the order. */
const SOURCE_RE = /^(\d+)_(.+)_clerking_style\.html$/;

/**
 * Day 0 of the daily rotation, and the single place it is written down. Both the
 * dashboard (src/doctordle.js) and the game engine date puzzles from it, so it
 * is stamped into both outputs rather than declared twice and drifting.
 *
 * Set a little before launch so the archive opens with a stock of past cases
 * instead of one. Once real students have played, moving it re-dates every
 * puzzle and invalidates their history — treat it as fixed.
 */
const EPOCH = '2026-09-01';

/**
 * Finds `const <name> = [ ... ];` and returns the array literal as source text.
 *
 * A regex cannot do this: the arrays hold prose full of brackets and apostrophes
 * ("Pain radiates to left arm[...]"), so the closing bracket has to be found by
 * scanning with an eye on string state rather than by matching the first `];`.
 */
function sliceArrayLiteral(html, name) {
  const start = html.indexOf(`const ${name} = [`);
  if (start === -1) return null;

  const open = html.indexOf('[', start);
  let depth = 0;
  let quote = null;

  for (let i = open; i < html.length; i++) {
    const ch = html[i];

    if (quote) {
      if (ch === '\\') { i++; continue; }         // escaped char — skip the pair
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) return html.slice(open, i + 1);
  }
  return null;
}

/** Evaluates an extracted array literal with no access to anything. */
function evalArray(source, what, file) {
  try {
    const value = vm.runInNewContext(`(${source})`, Object.create(null), { timeout: 1000 });
    if (!Array.isArray(value)) throw new Error('not an array');
    return value;
  } catch (error) {
    throw new Error(`${file}: could not read ${what} — ${error.message}`);
  }
}

/**
 * The one-line stem shown in the archive, e.g. "76F — drowsy and off her food".
 *
 * The picker must not give the diagnosis away, so it cannot show the condition
 * name or the filename. What it can show is the presenting complaint, which is
 * the first thing the case itself displays.
 */
function teaserFrom(complaint) {
  const match = complaint.match(
    /^(?:an?\s+)?(\d+)[\s-]*(?:year|yr)[\s-]*old\s+(male|female|man|woman|boy|girl)\b[,\s]*(.*)$/i,
  );
  if (!match) return { age: null, sex: null, teaser: trimStem(complaint) };

  const [, age, rawSex, rest] = match;
  const sex = /^(male|man|boy)$/i.test(rawSex) ? 'M' : 'F';
  return { age: Number(age), sex, teaser: trimStem(rest) };
}

/** Drops the "presents with" throat-clearing and any trailing full stop. */
function trimStem(text) {
  return text
    .replace(/^(?:who\s+)?presents?\s+(?:to\s+\S+\s+)?(?:with|from|after|following)?\s*/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim();
}

const files = readdirSync(SRC_DIR).filter((f) => SOURCE_RE.test(f)).sort();
if (files.length === 0) throw new Error(`no Doctordle sources found in ${SRC_DIR}`);

const diagnoses = new Set();
const puzzles = [];
const manifest = [];

for (const file of files) {
  const [, number, slug] = file.match(SOURCE_RE);
  const html = readFileSync(resolve(SRC_DIR, file), 'utf8');

  const casesSrc = sliceArrayLiteral(html, 'cases');
  const diagnosesSrc = sliceArrayLiteral(html, 'ALL_DIAGNOSES');
  if (!casesSrc) throw new Error(`${file}: no 'const cases = [' block`);
  if (!diagnosesSrc) throw new Error(`${file}: no 'const ALL_DIAGNOSES = [' block`);

  for (const d of evalArray(diagnosesSrc, 'ALL_DIAGNOSES', file)) {
    if (typeof d === 'string' && d.trim()) diagnoses.add(d.trim());
  }

  const cases = evalArray(casesSrc, 'cases', file);
  if (cases.length !== 1) {
    throw new Error(`${file}: expected exactly 1 case, found ${cases.length}`);
  }

  const c = cases[0];
  for (const field of ['presentingComplaint', 'diagnosis', 'hints', 'explanation', 'management']) {
    if (!c[field]) throw new Error(`${file}: case is missing '${field}'`);
  }
  if (c.hints.length !== 5) {
    throw new Error(`${file}: expected 5 hints, found ${c.hints.length} — scoring assumes 5`);
  }

  // Opaque ids on purpose. The id travels in the iframe URL, so a slug like
  // `addisonian-crisis` would hand the answer to anyone glancing at the address
  // bar — which is exactly what the game is asking them to work out.
  const id = `d${number}`;

  puzzles.push({
    id,
    presentingComplaint: c.presentingComplaint,
    location: c.location ?? '',
    diagnosis: c.diagnosis,
    hints: c.hints,
    explanation: c.explanation,
    management: c.management,
    source: c.source ?? '',
  });

  manifest.push({ id, number: Number(number), ...teaserFrom(c.presentingComplaint) });
  // `slug` stays out of both outputs — it names the diagnosis.
  void slug;
}

const sortedDiagnoses = [...diagnoses].sort((a, b) => a.localeCompare(b));

writeFileSync(
  PUZZLES_OUT,
  `${JSON.stringify({ v: 1, epoch: EPOCH, diagnoses: sortedDiagnoses, puzzles }, null, 2)}\n`,
);
writeFileSync(MANIFEST_OUT, `${JSON.stringify({ epoch: EPOCH, puzzles: manifest }, null, 2)}\n`);

const kb = (p) => (readFileSync(p).length / 1024).toFixed(0);
console.log(`${puzzles.length} puzzles, ${sortedDiagnoses.length} diagnoses`);
console.log(`  public/doctordle/puzzles.json   ${kb(PUZZLES_OUT)} KB`);
console.log(`  src/doctordle-manifest.json     ${kb(MANIFEST_OUT)} KB`);
