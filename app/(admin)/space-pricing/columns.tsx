"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, DollarSign, Clock, Calendar, Star } from "lucide-react";
import { SpacePricingRule } from "@/lib/api/space";

interface ColumnsProps {
  onEdit: (space: any) => void;
}

export const columns = ({ onEdit }: ColumnsProps): ColumnDef<any>[] => [
  {
    accessorKey: "spaceTitle",
    header: "Space",
    cell: ({ row }) => {
      const spaceTitle = row.getValue("spaceTitle") as string;
      return (
        <div className="font-medium">{spaceTitle}</div>
      );
    },
  },
  {
    accessorKey: "kind",
    header: "Type",
    cell: ({ row }) => {
      const kind = row.getValue("kind") as string;
      const variant = 
        kind === "HOURLY" ? "default" :
        kind === "DAILY" ? "secondary" :
        kind === "PEAK" ? "destructive" :
        kind === "CLEANING_FEE" ? "outline" :
        "secondary";
      
      const icon = 
        kind === "HOURLY" ? Clock :
        kind === "DAILY" ? Calendar :
        kind === "PEAK" ? Star :
        DollarSign;
      
      const Icon = icon;
      
      return (
        <Badge variant={variant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {kind.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const currency = row.original.currency;
      return (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{amount}</span>
          <span className="text-sm text-muted-foreground">{currency}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dow",
    header: "Days of Week",
    cell: ({ row }) => {
      const dow = row.getValue("dow") as number[];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      if (dow.length === 0) {
        return <span className="text-muted-foreground">All days</span>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {dow.map(day => (
            <Badge key={day} variant="outline" className="text-xs">
              {dayNames[day]}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "startHour",
    header: "Time Range",
    cell: ({ row }) => {
      const startHour = row.getValue("startHour") as number | undefined;
      const endHour = row.original.endHour as number | undefined;
      
      if (!startHour || !endHour) {
        return <span className="text-muted-foreground">All hours</span>;
      }
      
      const formatHour = (hour: number) => {
        if (hour === 0) return "12 AM";
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return "12 PM";
        return `${hour - 12} PM`;
      };
      
      return (
        <div className="text-sm">
          {formatHour(startHour)} - {formatHour(endHour)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const space = {
        id: row.original.spaceId,
        title: row.original.spaceTitle,
        slug: row.original.spaceSlug,
      };
      
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(space)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      );
    },
  },
];
