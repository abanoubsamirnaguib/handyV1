/**
 * Referral signup URL for the SPA. Uses the current origin so dev (e.g. :5173)
 * matches the page the user is on; API-only `user.referral_link` uses APP_URL/FRONTEND_URL and often shows :8000.
 */
export function getReferralInviteUrl(user) {
  if (!user) return '';
  if (user.referral_code && typeof window !== 'undefined') {
    return `${window.location.origin}/register?ref=${encodeURIComponent(user.referral_code)}`;
  }
  return user.referral_link || '';
}
