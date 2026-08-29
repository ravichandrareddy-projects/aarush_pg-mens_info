import React from 'react';
import {
  Grid,
  BedDouble,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Receipt,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { NavTab } from '../layout/Sidebar';
import { getTimeBasedGreeting } from '../../utils/dateUtils';

interface DashboardViewProps {
  onOpenAddResident: () => void;
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddResident, setActiveTab }) => {
  const { stats, activities, theme } = usePG();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Header */}
      <section>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#181919] tracking-tight mb-1">
          {getTimeBasedGreeting()}, Admin 👋
        </h1>
        <p className="text-sm text-[#747878]">
          Manage your PG rooms, residents and beds.
        </p>
      </section>

      {/* Stats Bento Grid (Dynamic calculated values, starts with 0 occupied, 240 empty) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 md:gap-4">
        {/* Total Rooms */}
        <div
          onClick={() => setActiveTab('floors')}
          className={`p-4 md:p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
            theme === 'atelier' ? 'atelier-card' : 'vision-card'
          }`}
        >
          <div className="flex items-center justify-between text-[#747878] mb-3">
            <span className="text-xs font-mono tracking-wider uppercase font-medium">TOTAL ROOMS</span>
            <Grid className="w-4 h-4 text-[#747878]" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-semibold text-[#181919] tracking-tight">
              {stats.totalRooms}
            </p>
            <p className="text-[11px] text-[#747878] mt-1 font-mono">67 Bedrooms + Facilities</p>
          </div>
        </div>

        {/* Total Beds */}
        <div
          onClick={() => setActiveTab('floors')}
          className={`p-4 md:p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
            theme === 'atelier' ? 'atelier-card' : 'vision-card'
          }`}
        >
          <div className="flex items-center justify-between text-[#747878] mb-3">
            <span className="text-xs font-mono tracking-wider uppercase font-medium">TOTAL BEDS</span>
            <BedDouble className="w-4 h-4 text-[#747878]" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-semibold text-[#181919] tracking-tight">
              {stats.totalBeds}
            </p>
            <p className="text-[11px] text-[#747878] mt-1 font-mono">Capacity across 7 floors</p>
          </div>
        </div>

        {/* Occupied */}
        <div
          onClick={() => setActiveTab('residents')}
          className={`p-4 md:p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
            theme === 'atelier' ? 'atelier-card' : 'vision-card'
          }`}
        >
          <div className="flex items-center justify-between text-[#536347] mb-3">
            <span className="text-xs font-mono tracking-wider uppercase font-medium">OCCUPIED</span>
            <UserCheck className="w-4 h-4 text-[#536347]" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-semibold text-[#536347] tracking-tight">
              {stats.occupiedBeds}
            </p>
            <p className="text-[11px] text-[#747878] mt-1 font-mono">Active residents</p>
          </div>
        </div>

        {/* Empty */}
        <div
          onClick={() => setActiveTab('empty-beds')}
          className={`p-4 md:p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
            theme === 'atelier' ? 'atelier-card' : 'vision-card'
          }`}
        >
          <div className="flex items-center justify-between text-[#181919] mb-3">
            <span className="text-xs font-mono tracking-wider uppercase font-medium">EMPTY</span>
            <UserX className="w-4 h-4 text-[#747878]" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-semibold text-[#181919] tracking-tight">
              {stats.emptyBeds}
            </p>
            <p className="text-[11px] text-[#747878] mt-1 font-mono">Ready for assignment</p>
          </div>
        </div>

        {/* Paid */}
        <div
          onClick={() => setActiveTab('payments')}
          className={`p-4 md:p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
            theme === 'atelier' ? 'atelier-card' : 'vision-card'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-3">
            <span className="text-xs font-mono tracking-wider uppercase font-medium">PAID</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-semibold text-emerald-800 tracking-tight">
              {stats.paidResidents}
            </p>
            <p className="text-[11px] text-[#747878] mt-1 font-mono">Up to date</p>
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => setActiveTab('payments')}
          className={`p-4 md:p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
            theme === 'atelier' ? 'atelier-card' : 'vision-card'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-3">
            <span className="text-xs font-mono tracking-wider uppercase font-medium">PENDING</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-semibold text-amber-800 tracking-tight">
              {stats.pendingResidents}
            </p>
            <p className="text-[11px] text-[#747878] mt-1 font-mono">Due payments</p>
          </div>
        </div>
      </section>

      {/* Sections Grid: Empty States / Real Data */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Residents Status Card */}
        <div className={`p-6 rounded-xl border ${theme === 'atelier' ? 'bg-white border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#181919]">Recent Residents</h3>
            <button
              onClick={() => setActiveTab('residents')}
              className="text-xs font-mono text-[#536347] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.occupiedBeds === 0 ? (
            /* Strict Empty State per Requirements */
            <div className="py-10 px-4 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] border-dashed flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#F5F3F3] border border-[#E4E2E2] flex items-center justify-center text-[#747878] mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <h4 className="text-base font-medium text-[#181919] mb-1">No residents added yet</h4>
              <p className="text-xs text-[#747878] max-w-xs mb-4">
                Start by adding your first resident to manage occupancy, rent, and documents.
              </p>
              <button
                onClick={onOpenAddResident}
                className="py-2 px-4 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors"
              >
                + Add Resident
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#747878]">Currently managing {stats.occupiedBeds} active resident(s).</p>
            </div>
          )}
        </div>

        {/* Payments Status Card */}
        <div className={`p-6 rounded-xl border ${theme === 'atelier' ? 'bg-white border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#181919]">Pending Payments</h3>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-mono text-[#536347] hover:underline flex items-center gap-1"
            >
              <span>View Payments</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.pendingResidents === 0 ? (
            /* Strict Empty State */
            <div className="py-10 px-4 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] border-dashed flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#F5F3F3] border border-[#E4E2E2] flex items-center justify-center text-[#747878] mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-base font-medium text-[#181919] mb-1">No payment records yet</h4>
              <p className="text-xs text-[#747878] max-w-xs">
                There are no pending payments at this time. All caught up.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-800">
                {stats.pendingResidents} resident(s) have pending payments totaling ₹{stats.totalPendingAmount.toLocaleString()}.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Activity Timeline Section */}
      <section className={`p-6 rounded-xl border ${theme === 'atelier' ? 'bg-white border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#181919] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#536347]" />
            <span>Recent Activity</span>
          </h3>
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#747878] bg-[#FDFBF7] rounded-lg border border-[#F5F2ED]">
            No recent activity yet. Resident movement and payment updates will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] text-xs">
                <div className="w-2 h-2 rounded-full bg-[#536347] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[#181919] font-medium">{log.description}</p>
                  <p className="text-[10px] font-mono text-[#747878] mt-0.5">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
