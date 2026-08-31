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
 * Obfuscated Room QR Security Token System
 * Converts plain room numbers (e.g. "610") into unique, cryptographically validated security tokens
 * e.g. "610" -> "qrm_610_k9x2m4_sec"
 */
const ROOM_TOKEN_SALT = 'AARUSH_PG_SECURE_TOKEN_SALT_2026_V1';

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
  return `qrm_${clean.toLowerCase()}_${hash}_sec`;
}

export function resolveRoomNumberFromToken(tokenOrRoom: string): string {
  if (!tokenOrRoom) return '';
  const clean = tokenOrRoom.trim();

  // Pattern: qrm_[room]_[hash]_sec
  const match = clean.match(/^qrm_([g]?\d{2,3})_([a-z0-9]+)_sec$/i);
  if (match) {
    const parsedRoom = match[1].toUpperCase();
    const expectedHash = computeRoomHash(parsedRoom);
    if (match[2].toLowerCase() === expectedHash.toLowerCase()) {
      return parsedRoom;
    }
    // Invalid hash tamper attempt
    return '';
  }

  // Support legacy direct room numbers e.g. "610" or "G01" if clean room number provided
  if (/^(G?\d{2,3})$/i.test(clean)) {
    return clean.toUpperCase();
  }

  return '';
}
