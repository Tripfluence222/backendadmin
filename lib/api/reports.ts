import { GenerateReportInput, ExportReportInput, ReportType } from "@/lib/validation/reports";

export interface Report {
  id: string;
  type: ReportType;
  name: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    categories?: string[];
    locations?: string[];
    platforms?: string[];
    customerSegments?: string[];
  };
  groupBy: "day" | "week" | "month" | "quarter" | "year";
  data: any;
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  createdAt: string;
  generatedBy: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface SalesReportData {
  revenue: ChartData;
  bookings: ChartData;
  categories: ChartData;
  monthlyTrend: ChartData;
}

export interface CustomerReportData {
  acquisition: ChartData;
  retention: ChartData;
  segments: ChartData;
  lifetimeValue: ChartData;
}

export interface ConversionReportData {
  funnel: ChartData;
  sources: ChartData;
  devices: ChartData;
  timeToConvert: ChartData;
}

// Mock data
const mockReports: Report[] = [
  {
    id: "1",
    type: "sales",
    name: "Monthly Sales Report - January 2024",
    dateRange: {
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-01-31T23:59:59Z",
    },
    groupBy: "month",
    data: {
      revenue: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Revenue",
          data: [45000, 52000, 48000, 61000, 55000, 67000],
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgba(59, 130, 246, 1)",
        }],
      },
      bookings: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Bookings",
          data: [120, 145, 130, 165, 150, 180],
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgba(16, 185, 129, 1)",
        }],
      },
    },
    summary: {
      totalRevenue: 328000,
      totalBookings: 890,
      totalCustomers: 456,
      averageOrderValue: 368.54,
      conversionRate: 12.5,
    },
    createdAt: "2024-01-31T23:59:59Z",
    generatedBy: "Admin",
  },
  {
    id: "2",
    type: "customers",
    name: "Customer Acquisition Report - Q1 2024",
    dateRange: {
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-03-31T23:59:59Z",
    },
    groupBy: "month",
    data: {
      acquisition: {
        labels: ["Jan", "Feb", "Mar"],
        datasets: [{
          label: "New Customers",
          data: [156, 189, 234],
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderColor: "rgba(139, 92, 246, 1)",
        }],
      },
      retention: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{
          label: "Retention Rate",
          data: [85, 78, 72, 68],
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderColor: "rgba(245, 158, 11, 1)",
        }],
      },
    },
    summary: {
      totalRevenue: 0,
      totalBookings: 0,
      totalCustomers: 579,
      averageOrderValue: 0,
      conversionRate: 0,
    },
    createdAt: "2024-03-31T23:59:59Z",
    generatedBy: "Admin",
  },
];

export const reportsApi = {
  async getAllReports(): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockReports];
  },

  async getReportById(id: string): Promise<Report | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReports.find(report => report.id === id) || null;
  },

  async generateReport(data: GenerateReportInput): Promise<Report> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: Report = {
      id: (mockReports.length + 1).toString(),
      name: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report - ${formatDateRange(data.dateRange)}`,
      dateRange: {
        startDate: data.dateRange.startDate.toISOString(),
        endDate: data.dateRange.endDate.toISOString(),
      },
      groupBy: data.groupBy,
      filters: data.filters,
      data: generateMockData(data.type, data.dateRange, data.groupBy),
      summary: generateMockSummary(data.type),
      createdAt: new Date().toISOString(),
      generatedBy: "Admin",
      ...data,
    };
    
    mockReports.push(newReport);
    return newReport;
  },

  async exportReport(data: ExportReportInput): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const report = mockReports.find(r => r.id === data.reportId);
    if (!report) {
      throw new Error("Report not found");
    }
    
    // Mock export functionality
    if (data.format === "csv") {
      return "report_data.csv";
    } else if (data.format === "pdf") {
      return "report_data.pdf";
    } else {
      return "report_data.xlsx";
    }
  },

  async getSalesReport(dateRange: { startDate: Date; endDate: Date }): Promise<SalesReportData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      revenue: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Revenue",
          data: [45000, 52000, 48000, 61000, 55000, 67000],
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgba(59, 130, 246, 1)",
        }],
      },
      bookings: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Bookings",
          data: [120, 145, 130, 165, 150, 180],
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgba(16, 185, 129, 1)",
        }],
      },
      categories: {
        labels: ["Wellness", "Culinary", "Adventure", "Cultural", "Luxury"],
        datasets: [{
          label: "Revenue by Category",
          data: [125000, 98000, 76000, 54000, 89000],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
        }],
      },
      monthlyTrend: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [{
          label: "Quarterly Revenue",
          data: [145000, 168000, 189000, 203000],
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgba(59, 130, 246, 1)",
        }],
      },
    };
  },

  async getCustomerReport(dateRange: { startDate: Date; endDate: Date }): Promise<CustomerReportData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      acquisition: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "New Customers",
          data: [156, 189, 234, 198, 267, 289],
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderColor: "rgba(139, 92, 246, 1)",
        }],
      },
      retention: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{
          label: "Retention Rate (%)",
          data: [85, 78, 72, 68],
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderColor: "rgba(245, 158, 11, 1)",
        }],
      },
      segments: {
        labels: ["VIP", "Regular", "New", "Inactive"],
        datasets: [{
          label: "Customer Segments",
          data: [45, 234, 156, 89],
          backgroundColor: [
            "rgba(139, 92, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(107, 114, 128, 0.8)",
          ],
        }],
      },
      lifetimeValue: {
        labels: ["$0-100", "$100-500", "$500-1000", "$1000+"],
        datasets: [{
          label: "Customer Lifetime Value",
          data: [123, 234, 156, 67],
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgba(16, 185, 129, 1)",
        }],
      },
    };
  },

  async getConversionReport(dateRange: { startDate: Date; endDate: Date }): Promise<ConversionReportData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      funnel: {
        labels: ["Visitors", "Interested", "Booked", "Completed"],
        datasets: [{
          label: "Conversion Funnel",
          data: [10000, 2500, 500, 450],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
        }],
      },
      sources: {
        labels: ["Organic", "Social", "Direct", "Referral", "Paid"],
        datasets: [{
          label: "Traffic Sources",
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
        }],
      },
      devices: {
        labels: ["Mobile", "Desktop", "Tablet"],
        datasets: [{
          label: "Device Usage",
          data: [65, 30, 5],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
          ],
        }],
      },
      timeToConvert: {
        labels: ["Same Day", "1-3 Days", "1 Week", "1 Month", "1+ Month"],
        datasets: [{
          label: "Time to Convert",
          data: [15, 35, 25, 20, 5],
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderColor: "rgba(139, 92, 246, 1)",
        }],
      },
    };
  },
};

// Helper functions
function formatDateRange(dateRange: { startDate: Date; endDate: Date }): string {
  const start = dateRange.startDate.toLocaleDateString();
  const end = dateRange.endDate.toLocaleDateString();
  return `${start} - ${end}`;
}

function generateMockData(type: ReportType, dateRange: { startDate: Date; endDate: Date }, groupBy: string): any {
  // This would generate actual data based on the report type and parameters
  return {
    labels: ["Sample Data"],
    datasets: [{
      label: "Sample",
      data: [100],
    }],
  };
}

function generateMockSummary(type: ReportType): any {
  const summaries = {
    sales: {
      totalRevenue: 328000,
      totalBookings: 890,
      totalCustomers: 456,
      averageOrderValue: 368.54,
      conversionRate: 12.5,
    },
    customers: {
      totalRevenue: 0,
      totalBookings: 0,
      totalCustomers: 579,
      averageOrderValue: 0,
      conversionRate: 0,
    },
    conversion: {
      totalRevenue: 0,
      totalBookings: 450,
      totalCustomers: 0,
      averageOrderValue: 0,
      conversionRate: 4.5,
    },
  };
  
  return summaries[type] || summaries.sales;
}
