import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const cards = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'anki-cards.json'), 'utf8')
);

const BATCH_SIZE = 500;

async function upload() {
  console.log(`Uploading ${cards.length} cards in batches of ${BATCH_SIZE}...`);

  // Clear existing cards first
  const { error: deleteError } = await supabase.from('anki_cards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Error clearing table:', deleteError.message);
    process.exit(1);
  }
  console.log('Cleared existing cards.');

  let uploaded = 0;
  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE).map(c => ({
      condition: c.condition,
      full_path: c.full_path,
      front: c.front,
      back: c.back,
      tags: c.tags,
    }));

    const { error } = await supabase.from('anki_cards').insert(batch);
    if (error) {
      console.error(`Error on batch ${i}:`, error.message);
      process.exit(1);
    }
    uploaded += batch.length;
    console.log(`Uploaded ${uploaded}/${cards.length}`);
  }

  console.log('Done!');
}

upload();
