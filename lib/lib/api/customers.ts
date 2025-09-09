import { CreateCustomerInput, UpdateCustomerInput, AddCustomerNoteInput, UpdateCustomerPreferencesInput, CustomerStatus } from "@/lib/validation/customers";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences: {
    newsletter: boolean;
    sms: boolean;
    marketing: boolean;
  };
  tags: string[];
  notes: CustomerNote[];
  status: CustomerStatus;
  loyaltyPoints: number;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNote {
  id: string;
  note: string;
  type: "general" | "booking" | "payment" | "support";
  isPrivate: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CustomerBooking {
  id: string;
  orderId: string;
  listingTitle: string;
  date: string;
  amount: number;
  status: string;
  createdAt: string;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    dateOfBirth: "1985-03-15",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
    },
    preferences: {
      newsletter: true,
      sms: false,
      marketing: true,
    },
    tags: ["VIP", "Yoga Enthusiast"],
    notes: [
      {
        id: "1",
        note: "Prefers morning yoga sessions",
        type: "general",
        isPrivate: false,
        createdAt: "2024-01-20T10:00:00Z",
        createdBy: "Admin",
      },
      {
        id: "2",
        note: "Vegetarian meals only",
        type: "booking",
        isPrivate: false,
        createdAt: "2024-01-20T10:05:00Z",
        createdBy: "Admin",
      },
    ],
    status: "vip",
    loyaltyPoints: 1250,
    totalBookings: 8,
    totalSpent: 2392,
    lastBookingDate: "2024-01-20T09:30:00Z",
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2024-01-20T10:05:00Z",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "+1-555-0456",
    preferences: {
      newsletter: true,
      sms: true,
      marketing: false,
    },
    tags: ["Foodie", "Regular"],
    notes: [
      {
        id: "3",
        note: "Excellent cooking skills, very engaged in classes",
        type: "general",
        isPrivate: false,
        createdAt: "2024-01-22T14:15:00Z",
        createdBy: "Chef Maria",
      },
    ],
    status: "active",
    loyaltyPoints: 450,
    totalBookings: 3,
    totalSpent: 450,
    lastBookingDate: "2024-01-22T14:15:00Z",
    createdAt: "2023-11-10T14:00:00Z",
    updatedAt: "2024-01-22T14:15:00Z",
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.r@email.com",
    preferences: {
      newsletter: false,
      sms: false,
      marketing: false,
    },
    tags: ["New Customer"],
    notes: [],
    status: "active",
    loyaltyPoints: 100,
    totalBookings: 1,
    totalSpent: 3200,
    lastBookingDate: "2024-01-25T11:20:00Z",
    createdAt: "2024-01-25T11:20:00Z",
    updatedAt: "2024-01-25T11:20:00Z",
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@email.com",
    phone: "+1-555-0789",
    preferences: {
      newsletter: true,
      sms: true,
      marketing: true,
    },
    tags: ["Fine Dining", "Regular"],
    notes: [
      {
        id: "4",
        note: "Prefers window seating",
        type: "booking",
        isPrivate: false,
        createdAt: "2024-01-18T16:45:00Z",
        createdBy: "Host",
      },
    ],
    status: "active",
    loyaltyPoints: 320,
    totalBookings: 2,
    totalSpent: 240,
    lastBookingDate: "2024-01-18T16:45:00Z",
    createdAt: "2023-12-05T16:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Thompson",
    email: "lisa.t@email.com",
    preferences: {
      newsletter: false,
      sms: false,
      marketing: false,
    },
    tags: ["Inactive"],
    notes: [
      {
        id: "5",
        note: "Payment failed multiple times",
        type: "payment",
        isPrivate: true,
        createdAt: "2024-01-19T13:15:00Z",
        createdBy: "Admin",
      },
    ],
    status: "inactive",
    loyaltyPoints: 0,
    totalBookings: 1,
    totalSpent: 0,
    createdAt: "2024-01-19T13:10:00Z",
    updatedAt: "2024-01-19T13:15:00Z",
  },
];

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockCustomers];
  },

  async getById(id: string): Promise<Customer | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCustomers.find(customer => customer.id === id) || null;
  },

  async create(data: CreateCustomerInput): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCustomer: Customer = {
      id: (mockCustomers.length + 1).toString(),
      loyaltyPoints: 0,
      totalBookings: 0,
      totalSpent: 0,
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        newsletter: false,
        sms: false,
        marketing: false,
        ...data.preferences,
      },
      tags: data.tags || [],
      ...data,
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error("Customer not found");
    }
    mockCustomers[index] = {
      ...mockCustomers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockCustomers[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error("Customer not found");
    }
    mockCustomers.splice(index, 1);
  },

  async addNote(id: string, data: AddCustomerNoteInput): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error("Customer not found");
    }
    
    const newNote: CustomerNote = {
      id: (mockCustomers[index].notes.length + 1).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: "Admin", // Would be current user
    };
    
    mockCustomers[index].notes.push(newNote);
    mockCustomers[index].updatedAt = new Date().toISOString();
    return mockCustomers[index];
  },

  async updatePreferences(id: string, data: UpdateCustomerPreferencesInput): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error("Customer not found");
    }
    
    mockCustomers[index].preferences = {
      ...mockCustomers[index].preferences,
      ...data,
    };
    mockCustomers[index].updatedAt = new Date().toISOString();
    return mockCustomers[index];
  },

  async getBookingHistory(id: string): Promise<CustomerBooking[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Mock booking history - in real app, this would come from orders API
    return [
      {
        id: "1",
        orderId: "ORD-2024-001",
        listingTitle: "Sunset Yoga Retreat",
        date: "2024-02-15",
        amount: 598,
        status: "confirmed",
        createdAt: "2024-01-20T09:30:00Z",
      },
      {
        id: "2",
        orderId: "ORD-2023-045",
        listingTitle: "Morning Yoga Session",
        date: "2023-12-10",
        amount: 299,
        status: "completed",
        createdAt: "2023-12-05T10:00:00Z",
      },
    ];
  },

  async exportSegment(filters: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock CSV export
    return "customer_id,first_name,last_name,email,phone,total_bookings,total_spent\n1,Sarah,Johnson,sarah.johnson@email.com,+1-555-0123,8,2392\n2,Michael,Chen,m.chen@email.com,+1-555-0456,3,450";
  },
};
