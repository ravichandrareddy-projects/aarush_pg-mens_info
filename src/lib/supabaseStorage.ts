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
