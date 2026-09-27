/**
 * Administrator Configuration
 *
 * To add or modify administrator accounts, update the ADMIN_EMAILS list below.
 * Users logged in with any of these Google account emails will have full access
 * to the Admin Portal (approving user-submitted plants to the shared global catalog,
 * dismissing them, or monitoring community submissions).
 */
export const ADMIN_EMAILS: string[] = [
  'aarya.bivalkar1605@gmail.com',
];

/**
 * Checks whether an email address belongs to an authorized app administrator.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase().trim() === normalized);
}
