import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  BedDouble,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  ArrowUpDown,
  UserCheck,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Resident } from '../../types/pg';
import { formatDayAndYear } from '../../utils/dateUtils';
import { Send } from 'lucide-react';

interface ResidentsViewProps {
  onOpenAddResident: () => void;
  onSelectResident: (residentId: string) => void;
  onOpenBulkBroadcast?: () => void;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({ onOpenAddResident, onSelectResident, onOpenBulkBroadcast }) => {
  const { residents, theme, togglePaymentStatus } = usePG();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'LEFT' | 'ALL'>('ACTIVE');

  // Filter residents
  const { floors } = usePG();
  const filteredResidents = residents.filter((res) => {
    const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const normalizedQuery = query.replace(/[\s\-_]/g, '');

    const roomObj = floors.flatMap((f) => f.rooms).find((rm) => rm.roomNumber === res.roomNumber);
    const cap = roomObj?.sharingCapacity;
    const sharingStr = cap ? `${cap}sharing ${cap}share ${cap}bed ${cap}seater` : '';

    const matchesQuery =
      !query ||
      res.fullName.toLowerCase().includes(query) ||
      res.phone.includes(query) ||
      res.roomNumber.toLowerCase().includes(query) ||
      res.aadhaarNumber.includes(query) ||
      (cap && sharingStr.includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  });

  const activeCount = residents.filter((r) => r.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
            Residents <span className="text-sm font-mono text-[#747878] font-normal">({activeCount} Active)</span>
          </h1>
          <p className="text-xs text-[#747878]">
            Manage current PG occupants, profiles, room assignments and payment records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBulkBroadcast && (
            <button
              onClick={onOpenBulkBroadcast}
              className="py-2.5 px-4 rounded-lg bg-[#536347] text-white text-xs font-mono font-bold hover:bg-[#3E4A35] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Google Form Broadcast</span>
            </button>
          )}

          <button
            onClick={onOpenAddResident}
            className="py-2.5 px-4 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Resident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {residents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, room, phone, or Aadhaar..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#F5F2ED] bg-white focus:outline-none focus:border-[#181919]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F5F3F3] p-1 rounded-lg text-xs font-mono w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-[#181919] font-semibold shadow-subtle'
                  : 'text-[#747878]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('LEFT')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
                statusFilter === 'LEFT'
                  ? 'bg-white text-[#181919] font-semibold shadow-subtle'
                  : 'text-[#747878]'
              }`}
            >
              Past / Left
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-[#181919] font-semibold shadow-subtle'
                  : 'text-[#747878]'
              }`}
            >
              All ({residents.length})
            </button>
          </div>
        </div>
      )}

      {/* Initial Empty State (When 0 residents exist in system) */}
      {residents.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#F5F2ED]">
          <div className="w-20 h-20 rounded-full bg-[#F5F3F3] border border-[#E4E2E2] flex items-center justify-center text-[#747878] mb-4">
            <Users className="w-10 h-10 text-[#747878]" />
          </div>
          <h2 className="text-xl font-bold text-[#181919] mb-1">No residents yet</h2>
          <p className="text-xs text-[#747878] max-w-sm mb-6">
            Add your first resident to start managing room occupancy, payments, documents, and Aadhaar verification.
          </p>
          <button
            onClick={onOpenAddResident}
            className="py-3 px-6 rounded-lg bg-[#181919] text-white text-sm font-medium hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 shadow-subtle"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Resident</span>
          </button>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#747878] bg-white rounded-xl border border-[#F5F2ED]">
          No residents found matching your search term or filter.
        </div>
      ) : (
        /* Resident Cards / List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResidents.map((res) => (
            <div
              key={res.id}
              onClick={() => onSelectResident(res.id)}
              className="p-5 rounded-xl border bg-white border-[#F5F2ED] hover:border-[#181919] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {res.photoUrl ? (
                      <img
                        src={res.photoUrl}
                        alt={res.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-[#536347] shadow-subtle"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#536347] text-white font-bold flex items-center justify-center text-sm shadow-subtle">
                        {res.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-base text-[#181919] group-hover:text-[#536347] transition-colors">
                        {res.fullName}
                      </h3>
                      <a
                        href={`tel:${res.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#536347] font-mono flex items-center gap-1 hover:underline font-medium"
                        title="Click to Call Dialer"
                      >
                        <Phone className="w-3 h-3 text-[#536347]" />
                        <span>{res.phone}</span>
                      </a>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                      res.status === 'ACTIVE'
                        ? 'bg-[#F2F7EE] text-[#536347] border border-[#D4E6C2]'
                        : 'bg-[#F5F3F3] text-[#747878]'
                    }`}
                  >
                    {res.status === 'ACTIVE' ? 'ACTIVE' : 'LEFT'}
                  </span>
                </div>

                {/* PG Details Badge Box */}
                <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] space-y-1.5 text-xs mb-3 font-mono">
                  <div className="flex items-center justify-between text-[#181919]">
                    <span className="text-[#747878]">Room & Bed:</span>
                    <span className="font-semibold text-[#181919]">
                      Room {res.roomNumber} (Bed {res.bedNumber})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#747878]">Joining Date:</span>
                    <span className="text-[#181919] font-medium">{formatDayAndYear(res.joiningDate)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#F5F2ED]">
                    <span className="text-[#747878]">Aadhaar Status:</span>
                    {res.aadhaarDocumentUrl ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Uploaded ✓</span>
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending ⏳</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#747878]">Monthly Rent:</span>
                    <span className="font-semibold text-[#181919]">
                      ₹{(res.monthlyRent || 8000).toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#536347] font-semibold bg-[#F2F7EE] px-2 py-1 rounded border border-[#D4E6C2] text-[11px] mt-1">
                    <span>Rent Due Date:</span>
                    <span>{formatDayAndYear(undefined, res.rentDueDay || 1)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status & Action Footer */}
              <div className="pt-3 border-t border-[#F5F2ED] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePaymentStatus(res.id);
                  }}
                  className={`font-mono font-semibold text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-sm ${
                    res.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      : 'bg-red-500 text-white hover:bg-red-600 animate-pulse hover:animate-none'
                  }`}
                  title={res.paymentStatus === 'PAID' ? 'Click to mark as Unpaid' : 'Click to confirm payment received'}
                >
                  {res.paymentStatus === 'PAID' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>PAID ✓</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-white" />
                      <span>Confirm Paid (₹{(res.monthlyRent || 8000).toLocaleString()})</span>
                    </>
                  )}
                </button>

                <span className="text-xs font-medium text-[#536347] group-hover:underline">
                  View Profile →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
