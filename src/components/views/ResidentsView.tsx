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
  UserCheck
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Resident } from '../../types/pg';

interface ResidentsViewProps {
  onOpenAddResident: () => void;
  onSelectResident: (residentId: string) => void;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({ onOpenAddResident, onSelectResident }) => {
  const { residents, theme } = usePG();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'LEFT' | 'ALL'>('ACTIVE');

  // Filter residents
  const filteredResidents = residents.filter((res) => {
    const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      res.fullName.toLowerCase().includes(query) ||
      res.phone.toLowerCase().includes(query) ||
      res.roomNumber.toLowerCase().includes(query) ||
      res.aadhaarNumber.includes(query);
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

        <button
          onClick={onOpenAddResident}
          className="py-2.5 px-4 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Resident</span>
        </button>
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
                    <div className="w-10 h-10 rounded-full bg-[#536347] text-white font-bold flex items-center justify-center text-sm shadow-subtle">
                      {res.fullName.charAt(0)}
                    </div>
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
                    <span className="text-[#181919]">{res.joiningDate}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#747878]">Monthly Rent:</span>
                    <span className="font-semibold text-[#181919]">
                      ₹{res.monthlyRent.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status & Action Footer */}
              <div className="pt-3 border-t border-[#F5F2ED] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {res.paymentStatus === 'PAID' ? (
                    <span className="text-emerald-700 font-mono font-semibold text-[11px] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>PAID</span>
                    </span>
                  ) : res.paymentStatus === 'PARTIALLY_PAID' ? (
                    <span className="text-amber-800 font-mono font-semibold text-[11px] flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>PARTIAL (₹{res.amountPending})</span>
                    </span>
                  ) : (
                    <span className="text-red-700 font-mono font-semibold text-[11px] flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span>UNPAID</span>
                    </span>
                  )}
                </div>

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
