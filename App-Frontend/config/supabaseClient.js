import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '@env';

const url = (SUPABASE_URL && SUPABASE_URL.trim()) || 'https://placeholder.supabase.co';
const key = (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.trim()) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const usingPlaceholder =
  url.includes('placeholder.supabase.co') || key.includes('placeholder');

if (usingPlaceholder) {
  console.warn(
    'ShareGo: SUPABASE_URL / SUPABASE_ANON_KEY missing in bundle. Add App-Frontend/.env then: npx react-native start --reset-cache and rebuild the app.',
  );
}

export const supabase = createClient(url, key);
