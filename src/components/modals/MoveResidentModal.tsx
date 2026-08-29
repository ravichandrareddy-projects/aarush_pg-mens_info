import React, { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { usePG } from '../../context/PGContext';

interface MoveResidentModalProps {
  residentId: string | null;
  onClose: () => void;
}

export const MoveResidentModal: React.FC<MoveResidentModalProps> = ({ residentId, onClose }) => {
  const { getResidentById, floors, moveResident } = usePG();

  const [newFloorId, setNewFloorId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newBedId, setNewBedId] = useState('');

  if (!residentId) return null;
  const resident = getResidentById(residentId);
  if (!resident) return null;

  const selectedFloor = floors.find((f) => f.id === newFloorId);
  const availableRooms = selectedFloor
    ? selectedFloor.rooms.filter((r) => r.beds.some((b) => b.status === 'EMPTY'))
    : [];

  const selectedRoom = selectedFloor?.rooms.find((r) => r.id === newRoomId);
  const availableBeds = selectedRoom
    ? selectedRoom.beds.filter((b) => b.status === 'EMPTY')
    : [];

  const handleMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorId || !newRoomId || !newBedId) {
      alert('Please select a target floor, room and empty bed.');
      return;
    }

    const success = moveResident(resident.id, newFloorId, newRoomId, newBedId);
    if (success) {
      onClose();
    } else {
      alert('Failed to move resident. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#F5F2ED] shadow-floating overflow-hidden">
        <div className="p-5 border-b border-[#F5F2ED] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#536347]" />
            <h3 className="font-semibold text-base text-[#181919]">Move Resident</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#747878] hover:bg-[#F5F3F3]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleMove} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] font-mono">
            <span className="text-[#747878] block text-[10px] uppercase">CURRENT ALLOCATION</span>
            <p className="font-bold text-[#181919] text-sm">{resident.fullName}</p>
            <p className="text-[#536347]">Room {resident.roomNumber} (Bed {resident.bedNumber})</p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[#181919] font-medium mb-1">New Target Floor *</label>
              <select
                value={newFloorId}
                onChange={(e) => {
                  setNewFloorId(e.target.value);
                  setNewRoomId('');
                  setNewBedId('');
                }}
                required
                className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919]"
              >
                <option value="">-- Choose Target Floor --</option>
                {floors
                  .filter((f) => f.id !== 'floor7')
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[#181919] font-medium mb-1">New Target Room *</label>
              <select
                value={newRoomId}
                disabled={!newFloorId}
                onChange={(e) => {
                  setNewRoomId(e.target.value);
                  setNewBedId('');
                }}
                required
                className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919] disabled:opacity-50"
              >
                <option value="">-- Choose Target Room --</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.sharingCapacity} Sharing)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#181919] font-medium mb-1">New Empty Bed *</label>
              <select
                value={newBedId}
                disabled={!newRoomId}
                onChange={(e) => setNewBedId(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-[#F5F2ED] bg-[#FDFBF7] text-[#181919] focus:outline-none focus:border-[#181919] disabled:opacity-50"
              >
                <option value="">-- Choose Empty Bed --</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bedNumber} (Vacant)
                  </option>
                ))}
              </select>
            </div>
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
              className="py-2 px-4 rounded-lg bg-[#181919] text-white font-medium hover:bg-[#2D2D2D]"
            >
              Confirm Move
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
