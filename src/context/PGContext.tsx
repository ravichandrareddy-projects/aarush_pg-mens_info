import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Floor,
  Resident,
  Payment,
  ActivityLog,
  DashboardStats,
  Bed,
  Room
} from '../types/pg';
import {
  INITIAL_BUILDING_CONFIG,
  INITIAL_GROUND_FLOOR_RESIDENTS,
  INITIAL_1ST_FLOOR_RESIDENTS,
  INITIAL_2ND_FLOOR_RESIDENTS,
  INITIAL_3RD_FLOOR_RESIDENTS,
  INITIAL_5TH_FLOOR_RESIDENTS,
  INITIAL_6TH_FLOOR_RESIDENTS
} from '../data/buildingConfig';
import { syncResidentsToSupabase, syncPaymentsToSupabase } from '../lib/supabaseSync';

export type DesignTheme = 'atelier' | 'vision';

interface PGContextType {
  floors: Floor[];
  residents: Resident[];
  payments: Payment[];
  activities: ActivityLog[];
  theme: DesignTheme;
  setTheme: (theme: DesignTheme) => void;
  stats: DashboardStats;
  
  // Actions
  addResident: (residentData: Omit<Resident, 'id' | 'createdAt' | 'status'>) => void;
  moveResident: (residentId: string, newFloorId: string, newRoomId: string, newBedId: string) => boolean;
  markResidentLeft: (residentId: string, leavingDate: string, reason?: string) => boolean;
  recordPayment: (payment: {
    residentId: string;
    amountPaid: number;
    paymentMethod: Payment['paymentMethod'];
    notes?: string;
  }) => boolean;
  importResidents: (importData: Array<{
    fullName: string;
    phone: string;
    aadhaarNumber: string;
    roomNumber: string;
    bedNumber: number;
    monthlyRent: number;
    amountPaid: number;
    emergencyName?: string;
    emergencyPhone?: string;
  }>) => { successCount: number; errors: string[] };
  togglePaymentStatus: (residentId: string) => boolean;
  resetSystem: () => void;
  
  // Helpers
  getRoomByNumber: (roomNumber: string) => { room: Room; floor: Floor } | null;
  getBedById: (bedId: string) => Bed | null;
  getAllEmptyBeds: () => Bed[];
  getResidentById: (residentId: string) => Resident | undefined;
}

const STORAGE_KEY_RESIDENTS = 'atelier_pg_residents_v7';
const STORAGE_KEY_PAYMENTS = 'atelier_pg_payments_v7';
const STORAGE_KEY_ACTIVITIES = 'atelier_pg_activities_v7';
const STORAGE_KEY_THEME = 'atelier_pg_theme_v1';

const PGContext = createContext<PGContextType | undefined>(undefined);

const ALL_INITIAL_RESIDENTS = [
  ...INITIAL_GROUND_FLOOR_RESIDENTS,
  ...INITIAL_1ST_FLOOR_RESIDENTS,
  ...INITIAL_2ND_FLOOR_RESIDENTS,
  ...INITIAL_3RD_FLOOR_RESIDENTS,
  ...INITIAL_5TH_FLOOR_RESIDENTS,
  ...INITIAL_6TH_FLOOR_RESIDENTS
];

export const PGProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<DesignTheme>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as DesignTheme) || 'atelier';
  });

  const [residents, setResidents] = useState<Resident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESIDENTS);
      return saved ? JSON.parse(saved) : (ALL_INITIAL_RESIDENTS as Resident[]);
    } catch {
      return ALL_INITIAL_RESIDENTS as Resident[];
    }
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const setTheme = (newTheme: DesignTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  };

  // Save to localStorage whenever residents, payments, activities change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RESIDENTS, JSON.stringify(residents));
    syncResidentsToSupabase(residents);
  }, [residents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
    syncPaymentsToSupabase(payments);
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  // Derived building floor state based on active residents
  const floors = useMemo(() => {
    const activeResidents = residents.filter((r) => r.status === 'ACTIVE');
    const residentMap = new Map<string, Resident>();
    activeResidents.forEach((r) => {
      if (r.bedId) {
        residentMap.set(r.bedId, r);
      }
    });

    return INITIAL_BUILDING_CONFIG.map((floor) => ({
      ...floor,
      rooms: floor.rooms.map((room) => ({
        ...room,
        beds: room.beds.map((bed) => {
          const res = residentMap.get(bed.id);
          if (res) {
            return {
              ...bed,
              status: 'OCCUPIED' as const,
              residentId: res.id,
              residentName: res.fullName
            };
          }
          return {
            ...bed,
            status: 'EMPTY' as const,
            residentId: undefined,
            residentName: undefined
          };
        })
      }))
    }));
  }, [residents]);

  // Dashboard Stats Calculation (Derived strictly from single source of truth)
  const stats: DashboardStats = useMemo(() => {
    let totalRoomsCount = 0;
    let totalBedsCount = 0;

    INITIAL_BUILDING_CONFIG.forEach((floor) => {
      floor.rooms.forEach((room) => {
        totalRoomsCount += 1;
        totalBedsCount += room.sharingCapacity;
      });
    });

    const activeResidents = residents.filter((r) => r.status === 'ACTIVE');
    const occupiedBedsCount = activeResidents.length;
    const emptyBedsCount = totalBedsCount - occupiedBedsCount;

    const paidResidentsCount = activeResidents.filter((r) => r.paymentStatus === 'PAID').length;
    const pendingResidentsCount = activeResidents.filter((r) => r.paymentStatus !== 'PAID').length;

    let totalCollectedAmount = 0;
    payments.forEach((p) => {
      totalCollectedAmount += p.amountPaid || 0;
    });

    let totalPendingAmt = 0;
    activeResidents.forEach((r) => {
      totalPendingAmt += r.amountPending || 0;
    });

    const occupancyPct = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;

    return {
      totalRooms: totalRoomsCount,
      totalBeds: totalBedsCount,
      occupiedBeds: occupiedBedsCount,
      emptyBeds: emptyBedsCount,
      paidResidents: paidResidentsCount,
      pendingResidents: pendingResidentsCount,
      totalCollected: totalCollectedAmount,
      totalPendingAmount: totalPendingAmt,
      occupancyPercentage: occupancyPct
    };
  }, [residents, payments]);

  // Actions
  const addResident = (residentData: Omit<Resident, 'id' | 'createdAt' | 'status'>) => {
    const newId = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const newResident: Resident = {
      ...residentData,
      id: newId,
      status: 'ACTIVE',
      createdAt: now
    };

    setResidents((prev) => [newResident, ...prev]);

    // Record initial payment entry if amountPaid > 0
    if (residentData.amountPaid > 0) {
      const newPayment: Payment = {
        id: `PAY-${Date.now()}`,
        residentId: newId,
        residentName: residentData.fullName,
        roomNumber: residentData.roomNumber,
        bedId: residentData.bedId,
        monthlyRent: residentData.monthlyRent,
        amountPaid: residentData.amountPaid,
        amountPending: residentData.amountPending,
        status: residentData.paymentStatus,
        paymentDate: residentData.joiningDate || now.split('T')[0],
        paymentMethod: (residentData.lastPaymentMethod as Payment['paymentMethod']) || 'UPI',
        notes: 'Initial joining payment'
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    // Add activity log
    const log: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: now,
      type: 'RESIDENT_ADDED',
      description: `Added ${residentData.fullName} to Room ${residentData.roomNumber} (Bed ${residentData.bedNumber})`,
      residentName: residentData.fullName,
      roomNumber: residentData.roomNumber
    };
    setActivities((prev) => [log, ...prev]);
  };

  const moveResident = (residentId: string, newFloorId: string, newRoomId: string, newBedId: string): boolean => {
    const res = residents.find((r) => r.id === residentId);
    if (!res) return false;

    // Find new room & bed details
    let targetRoom: Room | undefined;
    let targetFloor: Floor | undefined;
    let targetBed: Bed | undefined;

    for (const floor of INITIAL_BUILDING_CONFIG) {
      if (floor.id === newFloorId) {
        targetFloor = floor;
        for (const room of floor.rooms) {
          if (room.id === newRoomId) {
            targetRoom = room;
            targetBed = room.beds.find((b) => b.id === newBedId);
            break;
          }
        }
      }
    }

    if (!targetFloor || !targetRoom || !targetBed) return false;

    const oldRoomNumber = res.roomNumber;
    const oldBedNumber = res.bedNumber;

    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === residentId) {
          return {
            ...r,
            floorId: targetFloor!.id,
            roomId: targetRoom!.id,
            roomNumber: targetRoom!.roomNumber,
            bedId: targetBed!.id,
            bedNumber: targetBed!.bedNumber
          };
        }
        return r;
      })
    );

    // Add activity log
    const log: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'RESIDENT_MOVED',
      description: `Moved ${res.fullName} from Room ${oldRoomNumber} (Bed ${oldBedNumber}) to Room ${targetRoom.roomNumber} (Bed ${targetBed.bedNumber})`,
      residentName: res.fullName,
      roomNumber: targetRoom.roomNumber
    };
    setActivities((prev) => [log, ...prev]);

    return true;
  };

  const markResidentLeft = (residentId: string, leavingDate: string, reason?: string): boolean => {
    const res = residents.find((r) => r.id === residentId);
    if (!res) return false;

    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === residentId) {
          return {
            ...r,
            status: 'LEFT',
            leavingDate: leavingDate || new Date().toISOString().split('T')[0],
            leavingReason: reason || 'Relocated / End of stay'
          };
        }
        return r;
      })
    );

    const log: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'RESIDENT_LEFT',
      description: `Marked ${res.fullName} (Room ${res.roomNumber}) as Left`,
      residentName: res.fullName,
      roomNumber: res.roomNumber
    };
    setActivities((prev) => [log, ...prev]);

    return true;
  };

  const recordPayment = (payment: {
    residentId: string;
    amountPaid: number;
    paymentMethod: Payment['paymentMethod'];
    notes?: string;
  }): boolean => {
    const res = residents.find((r) => r.id === payment.residentId);
    if (!res) return false;

    const newAmountPaid = (res.amountPaid || 0) + payment.amountPaid;
    const newAmountPending = Math.max(0, res.monthlyRent - newAmountPaid);
    let newStatus: Payment['status'] = 'UNPAID';
    if (newAmountPending === 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Update resident state
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === payment.residentId) {
          return {
            ...r,
            amountPaid: newAmountPaid,
            amountPending: newAmountPending,
            paymentStatus: newStatus,
            lastPaymentDate: todayStr,
            lastPaymentMethod: payment.paymentMethod
          };
        }
        return r;
      })
    );

    // Create payment ledger record
    const paymentEntry: Payment = {
      id: `PAY-${Date.now()}`,
      residentId: res.id,
      residentName: res.fullName,
      roomNumber: res.roomNumber,
      bedId: res.bedId,
      monthlyRent: res.monthlyRent,
      amountPaid: payment.amountPaid,
      amountPending: newAmountPending,
      status: newStatus,
      paymentDate: todayStr,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes || 'Monthly rent payment'
    };

    setPayments((prev) => [paymentEntry, ...prev]);

    // Activity log
    const log: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'PAYMENT_RECORDED',
      description: `Received ₹${payment.amountPaid.toLocaleString()} payment from ${res.fullName} (Room ${res.roomNumber}) via ${payment.paymentMethod}`,
      residentName: res.fullName,
      roomNumber: res.roomNumber
    };
    setActivities((prev) => [log, ...prev]);

    return true;
  };

  const togglePaymentStatus = (residentId: string): boolean => {
    const res = residents.find((r) => r.id === residentId);
    if (!res) return false;

    const willBePaid = res.paymentStatus !== 'PAID';
    const newAmountPaid = willBePaid ? res.monthlyRent : 0;
    const newAmountPending = willBePaid ? 0 : res.monthlyRent;
    const newStatus = willBePaid ? ('PAID' as const) : ('UNPAID' as const);
    const todayStr = new Date().toISOString().split('T')[0];

    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === residentId) {
          return {
            ...r,
            paymentStatus: newStatus,
            amountPaid: newAmountPaid,
            amountPending: newAmountPending,
            lastPaymentDate: willBePaid ? todayStr : r.lastPaymentDate,
            lastPaymentMethod: willBePaid ? 'UPI' : r.lastPaymentMethod
          };
        }
        return r;
      })
    );

    if (willBePaid) {
      const paymentEntry: Payment = {
        id: `PAY-${Date.now()}`,
        residentId: res.id,
        residentName: res.fullName,
        roomNumber: res.roomNumber,
        bedId: res.bedId,
        monthlyRent: res.monthlyRent,
        amountPaid: res.monthlyRent,
        amountPending: 0,
        status: 'PAID',
        paymentDate: todayStr,
        paymentMethod: 'UPI',
        notes: 'Owner 1-Click Confirmed Payment'
      };

      setPayments((prev) => [paymentEntry, ...prev]);

      const log: ActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'PAYMENT_RECORDED',
        description: `Owner confirmed payment of ₹${res.monthlyRent.toLocaleString()} for ${res.fullName} (Room ${res.roomNumber})`,
        residentName: res.fullName,
        roomNumber: res.roomNumber
      };
      setActivities((prev) => [log, ...prev]);
    } else {
      const log: ActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'PAYMENT_RECORDED',
        description: `Owner marked ${res.fullName} (Room ${res.roomNumber}) payment status as Unpaid`,
        residentName: res.fullName,
        roomNumber: res.roomNumber
      };
      setActivities((prev) => [log, ...prev]);
    }

    return true;
  };

  const importResidents = (
    importData: Array<{
      fullName: string;
      phone: string;
      aadhaarNumber: string;
      roomNumber: string;
      bedNumber: number;
      monthlyRent: number;
      amountPaid: number;
      emergencyName?: string;
      emergencyPhone?: string;
    }>
  ) => {
    let successCount = 0;
    const errors: string[] = [];

    importData.forEach((item, index) => {
      const roomMatch = getRoomByNumber(item.roomNumber);
      if (!roomMatch) {
        errors.push(`Row ${index + 1}: Room ${item.roomNumber} does not exist.`);
        return;
      }

      const bed = roomMatch.room.beds.find((b) => b.bedNumber === Number(item.bedNumber));
      if (!bed) {
        errors.push(`Row ${index + 1}: Bed ${item.bedNumber} in Room ${item.roomNumber} does not exist.`);
        return;
      }

      // Check if bed is already occupied in current local list
      const existingRes = residents.find((r) => r.status === 'ACTIVE' && r.bedId === bed.id);
      if (existingRes) {
        errors.push(`Row ${index + 1}: Bed ${item.bedNumber} in Room ${item.roomNumber} is already occupied by ${existingRes.fullName}.`);
        return;
      }

      const rent = Number(item.monthlyRent) || 7500;
      const paid = Number(item.amountPaid) || 0;
      const pending = Math.max(0, rent - paid);
      let payStatus: Payment['status'] = 'UNPAID';
      if (pending === 0) payStatus = 'PAID';
      else if (paid > 0) payStatus = 'PARTIALLY_PAID';

      addResident({
        fullName: item.fullName,
        phone: item.phone,
        aadhaarNumber: item.aadhaarNumber || '000000000000',
        address: 'Imported Record',
        floorId: roomMatch.floor.id,
        roomId: roomMatch.room.id,
        roomNumber: roomMatch.room.roomNumber,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        joiningDate: new Date().toISOString().split('T')[0],
        monthlyRent: rent,
        amountPaid: paid,
        amountPending: pending,
        paymentStatus: payStatus,
        emergencyName: item.emergencyName || 'N/A',
        emergencyPhone: item.emergencyPhone || 'N/A',
        emergencyRelationship: 'Contact'
      });

      successCount++;
    });

    return { successCount, errors };
  };

  const resetSystem = () => {
    localStorage.removeItem(STORAGE_KEY_RESIDENTS);
    localStorage.removeItem(STORAGE_KEY_PAYMENTS);
    localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
    setResidents([]);
    setPayments([]);
    setActivities([
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SYSTEM_RESET',
        description: 'System reset to initial state. All 240 beds are now empty.'
      }
    ]);
  };

  // Helper functions
  const getRoomByNumber = (roomNumber: string) => {
    for (const floor of floors) {
      const room = floor.rooms.find((r) => r.roomNumber.toLowerCase() === roomNumber.toLowerCase());
      if (room) {
        return { room, floor };
      }
    }
    return null;
  };

  const getBedById = (bedId: string): Bed | null => {
    for (const floor of floors) {
      for (const room of floor.rooms) {
        const bed = room.beds.find((b) => b.id === bedId);
        if (bed) return bed;
      }
    }
    return null;
  };

  const getAllEmptyBeds = (): Bed[] => {
    const emptyBeds: Bed[] = [];
    floors.forEach((floor) => {
      floor.rooms.forEach((room) => {
        room.beds.forEach((bed) => {
          if (bed.status === 'EMPTY') {
            emptyBeds.push(bed);
          }
        });
      });
    });
    return emptyBeds;
  };

  const getResidentById = (residentId: string): Resident | undefined => {
    return residents.find((r) => r.id === residentId);
  };

  return (
    <PGContext.Provider
      value={{
        floors,
        residents,
        payments,
        activities,
        theme,
        setTheme,
        stats,
        addResident,
        moveResident,
        markResidentLeft,
        recordPayment,
        importResidents,
        togglePaymentStatus,
        resetSystem,
        getRoomByNumber,
        getBedById,
        getAllEmptyBeds,
        getResidentById
      }}
    >
      {children}
    </PGContext.Provider>
  );
};

export const usePG = () => {
  const context = useContext(PGContext);
  if (!context) {
    throw new Error('usePG must be used within a PGProvider');
  }
  return context;
};
