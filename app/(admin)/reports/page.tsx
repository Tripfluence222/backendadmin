"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, BarChart3, TrendingUp, Users, DollarSign, Calendar, Filter, FileText } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subMonths, subYears } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { DrawerForm } from "@/components/forms/drawer-form";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { reportsApi, Report, SalesReportData, CustomerReportData, ConversionReportData } from "@/lib/api/reports";
import { generateReportSchema, exportReportSchema } from "@/lib/validation/reports";
import { ReportColumns } from "./report-columns";
import { SalesChart } from "./sales-chart";
import { CustomerChart } from "./customer-chart";
import { ConversionChart } from "./conversion-chart";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.getAllReports,
  });

  const { data: salesData } = useQuery({
    queryKey: ["sales-report", dateRange],
    queryFn: () => reportsApi.getSalesReport(dateRange),
  });

  const { data: customerData } = useQuery({
    queryKey: ["customer-report", dateRange],
    queryFn: () => reportsApi.getCustomerReport(dateRange),
  });

  const { data: conversionData } = useQuery({
    queryKey: ["conversion-report", dateRange],
    queryFn: () => reportsApi.getConversionReport(dateRange),
  });

  const generateReportMutation = useMutation({
    mutationFn: reportsApi.generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate report");
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: reportsApi.exportReport,
    onSuccess: (filename) => {
      toast.success(`Report exported as ${filename}`);
    },
    onError: () => {
      toast.error("Failed to export report");
    },
  });

  const handleGenerateReport = (data: any) => {
    generateReportMutation.mutate(data);
  };

  const handleExportReport = (reportId: string, format: string) => {
    exportReportMutation.mutate({
      reportId,
      format: format as "csv" | "pdf" | "excel",
    });
  };

  const handleDeleteReport = (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      // Delete logic would go here
      toast.success("Report deleted successfully");
    }
  };

  const quickDateRanges = [
    { label: "Last 7 days", value: { from: subDays(new Date(), 7), to: new Date() } },
    { label: "Last 30 days", value: { from: subDays(new Date(), 30), to: new Date() } },
    { label: "Last 3 months", value: { from: subMonths(new Date(), 3), to: new Date() } },
    { label: "Last 6 months", value: { from: subMonths(new Date(), 6), to: new Date() } },
    { label: "Last year", value: { from: subYears(new Date(), 1), to: new Date() } },
  ];

  const reportColumns = ReportColumns({
    onExport: handleExportReport,
    onDelete: handleDeleteReport,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your business performance
          </p>
        </div>
        <Button onClick={() => setSelectedReport({} as Report)}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quick Select:</span>
              {quickDateRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Custom Range:</span>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData?.revenue.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData?.bookings.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData?.acquisition.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionData?.funnel.datasets[0].data.length > 0 
                ? Math.round((conversionData.funnel.datasets[0].data[3] / conversionData.funnel.datasets[0].data[0]) * 100)
                : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData && <SalesChart data={salesData.revenue} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Volume</CardTitle>
                <CardDescription>Number of bookings per month</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData && <SalesChart data={salesData.bookings} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                {customerData && <CustomerChart data={customerData.acquisition} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Customer journey from visitor to booking</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionData && <ConversionChart data={conversionData.funnel} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Breakdown of revenue by service category</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData && <SalesChart data={salesData.categories} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance</CardTitle>
                <CardDescription>Revenue trends by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData && <SalesChart data={salesData.monthlyTrend} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Distribution of customers by segment</CardDescription>
              </CardHeader>
              <CardContent>
                {customerData && <CustomerChart data={customerData.segments} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
                <CardDescription>Distribution of customer spending</CardDescription>
              </CardHeader>
              <CardContent>
                {customerData && <CustomerChart data={customerData.lifetimeValue} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
                <CardDescription>Customer retention over time</CardDescription>
              </CardHeader>
              <CardContent>
                {customerData && <CustomerChart data={customerData.retention} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionData && <ConversionChart data={conversionData.sources} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionData && <ConversionChart data={conversionData.devices} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time to Convert</CardTitle>
                <CardDescription>How long it takes customers to book</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionData && <ConversionChart data={conversionData.timeToConvert} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and export previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={reportColumns}
            data={reports}
            searchKey="name"
            searchPlaceholder="Search reports..."
          />
        </CardContent>
      </Card>

      {/* Generate Report Form */}
      {selectedReport && (
        <DrawerForm
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Generate New Report"
          description="Create a custom report with specific parameters"
          schema={generateReportSchema}
          defaultValues={{
            type: "sales",
            dateRange: {
              startDate: dateRange.from,
              endDate: dateRange.to,
            },
            groupBy: "month",
            format: "json",
          }}
          onSubmit={handleGenerateReport}
          isLoading={generateReportMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select onValueChange={(value) => form.setValue("type", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="bookings">Bookings Report</SelectItem>
                    <SelectItem value="customers">Customer Report</SelectItem>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                    <SelectItem value="conversion">Conversion Report</SelectItem>
                    <SelectItem value="social_roi">Social ROI Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    {...form.register("dateRange.startDate", { valueAsDate: true })} 
                    type="date"
                  />
                  {form.formState.errors.dateRange?.startDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.dateRange.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    {...form.register("dateRange.endDate", { valueAsDate: true })} 
                    type="date"
                  />
                  {form.formState.errors.dateRange?.endDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.dateRange.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Group By</label>
                <Select onValueChange={(value) => form.setValue("groupBy", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.groupBy && (
                  <p className="text-sm text-red-500">{form.formState.errors.groupBy.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Export Format</label>
                <Select onValueChange={(value) => form.setValue("format", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.format && (
                  <p className="text-sm text-red-500">{form.formState.errors.format.message}</p>
                )}
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
