"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Copy, ToggleLeft, ToggleRight } from "lucide-react";
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
import { Widget } from "@/lib/api/widgets";

interface ColumnsProps {
  onEdit: (widget: Widget) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onCopyEmbedCode: (id: string) => void;
  onPreview: (widget: Widget) => void;
}

export const columns = ({ 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onCopyEmbedCode, 
  onPreview 
}: ColumnsProps): ColumnDef<Widget>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Widget Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const description = row.original.description;
      const type = row.original.type;
      return (
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          {description && (
            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
              {description}
            </div>
          )}
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
        booking: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        calendar: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        menu: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        property_grid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        reviews: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        contact_form: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      };
      return (
        <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
          {type.replace('_', ' ')}
        </Badge>
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
    accessorKey: "usage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const usage = row.getValue("usage") as { views: number; clicks: number; conversions: number };
      return (
        <div className="space-y-1">
          <div className="font-medium">{usage.views.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {usage.clicks} clicks, {usage.conversions} conversions
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "design",
    header: "Design",
    cell: ({ row }) => {
      const design = row.getValue("design") as Widget["design"];
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: design.primaryColor }}
          />
          <div className="text-sm">
            {design.theme} • {design.fontSize}px
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
      const widget = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(widget.id)}>
              Copy widget ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onPreview(widget)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyEmbedCode(widget.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Embed Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(widget)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(widget.id)}>
              {widget.isActive ? (
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
              onClick={() => onDelete(widget.id)}
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
