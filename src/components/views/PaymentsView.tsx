import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Receipt,
  Search,
  Plus,
  DollarSign
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Resident, Payment } from '../../types/pg';

interface PaymentsViewProps {
  onOpenRecordPayment: (residentId?: string) => void;
  onViewResident: (residentId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onOpenRecordPayment, onViewResident }) => {
  const { residents, payments, stats, theme } = usePG();
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'RESIDENTS'>('RESIDENTS');
  const [searchQuery, setSearchQuery] = useState('');

  const activeResidents = residents.filter((r) => r.status === 'ACTIVE');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
            Payments & Rent Ledger
          </h1>
          <p className="text-xs text-[#747878]">
            Track monthly rent collections, pending dues, and payment transaction history.
          </p>
        </div>

        {activeResidents.length > 0 && (
          <button
            onClick={() => onOpenRecordPayment()}
            className="py-2.5 px-4 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white border-[#F5F2ED]">
          <span className="text-xs font-mono text-[#747878] uppercase block mb-1 font-medium">TOTAL COLLECTED</span>
          <p className="text-2xl font-bold font-mono text-[#536347]">
            ₹{stats.totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#747878] mt-1 font-mono">{payments.length} transactions</p>
        </div>

        <div className="p-4 rounded-xl border bg-white border-[#F5F2ED]">
          <span className="text-xs font-mono text-[#747878] uppercase block mb-1 font-medium">TOTAL PENDING</span>
          <p className="text-2xl font-bold font-mono text-amber-800">
            ₹{stats.totalPendingAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#747878] mt-1 font-mono">{stats.pendingResidents} resident(s) due</p>
        </div>

        <div className="p-4 rounded-xl border bg-white border-[#F5F2ED]">
          <span className="text-xs font-mono text-[#747878] uppercase block mb-1 font-medium">PAID RESIDENTS</span>
          <p className="text-2xl font-bold font-mono text-emerald-800">
            {stats.paidResidents}
          </p>
          <p className="text-[11px] text-[#747878] mt-1 font-mono">Up to date</p>
        </div>

        <div className="p-4 rounded-xl border bg-white border-[#F5F2ED]">
          <span className="text-xs font-mono text-[#747878] uppercase block mb-1 font-medium">PENDING RESIDENTS</span>
          <p className="text-2xl font-bold font-mono text-amber-800">
            {stats.pendingResidents}
          </p>
          <p className="text-[11px] text-[#747878] mt-1 font-mono">Requires action</p>
        </div>
      </div>

      {/* Initial Empty State (When zero payment records exist) */}
      {payments.length === 0 && activeResidents.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#F5F2ED]">
          <div className="w-16 h-16 rounded-full bg-[#F5F3F3] border border-[#E4E2E2] flex items-center justify-center text-[#747878] mb-3">
            <Receipt className="w-8 h-8 text-[#747878]" />
          </div>
          <h3 className="text-lg font-bold text-[#181919] mb-1">No payment records yet</h3>
          <p className="text-xs text-[#747878] max-w-sm mb-4">
            Once residents are added and rent payments are recorded, dynamic financial ledgers and receipt histories will populate automatically.
          </p>
        </div>
      ) : (
        /* Resident Payment Status Table & Transaction History */
        <div className="space-y-4">
          {/* Subtabs */}
          <div className="flex items-center gap-2 border-b border-[#F5F2ED] pb-3 text-xs font-mono">
            <button
              onClick={() => setActiveTab('RESIDENTS')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'RESIDENTS'
                  ? 'bg-[#181919] text-white shadow-subtle'
                  : 'text-[#747878] hover:text-[#181919]'
              }`}
            >
              Resident Dues Ledger ({activeResidents.length})
            </button>
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'LEDGER'
                  ? 'bg-[#181919] text-white shadow-subtle'
                  : 'text-[#747878] hover:text-[#181919]'
              }`}
            >
              Payment History Logs ({payments.length})
            </button>
          </div>

          {activeTab === 'RESIDENTS' ? (
            <div className="bg-white rounded-xl border border-[#F5F2ED] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FDFBF7] border-b border-[#F5F2ED] text-[#747878] font-mono uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Resident</th>
                      <th className="px-4 py-3">Room & Bed</th>
                      <th className="px-4 py-3">Monthly Rent</th>
                      <th className="px-4 py-3">Amount Paid</th>
                      <th className="px-4 py-3">Amount Pending</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F2ED]">
                    {activeResidents.map((res) => (
                      <tr key={res.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="px-4 py-3.5 font-medium text-[#181919]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#536347] text-white font-bold flex items-center justify-center text-xs">
                              {res.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#181919]">{res.fullName}</p>
                              <p className="text-[10px] text-[#747878] font-mono">{res.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[#181919]">
                          Room {res.roomNumber} (Bed {res.bedNumber})
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[#181919]">
                          ₹{res.monthlyRent.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-emerald-700 font-medium">
                          ₹{res.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-amber-800 font-medium">
                          ₹{res.amountPending.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              res.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-900'
                                : res.paymentStatus === 'PARTIALLY_PAID'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {res.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono">
                          <button
                            onClick={() => onOpenRecordPayment(res.id)}
                            className="px-3 py-1 rounded bg-[#181919] text-white text-[11px] font-medium hover:bg-[#536347] transition-colors"
                          >
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#F5F2ED] overflow-hidden">
              {payments.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#747878]">
                  No transaction history recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FDFBF7] border-b border-[#F5F2ED] text-[#747878] font-mono uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Resident</th>
                        <th className="px-4 py-3">Room</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F2ED] font-mono">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-4 py-3 text-[#747878]">{pay.paymentDate}</td>
                          <td className="px-4 py-3 font-sans font-semibold text-[#181919]">
                            {pay.residentName}
                          </td>
                          <td className="px-4 py-3 text-[#181919]">Room {pay.roomNumber}</td>
                          <td className="px-4 py-3 text-emerald-700 font-bold">
                            ₹{pay.amountPaid.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-[#F5F3F3] text-[#181919] px-2 py-0.5 rounded text-[10px]">
                              {pay.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#747878] font-sans">{pay.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
