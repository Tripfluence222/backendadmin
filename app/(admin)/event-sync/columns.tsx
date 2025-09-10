"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, RefreshCw, ExternalLink, Calendar, MapPin, Users, DollarSign } from "lucide-react";
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
import { EventSync } from "@/lib/api/event-sync";

interface ColumnsProps {
  onEdit: (eventSync: EventSync) => void;
  onDelete: (id: string) => void;
  onSync: (id: string) => void;
}

export const columns = ({ onEdit, onDelete, onSync }: ColumnsProps): ColumnDef<EventSync>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const platformEventId = row.original.platformEventId;
      const platform = row.original.platform;
      return (
        <div className="space-y-1">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">
            ID: {platformEventId}
          </div>
          <Badge variant="outline" className="text-xs">
            {platform.replace('_', ' ')}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.getValue("platform") as string;
      const platformColors = {
        facebook_events: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        google_business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        eventbrite: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        meetup: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        airbnb_experiences: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      };
      return (
        <Badge className={platformColors[platform as keyof typeof platformColors] || "bg-gray-100 text-gray-800"}>
          {platform.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      const endDate = row.original.endDate;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {format(new Date(startDate), "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(startDate), "h:mm a")} - {format(new Date(endDate), "h:mm a")}
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
      if (!location) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{location}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number;
      if (!capacity) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3" />
          <span>{capacity}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      if (!price) return <span className="text-muted-foreground">Free</span>;
      return (
        <div className="flex items-center gap-1 text-sm">
          <DollarSign className="h-3 w-3" />
          <span>${price}</span>
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
        created: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        updated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        deleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "syncStatus",
    header: "Sync Status",
    cell: ({ row }) => {
      const syncStatus = row.getValue("syncStatus") as string;
      const syncColors = {
        connected: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        disconnected: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        syncing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      };
      return (
        <Badge className={syncColors[syncStatus as keyof typeof syncColors] || "bg-gray-100 text-gray-800"}>
          {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastSyncedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Synced
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastSyncedAt = row.getValue("lastSyncedAt") as string;
      if (!lastSyncedAt) return <span className="text-muted-foreground">Never</span>;
      return (
        <div className="text-sm">
          {format(new Date(lastSyncedAt), "MMM dd, yyyy")}
          <div className="text-xs text-muted-foreground">
            {format(new Date(lastSyncedAt), "h:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const eventSync = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(eventSync.id)}>
              Copy event ID
            </DropdownMenuItem>
            {eventSync.externalUrl && (
              <DropdownMenuItem onClick={() => window.open(eventSync.externalUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View External
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(eventSync)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSync(eventSync.id)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(eventSync.id)}
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
