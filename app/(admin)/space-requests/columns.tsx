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
import { Eye, CheckCircle, XCircle, MessageSquare, DollarSign, MoreHorizontal, Calendar, Users } from "lucide-react";
import { SpaceRequest } from "@/lib/api/space";
import { format } from "date-fns";

interface ColumnsProps {
  onViewDetails: (request: SpaceRequest) => void;
  onQuote: (request: SpaceRequest) => void;
  onApprove: (request: SpaceRequest) => void;
  onDecline: (request: SpaceRequest) => void;
}

export const columns = ({ onViewDetails, onQuote, onApprove, onDecline }: ColumnsProps): ColumnDef<SpaceRequest>[] => [
  {
    accessorKey: "title",
    header: "Request",
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{request.title}</div>
          <div className="text-sm text-muted-foreground">
            {request.organizerName} • {request.organizerEmail}
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
      const variant = 
        status === "CONFIRMED" ? "default" :
        status === "PENDING" ? "secondary" :
        status === "NEEDS_PAYMENT" ? "outline" :
        status === "DECLINED" || status === "EXPIRED" || status === "CANCELLED" ? "destructive" :
        "secondary";
      
      return (
        <Badge variant={variant}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "attendees",
    header: "Attendees",
    cell: ({ row }) => {
      const attendees = row.getValue("attendees") as number;
      return (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          {attendees}
        </div>
      );
    },
  },
  {
    accessorKey: "start",
    header: "Date & Time",
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {format(new Date(request.start), "MMM d, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(request.start), "h:mm a")} - {format(new Date(request.end), "h:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "quoteAmount",
    header: "Quote",
    cell: ({ row }) => {
      const request = row.original;
      if (!request.quoteAmount) {
        return <span className="text-muted-foreground">No quote</span>;
      }
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {request.quoteAmount}
          </div>
          {request.depositAmount && (
            <div className="text-xs text-muted-foreground">
              Deposit: ${request.depositAmount}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "messages",
    header: "Messages",
    cell: ({ row }) => {
      const request = row.original;
      const messageCount = request.messages?.length || 0;
      return (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          {messageCount}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Requested",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "MMM d, yyyy");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const request = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(request)}
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
              {request.status === "PENDING" && (
                <>
                  <DropdownMenuItem onClick={() => onQuote(request)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Send Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onApprove(request)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDecline(request)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </DropdownMenuItem>
                </>
              )}
              
              {request.status === "NEEDS_PAYMENT" && (
                <DropdownMenuItem onClick={() => onViewDetails(request)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onViewDetails(request)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
