import { apiClient } from './client';
import type {
  SpaceCreateInput,
  SpaceUpdateInput,
  SpaceFilterInput,
  SpacePricingRulesBulkInput,
  SpaceAvailabilityBulkInput,
  SpaceRequestFilterInput,
  SpaceRequestQuoteInput,
  SpaceRequestDecisionInput,
  SpaceRequestCancelInput,
  SpaceMessageInput,
  PublicSpaceListInput,
  PublicAvailabilityInput,
  PublicQuoteInput,
} from '@/lib/validation/space';

// Types
export interface Space {
  id: string;
  businessId: string;
  title: string;
  slug: string;
  description: string;
  photos: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  capacity: number;
  floorAreaM2?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  amenities: SpaceAmenity[];
  rules: SpaceRule[];
  pricingRules: SpacePricingRule[];
  availability: SpaceAvailability[];
  requests: SpaceRequest[];
}

export interface SpaceAmenity {
  id: string;
  spaceId: string;
  label: string;
  category?: string;
}

export interface SpaceRule {
  id: string;
  spaceId: string;
  label: string;
  required: boolean;
}

export interface SpacePricingRule {
  id: string;
  spaceId: string;
  kind: 'HOURLY' | 'DAILY' | 'PEAK' | 'CLEANING_FEE' | 'SECURITY_DEPOSIT';
  amount: number;
  currency: string;
  dow: number[]; // 0=Sunday, 6=Saturday
  startHour?: number;
  endHour?: number;
}

export interface SpaceAvailability {
  id: string;
  spaceId: string;
  start: Date;
  end: Date;
  isBlocked: boolean;
  notes?: string;
}

export interface SpaceRequest {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  attendees: number;
  start: Date;
  end: Date;
  status: 'PENDING' | 'NEEDS_PAYMENT' | 'PAID_HOLD' | 'CONFIRMED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  quoteAmount?: number;
  depositAmount?: number;
  cleaningFee?: number;
  pricingBreakdown?: any;
  createdAt: Date;
  updatedAt: Date;
  messages: SpaceMessage[];
}

export interface SpaceMessage {
  id: string;
  spaceReqId: string;
  body: string;
  attachments?: string[];
  isFromHost: boolean;
  createdAt: Date;
}

export interface SpaceStats {
  totalSpaces: number;
  publishedSpaces: number;
  draftSpaces: number;
  totalRequests: number;
  pendingRequests: number;
  confirmedRequests: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

// API functions
export const spaceApi = {
  // Spaces CRUD
  list: async (filters: SpaceFilterInput = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return apiClient.get<{ spaces: Space[]; total: number; page: number; limit: number }>(`/space?${params}`);
  },

  get: async (id: string) => {
    return apiClient.get<Space>(`/space/${id}`);
  },

  create: async (data: SpaceCreateInput) => {
    return apiClient.post<Space>('/space', data);
  },

  update: async (id: string, data: SpaceUpdateInput) => {
    return apiClient.patch<Space>(`/space/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/space/${id}`);
  },

  publish: async (id: string) => {
    return apiClient.post<Space>(`/space/${id}/publish`);
  },

  archive: async (id: string) => {
    return apiClient.post<Space>(`/space/${id}/archive`);
  },

  // Pricing rules
  updatePricingRules: async (data: SpacePricingRulesBulkInput) => {
    return apiClient.post<SpacePricingRule[]>(`/space/${data.spaceId}/pricing`, data);
  },

  // Availability
  updateAvailability: async (data: SpaceAvailabilityBulkInput) => {
    return apiClient.post<SpaceAvailability[]>(`/space/${data.spaceId}/availability`, data);
  },

  // Requests
  listRequests: async (filters: SpaceRequestFilterInput = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return apiClient.get<{ requests: SpaceRequest[]; total: number; page: number; limit: number }>(`/space/requests?${params}`);
  },

  getRequest: async (id: string) => {
    return apiClient.get<SpaceRequest>(`/space/requests/${id}`);
  },

  quoteRequest: async (data: SpaceRequestQuoteInput) => {
    return apiClient.post<SpaceRequest>(`/space/requests/${data.requestId}/quote`, data);
  },

  approveRequest: async (data: SpaceRequestDecisionInput) => {
    return apiClient.post<SpaceRequest>(`/space/requests/${data.requestId}/approve`, data);
  },

  declineRequest: async (data: SpaceRequestDecisionInput) => {
    return apiClient.post<SpaceRequest>(`/space/requests/${data.requestId}/decline`, data);
  },

  cancelRequest: async (data: SpaceRequestCancelInput) => {
    return apiClient.post<SpaceRequest>(`/space/requests/${data.requestId}/cancel`, data);
  },

  // Messages
  sendMessage: async (data: SpaceMessageInput) => {
    return apiClient.post<SpaceMessage>(`/space/requests/${data.spaceReqId}/messages`, data);
  },

  // Stats
  getStats: async () => {
    return apiClient.get<SpaceStats>('/space/stats');
  },

  // Public APIs
  publicList: async (filters: PublicSpaceListInput = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return apiClient.get<{ spaces: Space[]; total: number; page: number; limit: number }>(`/public/space?${params}`);
  },

  publicGet: async (id: string) => {
    return apiClient.get<Space>(`/public/space/${id}`);
  },

  publicCheckAvailability: async (data: PublicAvailabilityInput) => {
    return apiClient.post<{ available: boolean; conflicts: any[] }>(`/public/space/${data.spaceId}/availability`, data);
  },

  publicGetQuote: async (data: PublicQuoteInput) => {
    return apiClient.post<{ quoteAmount: number; depositAmount?: number; cleaningFee?: number; pricingBreakdown: any }>(`/public/space/${data.spaceId}/quote`, data);
  },
};
