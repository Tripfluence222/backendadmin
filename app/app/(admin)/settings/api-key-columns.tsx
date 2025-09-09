"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trash2, Copy, Key, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";
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
import { ApiKey } from "@/lib/api/settings";

interface ApiKeyColumnsProps {
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const ApiKeyColumns = ({ onDelete, onToggle }: ApiKeyColumnsProps): ColumnDef<ApiKey>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          API Key
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const key = row.original.key;
      const maskedKey = key.substring(0, 8) + "..." + key.substring(key.length - 4);
      return (
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1 font-mono">
            <Key className="h-3 w-3" />
            {maskedKey}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 2).map((permission) => (
            <Badge key={permission} variant="outline" className="text-xs">
              {permission}
            </Badge>
          ))}
          {permissions.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{permissions.length - 2} more
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
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as string;
      if (!expiresAt) return <span className="text-muted-foreground">Never</span>;
      
      const isExpired = new Date(expiresAt) < new Date();
      const isExpiringSoon = new Date(expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      return (
        <div className="space-y-1">
          <div className={`text-sm ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-yellow-500' : ''}`}>
            {format(new Date(expiresAt), "MMM dd, yyyy")}
          </div>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">Expired</Badge>
          )}
          {isExpiringSoon && !isExpired && (
            <Badge variant="outline" className="text-xs text-yellow-600">Expires Soon</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "lastUsedAt",
    header: "Last Used",
    cell: ({ row }) => {
      const lastUsedAt = row.getValue("lastUsedAt") as string;
      if (!lastUsedAt) return <span className="text-muted-foreground">Never</span>;
      return (
        <div className="text-sm">
          <div>{format(new Date(lastUsedAt), "MMM dd, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(lastUsedAt), "h:mm a")}
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
      const apiKey = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(apiKey.key)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggle(apiKey.id)}>
              {apiKey.isActive ? (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(apiKey.id)}
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
