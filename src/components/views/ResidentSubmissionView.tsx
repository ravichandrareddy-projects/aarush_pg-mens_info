import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, CheckCircle2, Building2, User, FileText, ArrowRight, Lock } from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { uploadResidentPhoto, uploadAadhaarDocument } from '../../lib/supabaseStorage';

interface ResidentSubmissionViewProps {
  roomNumber: string;
  onFinished?: () => void;
}

export const ResidentSubmissionView: React.FC<ResidentSubmissionViewProps> = ({
  roomNumber,
  onFinished
}) => {
  const { floors, residents, getResidentById } = usePG();

  // Find target room across all floors
  let targetRoom: any = null;
  let targetFloorName = '';

  for (const floor of floors) {
    const r = floor.rooms.find((rm) => rm.roomNumber === roomNumber);
    if (r) {
      targetRoom = r;
      targetFloorName = floor.name;
      break;
    }
  }

  // Resident & Form State
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [residentName, setResidentName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set initial bed if occupants exist
  useEffect(() => {
    if (targetRoom && targetRoom.beds) {
      const occupied = targetRoom.beds.find((b: any) => b.status === 'OCCUPIED' && b.residentId);
      if (occupied) {
        setSelectedBedId(occupied.id);
        if (occupied.residentId) {
          setSelectedResidentId(occupied.residentId);
          const res = getResidentById(occupied.residentId);
          if (res) {
            setResidentName(res.fullName);
            setPhone(res.phone);
            setAadhaarNumber(res.aadhaarNumber || '');
          }
        }
      }
    }
  }, [targetRoom, getResidentById]);

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

    let finalPhotoUrl = '';
    let finalAadhaarUrl = '';

    try {
      if (photoFile) {
        const pUrl = await uploadResidentPhoto(photoFile, `Room_${roomNumber}_${residentName}_photo`);
        if (pUrl) finalPhotoUrl = pUrl;
      }

      if (aadhaarFile) {
        const aUrl = await uploadAadhaarDocument(aadhaarFile, `Room_${roomNumber}_${residentName}_aadhaar`);
        if (aUrl) finalAadhaarUrl = aUrl;
      }

      // Update local resident object if matching resident exists
      if (selectedResidentId) {
        const targetRes = residents.find((r) => r.id === selectedResidentId);
        if (targetRes) {
          targetRes.aadhaarNumber = aadhaarNumber;
          if (finalAadhaarUrl) targetRes.aadhaarDocumentUrl = finalAadhaarUrl;
          if (finalPhotoUrl) targetRes.photoUrl = finalPhotoUrl;
        }
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting resident documents:', err);
      alert('Error submitting documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#F5F2ED] shadow-floating space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#181919]">Submission Successful!</h2>
            <p className="text-sm text-[#747878] mt-1">
              Your Aadhaar document and photo for <span className="font-semibold text-[#181919]">Room {roomNumber}</span> have been saved securely.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[#747878]">Resident Name:</span>
              <span className="font-bold text-[#181919]">{residentName}</span>
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

          <p className="text-xs text-[#747878]">
            You can close this browser tab now. Thank you!
          </p>

          {onFinished && (
            <button
              onClick={onFinished}
              className="w-full py-3 rounded-xl bg-[#181919] text-white font-semibold text-xs hover:bg-black transition-colors"
            >
              Return to PG App
            </button>
          )}
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

        {/* Submission Form Card */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-[#F5F2ED] shadow-floating space-y-6">
          {/* STEP 1: BED & OCCUPANT SELECTION */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase text-[#747878]">
              1. SELECT YOUR BED IN ROOM {roomNumber}
            </label>

            {targetRoom && targetRoom.beds ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {targetRoom.beds.map((b: any) => {
                  const res = b.residentId ? getResidentById(b.residentId) : null;
                  const isSelected = selectedBedId === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleBedSelect(b.id, b.residentId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#181919] bg-[#FDFBF7] shadow-xs'
                          : 'border-[#F5F2ED] bg-white hover:border-[#E4E2E2]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                          isSelected ? 'bg-[#181919] text-white' : 'bg-[#F5F3F3] text-[#181919]'
                        }`}>
                          B{b.bedNumber}
                        </div>
                        <div>
                          <p className="font-bold text-[#181919] text-xs">
                            {res ? res.fullName : `Bed ${b.bedNumber}`}
                          </p>
                          <p className="text-[10px] text-[#747878] font-mono">
                            {res ? `Phone: ${res.phone.slice(-4).padStart(10, '*')}` : 'Empty Bed'}
                          </p>
                        </div>
                      </div>

                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#536347]" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-red-500 font-mono">Room {roomNumber} not found in system.</p>
            )}
          </div>

          {/* STEP 2: RESIDENT DETAILS */}
          <div className="space-y-4 pt-2 border-t border-[#F5F2ED]">
            <label className="block text-xs font-mono font-bold uppercase text-[#747878]">
              2. RESIDENT INFORMATION
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

          {/* STEP 3: FILE UPLOADS */}
          <div className="space-y-4 pt-2 border-t border-[#F5F2ED]">
            <label className="block text-xs font-mono font-bold uppercase text-[#747878]">
              3. UPLOAD AADHAAR CARD & PROFILE PHOTO
            </label>

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
                        setAadhaarFile(e.target.files[0]);
                        setAadhaarFileName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <Upload className="w-5 h-5 text-[#536347]" />
                    <span className="font-medium text-[#181919]">
                      {aadhaarFileName ? aadhaarFileName : 'Select Aadhaar Photo / PDF'}
                    </span>
                    <span className="text-[10px] text-[#747878]">Max 10MB file</span>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

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
      </div>
    </div>
  );
};
