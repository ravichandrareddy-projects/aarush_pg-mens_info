import React, { useState } from 'react';
import {
  ChevronLeft,
  Grid,
  BedDouble,
  User,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Utensils,
  Briefcase,
  Phone,
  QrCode
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { Floor, Room, Bed } from '../../types/pg';
import { formatDayAndYear } from '../../utils/dateUtils';
import { RoomQRCollectorModal } from '../modals/RoomQRCollectorModal';

interface FloorsRoomsViewProps {
  onOpenAddResidentForBed: (floorId: string, roomId: string, bedId: string) => void;
  onViewResident: (residentId: string) => void;
  selectedFloorId?: string | null;
  setSelectedFloorId?: (id: string | null) => void;
  selectedRoomId?: string | null;
  setSelectedRoomId?: (id: string | null) => void;
}

export const FloorsRoomsView: React.FC<FloorsRoomsViewProps> = ({
  onOpenAddResidentForBed,
  onViewResident,
  selectedFloorId: propFloorId,
  setSelectedFloorId: propSetFloorId,
  selectedRoomId: propRoomId,
  setSelectedRoomId: propSetRoomId
}) => {
  const { floors, theme, getResidentById, togglePaymentStatus } = usePG();
  const [localFloorId, setLocalFloorId] = useState<string | null>(null);
  const [localRoomId, setLocalRoomId] = useState<string | null>(null);

  const selectedFloorId = propFloorId !== undefined ? propFloorId : localFloorId;
  const setSelectedFloorId = propSetFloorId || setLocalFloorId;

  const selectedRoomId = propRoomId !== undefined ? propRoomId : localRoomId;
  const setSelectedRoomId = propSetRoomId || setLocalRoomId;

  const [sharingFilter, setSharingFilter] = useState<'ALL' | 3 | 4 | 5>('ALL');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const selectedFloor = floors.find((f) => f.id === selectedFloorId);
  const selectedRoom = selectedFloor?.rooms.find((r) => r.id === selectedRoomId);

  // Reset drill-down helpers
  const handleBackToFloors = () => {
    setSelectedFloorId(null);
    setSelectedRoomId(null);
  };

  const handleBackToRooms = () => {
    setSelectedRoomId(null);
  };

  // ROOM DETAIL VIEW
  if (selectedFloor && selectedRoom) {
    const occupiedCount = selectedRoom.beds.filter((b) => b.status === 'OCCUPIED').length;
    const availableCount = selectedRoom.sharingCapacity - occupiedCount;

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToRooms}
            className="p-1.5 rounded-lg border border-[#F5F2ED] bg-white text-[#181919] hover:bg-[#F5F3F3] transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to {selectedFloor.name}</span>
          </button>
        </div>

        {/* Room Header Card */}
        <div className={`p-6 rounded-xl border ${theme === 'atelier' ? 'bg-white border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F2ED] pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold font-mono text-[#181919]">
                  ROOM {selectedRoom.roomNumber}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#F2F7EE] text-[#536347] border border-[#D4E6C2]">
                  {selectedRoom.sharingCapacity} Sharing
                </span>
              </div>
              <p className="text-xs text-[#747878] font-mono">
                {selectedFloor.name} • {selectedRoom.sharingCapacity} Total Beds
              </p>
            </div>

            {/* Room Occupancy Badge & QR Collector Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#181919] text-white hover:bg-black font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-4 h-4 text-[#A8C393]" />
                <span>Collect Aadhaar (QR)</span>
              </button>

              <div className="text-right">
                <p className="text-xs text-[#747878] font-mono uppercase">Occupancy</p>
                <p className="text-lg font-semibold font-mono text-[#181919]">
                  {occupiedCount} / {selectedRoom.sharingCapacity}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                  occupiedCount === 0
                    ? 'bg-[#F5F3F3] text-[#181919]'
                    : occupiedCount === selectedRoom.sharingCapacity
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {occupiedCount === 0 ? 'EMPTY' : occupiedCount === selectedRoom.sharingCapacity ? 'FULL' : 'PARTIAL'}
              </div>
            </div>
          </div>

          {/* Room Summary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
              <span className="text-[#747878] block mb-0.5">Total Beds</span>
              <span className="font-mono font-semibold text-sm text-[#181919]">{selectedRoom.sharingCapacity}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
              <span className="text-[#747878] block mb-0.5">Available Beds</span>
              <span className="font-mono font-semibold text-sm text-[#536347]">{availableCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] col-span-2 sm:col-span-1">
              <span className="text-[#747878] block mb-0.5">Occupied Beds</span>
              <span className="font-mono font-semibold text-sm text-[#181919]">{occupiedCount}</span>
            </div>
          </div>
        </div>

        {/* Individual Bed Cards Grid */}
        <div>
          <h3 className="text-sm font-mono tracking-wider text-[#747878] uppercase mb-3 font-semibold">
            ROOM BEDS ({selectedRoom.beds.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedRoom.beds.map((bed) => {
              const resident = bed.residentId ? getResidentById(bed.residentId) : undefined;
              const isOccupied = bed.status === 'OCCUPIED';

              return (
                <div
                  key={bed.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                    isOccupied
                      ? 'bg-white border-[#D4E6C2] shadow-subtle'
                      : 'bg-[#FDFBF7] border-[#F5F2ED] border-dashed hover:border-[#181919]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BedDouble className={`w-4 h-4 ${isOccupied ? 'text-[#536347]' : 'text-[#747878]'}`} />
                        <span className="font-mono font-semibold text-sm text-[#181919]">
                          BED {bed.bedNumber}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          isOccupied
                            ? 'bg-[#D4E6C2] text-[#121F09]'
                            : 'bg-[#F5F3F3] text-[#747878]'
                        }`}
                      >
                        {isOccupied ? 'OCCUPIED' : 'EMPTY'}
                      </span>
                    </div>

                    {isOccupied && resident ? (
                      <div className="space-y-2 pt-1 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#536347] text-white flex items-center justify-center text-xs font-bold">
                            {resident.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#181919]">{resident.fullName}</p>
                            <a
                              href={`tel:${resident.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-[#536347] font-mono hover:underline flex items-center gap-1 font-semibold"
                              title="Click to Call Dialer"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{resident.phone}</span>
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 font-mono text-[#747878] border-t border-[#F5F2ED]">
                          <div>
                            <span>Rent Due:</span>{' '}
                            <span className="text-[#536347] font-semibold">{formatDayAndYear(undefined, resident.rentDueDay || 1)}</span>
                          </div>
                          <div>
                            <span>Rent:</span>{' '}
                            <span className="text-[#181919] font-medium">₹{resident.monthlyRent.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#F5F2ED] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePaymentStatus(resident.id);
                            }}
                            className={`font-mono font-semibold text-[10px] flex items-center gap-1 px-2.5 py-1 rounded transition-all shadow-xs ${
                              resident.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-500 text-white hover:bg-red-600 font-bold'
                            }`}
                            title={resident.paymentStatus === 'PAID' ? 'Click to mark as Unpaid' : 'Click to confirm payment'}
                          >
                            {resident.paymentStatus === 'PAID' ? 'PAID ✓' : 'Confirm Paid'}
                          </button>
                          <span className="text-[10px] text-[#536347] font-medium">View →</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-[#747878] mb-1">No resident assigned</p>
                        <p className="text-[11px] text-[#747878]/70 font-mono">Bed is available for onboarding</p>
                      </div>
                    )}
                  </div>

                  {/* Bed Action Footer */}
                  <div className="pt-3 border-t border-[#F5F2ED]">
                    {isOccupied && resident ? (
                      <button
                        onClick={() => onViewResident(resident.id)}
                        className="w-full py-2 px-3 rounded-lg border border-[#F5F2ED] bg-white text-xs font-medium text-[#181919] hover:bg-[#F5F3F3] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>View Resident Profile</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenAddResidentForBed(selectedFloor.id, selectedRoom.id, bed.id)}
                        className="w-full py-2 px-3 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Resident</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <RoomQRCollectorModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          floorName={selectedFloor.name}
          roomNumber={selectedRoom.roomNumber}
          beds={selectedRoom.beds}
        />
      </div>
    );
  }

  // FLOOR DETAIL VIEW (Room Cards List on Floor)
  if (selectedFloor) {
    let filteredRooms = selectedFloor.rooms;
    if (sharingFilter !== 'ALL') {
      filteredRooms = filteredRooms.filter((r) => r.sharingCapacity === sharingFilter);
    }

    const totalFloorBeds = selectedFloor.totalBeds;
    let floorOccupiedBeds = 0;
    selectedFloor.rooms.forEach((r) => {
      floorOccupiedBeds += r.beds.filter((b) => b.status === 'OCCUPIED').length;
    });
    const floorEmptyBeds = totalFloorBeds - floorOccupiedBeds;

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToFloors}
            className="p-1.5 rounded-lg border border-[#F5F2ED] bg-white text-[#181919] hover:bg-[#F5F3F3] transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Floors</span>
          </button>

          {/* Sharing Filter Pill Selector */}
          <div className="flex items-center gap-1 bg-[#F5F3F3] p-1 rounded-lg text-xs font-mono">
            <span className="text-[#747878] px-2">Sharing:</span>
            {(['ALL', 3, 4, 5] as const).map((cap) => (
              <button
                key={cap}
                onClick={() => setSharingFilter(cap)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  sharingFilter === cap
                    ? 'bg-white text-[#181919] font-semibold shadow-subtle'
                    : 'text-[#747878] hover:text-[#181919]'
                }`}
              >
                {cap === 'ALL' ? 'All' : `${cap} Bed`}
              </button>
            ))}
          </div>
        </div>

        {/* Floor Header Stats */}
        <div className={`p-6 rounded-xl border ${theme === 'atelier' ? 'bg-white border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F2ED] pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
                {selectedFloor.name}
              </h1>
              <p className="text-xs text-[#747878]">{selectedFloor.subtitle}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
                <span className="text-[#747878] block">Rooms</span>
                <span className="font-semibold text-sm text-[#181919]">{selectedFloor.rooms.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
                <span className="text-[#747878] block">Beds</span>
                <span className="font-semibold text-sm text-[#181919]">{totalFloorBeds}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#F2F7EE] border border-[#D4E6C2]">
                <span className="text-[#536347] block">Empty</span>
                <span className="font-semibold text-sm text-[#536347]">{floorEmptyBeds}</span>
              </div>
            </div>
          </div>

          {/* Facilities overview if ground / 7th floor */}
          {selectedFloor.facilities && selectedFloor.facilities.length > 0 && (
            <div className="mb-2 space-y-2">
              <span className="text-xs font-mono uppercase text-[#747878]">Special Facilities:</span>
              {selectedFloor.facilities.map((fac) => (
                <div key={fac.id} className="p-3 rounded-lg bg-[#F5F3F3] border border-[#E4E2E2] flex items-center gap-3 text-xs">
                  {fac.areaType === 'OFFICE' ? (
                    <Briefcase className="w-4 h-4 text-[#181919]" />
                  ) : (
                    <Utensils className="w-4 h-4 text-[#536347]" />
                  )}
                  <div>
                    <span className="font-semibold text-[#181919]">{fac.name}: </span>
                    <span className="text-[#747878]">{fac.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Cards Grid */}
        <div>
          <h3 className="text-xs font-mono tracking-wider text-[#747878] uppercase mb-3 font-semibold">
            ROOMS ({filteredRooms.length})
          </h3>

          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#747878] bg-white rounded-xl border border-[#F5F2ED]">
              No rooms match the selected sharing filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => {
                const occupiedBeds = room.beds.filter((b) => b.status === 'OCCUPIED').length;
                const availableBeds = room.sharingCapacity - occupiedBeds;
                const isFullyEmpty = occupiedBeds === 0;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className="premium-card rounded-xl p-5 cursor-pointer bg-white border border-[#F5F2ED] hover:border-[#181919] transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-bold font-mono text-[#181919] group-hover:text-[#536347] transition-colors">
                            {room.roomNumber}
                          </h4>
                          <span className="text-xs text-[#747878] font-mono">
                            {room.sharingCapacity} Sharing
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            isFullyEmpty
                              ? 'bg-[#F5F3F3] text-[#181919]'
                              : occupiedBeds === room.sharingCapacity
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {isFullyEmpty ? 'EMPTY' : `${occupiedBeds}/${room.sharingCapacity} OCCUPIED`}
                        </span>
                      </div>

                      {/* Bed Status Breakdown Pill */}
                      <div className="flex items-center gap-2 py-3 border-t border-[#F5F2ED] text-xs font-mono">
                        <div className="flex items-center gap-1 text-[#747878]">
                          <BedDouble className="w-3.5 h-3.5" />
                          <span>{availableBeds} Available</span>
                        </div>
                        <span className="text-[#E4E2E2]">•</span>
                        <div className="text-[#536347] font-medium">
                          {occupiedBeds} Occupied
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#181919] font-medium pt-2 group-hover:translate-x-0.5 transition-transform">
                      <span>Manage Beds</span>
                      <ArrowRight className="w-4 h-4 text-[#747878] group-hover:text-[#181919]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ALL FLOORS OVERVIEW (Ground to 7th Floor Cards)
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
            Floors & Rooms
          </h1>
          <p className="text-xs text-[#747878]">
            Overview of property occupancy and room distribution across 8 floors.
          </p>
        </div>

        <div className="text-xs font-mono text-[#747878]">
          <span>8 FLOORS TOTAL</span>
        </div>
      </div>

      {/* Floor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {floors.map((floor) => {
          const totalFloorBeds = floor.totalBeds;
          let floorOccupiedBeds = 0;
          floor.rooms.forEach((r) => {
            floorOccupiedBeds += r.beds.filter((b) => b.status === 'OCCUPIED').length;
          });
          const occupancyPct = totalFloorBeds > 0 ? Math.round((floorOccupiedBeds / totalFloorBeds) * 100) : 0;

          const isDiningFloor = floor.id === 'floor7';

          return (
            <div
              key={floor.id}
              onClick={() => setSelectedFloorId(floor.id)}
              className="premium-card rounded-xl p-5 cursor-pointer bg-white border border-[#F5F2ED] hover:border-[#181919] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#181919] group-hover:text-[#536347] transition-colors">
                      {floor.name}
                    </h3>
                    <p className="text-xs text-[#747878]">{floor.subtitle}</p>
                  </div>

                  {!isDiningFloor && (
                    <div className="bg-[#F5F3F3] text-[#181919] text-[11px] font-mono font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#181919]" />
                      <span>{occupancyPct}% Occupied</span>
                    </div>
                  )}
                </div>

                {/* Floor Meta Icons */}
                <div className="flex items-center gap-4 pt-3 border-t border-[#F5F2ED] text-xs font-medium text-[#444748]">
                  {isDiningFloor ? (
                    <div className="flex items-center gap-1.5 text-[#536347]">
                      <Utensils className="w-4 h-4" />
                      <span>Dining Area & Mess Facility</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Grid className="w-4 h-4 text-[#747878]" />
                        <span>{floor.rooms.length} Room{floor.rooms.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-[#E4E2E2]">•</span>
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-4 h-4 text-[#747878]" />
                        <span>{totalFloorBeds} Beds</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#181919] font-medium pt-3 mt-2">
                <span>View Rooms</span>
                <ArrowRight className="w-4 h-4 text-[#747878] group-hover:text-[#181919] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
