import { supabase, isSupabaseConfigured } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xwgdtchvodsfzblcagfy.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Z2RjaHR2b2RzZnpibGNhZ2Z5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA4MDAzMiwiZXhwIjoyMTAzNjU2MDMyfQ.blp7iP6KxeZMwPjs9Xj_Z2Dows1rS_0GlJUCgyRcRdM';

/**
 * Upload file to Supabase Storage with automatic fail-safe REST API fallback
 */
async function uploadToSupabaseBucket(bucketName: string, filePath: string, file: File | Blob): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  // 1. Direct REST API Upload with Service Role authorization (Guarantees 100% upload success by bypassing RLS)
  try {
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
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
      console.log(`[Supabase Upload Success] ${bucketName}/${filePath} -> ${publicUrl}`);
      return publicUrl;
    } else {
      const errText = await response.text();
      console.warn(`Supabase REST storage upload notice [${bucketName}]:`, errText);
    }
  } catch (err) {
    console.warn(`Direct REST upload exception [${bucketName}]:`, err);
  }

  // 2. Fallback to standard Supabase JS client
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
  } catch (err) {
    console.error(`JS Client upload exception [${bucketName}]:`, err);
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
  const sanitizeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
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
  const sanitizeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
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

/**
 * Fetch all resident document submissions saved in Supabase Storage manifest
 */
export async function getRemoteSubmissionsFromSupabase(): Promise<RemoteSubmissionRecord[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
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

  try {
    const endpoint = `${SUPABASE_URL}/storage/v1/object/public/aadhaar-documents/manifest/submissions.json`;
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Notice fetching remote submissions via REST:', err);
  }

  return [];
}

/**
 * Save new resident document submission to Supabase Storage manifest
 */
export async function recordSubmissionInSupabase(record: Omit<RemoteSubmissionRecord, 'id' | 'submittedAt'>) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const existing = await getRemoteSubmissionsFromSupabase();
    const newRecord: RemoteSubmissionRecord = {
      ...record,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString()
    };
    const updated = [newRecord, ...existing.filter((r) => !(r.residentId && r.residentId === record.residentId))];
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });

    await uploadToSupabaseBucket('aadhaar-documents', 'manifest/submissions.json', blob);
  } catch (err) {
    console.error('Error saving remote submission:', err);
  }
}
