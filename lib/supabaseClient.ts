import { createClient } from '@supabase/supabase-js';

// NEXT_PUBLIC_ variables are accessible in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are missing. ' +
    'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

// ALWAYS use the Anon Key for client-side Supabase instances
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
