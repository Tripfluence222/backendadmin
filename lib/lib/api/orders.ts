import { CreateOrderInput, UpdateOrderInput, PaymentStatus, OrderStatus } from "@/lib/validation/orders";

export interface Order {
  id: string;
  orderId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  listingId: string;
  listingTitle: string;
  listingType: string;
  date: string;
  time?: string;
  guests: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  specialRequests?: string;
  waivers?: Array<{
    type: string;
    signed: boolean;
    signedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "1",
    orderId: "ORD-2024-001",
    guestName: "Sarah Johnson",
    guestEmail: "sarah.johnson@email.com",
    guestPhone: "+1-555-0123",
    listingId: "1",
    listingTitle: "Sunset Yoga Retreat",
    listingType: "retreat",
    date: "2024-02-15",
    time: "18:00",
    guests: 2,
    totalAmount: 598,
    paymentStatus: "paid",
    status: "confirmed",
    specialRequests: "Vegetarian meals please",
    waivers: [
      { type: "Liability", signed: true, signedAt: "2024-01-20T10:00:00Z" },
      { type: "Photo Release", signed: true, signedAt: "2024-01-20T10:05:00Z" }
    ],
    createdAt: "2024-01-20T09:30:00Z",
    updatedAt: "2024-01-20T10:05:00Z",
  },
  {
    id: "2",
    orderId: "ORD-2024-002",
    guestName: "Michael Chen",
    guestEmail: "m.chen@email.com",
    guestPhone: "+1-555-0456",
    listingId: "2",
    listingTitle: "Farm-to-Table Cooking Class",
    listingType: "activity",
    date: "2024-02-20",
    time: "14:00",
    guests: 1,
    totalAmount: 150,
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: "2024-01-22T14:15:00Z",
    updatedAt: "2024-01-22T14:15:00Z",
  },
  {
    id: "3",
    orderId: "ORD-2024-003",
    guestName: "Emily Rodriguez",
    guestEmail: "emily.r@email.com",
    listingId: "3",
    listingTitle: "Luxury Beach Villa",
    listingType: "property",
    date: "2024-02-25",
    guests: 4,
    totalAmount: 3200,
    paymentStatus: "pending",
    status: "pending",
    specialRequests: "Late checkout requested",
    createdAt: "2024-01-25T11:20:00Z",
    updatedAt: "2024-01-25T11:20:00Z",
  },
  {
    id: "4",
    orderId: "ORD-2024-004",
    guestName: "David Kim",
    guestEmail: "david.kim@email.com",
    guestPhone: "+1-555-0789",
    listingId: "5",
    listingTitle: "Fine Dining Restaurant",
    listingType: "restaurant",
    date: "2024-02-18",
    time: "19:30",
    guests: 2,
    totalAmount: 240,
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    orderId: "ORD-2024-005",
    guestName: "Lisa Thompson",
    guestEmail: "lisa.t@email.com",
    listingId: "1",
    listingTitle: "Sunset Yoga Retreat",
    listingType: "retreat",
    date: "2024-02-15",
    time: "18:00",
    guests: 1,
    totalAmount: 299,
    paymentStatus: "failed",
    status: "cancelled",
    createdAt: "2024-01-19T13:10:00Z",
    updatedAt: "2024-01-19T13:15:00Z",
  },
];

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockOrders];
  },

  async getById(id: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(order => order.id === id) || null;
  },

  async create(data: CreateOrderInput): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newOrder: Order = {
      id: (mockOrders.length + 1).toString(),
      orderId: `ORD-2024-${String(mockOrders.length + 1).padStart(3, '0')}`,
      listingTitle: "Unknown Listing", // Would be fetched from listing
      listingType: "unknown",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  async update(id: string, data: UpdateOrderInput): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockOrders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    mockOrders[index] = {
      ...mockOrders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[index];
  },

  async refund(id: string, amount: number, reason: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockOrders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    mockOrders[index] = {
      ...mockOrders[index],
      paymentStatus: "refunded",
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[index];
  },

  async cancel(id: string, reason?: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockOrders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    mockOrders[index] = {
      ...mockOrders[index],
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[index];
  },

  async reschedule(id: string, newDate: string, newTime?: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockOrders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    mockOrders[index] = {
      ...mockOrders[index],
      date: newDate,
      time: newTime,
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[index];
  },
};
