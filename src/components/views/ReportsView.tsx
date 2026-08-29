import React from 'react';
import { BarChart3, PieChart, Layers, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { usePG } from '../../context/PGContext';

export const ReportsView: React.FC = () => {
  const { floors, residents, stats, theme } = usePG();
  const activeResidents = residents.filter((r) => r.status === 'ACTIVE');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
          Analytics & Occupancy Reports
        </h1>
        <p className="text-xs text-[#747878]">
          Real-time building occupancy stats, floor distribution metrics, and revenue breakdown.
        </p>
      </div>

      {activeResidents.length === 0 ? (
        /* Strict Empty State requirement */
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#F5F2ED]">
          <div className="w-16 h-16 rounded-full bg-[#F5F3F3] border border-[#E4E2E2] flex items-center justify-center text-[#747878] mb-3">
            <BarChart3 className="w-8 h-8 text-[#747878]" />
          </div>
          <h3 className="text-lg font-bold text-[#181919] mb-1">No data available yet</h3>
          <p className="text-xs text-[#747878] max-w-sm">
            Once residents are added to the PG, automated analytics for floor-wise occupancy, empty bed distribution, and payment collection will generate dynamically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border bg-white border-[#F5F2ED]">
              <span className="text-xs font-mono text-[#747878] uppercase block mb-1">OCCUPANCY RATE</span>
              <p className="text-3xl font-bold font-mono text-[#536347]">
                {stats.occupancyPercentage}%
              </p>
              <p className="text-xs text-[#747878] mt-1 font-mono">{stats.occupiedBeds} of 240 Beds Occupied</p>
            </div>

            <div className="p-5 rounded-xl border bg-white border-[#F5F2ED]">
              <span className="text-xs font-mono text-[#747878] uppercase block mb-1">EMPTY BEDS</span>
              <p className="text-3xl font-bold font-mono text-[#181919]">
                {stats.emptyBeds}
              </p>
              <p className="text-xs text-[#747878] mt-1 font-mono">Available for onboarding</p>
            </div>

            <div className="p-5 rounded-xl border bg-white border-[#F5F2ED]">
              <span className="text-xs font-mono text-[#747878] uppercase block mb-1">COLLECTION EFFICIENCY</span>
              <p className="text-3xl font-bold font-mono text-emerald-700">
                {stats.occupiedBeds > 0 ? Math.round((stats.paidResidents / stats.occupiedBeds) * 100) : 0}%
              </p>
              <p className="text-xs text-[#747878] mt-1 font-mono">{stats.paidResidents} Paid / {stats.pendingResidents} Pending</p>
            </div>
          </div>

          {/* Floor-wise Occupancy Breakdown */}
          <div className="p-6 rounded-xl border bg-white border-[#F5F2ED] space-y-4">
            <h3 className="text-base font-semibold text-[#181919]">Floor-wise Occupancy Breakdown</h3>
            <div className="space-y-3">
              {floors.map((floor) => {
                let occupied = 0;
                floor.rooms.forEach((r) => {
                  occupied += r.beds.filter((b) => b.status === 'OCCUPIED').length;
                });
                const total = floor.totalBeds;
                const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

                if (floor.id === 'floor7') return null; // Dining area skip

                return (
                  <div key={floor.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-semibold text-[#181919]">{floor.name}</span>
                      <span className="text-[#747878]">
                        {occupied} / {total} Beds ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F5F3F3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#536347] h-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
