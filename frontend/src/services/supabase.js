import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqezkqlufuieuaqfducr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Syncs the authenticated Clerk user into Supabase public.users table
 */
export async function syncUserWithSupabase(user) {
  if (!user || !user.id) return;

  const userData = {
    clerk_id: user.id,
    email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || `${user.id}@podlaunch.io`,
    full_name: user.fullName || user.username || user.firstName || 'Developer',
    avatar_url: user.imageUrl || null,
    role: 'researcher',
    updated_at: new Date().toISOString()
  };

  // 1. Sync via Backend API (which connects directly to Supabase via asyncpg/psycopg2)
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    await fetch(`${apiBase}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    console.log('[PodLaunch] Synced Clerk user with backend Supabase database:', userData.email);
  } catch (err) {
    console.warn('[PodLaunch] Backend sync endpoint unreachable, checking direct Supabase client...', err);
  }

  // 2. Direct Supabase Client fallback (if VITE_SUPABASE_ANON_KEY is provided)
  if (supabase) {
    try {
      const { error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'clerk_id' });
      if (error) {
        console.error('[PodLaunch] Direct Supabase upsert error:', error);
      } else {
        console.log('[PodLaunch] Direct Supabase upsert succeeded for:', userData.email);
      }
    } catch (e) {
      console.warn('[PodLaunch] Direct Supabase upsert exception:', e);
    }
  }
}
