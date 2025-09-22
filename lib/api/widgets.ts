import { CreateWidgetInput, UpdateWidgetInput, WidgetType } from "@/lib/validation/widgets";

export interface Widget {
  id: string;
  name: string;
  type: WidgetType;
  description?: string;
  filters?: {
    categories?: string[];
    tags?: string[];
    location?: string;
    priceRange?: {
      min?: number;
      max?: number;
    };
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    borderRadius: number;
    theme: "light" | "dark" | "auto";
    showBranding: boolean;
  };
  isActive: boolean;
  embedCode: string;
  previewUrl: string;
  usage: {
    views: number;
    clicks: number;
    conversions: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockWidgets: Widget[] = [
  {
    id: "1",
    name: "Yoga Retreat Booking Widget",
    type: "booking",
    description: "Embeddable booking widget for yoga retreats",
    filters: {
      categories: ["Wellness", "Retreat"],
      location: "Bali",
    },
    design: {
      primaryColor: "#10b981",
      secondaryColor: "#6b7280",
      fontFamily: "Inter",
      fontSize: 16,
      borderRadius: 12,
      theme: "light",
      showBranding: true,
    },
    isActive: true,
    embedCode: `<script src="https://widgets.tripfluence.com/booking.js" data-widget-id="1"></script>`,
    previewUrl: "https://widgets.tripfluence.com/preview/1",
    usage: {
      views: 1250,
      clicks: 89,
      conversions: 12,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Restaurant Menu Widget",
    type: "menu",
    description: "Interactive menu widget for fine dining restaurant",
    filters: {
      categories: ["Dining"],
    },
    design: {
      primaryColor: "#dc2626",
      secondaryColor: "#374151",
      fontFamily: "Playfair Display",
      fontSize: 18,
      borderRadius: 8,
      theme: "dark",
      showBranding: false,
    },
    isActive: true,
    embedCode: `<iframe src="https://widgets.tripfluence.com/menu/2" width="100%" height="600" frameborder="0"></iframe>`,
    previewUrl: "https://widgets.tripfluence.com/preview/2",
    usage: {
      views: 2100,
      clicks: 156,
      conversions: 23,
    },
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    name: "Property Showcase Grid",
    type: "property_grid",
    description: "Grid display for luxury beach villas",
    filters: {
      categories: ["Accommodation"],
      priceRange: {
        min: 500,
        max: 2000,
      },
    },
    design: {
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      fontFamily: "Inter",
      fontSize: 14,
      borderRadius: 16,
      theme: "auto",
      showBranding: true,
    },
    isActive: true,
    embedCode: `<div id="tripfluence-property-grid" data-widget-id="3"></div><script src="https://widgets.tripfluence.com/property-grid.js"></script>`,
    previewUrl: "https://widgets.tripfluence.com/preview/3",
    usage: {
      views: 3400,
      clicks: 234,
      conversions: 18,
    },
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-22T13:20:00Z",
  },
  {
    id: "4",
    name: "Event Calendar Widget",
    type: "calendar",
    description: "Monthly calendar view for upcoming events",
    filters: {
      categories: ["Events", "Activities"],
    },
    design: {
      primaryColor: "#8b5cf6",
      secondaryColor: "#6b7280",
      fontFamily: "Inter",
      fontSize: 16,
      borderRadius: 8,
      theme: "light",
      showBranding: true,
    },
    isActive: false,
    embedCode: `<script src="https://widgets.tripfluence.com/calendar.js" data-widget-id="4"></script>`,
    previewUrl: "https://widgets.tripfluence.com/preview/4",
    usage: {
      views: 890,
      clicks: 67,
      conversions: 8,
    },
    createdAt: "2024-01-25T15:00:00Z",
    updatedAt: "2024-01-25T15:00:00Z",
  },
];

export const widgetsApi = {
  async getAll(): Promise<Widget[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockWidgets];
  },

  async getById(id: string): Promise<Widget | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWidgets.find(widget => widget.id === id) || null;
  },

  async create(data: CreateWidgetInput): Promise<Widget> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWidget: Widget = {
      id: (mockWidgets.length + 1).toString(),
      embedCode: `<script src="https://widgets.tripfluence.com/${data.type}.js" data-widget-id="${mockWidgets.length + 1}"></script>`,
      previewUrl: `https://widgets.tripfluence.com/preview/${mockWidgets.length + 1}`,
      usage: {
        views: 0,
        clicks: 0,
        conversions: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockWidgets.push(newWidget);
    return newWidget;
  },

  async update(id: string, data: UpdateWidgetInput): Promise<Widget> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockWidgets.findIndex(widget => widget.id === id);
    if (index === -1) {
      throw new Error("Widget not found");
    }
    mockWidgets[index] = {
      ...mockWidgets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockWidgets[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockWidgets.findIndex(widget => widget.id === id);
    if (index === -1) {
      throw new Error("Widget not found");
    }
    mockWidgets.splice(index, 1);
  },

  async toggleActive(id: string): Promise<Widget> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockWidgets.findIndex(widget => widget.id === id);
    if (index === -1) {
      throw new Error("Widget not found");
    }
    mockWidgets[index] = {
      ...mockWidgets[index],
      isActive: !mockWidgets[index].isActive,
      updatedAt: new Date().toISOString(),
    };
    return mockWidgets[index];
  },

  async generateEmbedCode(id: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const widget = mockWidgets.find(w => w.id === id);
    if (!widget) {
      throw new Error("Widget not found");
    }
    return widget.embedCode;
  },

  async getPreviewUrl(id: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const widget = mockWidgets.find(w => w.id === id);
    if (!widget) {
      throw new Error("Widget not found");
    }
    return widget.previewUrl;
  },
};
