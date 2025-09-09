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
        restaurant: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        retreat: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        event: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        activity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        property: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
      return (
        <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
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
        draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        archived: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "nextDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Next Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("nextDate") as string;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return <div>{format(new Date(date), "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "occupancy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Occupancy
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const occupancy = row.getValue("occupancy") as number;
      const capacity = row.original.capacity;
      if (!capacity) return <span className="text-muted-foreground">-</span>;
      
      const percentage = Math.round((occupancy / capacity) * 100);
      const colorClass = percentage >= 80 ? "text-red-600" : percentage >= 60 ? "text-yellow-600" : "text-green-600";
      
      return (
        <div className="space-y-1">
          <div className={`font-medium ${colorClass}`}>
            {occupancy}/{capacity}
          </div>
          <div className="text-xs text-muted-foreground">
            {percentage}% full
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return <div className="max-w-[200px] truncate">{location}</div>;
    },
  },
  {
    accessorKey: "price",
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
      const price = row.getValue("price") as number;
      if (!price) return <span className="text-muted-foreground">-</span>;
      return <div className="font-medium">${price}</div>;
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
            {listing.status !== "archived" && (
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
