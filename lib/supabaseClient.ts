import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log initialization status to help debug "Failed to fetch" errors
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error(
    'CRITICAL: Supabase environment variables are missing or invalid. ' +
    'Please ensure your file is named ".env.local" (with a leading dot) ' +
    'and contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://invalid-url-to-trigger-error.supabase.co',
  supabaseAnonKey || 'invalid_key'
);
