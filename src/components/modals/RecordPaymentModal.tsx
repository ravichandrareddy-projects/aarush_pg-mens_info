import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Payment } from '../../types/pg';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialResidentId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialResidentId
}) => {
  const { residents, recordPayment } = usePG();
  const activeResidents = residents.filter((r) => r.status === 'ACTIVE');

  const [residentId, setResidentId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(7500);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('UPI');
  const [notes, setNotes] = useState('Monthly Rent');

  useEffect(() => {
    if (isOpen) {
      if (initialResidentId) {
        setResidentId(initialResidentId);
        const res = activeResidents.find((r) => r.id === initialResidentId);
        if (res) {
          setAmountPaid(res.amountPending > 0 ? res.amountPending : res.monthlyRent);
        }
      } else if (activeResidents.length > 0) {
        setResidentId(activeResidents[0].id);
        setAmountPaid(activeResidents[0].monthlyRent);
      }
    }
  }, [isOpen, initialResidentId]);

  if (!isOpen) return null;

  const selectedResident = activeResidents.find((r) => r.id === residentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId || amountPaid <= 0) {
      alert('Please select a resident and enter a valid payment amount.');
      return;
    }

    recordPayment({
      residentId,
      amountPaid,
      paymentMethod,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#F5F2ED] shadow-floating overflow-hidden">
        <div className="p-5 border-b border-[#F5F2ED] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#536347]" />
            <h3 className="font-semibold text-base text-[#181919]">Record Payment</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#747878] hover:bg-[#F5F3F3]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[#181919] font-medium mb-1">Select Active Resident *</label>
            <select
              value={residentId}
              onChange={(e) => {
                const id = e.target.value;
                setResidentId(id);
                const res = activeResidents.find((r) => r.id === id);
                if (res) {
                  setAmountPaid(res.amountPending > 0 ? res.amountPending : res.monthlyRent);
                }
              }}
              required
              className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none"
            >
              {activeResidents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName} (Room {r.roomNumber}) — Pending ₹{r.amountPending}
                </option>
              ))}
            </select>
          </div>

          {selectedResident && (
            <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#747878]">Monthly Rent:</span>
                <span className="font-semibold text-[#181919]">₹{selectedResident.monthlyRent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747878]">Current Pending:</span>
                <span className="font-semibold text-amber-800">₹{selectedResident.amountPending}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[#181919] font-medium mb-1">Amount Received (₹) *</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              required
              className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#181919] font-medium mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as Payment['paymentMethod'])}
              className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none"
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Debit/Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-[#181919] font-medium mb-1">Payment Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. July 2026 rent, Partial advance"
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
              className="py-2 px-4 rounded-lg bg-[#181919] text-white font-medium hover:bg-[#536347]"
            >
              Save Payment Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
