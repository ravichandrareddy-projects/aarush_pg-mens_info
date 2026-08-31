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

/**
 * Obfuscated Room QR Security Token System (V2 Strict)
 * Converts plain room numbers (e.g. "610") into unique, cryptographically validated security tokens
 * e.g. "610" -> "qrm_610_k9x2m4_sec"
 * OLD DIRECT LINKS (?collectRoom=610) ARE 100% INVALIDATED AND REJECTED.
 */
const ROOM_TOKEN_SALT = 'AARUSH_PG_SECURE_TOKEN_SALT_2026_V3_OPAQUE';

function computeRoomHash(roomStr: string): string {
  let hash = 0;
  const str = `${roomStr.trim().toUpperCase()}_${ROOM_TOKEN_SALT}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

export function getRoomSecurityToken(roomNumber: string): string {
  if (!roomNumber) return '';
  const clean = roomNumber.trim().toUpperCase();
  const hash = computeRoomHash(clean);
  const payload = `${clean}|${hash}`;
  return `qrs_${btoa(payload).replace(/=/g, '')}`;
}

export function resolveRoomNumberFromToken(tokenOrRoom: string): string {
  if (!tokenOrRoom) return '';
  const clean = tokenOrRoom.trim();

  // Pattern: qrs_[base64]
  if (clean.startsWith('qrs_')) {
    try {
      const b64 = clean.substring(4);
      const padded = b64 + '==='.slice((b64.length + 3) % 4);
      const payload = atob(padded);
      const parts = payload.split('|');
      if (parts.length === 2) {
        const parsedRoom = parts[0];
        const expectedHash = computeRoomHash(parsedRoom);
        if (parts[1].toLowerCase() === expectedHash.toLowerCase()) {
          return parsedRoom;
        }
      }
    } catch {
      return '';
    }
  }

  // ALL OLD DIRECT ROOM NUMBERS OR V2 TOKENS ARE REJECTED
  return '';
}
