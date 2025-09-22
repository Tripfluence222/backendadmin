import { ListingCreateInput, ListingUpdateInput, ListingType, ListingStatus } from "@/lib/validation/listings";

export interface Listing {
  id: string;
  businessId: string;
  title: string;
  slug: string;
  type: ListingType;
  status: ListingStatus;
  description?: string;
  category?: string;
  locationCity?: string;
  locationCountry?: string;
  photos?: string[]; // JSON array of URLs
  currency?: string;
  priceFrom?: number; // in cents
  capacity?: number;
  details?: any; // JSON object with type-specific data
  seoMeta?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockListings: Listing[] = [
  {
    id: "1",
    businessId: "business-1",
    title: "Sunset Yoga Retreat",
    slug: "sunset-yoga-retreat",
    type: "RETREAT",
    status: "PUBLISHED",
    category: "Wellness",
    locationCity: "Bali",
    locationCountry: "Indonesia",
    capacity: 20,
    priceFrom: 29900, // $299.00 in cents
    currency: "USD",
    seoMeta: "Transform your mind and body with our sunset yoga retreat in beautiful Bali",
    description: "Join us for a transformative 3-day yoga retreat overlooking the stunning Balinese sunset. Perfect for beginners and experienced practitioners alike.",
    photos: ["/images/yoga-retreat-1.jpg", "/images/yoga-retreat-2.jpg"],
    details: {
      kind: "RETREAT",
      startDate: "2024-02-15T09:00:00Z",
      endDate: "2024-02-17T17:00:00Z",
      packagePrice: 29900,
      includes: ["Accommodation", "All meals", "Yoga sessions", "Meditation", "Nature walks"]
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    businessId: "business-1",
    title: "Farm-to-Table Cooking Class",
    slug: "farm-to-table-cooking",
    type: "ACTIVITY",
    status: "PUBLISHED",
    category: "Culinary",
    locationCity: "Napa Valley",
    locationCountry: "USA",
    capacity: 12,
    priceFrom: 15000, // $150.00 in cents
    currency: "USD",
    seoMeta: "Learn to cook with fresh, local ingredients in our hands-on cooking class",
    description: "Experience the joy of cooking with the freshest ingredients from local farms. Learn traditional techniques and modern twists.",
    photos: ["/images/cooking-class-1.jpg"],
    details: {
      kind: "ACTIVITY",
      schedule: [{ date: "2024-02-20T10:00:00Z", durationMin: 180 }],
      pricePerPerson: 15000,
      skillLevel: "BEGINNER",
      equipmentProvided: true,
      meetPoint: "Napa Valley Culinary Institute"
    },
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    businessId: "business-1",
    title: "Luxury Beach Villa",
    slug: "luxury-beach-villa",
    type: "PROPERTY",
    status: "PUBLISHED",
    category: "Accommodation",
    locationCity: "Malibu",
    locationCountry: "USA",
    capacity: 8,
    priceFrom: 80000, // $800.00 in cents
    currency: "USD",
    seoMeta: "Stunning beachfront villa with panoramic ocean views and luxury amenities",
    description: "Escape to our exclusive beachfront villa featuring panoramic ocean views, private beach access, and world-class amenities.",
    photos: ["/images/villa-1.jpg", "/images/villa-2.jpg", "/images/villa-3.jpg"],
    details: {
      kind: "PROPERTY",
      rentalType: "NIGHTLY",
      rate: 80000,
      cleaningFee: 5000,
      securityDeposit: 20000,
      bedrooms: 4,
      baths: 3,
      amenities: ["WiFi", "Kitchen", "Parking", "Pool", "Beach Access"],
      address: "123 Ocean Drive, Malibu, CA 90265"
    },
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-22T13:20:00Z",
  },
  {
    id: "4",
    businessId: "business-1",
    title: "Wine Tasting Experience",
    slug: "wine-tasting-experience",
    type: "EVENT",
    status: "DRAFT",
    category: "Entertainment",
    locationCity: "Sonoma",
    locationCountry: "USA",
    capacity: 15,
    priceFrom: 7500, // $75.00 in cents
    currency: "USD",
    seoMeta: "Discover exceptional wines with expert sommeliers in beautiful Sonoma",
    description: "Join our expert sommeliers for an intimate wine tasting experience featuring rare vintages and local favorites.",
    photos: ["/images/wine-tasting-1.jpg"],
    details: {
      kind: "EVENT",
      start: "2024-03-01T18:00:00Z",
      end: "2024-03-01T21:00:00Z",
      venue: {
        name: "Sonoma Wine Cellar",
        address: "456 Vineyard Road, Sonoma, CA 95476"
      },
      tickets: [
        { name: "General Admission", price: 7500, qty: 15 }
      ]
    },
    createdAt: "2024-01-25T15:00:00Z",
    updatedAt: "2024-01-25T15:00:00Z",
  },
  {
    id: "5",
    businessId: "business-1",
    title: "Fine Dining Restaurant",
    slug: "fine-dining-restaurant",
    type: "RESTAURANT",
    status: "PUBLISHED",
    category: "Dining",
    locationCity: "San Francisco",
    locationCountry: "USA",
    capacity: 60,
    priceFrom: 12000, // $120.00 in cents
    currency: "USD",
    seoMeta: "Award-winning fine dining with innovative cuisine and exceptional service",
    description: "Experience culinary excellence at our Michelin-starred restaurant featuring innovative cuisine and exceptional service.",
    photos: ["/images/restaurant-1.jpg", "/images/restaurant-2.jpg"],
    details: {
      kind: "RESTAURANT",
      menuUrl: "https://example.com/menu",
      reservationUrl: "https://opentable.com/restaurant",
      cuisines: ["French", "Contemporary", "Fine Dining"]
    },
    createdAt: "2024-01-12T12:00:00Z",
    updatedAt: "2024-01-19T10:15:00Z",
  },
];

export const listingsApi = {
  async getAll(): Promise<Listing[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockListings];
  },

  async getById(id: string): Promise<Listing | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockListings.find(listing => listing.id === id) || null;
  },

  async create(data: ListingCreateInput): Promise<Listing> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newListing: Listing = {
      id: (mockListings.length + 1).toString(),
      businessId: "business-1",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockListings.push(newListing);
    return newListing;
  },

  async update(id: string, data: ListingUpdateInput): Promise<Listing> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockListings.findIndex(listing => listing.id === id);
    if (index === -1) {
      throw new Error("Listing not found");
    }
    mockListings[index] = {
      ...mockListings[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockListings[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockListings.findIndex(listing => listing.id === id);
    if (index === -1) {
      throw new Error("Listing not found");
    }
    mockListings.splice(index, 1);
  },

  async archive(id: string): Promise<Listing> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockListings.findIndex(listing => listing.id === id);
    if (index === -1) {
      throw new Error("Listing not found");
    }
    mockListings[index] = {
      ...mockListings[index],
      status: "ARCHIVED",
      updatedAt: new Date().toISOString(),
    };
    return mockListings[index];
  },
};
