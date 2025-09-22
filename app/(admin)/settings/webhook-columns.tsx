"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, TestTube, ExternalLink, CheckCircle, XCircle } from "lucide-react";
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
import { Webhook } from "@/lib/api/settings";

interface WebhookColumnsProps {
  onEdit: (webhook: Webhook) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}

export const WebhookColumns = ({ onEdit, onDelete, onTest }: WebhookColumnsProps): ColumnDef<Webhook>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Webhook
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const url = row.original.url;
      return (
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            {url}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "events",
    header: "Events",
    cell: ({ row }) => {
      const events = row.getValue("events") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {events.slice(0, 2).map((event) => (
            <Badge key={event} variant="outline" className="text-xs">
              {event}
            </Badge>
          ))}
          {events.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{events.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "successCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Success Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const successCount = row.getValue("successCount") as number;
      const failureCount = row.original.failureCount;
      const total = successCount + failureCount;
      const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-sm font-medium">{successCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            <span className="text-sm text-muted-foreground">{failureCount}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {successRate}% success rate
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "lastTriggeredAt",
    header: "Last Triggered",
    cell: ({ row }) => {
      const lastTriggeredAt = row.getValue("lastTriggeredAt") as string;
      if (!lastTriggeredAt) return <span className="text-muted-foreground">Never</span>;
      return (
        <div className="text-sm">
          <div>{format(new Date(lastTriggeredAt), "MMM dd, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(lastTriggeredAt), "h:mm a")}
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
      const webhook = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(webhook.url)}>
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onTest(webhook.id)}>
              <TestTube className="mr-2 h-4 w-4" />
              Test Webhook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(webhook)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(webhook.id)}
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
