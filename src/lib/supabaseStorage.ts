import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Upload resident photo to Supabase Storage ('resident-photos' bucket)
 * Stored permanently until admin explicitly deletes
 */
export async function uploadResidentPhoto(file: File | Blob, fileName: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const filePath = `photos/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage.from('resident-photos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    if (error) {
      console.warn('Supabase photo upload notice:', error.message);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from('resident-photos').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading photo to Supabase:', err);
    return null;
  }
}

/**
 * Upload Aadhaar card document to Supabase Storage ('aadhaar-documents' bucket)
 * Stored permanently until admin explicitly deletes
 */
export async function uploadAadhaarDocument(file: File | Blob, fileName: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const filePath = `documents/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage.from('aadhaar-documents').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    if (error) {
      console.warn('Supabase document upload notice:', error.message);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from('aadhaar-documents').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading document to Supabase:', err);
    return null;
  }
}

/**
 * Delete image or document file from Supabase Storage when explicitly requested by admin
 */
export async function deleteSupabaseFile(bucketName: 'resident-photos' | 'aadhaar-documents', filePath: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error) {
      console.warn('Supabase delete file notice:', error.message);
    } else {
      console.log(`Successfully deleted ${filePath} from Supabase bucket ${bucketName}`);
    }
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
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase.storage.from('aadhaar-documents').download('manifest/submissions.json');
    if (error || !data) return [];
    const text = await data.text();
    return JSON.parse(text) || [];
  } catch (err) {
    console.warn('Notice fetching remote submissions:', err);
    return [];
  }
}

/**
 * Save new resident document submission to Supabase Storage manifest
 */
export async function recordSubmissionInSupabase(record: Omit<RemoteSubmissionRecord, 'id' | 'submittedAt'>) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const existing = await getRemoteSubmissionsFromSupabase();
    const newRecord: RemoteSubmissionRecord = {
      ...record,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString()
    };
    const updated = [newRecord, ...existing.filter((r) => !(r.residentId && r.residentId === record.residentId))];
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });
    await supabase.storage.from('aadhaar-documents').upload('manifest/submissions.json', blob, {
      upsert: true,
      contentType: 'application/json'
    });
  } catch (err) {
    console.error('Error saving remote submission:', err);
  }
}
