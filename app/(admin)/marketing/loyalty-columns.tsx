"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Gift, Target, Award } from "lucide-react";
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
import { LoyaltyRule } from "@/lib/api/marketing";

interface LoyaltyColumnsProps {
  onEdit: (rule: LoyaltyRule) => void;
  onDelete: (id: string) => void;
}

export const LoyaltyColumns = ({ onEdit, onDelete }: LoyaltyColumnsProps): ColumnDef<LoyaltyRule>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rule Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const description = row.original.description;
      return (
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          {description && (
            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
              {description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "triggerType",
    header: "Trigger",
    cell: ({ row }) => {
      const triggerType = row.getValue("triggerType") as string;
      const triggerValue = row.original.triggerValue;
      const triggerColors = {
        booking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        spend: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        frequency: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        referral: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      };
      return (
        <div className="space-y-1">
          <Badge className={triggerColors[triggerType as keyof typeof triggerColors] || "bg-gray-100 text-gray-800"}>
            {triggerType}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {triggerType === "spend" ? `$${triggerValue}` : triggerValue}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "rewardType",
    header: "Reward",
    cell: ({ row }) => {
      const rewardType = row.getValue("rewardType") as string;
      const rewardValue = row.original.rewardValue;
      const rewardColors = {
        points: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        discount: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        free_item: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        upgrade: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      };
      return (
        <div className="space-y-1">
          <Badge className={rewardColors[rewardType as keyof typeof rewardColors] || "bg-gray-100 text-gray-800"}>
            {rewardType.replace('_', ' ')}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {rewardType === "discount" ? `${rewardValue}%` : rewardValue}
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
          Times Used
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const usageCount = row.getValue("usageCount") as number;
      return (
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{usageCount}</span>
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
      const rule = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rule.id)}>
              Copy rule ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(rule)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(rule.id)}
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
