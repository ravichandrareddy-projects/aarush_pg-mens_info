import React, { useState, useEffect } from 'react';
import { X, UserPlus, Upload, ShieldCheck, Check } from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Payment } from '../../types/pg';
import { uploadResidentPhoto, uploadAadhaarDocument } from '../../lib/supabaseStorage';

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFloorId?: string;
  initialRoomId?: string;
  initialBedId?: string;
}

export const AddResidentModal: React.FC<AddResidentModalProps> = ({
  isOpen,
  onClose,
  initialFloorId,
  initialRoomId,
  initialBedId
}) => {
  const { floors, addResident } = usePG();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocName, setAadhaarDocName] = useState<string | undefined>();
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState<string | undefined>();
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);

  const [address, setAddress] = useState('');

  const [floorId, setFloorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');

  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRent, setMonthlyRent] = useState<number>(7500);

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Parent');

  const [amountPaid, setAmountPaid] = useState<number>(7500);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('UPI');

  // Initialize pre-selected floor, room, bed if provided
  useEffect(() => {
    if (isOpen) {
      if (initialFloorId) setFloorId(initialFloorId);
      if (initialRoomId) setRoomId(initialRoomId);
      if (initialBedId) setBedId(initialBedId);
    }
  }, [isOpen, initialFloorId, initialRoomId, initialBedId]);

  // Selected Floor & Room objects
  const selectedFloor = floors.find((f) => f.id === floorId);
  const selectedRoom = selectedFloor?.rooms.find((r) => r.id === roomId);

  // Auto-set rent based on room sharing type: 3-sharing = 8000, 4-sharing = 7500, 5-sharing = 7000
  useEffect(() => {
    if (selectedRoom) {
      let defaultRent = 7500;
      if (selectedRoom.sharingCapacity === 3) defaultRent = 8000;
      else if (selectedRoom.sharingCapacity === 4) defaultRent = 7500;
      else if (selectedRoom.sharingCapacity === 5) defaultRent = 7000;
      setMonthlyRent(defaultRent);
      setAmountPaid(defaultRent);
    }
  }, [roomId, selectedRoom?.sharingCapacity]);

  if (!isOpen) return null;

  const availableRooms = selectedFloor
    ? selectedFloor.rooms.filter((r) => r.beds.some((b) => b.status === 'EMPTY'))
    : [];

  const availableBeds = selectedRoom
    ? selectedRoom.beds.filter((b) => b.status === 'EMPTY')
    : [];

  const selectedBed = selectedRoom?.beds.find((b) => b.id === bedId);

  // Form submission validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !floorId || !roomId || !bedId || !selectedRoom || !selectedBed) {
      alert('Please fill in all required fields and select an empty bed.');
      return;
    }

    const rent = Number(monthlyRent) || 7500;
    const paid = Number(amountPaid) || 0;
    const pending = Math.max(0, rent - paid);

    let payStatus: Payment['status'] = 'UNPAID';
    if (pending === 0) payStatus = 'PAID';
    else if (paid > 0) payStatus = 'PARTIALLY_PAID';

    addResident({
      fullName,
      phone,
      dateOfBirth: dateOfBirth || undefined,
      photoUrl: photoPreview,
      aadhaarNumber: aadhaarNumber || '000000000000',
      aadhaarDocumentUrl: aadhaarDocUrl || aadhaarDocName,
      address: address || 'N/A',
      floorId,
      roomId,
      roomNumber: selectedRoom.roomNumber,
      bedId: selectedBed.id,
      bedNumber: selectedBed.bedNumber,
      joiningDate,
      monthlyRent: rent,
      amountPaid: paid,
      amountPending: pending,
      paymentStatus: payStatus,
      lastPaymentMethod: paymentMethod,
      emergencyName: emergencyName || 'Emergency Contact',
      emergencyPhone: emergencyPhone || 'N/A',
      emergencyRelationship: emergencyRelationship || 'Contact'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 border border-[#F5F2ED] shadow-floating overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#F5F2ED] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#181919] text-white flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-[#181919]">Add New Resident</h2>
              <p className="text-xs text-[#747878] font-mono">Assign empty bed and onboard occupant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#747878] hover:bg-[#F5F3F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: PG ALLOCATION */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-[#747878] uppercase font-semibold pb-1 border-b border-[#F5F2ED]">
              1. PG ROOM & BED ALLOCATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Select Floor */}
              <div>
                <label className="block text-[#181919] font-medium mb-1">Select Floor *</label>
                <select
                  value={floorId}
                  onChange={(e) => {
                    setFloorId(e.target.value);
                    setRoomId('');
                    setBedId('');
                  }}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                >
                  <option value="">-- Choose Floor --</option>
                  {floors
                    .filter((f) => f.id !== 'floor7') // Skip dining floor
                    .map((f) => {
                      const emptyCount = f.rooms.reduce(
                        (acc, r) => acc + r.beds.filter((b) => b.status === 'EMPTY').length,
                        0
                      );
                      return (
                        <option key={f.id} value={f.id}>
                          {f.name} ({emptyCount} empty beds)
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Select Room (Only empty rooms selectable) */}
              <div>
                <label className="block text-[#181919] font-medium mb-1">Select Room *</label>
                <select
                  value={roomId}
                  disabled={!floorId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    setBedId('');
                  }}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919] disabled:opacity-50"
                >
                  <option value="">-- Choose Room --</option>
                  {availableRooms.map((r) => {
                    const emptyCount = r.beds.filter((b) => b.status === 'EMPTY').length;
                    return (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.sharingCapacity} Sharing, {emptyCount} available)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Select Bed (Only empty beds) */}
              <div>
                <label className="block text-[#181919] font-medium mb-1">Select Bed *</label>
                <select
                  value={bedId}
                  disabled={!roomId}
                  onChange={(e) => setBedId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919] disabled:opacity-50"
                >
                  <option value="">-- Choose Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      Bed {b.bedNumber} (Vacant)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#181919] font-medium mb-1">Joining Date *</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMonthlyRent(val);
                    setAmountPaid(val); // default full paid
                  }}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PERSONAL INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-[#747878] uppercase font-semibold pb-1 border-b border-[#F5F2ED]">
              2. PERSONAL INFORMATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#181919] font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Permanent Address</label>
                <input
                  type="text"
                  placeholder="H.No, Street, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: IDENTITY & DOCUMENTS */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-[#747878] uppercase font-semibold pb-1 border-b border-[#F5F2ED]">
              3. IDENTITY & AADHAAR
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#181919] font-medium mb-1">Aadhaar Number (12 digits)</label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 987654321012"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919] font-mono"
                />
                <p className="text-[10px] text-[#747878] mt-1 font-mono">Will be masked as XXXX-XXXX-1234 in public UI</p>
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Aadhaar Card Upload</label>
                <div className="relative border border-dashed border-[#E4E2E2] bg-[#FDFBF7] p-2.5 rounded-lg text-center cursor-pointer hover:border-[#181919]">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setAadhaarDocName(file.name);
                        setIsUploadingAadhaar(true);
                        const uploadedUrl = await uploadAadhaarDocument(file, file.name);
                        if (uploadedUrl) {
                          setAadhaarDocUrl(uploadedUrl);
                        }
                        setIsUploadingAadhaar(false);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-[#747878] text-xs font-mono">
                    <Upload className="w-4 h-4 text-[#536347]" />
                    <span>
                      {isUploadingAadhaar
                        ? 'Uploading to Supabase Storage...'
                        : aadhaarDocUrl
                        ? `✓ Saved in Supabase (${aadhaarDocName})`
                        : aadhaarDocName
                        ? aadhaarDocName
                        : 'Upload Aadhaar PDF/Image'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: EMERGENCY CONTACT */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-[#747878] uppercase font-semibold pb-1 border-b border-[#F5F2ED]">
              4. EMERGENCY CONTACT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#181919] font-medium mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="Parent / Guardian Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="Father, Brother, Guardian"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: INITIAL PAYMENT */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-[#747878] uppercase font-semibold pb-1 border-b border-[#F5F2ED]">
              5. INITIAL PAYMENT DETAILS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#181919] font-medium mb-1">Amount Paid Now (₹)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Amount Pending (₹)</label>
                <input
                  type="number"
                  value={Math.max(0, monthlyRent - amountPaid)}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#F5F3F3] text-[#747878] font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['paymentMethod'])}
                  className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Debit/Credit Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-[#F5F2ED] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg border border-[#F5F2ED] bg-white text-[#181919] text-xs font-medium hover:bg-[#F5F3F3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors shadow-subtle"
            >
              Save Resident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
