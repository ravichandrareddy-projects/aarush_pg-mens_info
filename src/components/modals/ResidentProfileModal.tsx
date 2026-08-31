import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  BedDouble,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  ArrowLeftRight,
  UserMinus,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Resident } from '../../types/pg';
import { formatDayAndYear } from '../../utils/dateUtils';
import { recordSubmissionInSupabase, eraseResidentDocumentsFromSupabase } from '../../lib/supabaseStorage';
import { downloadAadhaarFile } from '../../utils/downloadUtils';

interface ResidentProfileModalProps {
  residentId: string | null;
  onClose: () => void;
  onOpenMoveModal: (residentId: string) => void;
  onOpenMarkLeftModal: (residentId: string) => void;
  onOpenRecordPayment: (residentId: string) => void;
}

export const ResidentProfileModal: React.FC<ResidentProfileModalProps> = ({
  residentId,
  onClose,
  onOpenMoveModal,
  onOpenMarkLeftModal,
  onOpenRecordPayment
}) => {
  const { getResidentById, updateResident, payments, activities } = usePG();
  const [activeTab, setActiveTab] = useState<'INFO' | 'PAYMENTS' | 'DOCS' | 'HISTORY'>('INFO');
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);

  if (!residentId) return null;
  const resident = getResidentById(residentId);
  if (!resident) return null;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(resident.fullName || '');

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    const cleanName = editedName.trim();
    updateResident(resident.id, { fullName: cleanName });
    await recordSubmissionInSupabase({
      roomNumber: resident.roomNumber,
      bedId: resident.bedId,
      residentId: resident.id,
      residentName: cleanName,
      phone: resident.phone,
      aadhaarNumber: resident.aadhaarNumber || '',
      aadhaarDocumentUrl: resident.aadhaarDocumentUrl,
      photoUrl: resident.photoUrl
    });
    setIsEditingName(false);
  };

  const [isEditingAadhaar, setIsEditingAadhaar] = useState(false);
  const [editedAadhaar, setEditedAadhaar] = useState(resident.aadhaarNumber || '');

  const handleSaveAadhaar = async () => {
    if (!editedAadhaar) return;
    updateResident(resident.id, { aadhaarNumber: editedAadhaar });
    await recordSubmissionInSupabase({
      roomNumber: resident.roomNumber,
      bedId: resident.bedId,
      residentId: resident.id,
      residentName: resident.fullName,
      phone: resident.phone,
      aadhaarNumber: editedAadhaar,
      aadhaarDocumentUrl: resident.aadhaarDocumentUrl,
      photoUrl: resident.photoUrl
    });
    setIsEditingAadhaar(false);
  };

  const [showEraseConfirm, setShowEraseConfirm] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  const handleEraseDocuments = async () => {
    setIsErasing(true);
    try {
      await eraseResidentDocumentsFromSupabase({
        roomNumber: resident.roomNumber,
        residentId: resident.id,
        residentName: resident.fullName,
        photoUrl: resident.photoUrl,
        aadhaarDocumentUrl: resident.aadhaarDocumentUrl
      });
      updateResident(resident.id, {
        aadhaarNumber: '',
        aadhaarDocumentUrl: undefined,
        photoUrl: undefined
      });
      setShowEraseConfirm(false);
      alert('Aadhaar Document and Photo successfully erased from Supabase Storage and Resident Profile!');
    } catch (err) {
      alert('Error erasing documents: ' + err);
    } finally {
      setIsErasing(false);
    }
  };

  // Mask Aadhaar e.g. "9876 5432 1012" -> "XXXX-XXXX-1012"
  const maskAadhaar = (num?: string) => {
    if (!num || num.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = num.slice(-4);
    return `XXXX-XXXX-${last4}`;
  };

  const residentPayments = payments.filter((p) => p.residentId === resident.id);
  const residentLogs = activities.filter((a) => a.residentName === resident.fullName);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 border border-[#F5F2ED] shadow-floating overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#F5F2ED] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center gap-4">
            {resident.photoUrl ? (
              <img
                src={resident.photoUrl}
                alt={resident.fullName}
                className="w-12 h-12 rounded-full object-cover border border-[#536347] shadow-subtle"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#536347] text-white font-bold flex items-center justify-center text-lg shadow-subtle">
                {resident.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter Resident Name"
                      className="px-2.5 py-1 border border-[#181919] rounded-lg text-sm font-bold text-[#181919] focus:outline-none w-48 font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-2.5 py-1 bg-[#181919] text-white text-xs font-semibold rounded-lg hover:bg-[#536347]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-1 text-xs text-[#747878] hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-[#181919]">{resident.fullName}</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedName(resident.fullName);
                        setIsEditingName(true);
                      }}
                      className="text-xs text-[#536347] font-semibold hover:underline flex items-center gap-0.5 ml-1"
                      title="Edit Resident Name"
                    >
                      ✏️ Edit
                    </button>
                  </>
                )}
                <span
                  className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                    resident.status === 'ACTIVE'
                      ? 'bg-[#F2F7EE] text-[#536347] border border-[#D4E6C2]'
                      : 'bg-[#F5F3F3] text-[#747878]'
                  }`}
                >
                  {resident.status}
                </span>
              </div>
              <p className="text-xs text-[#747878] font-mono">
                Room {resident.roomNumber} (Bed {resident.bedNumber}) • Joined {resident.joiningDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#747878] hover:bg-[#F5F3F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex border-b border-[#F5F2ED] px-6 text-xs font-mono bg-[#FDFBF7]/50">
          {(['INFO', 'PAYMENTS', 'DOCS', 'HISTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-[#181919] text-[#181919]'
                  : 'border-transparent text-[#747878] hover:text-[#181919]'
              }`}
            >
              {tab === 'INFO'
                ? 'Overview & PG Info'
                : tab === 'PAYMENTS'
                ? `Payments (${residentPayments.length})`
                : tab === 'DOCS'
                ? 'Documents & Aadhaar'
                : 'Activity Logs'}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'INFO' && (
            <div className="space-y-4 text-xs">
              {/* PG Allocation Card */}
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] space-y-2 font-mono">
                <h4 className="text-[10px] font-semibold tracking-wider text-[#747878] uppercase">
                  PG ALLOCATION DETAILS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[#747878] block">Room Number</span>
                    <span className="font-bold text-sm text-[#181919]">Room {resident.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#747878] block">Bed Number</span>
                    <span className="font-bold text-sm text-[#536347]">Bed {resident.bedNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#747878] block">Monthly Rent</span>
                    <span className="font-bold text-sm text-[#181919]">₹{resident.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#747878] block">Rent Due Date</span>
                    <span className="font-bold text-sm text-[#536347]">
                      {formatDayAndYear(undefined, resident.rentDueDay || 1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-[#F5F2ED]">
                <div>
                  <span className="text-[#747878] block">Phone Number</span>
                  <a
                    href={`tel:${resident.phone}`}
                    className="font-semibold text-[#536347] font-mono hover:underline flex items-center gap-1 mt-0.5"
                    title="Click to Call Dialer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{resident.phone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-[#747878] block">Date of Birth</span>
                  <span className="font-medium text-[#181919]">{resident.dateOfBirth || 'Not provided'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#747878] block">Permanent Address</span>
                  <span className="font-medium text-[#181919]">{resident.address}</span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl border border-[#F5F2ED] space-y-1">
                <h4 className="text-[10px] font-mono uppercase text-[#747878] font-semibold">
                  EMERGENCY CONTACT
                </h4>
                <p className="font-semibold text-[#181919] text-sm">{resident.emergencyName}</p>
                <div className="text-[#747878] font-mono flex items-center gap-2 text-xs">
                  <span>{resident.emergencyRelationship}</span>
                  <span>•</span>
                  <a
                    href={`tel:${resident.emergencyPhone}`}
                    className="text-[#536347] font-semibold hover:underline flex items-center gap-1"
                    title="Click to Call Emergency Contact"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{resident.emergencyPhone}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] flex items-center justify-between">
                <div>
                  <span className="text-[#747878] font-mono block">Payment Status</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      resident.paymentStatus === 'PAID'
                        ? 'text-emerald-700'
                        : resident.paymentStatus === 'PARTIALLY_PAID'
                        ? 'text-amber-800'
                        : 'text-red-700'
                    }`}
                  >
                    {resident.paymentStatus} (Pending: ₹{resident.amountPending})
                  </span>
                </div>

                {resident.status === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRecordPayment(resident.id);
                    }}
                    className="py-2 px-3 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#536347] transition-colors"
                  >
                    + Record Payment
                  </button>
                )}
              </div>

              {/* Payment Records Table */}
              {residentPayments.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#747878]">
                  No transaction history recorded yet for this resident.
                </div>
              ) : (
                <div className="border border-[#F5F2ED] rounded-xl overflow-hidden font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-[#FDFBF7] text-[#747878] text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Amount Paid</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F2ED]">
                      {residentPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 text-[#747878]">{p.paymentDate}</td>
                          <td className="p-3 text-emerald-700 font-bold">₹{p.amountPaid.toLocaleString()}</td>
                          <td className="p-3">{p.paymentMethod}</td>
                          <td className="p-3 text-[#747878] font-sans">{p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'DOCS' && (
            <div className="space-y-4 text-xs">
              {/* Resident Photo & Identity Card */}
              <div className="p-4 rounded-xl border border-[#F5F2ED] bg-[#FDFBF7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {resident.photoUrl ? (
                    <img
                      src={resident.photoUrl}
                      alt={resident.fullName}
                      className="w-14 h-14 rounded-full object-cover border border-[#181919] shadow-subtle"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#181919] text-white flex items-center justify-center font-bold text-xl">
                      {resident.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-[#181919]">{resident.fullName}</h4>
                    <p className="text-xs text-[#747878] font-mono">Phone: {resident.phone}</p>
                    <p className="text-[10px] text-[#747878] font-mono">Room {resident.roomNumber} • Bed {resident.bedNumber}</p>
                  </div>
                </div>

                {resident.photoUrl && (
                  <a
                    href={resident.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg border border-[#E4E2E2] bg-white text-[#181919] font-mono text-[11px] font-semibold hover:bg-[#F5F3F3] transition-colors"
                  >
                    View Photo ↗
                  </a>
                )}
              </div>

              {/* Aadhaar Verification & Document Card */}
              <div className="p-5 rounded-xl border border-[#F5F2ED] bg-white space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold text-sm text-[#181919]">Official Aadhaar Document</span>
                      <p className="text-[10px] text-[#747878] font-mono">Saved in Supabase Cloud Storage</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono bg-[#FDFBF7] p-3 rounded-xl border border-[#F5F2ED]">
                  <div className="flex-1 mr-2">
                    <span className="text-[10px] text-[#747878] block uppercase">Aadhaar Number</span>
                    {isEditingAadhaar ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editedAadhaar}
                          onChange={(e) => setEditedAadhaar(e.target.value)}
                          placeholder="Enter 12-digit Aadhaar"
                          className="px-2 py-1 border border-[#181919] rounded-lg text-xs font-mono w-44 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveAadhaar}
                          className="px-2.5 py-1 bg-[#181919] text-white text-xs font-semibold rounded-lg hover:bg-[#536347]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingAadhaar(false)}
                          className="px-2 py-1 text-xs text-[#747878] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-sm text-[#181919]">
                        {showFullAadhaar ? resident.aadhaarNumber || 'Not provided' : maskAadhaar(resident.aadhaarNumber)}
                      </span>
                    )}
                  </div>

                  {!isEditingAadhaar && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditedAadhaar(resident.aadhaarNumber || '');
                          setIsEditingAadhaar(true);
                        }}
                        className="text-[11px] text-[#181919] font-semibold hover:underline flex items-center gap-1"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFullAadhaar(!showFullAadhaar)}
                        className="text-[11px] text-[#536347] font-semibold hover:underline"
                      >
                        {showFullAadhaar ? 'Hide' : 'Show Full Number'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Aadhaar File Preview & Open/Download Actions */}
                {resident.aadhaarDocumentUrl ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#747878] font-mono">Uploaded Document File:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadAadhaarFile(resident.aadhaarDocumentUrl, `Aadhaar_Room${resident.roomNumber}_${resident.fullName.replace(/\s+/g, '_')}`)}
                          className="py-2 px-3.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-4 h-4 text-emerald-200" />
                          <span>Download Aadhaar Card 📥</span>
                        </button>
                        <a
                          href={resident.aadhaarDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl border border-[#181919] bg-white text-[#181919] font-semibold text-xs hover:bg-[#F5F3F3] transition-all flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View ↗</span>
                        </a>
                      </div>
                    </div>

                    {/* Image Preview if document is image */}
                    {resident.aadhaarDocumentUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) && (
                      <div className="p-2 border border-[#F5F2ED] rounded-xl bg-[#FDFBF7] flex justify-center">
                        <img
                          src={resident.aadhaarDocumentUrl}
                          alt="Aadhaar Card Preview"
                          className="max-h-56 rounded-lg object-contain border border-[#E4E2E2]"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center text-xs font-mono">
                    No physical Aadhaar document uploaded yet. Use Room QR Collector to invite resident for self-submission.
                  </div>
                )}

                {/* 2-Step Erase Documents Action */}
                <div className="pt-3 border-t border-[#F5F2ED] flex justify-end">
                  {!showEraseConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowEraseConfirm(true)}
                      className="py-2 px-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Erase Documents (2-Step)</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 w-full space-y-3 animate-fade-in text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold text-xs text-red-900">Step 2: Confirm Document Erasure</h5>
                          <p className="text-[11px] text-red-700 mt-0.5">
                            Are you sure you want to permanently delete Room {resident.roomNumber} ({resident.fullName}) Aadhaar card and photo files from Supabase Storage? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowEraseConfirm(false)}
                          disabled={isErasing}
                          className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleEraseDocuments}
                          disabled={isErasing}
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-xs"
                        >
                          {isErasing ? 'Erasing...' : '🔥 Yes, Permanently Erase'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-3 text-xs">
              {residentLogs.length === 0 ? (
                <div className="p-6 text-center text-[#747878]">No activity logged for this resident yet.</div>
              ) : (
                residentLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] font-mono">
                    <p className="text-[#181919] font-sans font-medium">{log.description}</p>
                    <p className="text-[10px] text-[#747878] mt-0.5">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        {resident.status === 'ACTIVE' && (
          <div className="p-4 border-t border-[#F5F2ED] bg-[#FDFBF7] flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenMarkLeftModal(resident.id);
              }}
              className="py-2 px-3 rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <UserMinus className="w-4 h-4" />
              <span>Mark as Left</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenMoveModal(resident.id);
              }}
              className="py-2 px-4 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors flex items-center gap-1.5 shadow-subtle"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Move Resident</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
