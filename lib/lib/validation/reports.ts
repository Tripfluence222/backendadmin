import { z } from "zod";

export const reportTypeSchema = z.enum([
  "sales",
  "bookings",
  "customers",
  "revenue",
  "conversion",
  "social_roi",
  "inventory",
  "performance"
]);

export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const generateReportSchema = z.object({
  type: reportTypeSchema,
  dateRange: dateRangeSchema,
  filters: z.object({
    categories: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    customerSegments: z.array(z.string()).optional(),
  }).optional(),
  groupBy: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
  format: z.enum(["json", "csv", "pdf"]).default("json"),
});

export const exportReportSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  format: z.enum(["csv", "pdf", "excel"]),
  includeCharts: z.boolean().default(true),
  includeRawData: z.boolean().default(false),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ExportReportInput = z.infer<typeof exportReportSchema>;
export type ReportType = z.infer<typeof reportTypeSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
