import { Floor, Bed, Room } from '../types/pg';

// Helper function to generate bed list for a room
function generateBeds(roomId: string, roomNumber: string, floorId: string, floorName: string, capacity: number): Bed[] {
  const beds: Bed[] = [];
  for (let i = 1; i <= capacity; i++) {
    beds.push({
      id: `${roomNumber}-B${i}`,
      bedNumber: i,
      roomId,
      roomNumber,
      floorId,
      floorName,
      status: 'EMPTY'
    });
  }
  return beds;
}

export const INITIAL_BUILDING_CONFIG: Floor[] = [
  {
    id: 'ground',
    floorNumber: 0,
    name: 'Ground Floor',
    subtitle: 'Office & Rooms',
    totalBeds: 4,
    facilities: [
      {
        id: 'off-ground',
        name: 'Office',
        floorId: 'ground',
        floorName: 'Ground Floor',
        areaType: 'OFFICE',
        description: 'Administrative office for PG management & reception.'
      }
    ],
    rooms: [
      {
        id: 'G01',
        roomNumber: 'G01',
        floorId: 'ground',
        floorName: 'Ground Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('G01', 'G01', 'ground', 'Ground Floor', 4)
      }
    ]
  },
  {
    id: 'floor1',
    floorNumber: 1,
    name: '1st Floor',
    subtitle: 'Residential',
    totalBeds: 38,
    rooms: [
      // 101 to 106 -> 3 sharing
      ...[101, 102, 103, 104, 105, 106].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor1',
        floorName: '1st Floor',
        sharingCapacity: 3 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor1', '1st Floor', 3)
      })),
      // 107 to 111 -> 4 sharing
      ...[107, 108, 109, 110, 111].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor1',
        floorName: '1st Floor',
        sharingCapacity: 4 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor1', '1st Floor', 4)
      }))
    ]
  },
  {
    id: 'floor2',
    floorNumber: 2,
    name: '2nd Floor',
    subtitle: 'Residential',
    totalBeds: 38,
    rooms: [
      // 201 to 206 -> 3 sharing
      ...[201, 202, 203, 204, 205, 206].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor2',
        floorName: '2nd Floor',
        sharingCapacity: 3 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor2', '2nd Floor', 3)
      })),
      // 207 to 211 -> 4 sharing
      ...[207, 208, 209, 210, 211].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor2',
        floorName: '2nd Floor',
        sharingCapacity: 4 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor2', '2nd Floor', 4)
      }))
    ]
  },
  {
    id: 'floor3',
    floorNumber: 3,
    name: '3rd Floor',
    subtitle: 'Residential',
    totalBeds: 40,
    rooms: [
      // 301 -> 4 sharing
      {
        id: '301',
        roomNumber: '301',
        floorId: 'floor3',
        floorName: '3rd Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('301', '301', 'floor3', '3rd Floor', 4)
      },
      // 302, 303, 304 -> 3 sharing
      ...[302, 303, 304].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor3',
        floorName: '3rd Floor',
        sharingCapacity: 3 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor3', '3rd Floor', 3)
      })),
      // 305 -> 4 sharing
      {
        id: '305',
        roomNumber: '305',
        floorId: 'floor3',
        floorName: '3rd Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('305', '305', 'floor3', '3rd Floor', 4)
      },
      // 306 -> 3 sharing
      {
        id: '306',
        roomNumber: '306',
        floorId: 'floor3',
        floorName: '3rd Floor',
        sharingCapacity: 3,
        areaType: 'BEDROOM',
        beds: generateBeds('306', '306', 'floor3', '3rd Floor', 3)
      },
      // 307 to 311 -> 4 sharing
      ...[307, 308, 309, 310, 311].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor3',
        floorName: '3rd Floor',
        sharingCapacity: 4 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor3', '3rd Floor', 4)
      }))
    ]
  },
  {
    id: 'floor4',
    floorNumber: 4,
    name: '4th Floor',
    subtitle: 'Residential',
    totalBeds: 42,
    rooms: [
      // 401, 402 -> 3 sharing
      ...[401, 402].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor4',
        floorName: '4th Floor',
        sharingCapacity: 3 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor4', '4th Floor', 3)
      })),
      // 403 -> 4 sharing
      {
        id: '403',
        roomNumber: '403',
        floorId: 'floor4',
        floorName: '4th Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('403', '403', 'floor4', '4th Floor', 4)
      },
      // 404 -> 3 sharing
      {
        id: '404',
        roomNumber: '404',
        floorId: 'floor4',
        floorName: '4th Floor',
        sharingCapacity: 3,
        areaType: 'BEDROOM',
        beds: generateBeds('404', '404', 'floor4', '4th Floor', 3)
      },
      // 405 to 409 -> 4 sharing
      ...[405, 406, 407, 408, 409].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor4',
        floorName: '4th Floor',
        sharingCapacity: 4 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor4', '4th Floor', 4)
      })),
      // 410 -> 5 sharing
      {
        id: '410',
        roomNumber: '410',
        floorId: 'floor4',
        floorName: '4th Floor',
        sharingCapacity: 5,
        areaType: 'BEDROOM',
        beds: generateBeds('410', '410', 'floor4', '4th Floor', 5)
      },
      // 411 -> 4 sharing
      {
        id: '411',
        roomNumber: '411',
        floorId: 'floor4',
        floorName: '4th Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('411', '411', 'floor4', '4th Floor', 4)
      }
    ]
  },
  {
    id: 'floor5',
    floorNumber: 5,
    name: '5th Floor',
    subtitle: 'Residential',
    totalBeds: 39,
    rooms: [
      // 501 to 506 -> 3 sharing
      ...[501, 502, 503, 504, 505, 506].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor5',
        floorName: '5th Floor',
        sharingCapacity: 3 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor5', '5th Floor', 3)
      })),
      // 507 to 509 -> 4 sharing
      ...[507, 508, 509].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor5',
        floorName: '5th Floor',
        sharingCapacity: 4 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor5', '5th Floor', 4)
      })),
      // 510 -> 5 sharing
      {
        id: '510',
        roomNumber: '510',
        floorId: 'floor5',
        floorName: '5th Floor',
        sharingCapacity: 5,
        areaType: 'BEDROOM',
        beds: generateBeds('510', '510', 'floor5', '5th Floor', 5)
      },
      // 511 -> 4 sharing
      {
        id: '511',
        roomNumber: '511',
        floorId: 'floor5',
        floorName: '5th Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('511', '511', 'floor5', '5th Floor', 4)
      }
    ]
  },
  {
    id: 'floor6',
    floorNumber: 6,
    name: '6th Floor',
    subtitle: 'Residential',
    totalBeds: 39,
    rooms: [
      // 601 to 606 -> 3 sharing
      ...[601, 602, 603, 604, 605, 606].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor6',
        floorName: '6th Floor',
        sharingCapacity: 3 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor6', '6th Floor', 3)
      })),
      // 607 to 609 -> 4 sharing
      ...[607, 608, 609].map((num) => ({
        id: `${num}`,
        roomNumber: `${num}`,
        floorId: 'floor6',
        floorName: '6th Floor',
        sharingCapacity: 4 as const,
        areaType: 'BEDROOM' as const,
        beds: generateBeds(`${num}`, `${num}`, 'floor6', '6th Floor', 4)
      })),
      // 610 -> 5 sharing
      {
        id: '610',
        roomNumber: '610',
        floorId: 'floor6',
        floorName: '6th Floor',
        sharingCapacity: 5,
        areaType: 'BEDROOM',
        beds: generateBeds('610', '610', 'floor6', '6th Floor', 5)
      },
      // 611 -> 4 sharing
      {
        id: '611',
        roomNumber: '611',
        floorId: 'floor6',
        floorName: '6th Floor',
        sharingCapacity: 4,
        areaType: 'BEDROOM',
        beds: generateBeds('611', '611', 'floor6', '6th Floor', 4)
      }
    ]
  },
  {
    id: 'floor7',
    floorNumber: 7,
    name: '7th Floor',
    subtitle: 'Dining Area',
    totalBeds: 0,
    facilities: [
      {
        id: 'din-7th',
        name: 'Dining Area',
        floorId: 'floor7',
        floorName: '7th Floor',
        areaType: 'DINING',
        description: 'Central dining hall and mess service for residents.'
      }
    ],
    rooms: []
  }
];
