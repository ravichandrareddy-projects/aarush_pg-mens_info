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
  AlertCircle
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Resident } from '../../types/pg';

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
  const { getResidentById, payments, activities } = usePG();
  const [activeTab, setActiveTab] = useState<'INFO' | 'PAYMENTS' | 'DOCS' | 'HISTORY'>('INFO');

  if (!residentId) return null;
  const resident = getResidentById(residentId);
  if (!resident) return null;

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
            <div className="w-12 h-12 rounded-full bg-[#536347] text-white font-bold flex items-center justify-center text-lg shadow-subtle">
              {resident.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#181919]">{resident.fullName}</h2>
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
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-[#F5F2ED]">
                <div>
                  <span className="text-[#747878] block">Phone Number</span>
                  <span className="font-medium text-[#181919]">{resident.phone}</span>
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
                <p className="text-[#747878] font-mono">
                  {resident.emergencyRelationship} • {resident.emergencyPhone}
                </p>
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
              <div className="p-4 rounded-xl border border-[#F5F2ED] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#536347]" />
                    <span className="font-semibold text-sm text-[#181919]">Aadhaar Verification</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#F2F7EE] text-[#536347] px-2 py-0.5 rounded font-semibold">
                    MASKED DISPLAY
                  </span>
                </div>
                <p className="font-mono text-sm text-[#181919] pt-1">
                  {maskAadhaar(resident.aadhaarNumber)}
                </p>
                <p className="text-[11px] text-[#747878]">
                  Document file: {resident.aadhaarDocumentUrl ? resident.aadhaarDocumentUrl : 'No document attached'}
                </p>
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
