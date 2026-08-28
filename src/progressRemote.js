import { supabase } from './supabase.js';
import { normaliseRecord } from './progress.js';

/**
 * Supabase side of the quest map's progress, kept apart from progress.js so the
 * level maths stays pure and testable.
 *
 * Every call fails soft. Progress lives in localStorage first and syncs second,
 * so a dropped connection — or a project where the migration in
 * supabase/migrations has not been run yet — costs a student nothing but
 * cross-device carry-over.
 */

const TABLE = 'user_progress';

let warned = false;
function warnOnce(action, error) {
  if (warned) return;
  warned = true;
  console.warn(
    `[progress] could not ${action} progress from Supabase — running on this ` +
    `device only. If this persists, apply supabase/migrations/*_user_progress.sql.`,
    error?.message ?? error,
  );
}

/** The student's stored progress, or null if there is none yet (or none reachable). */
export async function fetchRemoteProgress(userId) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('archived_xp, archived_through, days')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) { warnOnce('read', error); return null; }
    if (!data) return null;

    return normaliseRecord({
      archivedXp: data.archived_xp,
      archivedThrough: data.archived_through,
      days: data.days,
    });
  } catch (error) {
    warnOnce('read', error);
    return null;
  }
}

/** Write the merged record back. Returns whether it landed. */
export async function pushRemoteProgress(userId, record) {
  try {
    const { error } = await supabase.from(TABLE).upsert({
      user_id: userId,
      archived_xp: record.archivedXp,
      archived_through: record.archivedThrough,
      days: record.days,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) { warnOnce('save', error); return false; }
    return true;
  } catch (error) {
    warnOnce('save', error);
    return false;
  }
}
