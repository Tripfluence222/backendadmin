"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Copy, Percent, DollarSign } from "lucide-react";
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
import { Coupon } from "@/lib/api/marketing";

interface CouponColumnsProps {
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export const CouponColumns = ({ onEdit, onDelete }: CouponColumnsProps): ColumnDef<Coupon>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Coupon Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      const name = row.original.name;
      return (
        <div className="space-y-1">
          <div className="font-mono font-medium">{code}</div>
          <div className="text-sm text-muted-foreground">{name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const value = row.original.value;
      const typeColors = {
        percentage: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        fixed_amount: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        free_shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        buy_one_get_one: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      };
      return (
        <div className="flex items-center gap-2">
          <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
            {type.replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-1 text-sm">
            {type === "percentage" ? (
              <Percent className="h-3 w-3" />
            ) : (
              <DollarSign className="h-3 w-3" />
            )}
            <span>{value}{type === "percentage" ? "%" : ""}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "usageCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Usage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const usageCount = row.getValue("usageCount") as number;
      const usageLimit = row.original.usageLimit;
      return (
        <div className="space-y-1">
          <div className="font-medium">{usageCount.toLocaleString()}</div>
          {usageLimit && (
            <div className="text-xs text-muted-foreground">
              of {usageLimit.toLocaleString()}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "validFrom",
    header: "Valid Period",
    cell: ({ row }) => {
      const validFrom = row.getValue("validFrom") as string;
      const validUntil = row.original.validUntil;
      const now = new Date();
      const isExpired = new Date(validUntil) < now;
      const isActive = new Date(validFrom) <= now && new Date(validUntil) >= now;
      
      return (
        <div className="space-y-1">
          <div className="text-sm">
            {format(new Date(validFrom), "MMM dd, yyyy")}
          </div>
          <div className="text-sm">
            to {format(new Date(validUntil), "MMM dd, yyyy")}
          </div>
          <Badge 
            variant={isExpired ? "destructive" : isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {isExpired ? "Expired" : isActive ? "Active" : "Future"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        exhausted: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
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
      const coupon = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(coupon.code)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(coupon)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(coupon.id)}
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
