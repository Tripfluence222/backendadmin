"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, CheckCircle, XCircle, Flag, MessageSquare, Trash2, Star } from "lucide-react";
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
import { Review } from "@/lib/api/reviews";

interface ColumnsProps {
  onView: (review: Review) => void;
  onModerate: (id: string, status: string, reason?: string) => void;
  onReply: (review: Review) => void;
  onDelete: (id: string) => void;
}

export const columns = ({ onView, onModerate, onReply, onDelete }: ColumnsProps): ColumnDef<Review>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Review
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const content = row.original.content;
      const customerName = row.original.customerName;
      return (
        <div className="space-y-1 max-w-[300px]">
          <div className="font-medium truncate">{title}</div>
          <div className="text-sm text-muted-foreground truncate">{content}</div>
          <div className="text-xs text-muted-foreground">by {customerName}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "listingTitle",
    header: "Listing",
    cell: ({ row }) => {
      const listingTitle = row.getValue("listingTitle") as string;
      return (
        <div className="max-w-[200px] truncate">
          {listingTitle}
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium">({rating})</span>
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
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        flagged: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: "Verified",
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified") as boolean;
      return (
        <Badge variant={isVerified ? "default" : "secondary"}>
          {isVerified ? "Verified" : "Unverified"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reply",
    header: "Reply",
    cell: ({ row }) => {
      const reply = row.original.reply;
      if (!reply) return <span className="text-muted-foreground">No reply</span>;
      return (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Replied</span>
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
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          {format(new Date(date), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const review = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(review.id)}>
              Copy review ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(review)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {!review.reply && (
              <DropdownMenuItem onClick={() => onReply(review)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {review.status === "pending" && (
              <>
                <DropdownMenuItem onClick={() => onModerate(review.id, "approved")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onModerate(review.id, "rejected")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {review.status === "flagged" && (
              <DropdownMenuItem onClick={() => onModerate(review.id, "approved")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
            {review.status === "approved" && (
              <DropdownMenuItem onClick={() => onModerate(review.id, "flagged")}>
                <Flag className="mr-2 h-4 w-4" />
                Flag
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(review.id)}
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
