import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid (not placeholder values)
const isValidUrl = (url: string): boolean => {
  if (!url || url === 'your_supabase_project_url') return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const isValidKey = (key: string): boolean => {
  return Boolean(key && key !== 'your_supabase_anon_key' && key.length > 20);
};

const hasValidCredentials = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

if (!hasValidCredentials) {
  console.warn('Supabase credentials not configured. Room sharing features will be disabled.');
  console.warn('To enable room sharing, configure your Supabase credentials in .env.local');
  console.warn('See SUPABASE_SETUP.md for instructions.');
}

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
