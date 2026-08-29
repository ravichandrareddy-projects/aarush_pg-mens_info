import React, { useState, useEffect } from 'react';
import { Search, X, Grid, BedDouble, User, Layers, ArrowRight } from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { NavTab } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: NavTab) => void;
  onSelectResident: (residentId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onSelectResident
}) => {
  const { floors, residents, getAllEmptyBeds } = usePG();
  const [query, setQuery] = useState('');

  // Keyboard Esc shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedQuery = query.toLowerCase().trim();
  const normalizedQuery = trimmedQuery.replace(/[\s\-_]/g, '');

  // Search Rooms matching query (e.g., "410", "3 sharing", "3-sharing", "4-sharing")
  const matchingRooms: Array<{ room: any; floor: any }> = [];
  if (trimmedQuery) {
    floors.forEach((floor) => {
      floor.rooms.forEach((room) => {
        const cap = room.sharingCapacity;
        const sharingStr = `${cap}sharing ${cap}share ${cap}bed ${cap}seater ${cap}person`;
        const floorStr = floor.name.toLowerCase();
        const roomStr = room.roomNumber.toLowerCase();

        if (
          roomStr.includes(trimmedQuery) ||
          floorStr.includes(trimmedQuery) ||
          sharingStr.includes(normalizedQuery) ||
          (normalizedQuery === `${cap}`)
        ) {
          matchingRooms.push({ room, floor });
        }
      });
    });
  }

  // Search Residents matching query
  const matchingResidents = trimmedQuery
    ? residents.filter((r) => {
        const roomObj = floors.flatMap((f) => f.rooms).find((rm) => rm.roomNumber === r.roomNumber);
        const cap = roomObj?.sharingCapacity;
        const sharingStr = cap ? `${cap}sharing ${cap}share ${cap}bed ${cap}seater` : '';

        return (
          r.fullName.toLowerCase().includes(trimmedQuery) ||
          r.phone.includes(trimmedQuery) ||
          r.roomNumber.toLowerCase().includes(trimmedQuery) ||
          (cap && sharingStr.includes(normalizedQuery))
        );
      })
    : [];

  const handleOpenEmptyBeds = () => {
    setActiveTab('empty-beds');
    onClose();
  };

  const handleOpenFloors = () => {
    setActiveTab('floors');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#F5F2ED] shadow-floating overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-[#F5F2ED] flex items-center gap-3 bg-[#FDFBF7]">
          <Search className="w-5 h-5 text-[#747878]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms, residents or empty beds..."
            className="flex-1 bg-transparent text-sm text-[#181919] focus:outline-none placeholder-[#747878]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-full text-[#747878] hover:bg-[#F5F3F3]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 text-xs text-[#747878] font-mono hover:text-[#181919]">
            ESC
          </button>
        </div>

        {/* Search Results Canvas */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {!trimmedQuery ? (
            <div className="py-6 text-center text-[#747878] space-y-2">
              <p>Type room number (e.g. <span className="font-mono text-[#181919] font-bold">410</span>), resident name, or <span className="font-mono text-[#536347] font-bold">empty</span>.</p>
              <div className="flex justify-center gap-2 pt-2 font-mono text-[11px]">
                <button
                  onClick={handleOpenEmptyBeds}
                  className="px-3 py-1.5 rounded-lg bg-[#F5F3F3] text-[#181919] hover:bg-[#E4E2E2]"
                >
                  ⚡ Browse All 240 Empty Beds
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick shortcut if query contains "empty" */}
              {trimmedQuery.includes('empty') && (
                <div
                  onClick={handleOpenEmptyBeds}
                  className="p-3 rounded-xl bg-[#F2F7EE] border border-[#D4E6C2] text-[#3C4B31] flex items-center justify-between cursor-pointer hover:bg-[#D4E6C2]"
                >
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-[#536347]" />
                    <span className="font-semibold">Open Empty Beds Explorer (240 Available)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}

              {/* ROOM MATCHES */}
              {matchingRooms.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-[#747878] uppercase font-semibold">
                    ROOM MATCHES ({matchingRooms.length})
                  </span>
                  <div className="space-y-2">
                    {matchingRooms.slice(0, 5).map(({ room, floor }) => {
                      const occupiedBeds = room.beds.filter((b: any) => b.status === 'OCCUPIED').length;
                      const emptyBeds = room.sharingCapacity - occupiedBeds;

                      return (
                        <div
                          key={room.id}
                          onClick={handleOpenFloors}
                          className="p-3.5 rounded-xl border border-[#F5F2ED] bg-[#FDFBF7] hover:border-[#181919] cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base font-mono text-[#181919]">
                                Room {room.roomNumber}
                              </span>
                              <span className="text-[10px] font-mono bg-[#E4E2E2] px-2 py-0.5 rounded">
                                {room.sharingCapacity} Sharing
                              </span>
                            </div>
                            <p className="text-[#747878] font-mono text-[11px] mt-0.5">
                              {floor.name} • {room.sharingCapacity} Beds • {emptyBeds} Empty
                            </p>
                          </div>

                          <div className="text-right font-mono">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                occupiedBeds === 0
                                  ? 'bg-[#F5F3F3] text-[#181919]'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {occupiedBeds === 0 ? 'EMPTY' : `${occupiedBeds}/${room.sharingCapacity} OCCUPIED`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RESIDENT MATCHES */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-wider text-[#747878] uppercase font-semibold">
                  RESIDENT MATCHES
                </span>

                {matchingResidents.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[#F5F3F3] text-[#747878] font-mono text-center">
                    No residents found.
                  </div>
                ) : (
                  matchingResidents.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        onSelectResident(res.id);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-[#F5F2ED] bg-white hover:border-[#536347] cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-sm text-[#181919]">{res.fullName}</p>
                        <p className="text-xs text-[#747878] font-mono">
                          Room {res.roomNumber} (Bed {res.bedNumber}) • {res.phone}
                        </p>
                      </div>
                      <span className="text-xs text-[#536347] font-medium">View Profile →</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
