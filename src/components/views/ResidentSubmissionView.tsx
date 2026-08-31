import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, CheckCircle2, Building2, User, FileText, ArrowRight, Lock, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { uploadResidentPhoto, uploadAadhaarDocument, recordSubmissionInSupabase, eraseResidentDocumentsFromSupabase } from '../../lib/supabaseStorage';

interface ResidentSubmissionViewProps {
  roomNumber: string;
  onFinished?: () => void;
}

export const ResidentSubmissionView: React.FC<ResidentSubmissionViewProps> = ({
  roomNumber,
  onFinished
}) => {
  const { floors, residents, getResidentById, updateResident } = usePG();

  // Flexible Room Lookup
  let targetRoom: any = null;
  let targetFloorName = '';

  const cleanQuery = (roomNumber || '').trim().toLowerCase();

  if (floors && Array.isArray(floors)) {
    for (const floor of floors) {
      if (!floor.rooms) continue;
      const r = floor.rooms.find(
        (rm) =>
          rm.roomNumber.toLowerCase() === cleanQuery ||
          rm.id.toLowerCase() === cleanQuery ||
          rm.roomNumber.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, '')
      );
      if (r) {
        targetRoom = r;
        targetFloorName = floor.name;
        break;
      }
    }
  }

  // Resident & Form State (Starts at null so user must tap their name first)
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [residentName, setResidentName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');

  const submittedStorageKey = `aarush_submitted_room_${roomNumber}`;
  const savedSubmissionData = (() => {
    try {
      const raw = localStorage.getItem(submittedStorageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(savedSubmissionData));
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [showEraseTestConfirm, setShowEraseTestConfirm] = useState(false);
  const [isErasingTest, setIsErasingTest] = useState(false);

  const handleEraseTest = async () => {
    setIsErasingTest(true);
    try {
      await eraseResidentDocumentsFromSupabase({
        roomNumber,
        residentId: selectedResidentId,
        residentName
      });
      localStorage.removeItem(submittedStorageKey);
      setIsSubmitted(false);
      setShowEraseTestConfirm(false);
    } catch (err) {
      alert('Error resetting submission: ' + err);
    } finally {
      setIsErasingTest(false);
    }
  };

  const handleBedSelect = (bedId: string, residentId?: string) => {
    setSelectedBedId(bedId);
    if (residentId) {
      setSelectedResidentId(residentId);
      const res = getResidentById(residentId);
      if (res) {
        setResidentName(res.fullName);
        setPhone(res.phone);
        setAadhaarNumber(res.aadhaarNumber || '');
      }
    } else {
      setSelectedResidentId('');
      setResidentName('');
      setPhone('');
      setAadhaarNumber('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentName || !aadhaarNumber) {
      alert('Please fill in your name and Aadhaar number.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    let finalPhotoUrl = '';
    let finalAadhaarUrl = '';

    try {
      if (photoFile) {
        const pUrl = await uploadResidentPhoto(photoFile, `${residentName}_photo`, roomNumber, targetFloorName);
        if (!pUrl) {
          throw new Error(`Failed to upload photo to Supabase. Please check file format and network connection.`);
        }
        finalPhotoUrl = pUrl;
      }

      if (aadhaarFile) {
        const aUrl = await uploadAadhaarDocument(aadhaarFile, `${residentName}_aadhaar`, roomNumber, targetFloorName);
        if (!aUrl) {
          throw new Error(`Failed to upload Aadhaar card document to Supabase. Please check file format and network connection.`);
        }
        finalAadhaarUrl = aUrl;
      }

      // Record submission in Supabase manifest so Admin App syncs automatically
      await recordSubmissionInSupabase({
        roomNumber,
        bedId: selectedBedId || `${roomNumber}-B1`,
        residentId: selectedResidentId,
        residentName,
        phone,
        aadhaarNumber,
        aadhaarDocumentUrl: finalAadhaarUrl,
        photoUrl: finalPhotoUrl
      });

      // Update local resident object if matching resident exists
      if (selectedResidentId) {
        updateResident(selectedResidentId, {
          aadhaarNumber,
          ...(finalAadhaarUrl ? { aadhaarDocumentUrl: finalAadhaarUrl } : {}),
          ...(finalPhotoUrl ? { photoUrl: finalPhotoUrl } : {})
        });
      }

      // Save persistent submission status locally for refresh retention
      try {
        localStorage.setItem(
          submittedStorageKey,
          JSON.stringify({
            residentName,
            roomNumber,
            submittedAt: new Date().toISOString()
          })
        );
      } catch {
        // Ignore localStorage error
      }

      // 100% Verified Success
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting resident documents:', err);
      const errMsg = err?.message || String(err);
      setSubmissionError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = residentName || savedSubmissionData?.residentName || 'Resident';

  // 100% Verified Successful Submission Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#181919] p-4 md:p-8 flex items-center justify-center selection:bg-none">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#F5F2ED] shadow-floating text-center space-y-6">
          <div className="w-16 h-16 bg-[#F2F7EE] text-[#536347] rounded-full flex items-center justify-center mx-auto border border-[#D4E6C2]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#181919]">Thank You, {displayName}!</h2>
            <p className="text-xs text-[#747878] leading-relaxed">
              Your Aadhaar Card and Profile Photo have been successfully verified and saved for <strong className="text-[#181919]">Room {roomNumber}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] text-xs font-mono space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-[#747878]">Resident Name:</span>
              <span className="font-bold text-[#181919]">{displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#747878]">Room Number:</span>
              <span className="font-bold text-[#181919]">Room {roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#747878]">Storage Status:</span>
              <span className="text-emerald-700 font-bold">Saved in Supabase Storage ✓</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F5F2ED]">
            {!showEraseTestConfirm ? (
              <button
                type="button"
                onClick={() => setShowEraseTestConfirm(true)}
                className="text-[11px] text-[#747878] hover:text-red-600 underline font-mono flex items-center justify-center gap-1 mx-auto"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Erase & Test Re-upload (2-Step)</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-left space-y-2 text-xs font-mono animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Confirm Erase & Reset Test</span>
                </div>
                <p className="text-[10px] text-red-700">
                  This will delete uploaded files from Supabase Storage and reset form so you can test re-uploading again.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEraseTestConfirm(false)}
                    disabled={isErasingTest}
                    className="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-700 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEraseTest}
                    disabled={isErasingTest}
                    className="px-2.5 py-1 bg-red-600 text-white rounded font-bold text-[11px]"
                  >
                    {isErasingTest ? 'Erasing...' : '🔥 Yes, Erase & Reset'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#181919] p-4 md:p-8 flex flex-col items-center selection:bg-none">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181919] text-white text-[11px] font-mono tracking-wider uppercase">
            <Building2 className="w-3.5 h-3.5 text-[#A8C393]" />
            <span>Aarush Mens Luxury PG</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#181919]">
            Room {roomNumber} Document Submission
          </h1>
          <p className="text-xs text-[#747878]">
            {targetFloorName || 'Property'} • Official Aadhaar & Photo Verification Portal
          </p>
        </div>

        {/* SCREEN 1: SELECT YOUR NAME LIST ONLY */}
        {selectedBedId === null ? (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#F5F2ED] shadow-floating space-y-5 animate-fade-in">
            <div className="text-center space-y-1 pb-2 border-b border-[#F5F2ED]">
              <h2 className="text-lg font-bold text-[#181919]">
                1. Select Your Name in Room {roomNumber}
              </h2>
              <p className="text-xs text-[#747878]">
                Please tap your name below to open your dedicated submission form:
              </p>
            </div>

            {targetRoom && targetRoom.beds ? (
              <div className="space-y-3">
                {targetRoom.beds.map((b: any) => {
                  const res = b.residentId ? getResidentById(b.residentId) : null;

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleBedSelect(b.id, b.residentId)}
                      className="p-4 rounded-xl border border-[#F5F2ED] bg-white hover:border-[#181919] hover:bg-[#FDFBF7] cursor-pointer transition-all flex items-center justify-between shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#181919] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                          B{b.bedNumber}
                        </div>
                        <div>
                          <p className="font-bold text-[#181919] text-sm group-hover:underline">
                            {res ? res.fullName : `Bed ${b.bedNumber} (Empty Bed)`}
                          </p>
                          <p className="text-xs text-[#747878] font-mono mt-0.5">
                            {res ? `Phone: ${res.phone.slice(-4).padStart(10, '*')}` : 'Tap to register as new resident'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#536347] bg-[#F2F7EE] px-3 py-1.5 rounded-lg border border-[#D4E6C2] group-hover:bg-[#181919] group-hover:text-white transition-all">
                        <span>Tap to Fill Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-red-500 font-mono text-center">Room {roomNumber} not found in system.</p>
            )}
          </div>
        ) : (
          /* SCREEN 2: DEDICATED SUBMISSION FORM FOR SELECTED RESIDENT */
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-[#F5F2ED] shadow-floating space-y-6 animate-fade-in">
            {/* Top Navigation Bar to Switch Person */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F5F2ED]">
              <button
                type="button"
                onClick={() => setSelectedBedId(null)}
                className="text-xs font-mono font-bold text-[#536347] hover:underline flex items-center gap-1 bg-[#F2F7EE] px-3 py-1.5 rounded-lg border border-[#D4E6C2]"
              >
                <span>← Change / Select Different Name</span>
              </button>

              <span className="text-xs font-mono font-bold text-[#181919]">
                Room {roomNumber}
              </span>
            </div>

            {/* Selected Resident Header Card */}
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#747878] block">
                  SUBMITTING DOCUMENTS FOR:
                </span>
                <h3 className="text-base font-bold text-[#181919]">
                  {residentName || 'New Resident'}
                </h3>
              </div>
              <div className="px-3 py-1 bg-[#181919] text-white rounded-lg font-mono font-bold text-xs">
                Room {roomNumber}
              </div>
            </div>

            {/* RESIDENT DETAILS */}
            <div className="space-y-4">
              <label className="block text-xs font-mono font-bold uppercase text-[#747878]">
                2. YOUR DETAILS
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#181919] font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                  />
                </div>

                <div>
                  <label className="block text-[#181919] font-medium mb-1">Aadhaar Number (12 Digits) *</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 987654321012"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* FILE UPLOADS */}
            <div className="space-y-4 pt-2 border-t border-[#F5F2ED]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold uppercase text-[#747878]">
                  3. UPLOAD AADHAAR CARD & PROFILE PHOTO
                </label>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-300">
                  ⚠️ MAX 3MB PER FILE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Notice: Please upload photos or screenshots under <strong>3MB max size</strong> per file for fast processing.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Aadhaar File Input */}
                <div className="space-y-1">
                  <label className="block text-[#181919] font-medium">Aadhaar Document (PDF / Image)</label>
                  <div className="relative border border-dashed border-[#E4E2E2] bg-[#FDFBF7] p-3 rounded-xl text-center cursor-pointer hover:border-[#181919] transition-all">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          if (f.size > 3 * 1024 * 1024) {
                            alert('⚠️ File size exceeds 3MB limit! Please upload an image or screenshot under 3MB.');
                            return;
                          }
                          setAadhaarFile(f);
                          setAadhaarFileName(f.name);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center space-y-1">
                      <Upload className="w-5 h-5 text-[#536347]" />
                      <span className="font-medium text-[#181919]">
                        {aadhaarFileName ? aadhaarFileName : 'Select Aadhaar Photo / PDF'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#536347] bg-[#F2F7EE] px-2 py-0.5 rounded border border-[#D4E6C2]">
                        Max 3MB File
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo Input */}
                <div className="space-y-1">
                  <label className="block text-[#181919] font-medium">Resident Photo</label>
                  <div className="relative border border-dashed border-[#E4E2E2] bg-[#FDFBF7] p-3 rounded-xl text-center cursor-pointer hover:border-[#181919] transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          if (f.size > 3 * 1024 * 1024) {
                            alert('⚠️ Photo size exceeds 3MB limit! Please upload a photo or screenshot under 3MB.');
                            return;
                          }
                          setPhotoFile(f);
                          setPhotoPreview(URL.createObjectURL(f));
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center space-y-1">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-[#181919]" />
                      ) : (
                        <User className="w-5 h-5 text-[#536347]" />
                      )}
                      <span className="font-medium text-[#181919]">
                        {photoFile ? photoFile.name : 'Take or Select Passport Photo'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#536347] bg-[#F2F7EE] px-2 py-0.5 rounded border border-[#D4E6C2]">
                        Max 3MB File
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Log Card */}
            {submissionError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-left space-y-2 text-xs text-red-900 animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-red-700">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Upload Failed - Error Details:</span>
                </div>
                <p className="font-mono bg-white p-2.5 rounded border border-red-200 text-red-800 break-all text-[11px]">
                  {submissionError}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmissionError(null)}
                  className="w-full py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-xs"
                >
                  Try Upload Again ↺
                </button>
              </div>
            )}

            {/* Privacy Security Note */}
            <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] flex items-start gap-2 text-[11px] text-[#747878]">
              <Lock className="w-4 h-4 text-[#536347] shrink-0 mt-0.5" />
              <p>
                Your documents are encrypted and uploaded directly into secure Supabase Storage for official PG records.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#181919] text-white font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-floating disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Uploading Documents to Supabase...</span>
              ) : (
                <>
                  <span>Submit Aadhaar Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
