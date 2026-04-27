import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '@env';

const url = (SUPABASE_URL && SUPABASE_URL.trim()) || 'https://placeholder.supabase.co';
const key = (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.trim()) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'ShareGo: Set SUPABASE_URL and SUPABASE_ANON_KEY in App-Frontend .env (see .env.example).',
  );
}

export const supabase = createClient(url, key);
