"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Archive, Eye } from "lucide-react";
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
import { Listing } from "@/lib/api/listings";

interface ColumnsProps {
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export const columns = ({ onEdit, onDelete, onArchive }: ColumnsProps): ColumnDef<Listing>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const slug = row.original.slug;
      return (
        <div className="space-y-1">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">/{slug}</div>
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
        RESTAURANT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        RETREAT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        EVENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        ACTIVITY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        PROPERTY: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
      return (
        <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"} data-testid="type-badge">
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
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
        DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        ARCHIVED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"} data-testid="status-badge">
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Capacity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number;
      if (!capacity) return <span className="text-muted-foreground">-</span>;
      return <div className="font-medium">{capacity}</div>;
    },
  },
  {
    accessorKey: "locationCity",
    header: "Location",
    cell: ({ row }) => {
      const city = row.getValue("locationCity") as string;
      const country = row.original.locationCountry;
      const location = [city, country].filter(Boolean).join(", ");
      return <div className="max-w-[200px] truncate">{location || "-"}</div>;
    },
  },
  {
    accessorKey: "priceFrom",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priceFrom = row.getValue("priceFrom") as number;
      const currency = row.original.currency || "USD";
      if (!priceFrom) return <span className="text-muted-foreground">-</span>;
      const formattedPrice = (priceFrom / 100).toFixed(2);
      return <div className="font-medium">{currency} ${formattedPrice}</div>;
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
      const listing = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(listing.id)}>
              Copy listing ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(listing)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/listings/${listing.slug}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            {listing.status !== "ARCHIVED" && (
              <DropdownMenuItem onClick={() => onArchive(listing.id)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(listing.id)}
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
