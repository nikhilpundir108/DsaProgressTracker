import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function isSupabaseFetchFailure(error) {
  return error instanceof TypeError && error.message === 'fetch failed';
}

export function getSupabaseUnavailableMessage() {
  const configuredUrl = process.env.SUPABASE_URL;
  if (configuredUrl) {
    try {
      const { hostname } = new URL(configuredUrl);
      if (['localhost', '127.0.0.1', '::1'].includes(hostname)) {
        return 'SUPABASE_URL points to a local endpoint that is not responding. Start local Supabase or set it to your active project HTTPS URL.';
      }
    } catch {
      return 'SUPABASE_URL is invalid. Set it to the Project URL from your Supabase project settings.';
    }
  }

  return 'Could not connect to Supabase Auth. Verify the project URL, project status, and network access.';
}

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL is not configured');
  }
  return url;
}

export function createSupabaseAuthClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_PUBLISHABLE_KEY is not configured');
  }

  return createClient(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error('SUPABASE_SECRET_KEY is not configured');
  }

  return createClient(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}