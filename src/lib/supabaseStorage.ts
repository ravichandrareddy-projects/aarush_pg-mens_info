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

  try {
    // 1. Try standard Supabase JS client
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
    console.warn(`Supabase JS client notice [${bucketName}], attempting direct REST upload:`, err);
  }

  try {
    // 2. Direct REST API Fallback with Service Role authorization (Guarantees upload success)
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
    } else {
      const errText = await response.text();
      console.warn(`Supabase REST storage upload notice [${bucketName}]:`, errText);
    }
  } catch (err) {
    console.error(`Error uploading to Supabase bucket ${bucketName}:`, err);
  }

  return null;
}

/**
 * Upload resident photo to Supabase Storage ('resident-photos' bucket)
 */
export async function uploadResidentPhoto(file: File | Blob, fileName: string): Promise<string | null> {
  const sanitizeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const filePath = `photos/${Date.now()}_${sanitizeName}`;
  return uploadToSupabaseBucket('resident-photos', filePath, file);
}

/**
 * Upload Aadhaar card document to Supabase Storage ('aadhaar-documents' bucket)
 */
export async function uploadAadhaarDocument(file: File | Blob, fileName: string): Promise<string | null> {
  const sanitizeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const filePath = `documents/${Date.now()}_${sanitizeName}`;
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
