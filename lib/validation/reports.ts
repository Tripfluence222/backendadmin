import { z } from 'zod';

// Report generation schemas
export const generateReportSchema = z.object({
  type: z.enum(['sales', 'customers', 'conversion', 'inventory', 'revenue']),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  filters: z.object({
    listingIds: z.array(z.string().cuid()).optional(),
    customerIds: z.array(z.string().cuid()).optional(),
    categories: z.array(z.string()).optional(),
    statuses: z.array(z.string()).optional(),
  }).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  includeMetrics: z.array(z.enum(['revenue', 'bookings', 'customers', 'conversion_rate', 'average_order_value'])).optional(),
});

export const exportReportSchema = z.object({
  reportId: z.string().cuid(),
  format: z.enum(['csv', 'xlsx', 'pdf']),
  includeCharts: z.boolean().default(false),
  includeRawData: z.boolean().default(true),
});

// Report filters
export const reportFiltersSchema = z.object({
  type: z.enum(['sales', 'customers', 'conversion', 'inventory', 'revenue']).optional(),
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  status: z.enum(['draft', 'generating', 'completed', 'failed']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Sales report specific schemas
export const salesReportFiltersSchema = z.object({
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  listingIds: z.array(z.string().cuid()).optional(),
  categories: z.array(z.string()).optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// Customer report specific schemas
export const customerReportFiltersSchema = z.object({
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  customerSegment: z.enum(['all', 'new', 'returning', 'vip']).optional(),
  includeMetrics: z.array(z.enum(['total_customers', 'new_customers', 'repeat_customers', 'average_order_value', 'lifetime_value'])).optional(),
});

// Conversion report specific schemas
export const conversionReportFiltersSchema = z.object({
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  funnelSteps: z.array(z.string()).optional(),
  includeBreakdown: z.boolean().default(true),
});

// Type exports
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ExportReportInput = z.infer<typeof exportReportSchema>;
export type ReportFilters = z.infer<typeof reportFiltersSchema>;
export type SalesReportFilters = z.infer<typeof salesReportFiltersSchema>;
export type CustomerReportFilters = z.infer<typeof customerReportFiltersSchema>;
export type ConversionReportFilters = z.infer<typeof conversionReportFiltersSchema>;
