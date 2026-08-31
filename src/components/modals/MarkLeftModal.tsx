import React, { useState } from 'react';
import { X, UserMinus, AlertTriangle } from 'lucide-react';
import { usePG } from '../../context/PGContext';

interface MarkLeftModalProps {
  residentId: string | null;
  onClose: () => void;
}

export const MarkLeftModal: React.FC<MarkLeftModalProps> = ({ residentId, onClose }) => {
  const { getResidentById, markResidentLeft } = usePG();
  const [leavingDate, setLeavingDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Relocated / Completed Stay');

  if (!residentId) return null;
  const resident = getResidentById(residentId);
  if (!resident) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    markResidentLeft(resident.id, leavingDate, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-floating overflow-hidden">
        <div className="p-5 border-b border-red-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2 text-red-900">
            <UserMinus className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-base">Mark Resident as Left</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#747878] hover:bg-red-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] font-mono space-y-1">
            <p className="font-bold text-[#181919] text-sm">{resident.fullName}</p>
            <p className="text-[#747878]">Room {resident.roomNumber} (Bed {resident.bedNumber})</p>
            {resident.amountPending > 0 && (
              <p className="text-red-700 font-semibold pt-1">
                ⚠️ Warning: Pending Balance ₹{(resident.amountPending || 0).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#181919] font-medium mb-1">Leaving Date *</label>
            <input
              type="date"
              value={leavingDate}
              onChange={(e) => setLeavingDate(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#181919] font-medium mb-1">Reason for Departure</label>
            <input
              type="text"
              placeholder="Job change, end of college term, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#F5F2ED] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-lg border border-[#F5F2ED] bg-white text-[#181919]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
            >
              Confirm Checkout & Free Bed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
