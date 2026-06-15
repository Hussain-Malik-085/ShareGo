import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '@env';

const url = (SUPABASE_URL && SUPABASE_URL.trim()) || 'https://placeholder.supabase.co';
const key = (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.trim()) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const usingPlaceholder =
  url.includes('placeholder.supabase.co') ||
  key.includes('placeholder') ||
  url.includes('YOUR_PROJECT_REF');

const knownInvalidExampleHost = 'cfruenqlarzlsfugrkcc.supabase.co';

if (usingPlaceholder) {
  console.warn(
    'ShareGo: SUPABASE_URL / SUPABASE_ANON_KEY missing in bundle. Add App-Frontend/.env then: npx react-native start --reset-cache and rebuild the app.',
  );
} else if (url.includes(knownInvalidExampleHost)) {
  console.warn(
    'ShareGo: SUPABASE_URL still uses the sample project from .env.example. Create your project at supabase.com, copy Project URL + anon/publishable key into App-Frontend/.env, then: npx react-native start --reset-cache and rebuild.',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
