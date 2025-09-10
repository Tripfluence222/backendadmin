// React Query keys for consistent caching and invalidation

export const queryKeys = {
  // Listings
  listings: {
    all: ["listings"] as const,
    lists: () => [...queryKeys.listings.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.listings.lists(), filters] as const,
    details: () => [...queryKeys.listings.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.listings.details(), id] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Availability
  availability: {
    all: ["availability"] as const,
    lists: () => [...queryKeys.availability.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.availability.lists(), filters] as const,
    calendar: (listingId: string, month: string) => 
      [...queryKeys.availability.all, "calendar", listingId, month] as const,
  },

  // Widgets
  widgets: {
    all: ["widgets"] as const,
    lists: () => [...queryKeys.widgets.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.widgets.lists(), filters] as const,
    details: () => [...queryKeys.widgets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.widgets.details(), id] as const,
  },

  // Social
  social: {
    all: ["social"] as const,
    posts: {
      all: [...queryKeys.social.all, "posts"] as const,
      lists: () => [...queryKeys.social.posts.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.social.posts.lists(), filters] as const,
      details: () => [...queryKeys.social.posts.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.social.posts.details(), id] as const,
    },
    accounts: {
      all: [...queryKeys.social.all, "accounts"] as const,
      lists: () => [...queryKeys.social.accounts.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.social.accounts.lists(), filters] as const,
    },
  },

  // Event Sync
  eventSync: {
    all: ["eventSync"] as const,
    lists: () => [...queryKeys.eventSync.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.eventSync.lists(), filters] as const,
    details: () => [...queryKeys.eventSync.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.eventSync.details(), id] as const,
  },

  // Marketing
  marketing: {
    all: ["marketing"] as const,
    coupons: {
      all: [...queryKeys.marketing.all, "coupons"] as const,
      lists: () => [...queryKeys.marketing.coupons.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.marketing.coupons.lists(), filters] as const,
    },
    affiliates: {
      all: [...queryKeys.marketing.all, "affiliates"] as const,
      lists: () => [...queryKeys.marketing.affiliates.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.marketing.affiliates.lists(), filters] as const,
    },
    loyalty: {
      all: [...queryKeys.marketing.all, "loyalty"] as const,
      lists: () => [...queryKeys.marketing.loyalty.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.marketing.loyalty.lists(), filters] as const,
    },
  },

  // Reports
  reports: {
    all: ["reports"] as const,
    sales: (filters: Record<string, any>) => [...queryKeys.reports.all, "sales", filters] as const,
    customers: (filters: Record<string, any>) => [...queryKeys.reports.all, "customers", filters] as const,
    conversion: (filters: Record<string, any>) => [...queryKeys.reports.all, "conversion", filters] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    users: {
      all: [...queryKeys.settings.all, "users"] as const,
      lists: () => [...queryKeys.settings.users.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.settings.users.lists(), filters] as const,
    },
    webhooks: {
      all: [...queryKeys.settings.all, "webhooks"] as const,
      lists: () => [...queryKeys.settings.webhooks.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.settings.webhooks.lists(), filters] as const,
    },
    apiKeys: {
      all: [...queryKeys.settings.all, "apiKeys"] as const,
      lists: () => [...queryKeys.settings.apiKeys.all, "list"] as const,
      list: (filters: Record<string, any>) => [...queryKeys.settings.apiKeys.lists(), filters] as const,
    },
  },

  // Audit
  audit: {
    all: ["audit"] as const,
    lists: () => [...queryKeys.audit.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.audit.lists(), filters] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    metrics: () => [...queryKeys.dashboard.all, "metrics"] as const,
    recentOrders: () => [...queryKeys.dashboard.all, "recentOrders"] as const,
    topListings: () => [...queryKeys.dashboard.all, "topListings"] as const,
  },
};
