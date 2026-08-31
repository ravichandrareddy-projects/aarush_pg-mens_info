import { supabase, isSupabaseConfigured } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xwgdchtvodsfzblcagfy.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Z2RjaHR2b2RzZnpibGNhZ2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODAwMzIsImV4cCI6MjEwMzY1NjAzMn0.sWLmTdEdFNaLWM7VUgfh1LOFd6GUqvqjfwHpNlU7s0E';

/**
 * Upload file to Supabase Storage securely using Anon Key with RLS
 */
async function uploadToSupabaseBucket(bucketName: string, filePath: string, file: File | Blob): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  try {
    if (supabase) {
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
        return publicUrlData.publicUrl;
      }
    }

    const endpoint = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        'x-upsert': 'true',
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (response.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
    }
  } catch {
    // Fail silently in production without leaking paths or keys
  }

  return null;
}

export function getFloorFolderName(roomNumber: string): string {
  const cleanRoom = roomNumber.trim().toUpperCase();
  if (cleanRoom.startsWith('G')) return 'Ground_Floor';
  const firstChar = cleanRoom.charAt(0);
  switch (firstChar) {
    case '1': return '1st_Floor';
    case '2': return '2nd_Floor';
    case '3': return '3rd_Floor';
    case '4': return '4th_Floor';
    case '5': return '5th_Floor';
    case '6': return '6th_Floor';
    case '7': return '7th_Floor';
    default: return 'Floor_General';
  }
}

function getFileExtension(file: File | Blob, defaultExt: string): string {
  if ('name' in file && file.name && file.name.includes('.')) {
    const ext = file.name.split('.').pop();
    if (ext) return `.${ext.toLowerCase()}`;
  }
  if (file.type) {
    if (file.type.includes('png')) return '.png';
    if (file.type.includes('jpeg') || file.type.includes('jpg')) return '.jpg';
    if (file.type.includes('webp')) return '.webp';
    if (file.type.includes('pdf')) return '.pdf';
  }
  return defaultExt;
}

/**
 * Upload resident photo to Supabase Storage ('resident-photos' bucket)
 * Saves in Floor-wise / Room-wise folder hierarchy e.g. 1st_Floor/Room_101/photo.jpg
 */
export async function uploadResidentPhoto(
  file: File | Blob,
  fileName: string,
  roomNumber?: string,
  floorName?: string
): Promise<string | null> {
  const ext = getFileExtension(file, '.jpg');
  const fullFileName = fileName.toLowerCase().endsWith(ext) ? fileName : `${fileName}${ext}`;
  const sanitizeName = fullFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const floorFolder = floorName
    ? floorName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    : roomNumber
    ? getFloorFolderName(roomNumber)
    : 'General_Floor';
  const roomFolder = roomNumber
    ? `Room_${roomNumber.trim().replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    : 'General_Room';

  const filePath = `${floorFolder}/${roomFolder}/${Date.now()}_${sanitizeName}`;
  return uploadToSupabaseBucket('resident-photos', filePath, file);
}

/**
 * Upload Aadhaar card document to Supabase Storage ('aadhaar-documents' bucket)
 * Saves in Floor-wise / Room-wise folder hierarchy e.g. 1st_Floor/Room_101/aadhaar.pdf
 */
export async function uploadAadhaarDocument(
  file: File | Blob,
  fileName: string,
  roomNumber?: string,
  floorName?: string
): Promise<string | null> {
  const ext = getFileExtension(file, '.pdf');
  const fullFileName = fileName.toLowerCase().endsWith(ext) ? fileName : `${fileName}${ext}`;
  const sanitizeName = fullFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const floorFolder = floorName
    ? floorName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    : roomNumber
    ? getFloorFolderName(roomNumber)
    : 'General_Floor';
  const roomFolder = roomNumber
    ? `Room_${roomNumber.trim().replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    : 'General_Room';

  const filePath = `${floorFolder}/${roomFolder}/${Date.now()}_${sanitizeName}`;
  return uploadToSupabaseBucket('aadhaar-documents', filePath, file);
}

/**
 * Delete image or document file from Supabase Storage when explicitly requested by admin
 */
export async function deleteSupabaseFile(bucketName: 'resident-photos' | 'aadhaar-documents', filePath: string) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    if (supabase) {
      await supabase.storage.from(bucketName).remove([filePath]);
    }
    const endpoint = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`;
    await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY
      }
    });
  } catch (err) {
    console.error('Error deleting file from Supabase storage:', err);
  }
}

export interface RemoteSubmissionRecord {
  id: string;
  roomNumber: string;
  bedId?: string;
  residentId?: string;
  residentName: string;
  phone: string;
  aadhaarNumber: string;
  aadhaarDocumentUrl?: string;
  photoUrl?: string;
  submittedAt: string;
}

export function extractSupabaseFilePath(url: string, bucketName: string): string | null {
  if (!url) return null;
  const marker = `/public/${bucketName}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return url.substring(idx + marker.length);
  }
  return null;
}

/**
 * Fetch all resident document submissions saved in Supabase Storage manifest
 */
export async function getRemoteSubmissionsFromSupabase(): Promise<RemoteSubmissionRecord[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];

  const cacheBuster = `t=${Date.now()}`;

  // 1. Direct REST API download with cache buster
  try {
    const endpoint = `${SUPABASE_URL}/storage/v1/object/public/aadhaar-documents/manifest/submissions.json?${cacheBuster}`;
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    if (res.ok) {
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    }
  } catch (err) {
    console.warn('Notice fetching remote submissions via REST:', err);
  }

  // 2. Fallback to JS client
  try {
    if (supabase) {
      const { data, error } = await supabase.storage.from('aadhaar-documents').download('manifest/submissions.json');
      if (!error && data) {
        const text = await data.text();
        return JSON.parse(text) || [];
      }
    }
  } catch (err) {
    console.warn('Notice fetching remote submissions via client:', err);
  }

  return [];
}

/**
 * Save new resident document submission to Supabase Storage manifest.
 * Automatically deletes previous photo and Aadhaar document files from Supabase Storage on re-upload!
 */
export async function recordSubmissionInSupabase(record: Omit<RemoteSubmissionRecord, 'id' | 'submittedAt'>) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const existing = await getRemoteSubmissionsFromSupabase();

    // Match condition for previous submission by residentId, bedId+roomNumber, or name+roomNumber
    const matchCondition = (r: RemoteSubmissionRecord) => {
      if (record.residentId && r.residentId && r.residentId === record.residentId) return true;
      if (record.bedId && r.bedId && r.bedId === record.bedId && r.roomNumber === record.roomNumber) return true;
      if (r.roomNumber === record.roomNumber && r.residentName.trim().toLowerCase() === record.residentName.trim().toLowerCase()) return true;
      return false;
    };

    const previousRecords = existing.filter(matchCondition);

    // Delete old files from Supabase Storage so old duplicates are removed on re-upload!
    for (const prev of previousRecords) {
      if (prev.photoUrl && record.photoUrl && prev.photoUrl !== record.photoUrl) {
        const path = extractSupabaseFilePath(prev.photoUrl, 'resident-photos');
        if (path) {
          console.log(`[Supabase Cleanup] Removing old photo: ${path}`);
          await deleteSupabaseFile('resident-photos', path);
        }
      }
      if (prev.aadhaarDocumentUrl && record.aadhaarDocumentUrl && prev.aadhaarDocumentUrl !== record.aadhaarDocumentUrl) {
        const path = extractSupabaseFilePath(prev.aadhaarDocumentUrl, 'aadhaar-documents');
        if (path) {
          console.log(`[Supabase Cleanup] Removing old Aadhaar document: ${path}`);
          await deleteSupabaseFile('aadhaar-documents', path);
        }
      }
    }

    const prev = previousRecords[0];

    const newRecord: RemoteSubmissionRecord = {
      ...record,
      aadhaarDocumentUrl: record.aadhaarDocumentUrl || prev?.aadhaarDocumentUrl,
      photoUrl: record.photoUrl || prev?.photoUrl,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString()
    };

    const updated = [newRecord, ...existing.filter((r) => !matchCondition(r))];
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });

    await uploadToSupabaseBucket('aadhaar-documents', 'manifest/submissions.json', blob);
  } catch (err) {
    console.error('Error saving remote submission:', err);
  }
}

/**
 * Permanently delete resident's photo & Aadhaar document files from Supabase Storage buckets
 * and remove submission entry from manifest.
 */
export async function eraseResidentDocumentsFromSupabase(params: {
  roomNumber: string;
  residentId?: string;
  residentName?: string;
  photoUrl?: string;
  aadhaarDocumentUrl?: string;
}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    // 1. Delete physical files from Supabase Storage
    if (params.photoUrl) {
      const path = extractSupabaseFilePath(params.photoUrl, 'resident-photos');
      if (path) {
        console.log(`[Supabase Erase] Deleting photo file: ${path}`);
        await deleteSupabaseFile('resident-photos', path);
      }
    }
    if (params.aadhaarDocumentUrl) {
      const path = extractSupabaseFilePath(params.aadhaarDocumentUrl, 'aadhaar-documents');
      if (path) {
        console.log(`[Supabase Erase] Deleting Aadhaar document file: ${path}`);
        await deleteSupabaseFile('aadhaar-documents', path);
      }
    }

    // 2. Remove submission record from manifest/submissions.json
    const existing = await getRemoteSubmissionsFromSupabase();
    const updated = existing.filter((r) => {
      if (params.residentId && r.residentId === params.residentId) return false;
      if (params.residentName && r.roomNumber === params.roomNumber && r.residentName.trim().toLowerCase() === params.residentName.trim().toLowerCase()) return false;
      if (r.roomNumber === params.roomNumber && !params.residentId && !params.residentName) return false;
      return true;
    });

    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });
    await uploadToSupabaseBucket('aadhaar-documents', 'manifest/submissions.json', blob);

    // 3. Clear local submission state for that room
    try {
      localStorage.removeItem(`aarush_submitted_room_${params.roomNumber}`);
    } catch {
      // Ignore localStorage error
    }
  } catch (err) {
    console.error('Error erasing resident documents from Supabase:', err);
  }
}

export interface MasterStateRecord {
  residents: any[];
  payments: any[];
  activities: any[];
  updatedAt: string;
}

/**
 * Save Master Resident State to Supabase Storage for 100% Cross-Device Real-time Sync
 * (Syncs Phone APK, Laptop Web, and Mobile PWA seamlessly)
 */
export async function saveMasterStateToSupabase(state: { residents?: any[]; payments?: any[]; activities?: any[] }) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const existing = await getMasterStateFromSupabase();
    const payload: MasterStateRecord = {
      residents: state.residents || existing?.residents || [],
      payments: state.payments || existing?.payments || [],
      activities: state.activities || existing?.activities || [],
      updatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    await uploadToSupabaseBucket('aadhaar-documents', 'manifest/master_state.json', blob);
    console.log('[Supabase Master Sync] Successfully synced master state across all devices.');
  } catch (err) {
    console.warn('Notice saving master state to Supabase:', err);
  }
}

/**
 * Get Master Resident State from Supabase Storage for Cross-Device Sync
 */
export async function getMasterStateFromSupabase(): Promise<MasterStateRecord | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/aadhaar-documents/manifest/master_state.json?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Notice fetching master state from Supabase:', err);
  }
  return null;
}

/**
 * Trigger Global Emergency Hard Reset across ALL active screens and devices
 */
export async function triggerGlobalHardReset(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const payload = { resetAt: Date.now() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    await uploadToSupabaseBucket('aadhaar-documents', 'manifest/security_reset.json', blob);
  } catch {
    // Fail silently
  }
}

/**
 * Fetch latest Global Hard Reset timestamp from Supabase
 */
export async function getGlobalResetTimestamp(): Promise<number | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/aadhaar-documents/manifest/security_reset.json?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.resetAt || null;
    }
  } catch {
    return null;
  }
  return null;
}
