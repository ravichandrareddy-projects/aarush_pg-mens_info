/**
 * Security & Privacy Protection Utilities for Aarush PG Management
 */

const ADMIN_SESSION_KEY = 'aarush_admin_auth_session';

/**
 * Mask 12-digit Aadhaar number for default privacy protection
 * Example: "987654321012" -> "XXXX-XXXX-1012"
 */
export function maskAadhaarNumber(aadhaar?: string): string {
  if (!aadhaar) return 'Not Provided';
  const clean = aadhaar.replace(/[^0-9]/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Mask resident phone number for privacy protection
 * Example: "9988776655" -> "******6655"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '******0000';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '******0000';
  const last4 = clean.slice(-4);
  return `******${last4}`;
}

/**
 * Admin Passcode & Session Management
 */
const DEFAULT_ADMIN_PIN = '1234'; // Default Admin Security PIN

export function verifyAdminPin(pinInput: string): boolean {
  if (!pinInput) return false;
  return pinInput.trim() === DEFAULT_ADMIN_PIN;
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        authenticated: true,
        loginTime: Date.now()
      }));
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

export function isAdminSessionActive(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.authenticated) {
      // 1-hour session expiration check
      const elapsed = Date.now() - (parsed.loginTime || 0);
      if (elapsed < 60 * 60 * 1000) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}
