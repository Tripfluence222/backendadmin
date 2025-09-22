import { UpdateBrandingInput, UpdatePaymentSettingsInput, CreateUserInput, UpdateUserInput, CreateWebhookInput, UpdateWebhookInput, CreateApiKeyInput, UserRole, PaymentGateway } from "@/lib/validation/settings";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggered?: Date;
  lastStatus?: string;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsed?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface BrandingSettings {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCSS?: string;
}

export interface PaymentSettings {
  enabledGateways: PaymentGateway[];
  stripePublicKey?: string;
  stripeSecretKey?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  cryptoWalletAddress?: string;
  defaultCurrency: string;
  taxRate: number;
}

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    firstName: "Admin",
    lastName: "User",
    email: "admin@tripfluence.com",
    role: "admin",
    permissions: ["all"],
    isActive: true,
    lastLoginAt: "2024-01-25T10:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@tripfluence.com",
    role: "staff",
    permissions: ["listings", "orders", "customers"],
    isActive: true,
    lastLoginAt: "2024-01-24T16:30:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-24T16:30:00Z",
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Chen",
    email: "mike@tripfluence.com",
    role: "influencer",
    permissions: ["social", "reports"],
    isActive: true,
    lastLoginAt: "2024-01-23T14:15:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-23T14:15:00Z",
  },
];

const mockWebhooks: Webhook[] = [
  {
    id: "1",
    name: "Order Created",
    url: "https://api.example.com/webhooks/order-created",
    events: ["order.created", "order.updated"],
    secret: "whsec_1234567890",
    isActive: true,
    lastTriggeredAt: "2024-01-25T09:30:00Z",
    successCount: 145,
    failureCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-25T09:30:00Z",
  },
  {
    id: "2",
    name: "Customer Registration",
    url: "https://crm.example.com/webhooks/customer-registered",
    events: ["customer.created"],
    isActive: true,
    lastTriggeredAt: "2024-01-24T16:45:00Z",
    successCount: 89,
    failureCount: 1,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-24T16:45:00Z",
  },
];

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Mobile App API",
    key: "trip_sk_live_1234567890abcdef",
    permissions: ["read:listings", "read:availability", "create:bookings"],
    expiresAt: "2024-12-31T23:59:59Z",
    lastUsedAt: "2024-01-25T10:15:00Z",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-25T10:15:00Z",
  },
  {
    id: "2",
    name: "Partner Integration",
    key: "trip_sk_live_fedcba0987654321",
    permissions: ["read:listings", "read:reviews"],
    lastUsedAt: "2024-01-24T14:20:00Z",
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-24T14:20:00Z",
  },
];

const mockBrandingSettings: BrandingSettings = {
  logo: "https://tripfluence.com/logo.png",
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  fontFamily: "Inter",
  customCSS: "/* Custom styles */",
};

const mockPaymentSettings: PaymentSettings = {
  enabledGateways: ["stripe", "paypal"],
  stripePublicKey: "pk_live_1234567890",
  stripeSecretKey: "sk_live_1234567890",
  paypalClientId: "paypal_client_id",
  paypalClientSecret: "paypal_client_secret",
  defaultCurrency: "USD",
  taxRate: 8.5,
};

export const settingsApi = {
  // Branding
  async getBrandingSettings(): Promise<BrandingSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockBrandingSettings };
  },

  async updateBrandingSettings(data: UpdateBrandingInput): Promise<BrandingSettings> {
    await new Promise(resolve => setTimeout(resolve, 600));
    Object.assign(mockBrandingSettings, data);
    return { ...mockBrandingSettings };
  },

  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockPaymentSettings };
  },

  async updatePaymentSettings(data: UpdatePaymentSettingsInput): Promise<PaymentSettings> {
    await new Promise(resolve => setTimeout(resolve, 600));
    Object.assign(mockPaymentSettings, data);
    return { ...mockPaymentSettings };
  },

  // Users
  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockUsers];
  },

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(user => user.id === id) || null;
  },

  async createUser(data: CreateUserInput): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      permissions: data.permissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockUsers.push(newUser);
    return newUser;
  },

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockUsers.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockUsers[index];
  },

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockUsers.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }
    mockUsers.splice(index, 1);
  },

  // Webhooks
  async getWebhooks(): Promise<Webhook[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockWebhooks];
  },

  async getWebhookById(id: string): Promise<Webhook | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWebhooks.find(webhook => webhook.id === id) || null;
  },

  async createWebhook(data: CreateWebhookInput): Promise<Webhook> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWebhook: Webhook = {
      id: (mockWebhooks.length + 1).toString(),
      successCount: 0,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockWebhooks.push(newWebhook);
    return newWebhook;
  },

  async updateWebhook(id: string, data: UpdateWebhookInput): Promise<Webhook> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockWebhooks.findIndex(webhook => webhook.id === id);
    if (index === -1) {
      throw new Error("Webhook not found");
    }
    mockWebhooks[index] = {
      ...mockWebhooks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockWebhooks[index];
  },

  async deleteWebhook(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockWebhooks.findIndex(webhook => webhook.id === id);
    if (index === -1) {
      throw new Error("Webhook not found");
    }
    mockWebhooks.splice(index, 1);
  },

  async testWebhook(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const webhook = mockWebhooks.find(w => w.id === id);
    if (!webhook) {
      throw new Error("Webhook not found");
    }
    
    // Mock webhook test - randomly succeed or fail
    const success = Math.random() > 0.2; // 80% success rate
    if (success) {
      webhook.successCount++;
      webhook.lastTriggeredAt = new Date().toISOString();
    } else {
      webhook.failureCount++;
    }
    
    return success;
  },

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockApiKeys];
  },

  async createApiKey(data: CreateApiKeyInput): Promise<ApiKey> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newApiKey: ApiKey = {
      id: (mockApiKeys.length + 1).toString(),
      key: `trip_sk_live_${Math.random().toString(36).substring(2, 15)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
      expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
    };
    mockApiKeys.push(newApiKey);
    return newApiKey;
  },

  async deleteApiKey(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockApiKeys.findIndex(apiKey => apiKey.id === id);
    if (index === -1) {
      throw new Error("API key not found");
    }
    mockApiKeys.splice(index, 1);
  },

  async toggleApiKey(id: string): Promise<ApiKey> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockApiKeys.findIndex(apiKey => apiKey.id === id);
    if (index === -1) {
      throw new Error("API key not found");
    }
    mockApiKeys[index] = {
      ...mockApiKeys[index],
      isActive: !mockApiKeys[index].isActive,
      updatedAt: new Date().toISOString(),
    };
    return mockApiKeys[index];
  },
};
