import { CreateListingInput, UpdateListingInput, ListingType, ListingStatus } from "@/lib/validation/listings";

export interface Listing {
  id: string;
  title: string;
  type: ListingType;
  status: ListingStatus;
  category: string;
  location: string;
  nextDate?: string;
  occupancy?: number;
  capacity?: number;
  price?: number;
  slug: string;
  metaDescription?: string;
  description: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockListings: Listing[] = [
  {
    id: "1",
    title: "Sunset Yoga Retreat",
    type: "RETREAT",
    status: "PUBLISHED",
    category: "Wellness",
    location: "Bali, Indonesia",
    nextDate: "2024-02-15",
    occupancy: 12,
    capacity: 20,
    price: 299,
    slug: "sunset-yoga-retreat",
    metaDescription: "Transform your mind and body with our sunset yoga retreat in beautiful Bali",
    description: "Join us for a transformative 3-day yoga retreat overlooking the stunning Balinese sunset. Perfect for beginners and experienced practitioners alike.",
    images: ["/images/yoga-retreat-1.jpg", "/images/yoga-retreat-2.jpg"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    title: "Farm-to-Table Cooking Class",
    type: "ACTIVITY",
    status: "PUBLISHED",
    category: "Culinary",
    location: "Napa Valley, CA",
    nextDate: "2024-02-20",
    occupancy: 8,
    capacity: 12,
    price: 150,
    slug: "farm-to-table-cooking",
    metaDescription: "Learn to cook with fresh, local ingredients in our hands-on cooking class",
    description: "Experience the joy of cooking with the freshest ingredients from local farms. Learn traditional techniques and modern twists.",
    images: ["/images/cooking-class-1.jpg"],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    title: "Luxury Beach Villa",
    type: "PROPERTY",
    status: "PUBLISHED",
    category: "Accommodation",
    location: "Malibu, CA",
    nextDate: "2024-02-25",
    occupancy: 6,
    capacity: 8,
    price: 800,
    slug: "luxury-beach-villa",
    metaDescription: "Stunning beachfront villa with panoramic ocean views and luxury amenities",
    description: "Escape to our exclusive beachfront villa featuring panoramic ocean views, private beach access, and world-class amenities.",
    images: ["/images/villa-1.jpg", "/images/villa-2.jpg", "/images/villa-3.jpg"],
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-22T13:20:00Z",
  },
  {
    id: "4",
    title: "Wine Tasting Experience",
    type: "EVENT",
    status: "DRAFT",
    category: "Entertainment",
    location: "Sonoma, CA",
    nextDate: "2024-03-01",
    occupancy: 0,
    capacity: 15,
    price: 75,
    slug: "wine-tasting-experience",
    metaDescription: "Discover exceptional wines with expert sommeliers in beautiful Sonoma",
    description: "Join our expert sommeliers for an intimate wine tasting experience featuring rare vintages and local favorites.",
    images: ["/images/wine-tasting-1.jpg"],
    createdAt: "2024-01-25T15:00:00Z",
    updatedAt: "2024-01-25T15:00:00Z",
  },
  {
    id: "5",
    title: "Fine Dining Restaurant",
    type: "RESTAURANT",
    status: "PUBLISHED",
    category: "Dining",
    location: "San Francisco, CA",
    nextDate: "2024-02-18",
    occupancy: 45,
    capacity: 60,
    price: 120,
    slug: "fine-dining-restaurant",
    metaDescription: "Award-winning fine dining with innovative cuisine and exceptional service",
    description: "Experience culinary excellence at our Michelin-starred restaurant featuring innovative cuisine and exceptional service.",
    images: ["/images/restaurant-1.jpg", "/images/restaurant-2.jpg"],
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

  async create(data: CreateListingInput): Promise<Listing> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newListing: Listing = {
      id: (mockListings.length + 1).toString(),
      ...data,
      occupancy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockListings.push(newListing);
    return newListing;
  },

  async update(id: string, data: UpdateListingInput): Promise<Listing> {
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
