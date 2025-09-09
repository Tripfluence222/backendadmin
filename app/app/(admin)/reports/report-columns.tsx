"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Download, Trash2, Eye, FileText } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Report } from "@/lib/api/reports";

interface ReportColumnsProps {
  onExport: (reportId: string, format: string) => void;
  onDelete: (id: string) => void;
}

export const ReportColumns = ({ onExport, onDelete }: ReportColumnsProps): ColumnDef<Report>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Report Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const type = row.original.type;
      return (
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          <Badge variant="outline" className="text-xs">
            {type.replace('_', ' ')}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeColors = {
        sales: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        bookings: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        customers: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        revenue: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        conversion: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        social_roi: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
        inventory: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
        performance: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
      return (
        <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
          {type.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "dateRange",
    header: "Date Range",
    cell: ({ row }) => {
      const dateRange = row.getValue("dateRange") as { startDate: string; endDate: string };
      return (
        <div className="text-sm">
          <div>{format(new Date(dateRange.startDate), "MMM dd, yyyy")}</div>
          <div className="text-muted-foreground">
            to {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "groupBy",
    header: "Group By",
    cell: ({ row }) => {
      const groupBy = row.getValue("groupBy") as string;
      return (
        <Badge variant="outline" className="text-xs">
          {groupBy}
        </Badge>
      );
    },
  },
  {
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }) => {
      const summary = row.getValue("summary") as Report["summary"];
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            ${summary.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            {summary.totalBookings} bookings
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Generated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          <div>{format(new Date(date), "MMM dd, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "h:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const report = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(report.id)}>
              Copy report ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport(report.id, "csv")}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport(report.id, "pdf")}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport(report.id, "excel")}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(report.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
