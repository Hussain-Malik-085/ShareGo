/**
 * Maps Supabase Auth errors to clearer copy (e.g. email send rate limits).
 */

export function formatAuthError(error) {
  if (!error) return 'Something went wrong. Try again.';

  const msg = (error.message || '').trim();
  const lower = msg.toLowerCase();
  const code = error.code || '';
  const status = error.status;

  if (
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    lower.includes('rate limit') ||
    lower.includes('email rate limit')
  ) {
    return (
      'Email sending limit reached (Supabase blocks too many signup/reset emails per hour). ' +
      'Wait up to an hour, use a different email, or for class/testing: Supabase → Authentication → ' +
      'Providers → Email → turn off "Confirm email", then sign up again (no confirmation email is sent).'
    );
  }

  if (lower.includes('network request failed') || lower.includes('failed to fetch')) {
    return (
      'Cannot reach Supabase. In App-Frontend/.env set your real SUPABASE_URL and SUPABASE_ANON_KEY ' +
      '(Supabase → Project Settings → API). Then restart Metro with --reset-cache and rebuild the app.'
    );
  }

  return msg || 'Something went wrong. Try again.';
}
