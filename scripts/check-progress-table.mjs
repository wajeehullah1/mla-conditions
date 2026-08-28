/**
 * Reports whether the user_progress table from
 * supabase/migrations/20260828120000_user_progress.sql has been applied yet.
 *
 * Uses the public anon key, so it proves exactly what the browser would see:
 * the table exists and row-level security is on (an anonymous read returns
 * nothing rather than everyone's progress).
 *
 *   node scripts/check-progress-table.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function env(name) {
  const line = readFileSync(resolve(root, '.env.local'), 'utf8')
    .split('\n')
    .find((l) => l.startsWith(`${name}=`));
  if (!line) throw new Error(`${name} is not set in .env.local`);
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
}

const url = env('VITE_SUPABASE_URL');
const key = env('VITE_SUPABASE_ANON_KEY');

const res = await fetch(`${url}/rest/v1/user_progress?select=user_id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const body = await res.json().catch(() => null);

if (res.ok) {
  console.log('✓ user_progress exists — cross-device sync is live.');
  console.log(`  An anonymous read returned ${Array.isArray(body) ? body.length : '?'} rows, which is what RLS should do.`);
  process.exit(0);
}

const code = body?.code ?? '';
if (code === 'PGRST205' || code === '42P01') {
  console.log('✗ user_progress does not exist yet.');
  console.log('  Run supabase/migrations/20260828120000_user_progress.sql in the Supabase SQL editor.');
  console.log('  Until then progress still works, but stays on one device per browser.');
  process.exit(1);
}

console.log(`✗ Could not check (HTTP ${res.status}): ${body?.message ?? 'unknown error'}`);
process.exit(1);
