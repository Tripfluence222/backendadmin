import { CreateSlotInput, UpdateSlotInput, BulkCreateSlotsInput, SlotStatus } from "@/lib/validation/availability";

export interface AvailabilitySlot {
  id: string;
  listingId: string;
  listingTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  location?: string;
  room?: string;
  table?: string;
  isBlackout: boolean;
  price?: number;
  notes?: string;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockSlots: AvailabilitySlot[] = [
  {
    id: "1",
    listingId: "1",
    listingTitle: "Sunset Yoga Retreat",
    date: "2024-02-15",
    startTime: "18:00",
    endTime: "20:00",
    capacity: 20,
    booked: 12,
    available: 8,
    location: "Beach Pavilion",
    isBlackout: false,
    price: 299,
    status: "available",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    listingId: "2",
    listingTitle: "Farm-to-Table Cooking Class",
    date: "2024-02-20",
    startTime: "14:00",
    endTime: "17:00",
    capacity: 12,
    booked: 8,
    available: 4,
    location: "Kitchen Studio",
    room: "Main Kitchen",
    isBlackout: false,
    price: 150,
    status: "available",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    listingId: "5",
    listingTitle: "Fine Dining Restaurant",
    date: "2024-02-18",
    startTime: "19:30",
    endTime: "22:00",
    capacity: 60,
    booked: 45,
    available: 15,
    location: "Main Dining Room",
    table: "Tables 1-20",
    isBlackout: false,
    price: 120,
    status: "available",
    createdAt: "2024-01-12T12:00:00Z",
    updatedAt: "2024-01-19T10:15:00Z",
  },
  {
    id: "4",
    listingId: "3",
    listingTitle: "Luxury Beach Villa",
    date: "2024-02-25",
    startTime: "15:00",
    endTime: "11:00",
    capacity: 8,
    booked: 6,
    available: 2,
    location: "Beach Villa",
    room: "Villa A",
    isBlackout: false,
    price: 800,
    status: "available",
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-22T13:20:00Z",
  },
  {
    id: "5",
    listingId: "1",
    listingTitle: "Sunset Yoga Retreat",
    date: "2024-02-22",
    startTime: "18:00",
    endTime: "20:00",
    capacity: 20,
    booked: 0,
    available: 20,
    location: "Beach Pavilion",
    isBlackout: true,
    notes: "Maintenance day",
    status: "maintenance",
    createdAt: "2024-01-25T15:00:00Z",
    updatedAt: "2024-01-25T15:00:00Z",
  },
];

export const availabilityApi = {
  async getAll(): Promise<AvailabilitySlot[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockSlots];
  },

  async getByListing(listingId: string): Promise<AvailabilitySlot[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSlots.filter(slot => slot.listingId === listingId);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<AvailabilitySlot[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= start && slotDate <= end;
    });
  },

  async getById(id: string): Promise<AvailabilitySlot | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSlots.find(slot => slot.id === id) || null;
  },

  async create(data: CreateSlotInput): Promise<AvailabilitySlot> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newSlot: AvailabilitySlot = {
      id: (mockSlots.length + 1).toString(),
      listingTitle: "Unknown Listing", // Would be fetched from listing
      booked: 0,
      available: data.capacity,
      status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
      date: data.date.toISOString().split('T')[0],
    };
    mockSlots.push(newSlot);
    return newSlot;
  },

  async update(id: string, data: UpdateSlotInput): Promise<AvailabilitySlot> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockSlots.findIndex(slot => slot.id === id);
    if (index === -1) {
      throw new Error("Slot not found");
    }
    mockSlots[index] = {
      ...mockSlots[index],
      ...data,
      date: data.date ? data.date.toISOString().split('T')[0] : mockSlots[index].date,
      updatedAt: new Date().toISOString(),
    };
    return mockSlots[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockSlots.findIndex(slot => slot.id === id);
    if (index === -1) {
      throw new Error("Slot not found");
    }
    mockSlots.splice(index, 1);
  },

  async bulkCreate(data: BulkCreateSlotsInput): Promise<AvailabilitySlot[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const slots: AvailabilitySlot[] = [];
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      if (data.daysOfWeek.includes(date.getDay())) {
        const slot: AvailabilitySlot = {
          id: (mockSlots.length + slots.length + 1).toString(),
          listingId: data.listingId,
          listingTitle: "Unknown Listing",
          date: date.toISOString().split('T')[0],
          startTime: data.startTime,
          endTime: data.endTime,
          capacity: data.capacity,
          booked: 0,
          available: data.capacity,
          location: data.location,
          room: data.room,
          table: data.table,
          isBlackout: data.isBlackout,
          price: data.price,
          status: "available",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        slots.push(slot);
      }
    }
    
    mockSlots.push(...slots);
    return slots;
  },

  async toggleBlackout(id: string): Promise<AvailabilitySlot> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockSlots.findIndex(slot => slot.id === id);
    if (index === -1) {
      throw new Error("Slot not found");
    }
    mockSlots[index] = {
      ...mockSlots[index],
      isBlackout: !mockSlots[index].isBlackout,
      status: !mockSlots[index].isBlackout ? "blocked" : "available",
      updatedAt: new Date().toISOString(),
    };
    return mockSlots[index];
  },
};
