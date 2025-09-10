import { CreateEventSyncInput, UpdateEventSyncInput, ConnectPlatformInput, EventSyncPlatform, SyncStatus, EventSyncStatus } from "@/lib/validation/event-sync";

export interface ConnectedPlatform {
  id: string;
  platform: EventSyncPlatform;
  accountName: string;
  status: SyncStatus;
  lastSyncAt?: string;
  autoSync: boolean;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventSync {
  id: string;
  platform: EventSyncPlatform;
  platformEventId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  capacity?: number;
  price?: number;
  status: EventSyncStatus;
  externalUrl?: string;
  imageUrl?: string;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncMetrics {
  totalEvents: number;
  syncedEvents: number;
  pendingEvents: number;
  failedEvents: number;
  lastSyncTime?: string;
  platformsConnected: number;
}

// Mock data
const mockPlatforms: ConnectedPlatform[] = [
  {
    id: "1",
    platform: "facebook_events",
    accountName: "Tripfluence Events",
    status: "connected",
    lastSyncAt: "2024-01-25T10:00:00Z",
    autoSync: true,
    webhookUrl: "https://api.tripfluence.com/webhooks/facebook-events",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "2",
    platform: "eventbrite",
    accountName: "Tripfluence Eventbrite",
    status: "connected",
    lastSyncAt: "2024-01-24T15:30:00Z",
    autoSync: true,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-24T15:30:00Z",
  },
  {
    id: "3",
    platform: "google_business",
    accountName: "Tripfluence Google Business",
    status: "error",
    lastSyncAt: "2024-01-20T09:00:00Z",
    autoSync: false,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
  },
];

const mockEventSyncs: EventSync[] = [
  {
    id: "1",
    platform: "facebook_events",
    platformEventId: "fb_123456789",
    title: "Sunset Yoga Retreat",
    description: "Join us for a transformative yoga retreat overlooking the stunning Balinese sunset.",
    startDate: "2024-02-15T18:00:00Z",
    endDate: "2024-02-18T10:00:00Z",
    location: "Bali, Indonesia",
    capacity: 20,
    price: 299,
    status: "created",
    externalUrl: "https://facebook.com/events/123456789",
    imageUrl: "/images/yoga-retreat.jpg",
    syncStatus: "connected",
    lastSyncedAt: "2024-01-25T10:00:00Z",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "2",
    platform: "eventbrite",
    platformEventId: "eb_987654321",
    title: "Farm-to-Table Cooking Class",
    description: "Learn to cook with fresh, local ingredients in our hands-on cooking class.",
    startDate: "2024-02-20T14:00:00Z",
    endDate: "2024-02-20T17:00:00Z",
    location: "Napa Valley, CA",
    capacity: 12,
    price: 150,
    status: "updated",
    externalUrl: "https://eventbrite.com/e/farm-to-table-cooking-class-987654321",
    imageUrl: "/images/cooking-class.jpg",
    syncStatus: "connected",
    lastSyncedAt: "2024-01-24T15:30:00Z",
    createdAt: "2024-01-15T14:00:00Z",
    updatedAt: "2024-01-24T15:30:00Z",
  },
  {
    id: "3",
    platform: "google_business",
    platformEventId: "gb_456789123",
    title: "Wine Tasting Experience",
    description: "Join our expert sommeliers for an intimate wine tasting experience.",
    startDate: "2024-03-01T19:00:00Z",
    endDate: "2024-03-01T21:00:00Z",
    location: "Sonoma, CA",
    capacity: 15,
    price: 75,
    status: "failed",
    externalUrl: "https://business.google.com/events/456789123",
    syncStatus: "error",
    lastSyncedAt: "2024-01-20T09:00:00Z",
    createdAt: "2024-01-18T16:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
  },
  {
    id: "4",
    platform: "facebook_events",
    platformEventId: "fb_789123456",
    title: "Luxury Beach Villa Open House",
    description: "Tour our exclusive beachfront villa with panoramic ocean views.",
    startDate: "2024-02-25T15:00:00Z",
    endDate: "2024-02-25T18:00:00Z",
    location: "Malibu, CA",
    capacity: 8,
    price: 0,
    status: "pending",
    externalUrl: "https://facebook.com/events/789123456",
    imageUrl: "/images/beach-villa.jpg",
    syncStatus: "syncing",
    createdAt: "2024-01-25T12:00:00Z",
    updatedAt: "2024-01-25T12:00:00Z",
  },
];

export const eventSyncApi = {
  // Platforms
  async getConnectedPlatforms(): Promise<ConnectedPlatform[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockPlatforms];
  },

  async connectPlatform(data: ConnectPlatformInput): Promise<ConnectedPlatform> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newPlatform: ConnectedPlatform = {
      id: (mockPlatforms.length + 1).toString(),
      accountName: `${data.platform} Account`,
      status: "connected",
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockPlatforms.push(newPlatform);
    return newPlatform;
  },

  async disconnectPlatform(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockPlatforms.findIndex(platform => platform.id === id);
    if (index === -1) {
      throw new Error("Platform not found");
    }
    mockPlatforms[index].status = "disconnected";
    mockPlatforms[index].updatedAt = new Date().toISOString();
  },

  async updatePlatformSettings(id: string, settings: Partial<ConnectedPlatform>): Promise<ConnectedPlatform> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockPlatforms.findIndex(platform => platform.id === id);
    if (index === -1) {
      throw new Error("Platform not found");
    }
    mockPlatforms[index] = {
      ...mockPlatforms[index],
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    return mockPlatforms[index];
  },

  // Event Syncs
  async getAllEventSyncs(): Promise<EventSync[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockEventSyncs];
  },

  async getEventSyncById(id: string): Promise<EventSync | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEventSyncs.find(eventSync => eventSync.id === id) || null;
  },

  async createEventSync(data: CreateEventSyncInput): Promise<EventSync> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newEventSync: EventSync = {
      id: (mockEventSyncs.length + 1).toString(),
      syncStatus: "connected",
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    };
    mockEventSyncs.push(newEventSync);
    return newEventSync;
  },

  async updateEventSync(id: string, data: UpdateEventSyncInput): Promise<EventSync> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockEventSyncs.findIndex(eventSync => eventSync.id === id);
    if (index === -1) {
      throw new Error("Event sync not found");
    }
    mockEventSyncs[index] = {
      ...mockEventSyncs[index],
      ...data,
      startDate: data.startDate ? data.startDate.toISOString() : mockEventSyncs[index].startDate,
      endDate: data.endDate ? data.endDate.toISOString() : mockEventSyncs[index].endDate,
      updatedAt: new Date().toISOString(),
    };
    return mockEventSyncs[index];
  },

  async deleteEventSync(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockEventSyncs.findIndex(eventSync => eventSync.id === id);
    if (index === -1) {
      throw new Error("Event sync not found");
    }
    mockEventSyncs.splice(index, 1);
  },

  async syncEvent(id: string): Promise<EventSync> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockEventSyncs.findIndex(eventSync => eventSync.id === id);
    if (index === -1) {
      throw new Error("Event sync not found");
    }
    mockEventSyncs[index] = {
      ...mockEventSyncs[index],
      syncStatus: "connected",
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockEventSyncs[index];
  },

  async syncAllEvents(): Promise<EventSync[]> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const now = new Date().toISOString();
    mockEventSyncs.forEach(eventSync => {
      eventSync.syncStatus = "connected";
      eventSync.lastSyncedAt = now;
      eventSync.updatedAt = now;
    });
    return [...mockEventSyncs];
  },

  async getSyncMetrics(): Promise<SyncMetrics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const totalEvents = mockEventSyncs.length;
    const syncedEvents = mockEventSyncs.filter(e => e.syncStatus === "connected").length;
    const pendingEvents = mockEventSyncs.filter(e => e.status === "pending").length;
    const failedEvents = mockEventSyncs.filter(e => e.syncStatus === "error").length;
    const platformsConnected = mockPlatforms.filter(p => p.status === "connected").length;
    
    const lastSyncTimes = mockEventSyncs
      .filter(e => e.lastSyncedAt)
      .map(e => new Date(e.lastSyncedAt!).getTime());
    const lastSyncTime = lastSyncTimes.length > 0 
      ? new Date(Math.max(...lastSyncTimes)).toISOString()
      : undefined;

    return {
      totalEvents,
      syncedEvents,
      pendingEvents,
      failedEvents,
      lastSyncTime,
      platformsConnected,
    };
  },

  async getEventsByPlatform(platform: EventSyncPlatform): Promise<EventSync[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockEventSyncs.filter(eventSync => eventSync.platform === platform);
  },

  async getEventsByStatus(status: EventSyncStatus): Promise<EventSync[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockEventSyncs.filter(eventSync => eventSync.status === status);
  },
};
