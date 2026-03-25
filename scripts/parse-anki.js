import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.join(__dirname, '..', 'All Decks.txt');
const OUTPUT = path.join(__dirname, '..', 'scripts', 'anki-cards.json');

function stripHtml(str) {
  return str
    .replace(/<img[^>]*>/gi, '') // remove images entirely
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function convertCloze(str) {
  // {{c1::answer::hint}} or {{c1::answer}} → just the answer inline
  return str.replace(/\{\{c\d+::([^:}]+)(?:::[^}]*)?\}\}/g, (_, answer) => answer.trim());
}

const SUBTOPIC_WORDS = new Set([
  'General','Management','Investigations','Aetiology','Aetiology/RiskFactors',
  'Acute','Chronic','Clinical','Features','ClinicalFeatures','ClinicalPresentation',
  'Presentation','Staging','Complications','Treatment','Diagnosis','Overview',
  'Pathophysiology','Definition','Epidemiology','Prognosis','Symptoms','Signs',
  'RiskFactors','Causes','Mechanism','History','Examination','Emergency',
  'Bacterial','Viral','Fungal','Drug','Drugs','Antibiotics','Pharmacology',
  'A','B','C','Types','Classification','Screening','Prevention','FollowUp',
  'Monitoring','Investigations/Management',
]);

function extractCondition(tagStr) {
  if (!tagStr) return null;
  // Take the first tag (some cards have multiple)
  const firstTag = tagStr.trim().split(' ')[0];
  const clean = firstTag.replace(/^!/, '');
  const parts = clean.split('::');
  const condIdx = parts.indexOf('Conditions');
  if (condIdx === -1) return null;
  // Take segments after Conditions, filter numeric prefixes and sub-topic labels
  const relevant = parts
    .slice(condIdx + 1)
    .filter(p => !/^\d/.test(p) && !SUBTOPIC_WORDS.has(p));
  return relevant[relevant.length - 1] || null;
}

function extractFullPath(tagStr) {
  if (!tagStr) return null;
  const firstTag = tagStr.trim().split(' ')[0];
  return firstTag.replace(/^!/, '');
}

const raw = fs.readFileSync(INPUT, 'utf8');
const lines = raw.split('\n');

const cards = [];
let skipped = 0;

for (const line of lines) {
  // Skip header lines
  if (line.startsWith('#') || !line.trim()) continue;

  const cols = line.split('\t');
  const frontRaw = cols[0] || '';
  const backRaw = cols[1] || '';
  const tagsRaw = cols[8] || ''; // column 9, 0-indexed = 8

  // Skip cards with images in the front (not useful as text reference)
  if (/<img/i.test(frontRaw)) {
    skipped++;
    continue;
  }

  const condition = extractCondition(tagsRaw);
  if (!condition) {
    skipped++;
    continue;
  }

  const front = convertCloze(stripHtml(frontRaw));
  const back = convertCloze(stripHtml(backRaw));

  if (!front) {
    skipped++;
    continue;
  }

  cards.push({
    condition,
    full_path: extractFullPath(tagsRaw),
    front,
    back: back || null,
    tags: tagsRaw.trim(),
  });
}

fs.writeFileSync(OUTPUT, JSON.stringify(cards, null, 2));
console.log(`Parsed ${cards.length} cards, skipped ${skipped}`);
console.log(`Output: ${OUTPUT}`);

// Preview: show unique conditions
const conditions = [...new Set(cards.map(c => c.condition))].sort();
console.log(`\nUnique conditions: ${conditions.length}`);
console.log('Sample:', conditions.slice(0, 20).join(', '));
