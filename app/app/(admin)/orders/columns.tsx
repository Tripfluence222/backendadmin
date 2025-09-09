"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, RotateCcw, X, Calendar } from "lucide-react";
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
import { Order } from "@/lib/api/orders";

interface ColumnsProps {
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onRefund: (order: Order) => void;
  onCancel: (id: string) => void;
  onReschedule: (order: Order) => void;
}

export const columns = ({ 
  onView, 
  onEdit, 
  onRefund, 
  onCancel, 
  onReschedule 
}: ColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: "orderId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderId = row.getValue("orderId") as string;
      return (
        <div className="font-mono text-sm">
          {orderId}
        </div>
      );
    },
  },
  {
    accessorKey: "guestName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Guest Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const guestName = row.getValue("guestName") as string;
      const guestEmail = row.original.guestEmail;
      return (
        <div className="space-y-1">
          <div className="font-medium">{guestName}</div>
          <div className="text-sm text-muted-foreground">{guestEmail}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "listingTitle",
    header: "Listing",
    cell: ({ row }) => {
      const listingTitle = row.getValue("listingTitle") as string;
      const listingType = row.original.listingType;
      const typeColors = {
        restaurant: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        retreat: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        event: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        activity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        property: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
      return (
        <div className="space-y-1">
          <div className="font-medium max-w-[200px] truncate">{listingTitle}</div>
          <Badge className={typeColors[listingType as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
            {listingType.charAt(0).toUpperCase() + listingType.slice(1)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      const time = row.original.time;
      return (
        <div className="space-y-1">
          <div className="font-medium">{format(new Date(date), "MMM dd, yyyy")}</div>
          {time && (
            <div className="text-sm text-muted-foreground">{time}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "guests",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Guests
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const guests = row.getValue("guests") as number;
      return (
        <div className="text-center">
          <div className="font-medium">{guests}</div>
          <div className="text-xs text-muted-foreground">
            {guests === 1 ? "guest" : "guests"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="font-medium">
          ${amount.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        no_show: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Badge>
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
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return <div className="text-sm">{format(new Date(date), "MMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.orderId)}>
              Copy order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(order)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(order)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {order.status !== "cancelled" && order.status !== "completed" && (
              <DropdownMenuItem onClick={() => onReschedule(order)}>
                <Calendar className="mr-2 h-4 w-4" />
                Reschedule
              </DropdownMenuItem>
            )}
            {order.paymentStatus === "paid" && order.status !== "cancelled" && (
              <DropdownMenuItem onClick={() => onRefund(order)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Refund
              </DropdownMenuItem>
            )}
            {order.status !== "cancelled" && order.status !== "completed" && (
              <DropdownMenuItem 
                onClick={() => onCancel(order.id)}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
