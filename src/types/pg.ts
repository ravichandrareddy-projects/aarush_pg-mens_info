export type BedStatus = 'EMPTY' | 'OCCUPIED' | 'MAINTENANCE';

export type PaymentStatus = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';

export type RoomSharingType = 3 | 4 | 5;

export type AreaType = 'BEDROOM' | 'OFFICE' | 'DINING';

export interface Bed {
  id: string; // e.g. "G01-B1", "101-B1"
  bedNumber: number; // 1, 2, 3, 4, 5
  roomId: string;
  roomNumber: string;
  floorId: string;
  floorName: string;
  status: BedStatus;
  residentId?: string;
  residentName?: string;
}

export interface Room {
  id: string; // e.g. "G01", "101"
  roomNumber: string;
  floorId: string;
  floorName: string;
  sharingCapacity: RoomSharingType;
  areaType: 'BEDROOM';
  beds: Bed[];
}

export interface FacilityArea {
  id: string;
  name: string;
  floorId: string;
  floorName: string;
  areaType: 'OFFICE' | 'DINING';
  description: string;
}

export interface Floor {
  id: string; // e.g. "ground", "floor1", ..., "floor7"
  floorNumber: number; // 0 for Ground, 1 for 1st, ..., 7 for 7th
  name: string; // "Ground Floor", "1st Floor", etc.
  subtitle: string; // "Office & Rooms", "Residential", "Dining Area"
  rooms: Room[];
  facilities?: FacilityArea[];
  totalBeds: number;
}

export interface Resident {
  id: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  photoUrl?: string;
  
  // Identity
  aadhaarNumber: string; // 12 digits, displayed masked e.g. "XXXX-XXXX-1234"
  aadhaarDocumentUrl?: string;
  
  // Address
  address: string;
  
  // PG Allocation
  floorId: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedNumber: number;
  joiningDate: string;
  leavingDate?: string;
  monthlyRent: number;
  
  // Status
  status: 'ACTIVE' | 'LEFT';
  leavingReason?: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  
  // Payment info summary
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountPending: number;
  lastPaymentDate?: string;
  lastPaymentMethod?: string;
  
  createdAt: string;
}

export interface Payment {
  id: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  bedId: string;
  monthlyRent: number;
  amountPaid: number;
  amountPending: number;
  status: PaymentStatus;
  paymentDate: string;
  paymentMethod: 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'RESIDENT_ADDED' | 'RESIDENT_MOVED' | 'RESIDENT_LEFT' | 'PAYMENT_RECORDED' | 'SYSTEM_RESET';
  description: string;
  residentName?: string;
  roomNumber?: string;
}

export interface DashboardStats {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  emptyBeds: number;
  paidResidents: number;
  pendingResidents: number;
  totalCollected: number;
  totalPendingAmount: number;
  occupancyPercentage: number;
}
