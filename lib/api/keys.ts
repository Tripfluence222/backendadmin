// React Query keys for consistent caching and invalidation

export const queryKeys = {
  // Listings
  listings: {
    all: ["listings"] as const,
    lists: () => ["listings", "list"] as const,
    list: (filters: Record<string, any>) => ["listings", "list", filters] as const,
    details: () => ["listings", "detail"] as const,
    detail: (id: string) => ["listings", "detail", id] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => ["orders", "list"] as const,
    list: (filters: Record<string, any>) => ["orders", "list", filters] as const,
    details: () => ["orders", "detail"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },

  // Availability
  availability: {
    all: ["availability"] as const,
    lists: () => ["availability", "list"] as const,
    list: (filters: Record<string, any>) => ["availability", "list", filters] as const,
    calendar: (listingId: string, month: string) => 
      ["availability", "calendar", listingId, month] as const,
  },

  // Widgets
  widgets: {
    all: ["widgets"] as const,
    lists: () => ["widgets", "list"] as const,
    list: (filters: Record<string, any>) => ["widgets", "list", filters] as const,
    details: () => ["widgets", "detail"] as const,
    detail: (id: string) => ["widgets", "detail", id] as const,
  },

  // Social
  social: {
    all: ["social"] as const,
    posts: {
      all: ["social", "posts"] as const,
      lists: () => ["social", "posts", "list"] as const,
      list: (filters: Record<string, any>) => ["social", "posts", "list", filters] as const,
      details: () => ["social", "posts", "detail"] as const,
      detail: (id: string) => ["social", "posts", "detail", id] as const,
    },
    accounts: {
      all: ["social", "accounts"] as const,
      lists: () => ["social", "accounts", "list"] as const,
      list: (filters: Record<string, any>) => ["social", "accounts", "list", filters] as const,
    },
  },

  // Integrations
  integrations: {
    all: ["integrations"] as const,
    accounts: (businessId: string) => ["integrations", "accounts", businessId] as const,
    logs: (businessId: string) => ["integrations", "logs", businessId] as const,
  },

  // Event Sync
  eventSync: {
    all: ["eventSync"] as const,
    lists: () => ["eventSync", "list"] as const,
    list: (filters: Record<string, any>) => ["eventSync", "list", filters] as const,
    details: () => ["eventSync", "detail"] as const,
    detail: (id: string) => ["eventSync", "detail", id] as const,
  },

  // Marketing
  marketing: {
    all: ["marketing"] as const,
    coupons: {
      all: ["marketing", "coupons"] as const,
      lists: () => ["marketing", "coupons", "list"] as const,
      list: (filters: Record<string, any>) => ["marketing", "coupons", "list", filters] as const,
    },
    affiliates: {
      all: ["marketing", "affiliates"] as const,
      lists: () => ["marketing", "affiliates", "list"] as const,
      list: (filters: Record<string, any>) => ["marketing", "affiliates", "list", filters] as const,
    },
    loyalty: {
      all: ["marketing", "loyalty"] as const,
      lists: () => ["marketing", "loyalty", "list"] as const,
      list: (filters: Record<string, any>) => ["marketing", "loyalty", "list", filters] as const,
    },
  },

  // Reports
  reports: {
    all: ["reports"] as const,
    sales: (filters: Record<string, any>) => ["reports", "sales", filters] as const,
    customers: (filters: Record<string, any>) => ["reports", "customers", filters] as const,
    conversion: (filters: Record<string, any>) => ["reports", "conversion", filters] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    users: {
      all: ["settings", "users"] as const,
      lists: () => ["settings", "users", "list"] as const,
      list: (filters: Record<string, any>) => ["settings", "users", "list", filters] as const,
    },
    webhooks: {
      all: ["settings", "webhooks"] as const,
      lists: () => ["settings", "webhooks", "list"] as const,
      list: (filters: Record<string, any>) => ["settings", "webhooks", "list", filters] as const,
    },
    apiKeys: {
      all: ["settings", "apiKeys"] as const,
      lists: () => ["settings", "apiKeys", "list"] as const,
      list: (filters: Record<string, any>) => ["settings", "apiKeys", "list", filters] as const,
    },
  },

  // Audit
  audit: {
    all: ["audit"] as const,
    lists: () => ["audit", "list"] as const,
    list: (filters: Record<string, any>) => ["audit", "list", filters] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    metrics: () => ["dashboard", "metrics"] as const,
    recentOrders: () => ["dashboard", "recentOrders"] as const,
    topListings: () => ["dashboard", "topListings"] as const,
  },
};
