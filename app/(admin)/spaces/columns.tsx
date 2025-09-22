"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, Archive, Globe, MoreHorizontal, MapPin, Users, DollarSign } from "lucide-react";
import { Space } from "@/lib/api/space";
import { format } from "date-fns";

interface ColumnsProps {
  onEdit: (space: Space) => void;
  onDelete: (space: Space) => void;
  onPublish: (space: Space) => void;
  onArchive: (space: Space) => void;
}

export const columns = ({ onEdit, onDelete, onPublish, onArchive }: ColumnsProps): ColumnDef<Space>[] => [
  {
    accessorKey: "title",
    header: "Space",
    cell: ({ row }) => {
      const space = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{space.title}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {space.location.address}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "PUBLISHED" ? "default" : status === "DRAFT" ? "secondary" : "outline";
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number;
      return (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          {capacity}
        </div>
      );
    },
  },
  {
    accessorKey: "pricingRules",
    header: "Pricing",
    cell: ({ row }) => {
      const space = row.original;
      const hourlyRule = space.pricingRules?.find(rule => rule.kind === "HOURLY");
      const dailyRule = space.pricingRules?.find(rule => rule.kind === "DAILY");
      
      if (!hourlyRule && !dailyRule) {
        return <span className="text-muted-foreground">No pricing set</span>;
      }

      return (
        <div className="space-y-1">
          {hourlyRule && (
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="h-3 w-3" />
              {hourlyRule.amount}/{hourlyRule.currency}/hr
            </div>
          )}
          {dailyRule && (
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="h-3 w-3" />
              {dailyRule.amount}/{dailyRule.currency}/day
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "requests",
    header: "Requests",
    cell: ({ row }) => {
      const space = row.original;
      const totalRequests = space.requests?.length || 0;
      const pendingRequests = space.requests?.filter(req => req.status === "PENDING").length || 0;
      
      return (
        <div className="space-y-1">
          <div className="text-sm">{totalRequests} total</div>
          {pendingRequests > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingRequests} pending
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "MMM d, yyyy");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const space = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/venues/${space.location.address.split(',')[0].toLowerCase().replace(/\s+/g, '-')}/${space.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(space)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              
              {space.status === "DRAFT" && (
                <DropdownMenuItem onClick={() => onPublish(space)}>
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              
              {space.status === "PUBLISHED" && (
                <DropdownMenuItem onClick={() => onArchive(space)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(space)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
