import React, { useState } from 'react';
import {
  BedDouble,
  Layers,
  Users,
  Search,
  Plus,
  ChevronRight,
  Filter
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Bed } from '../../types/pg';

interface EmptyBedsViewProps {
  onOpenAddResidentForBed: (floorId: string, roomId: string, bedId: string) => void;
}

export const EmptyBedsView: React.FC<EmptyBedsViewProps> = ({ onOpenAddResidentForBed }) => {
  const { getAllEmptyBeds, floors, theme } = usePG();
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('ALL');
  const [selectedSharingFilter, setSelectedSharingFilter] = useState<'ALL' | 3 | 4 | 5>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allEmptyBeds = getAllEmptyBeds();

  // Filter empty beds
  const filteredBeds = allEmptyBeds.filter((bed) => {
    // Floor filter
    if (selectedFloorFilter !== 'ALL' && bed.floorId !== selectedFloorFilter) {
      return false;
    }

    // Room lookup for sharing capacity
    let sharingCap: number = 0;
    for (const f of floors) {
      if (f.id === bed.floorId) {
        const r = f.rooms.find((rm) => rm.id === bed.roomId);
        if (r) {
          sharingCap = r.sharingCapacity;
          break;
        }
      }
    }

    if (selectedSharingFilter !== 'ALL' && sharingCap !== selectedSharingFilter) {
      return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchRoom = bed.roomNumber.toLowerCase().includes(q);
      const matchBed = bed.id.toLowerCase().includes(q);
      const matchFloor = bed.floorName.toLowerCase().includes(q);
      if (!matchRoom && !matchBed && !matchFloor) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
          Empty Beds{' '}
          <span className="text-base font-mono text-[#747878] font-normal">
            ({allEmptyBeds.length})
          </span>
        </h1>
        <p className="text-xs text-[#747878]">
          Available spaces for new residents across all floors. Filter by floor or sharing type to assign.
        </p>
      </div>

      {/* Filter Bar (Horizontal Scrollable Pills) */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-[#F5F2ED]">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by room (e.g. 410) or floor..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] focus:outline-none focus:border-[#181919]"
          />
        </div>

        {/* Floor Pills */}
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#747878] uppercase mb-1.5 block font-semibold">
            FLOOR FILTER
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedFloorFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                selectedFloorFilter === 'ALL'
                  ? 'bg-[#181919] text-white font-semibold'
                  : 'bg-[#FDFBF7] text-[#181919] border border-[#F5F2ED] hover:border-[#181919]'
              }`}
            >
              All Floors ({allEmptyBeds.length})
            </button>

            {floors.map((floor) => {
              let count = 0;
              floor.rooms.forEach((r) => {
                count += r.beds.filter((b) => b.status === 'EMPTY').length;
              });

              return (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloorFilter(floor.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                    selectedFloorFilter === floor.id
                      ? 'bg-[#181919] text-white font-semibold'
                      : 'bg-[#FDFBF7] text-[#181919] border border-[#F5F2ED] hover:border-[#181919]'
                  }`}
                >
                  {floor.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Sharing Capacity Pills */}
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#747878] uppercase mb-1.5 block font-semibold">
            SHARING CAPACITY
          </span>
          <div className="flex gap-2">
            {(['ALL', 3, 4, 5] as const).map((cap) => (
              <button
                key={cap}
                onClick={() => setSelectedSharingFilter(cap)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  selectedSharingFilter === cap
                    ? 'bg-[#536347] text-white font-semibold'
                    : 'bg-[#FDFBF7] text-[#181919] border border-[#F5F2ED] hover:border-[#536347]'
                }`}
              >
                {cap === 'ALL' ? 'All Sharing' : `${cap} Sharing`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs font-mono text-[#747878]">
        <span>SHOWING {filteredBeds.length} EMPTY BEDS</span>
      </div>

      {/* Empty Beds Grid */}
      {filteredBeds.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#747878] bg-white rounded-xl border border-[#F5F2ED]">
          No empty beds found matching your active filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredBeds.map((bed) => {
            // Find room details
            let sharingCap = 0;
            for (const f of floors) {
              if (f.id === bed.floorId) {
                const r = f.rooms.find((rm) => rm.id === bed.roomId);
                if (r) sharingCap = r.sharingCapacity;
              }
            }

            return (
              <div
                key={bed.id}
                className="p-4 rounded-xl border bg-white border-[#F5F2ED] hover:border-[#181919] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-base text-[#181919]">
                      {bed.roomNumber}-B{bed.bedNumber}
                    </span>
                    <span className="bg-[#F5F3F3] text-[#181919] font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                      VACANT
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#747878] font-mono mb-4">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#747878]" />
                      <span>{bed.floorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#747878]" />
                      <span>{sharingCap} Sharing Room</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAddResidentForBed(bed.floorId, bed.roomId, bed.id)}
                  className="w-full py-2 px-3 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#536347] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Resident</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
