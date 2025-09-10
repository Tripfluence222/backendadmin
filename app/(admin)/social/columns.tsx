"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Send, Calendar, Instagram, Facebook, MessageSquare, Share2 } from "lucide-react";
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
import { SocialPost } from "@/lib/api/social";

interface ColumnsProps {
  onEdit: (post: SocialPost) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}

export const columns = ({ onEdit, onDelete, onPublish }: ColumnsProps): ColumnDef<SocialPost>[] => [
  {
    accessorKey: "content",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Content
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const content = row.getValue("content") as string;
      const hashtags = row.original.hashtags;
      return (
        <div className="space-y-1 max-w-[300px]">
          <div className="text-sm truncate">{content}</div>
          {hashtags && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {hashtags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{hashtags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "platforms",
    header: "Platforms",
    cell: ({ row }) => {
      const platforms = row.getValue("platforms") as string[];
      return (
        <div className="flex items-center gap-1">
          {platforms.map((platform) => {
            const icons = {
              instagram: <Instagram className="h-4 w-4 text-pink-600" />,
              facebook: <Facebook className="h-4 w-4 text-blue-600" />,
              tiktok: <MessageSquare className="h-4 w-4 text-black" />,
              google_business: <Share2 className="h-4 w-4 text-green-600" />,
            };
            return (
              <div key={platform} title={platform}>
                {icons[platform as keyof typeof icons]}
              </div>
            );
          })}
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
        draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "scheduledAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Scheduled
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const scheduledAt = row.getValue("scheduledAt") as string;
      const publishedAt = row.original.publishedAt;
      const date = scheduledAt || publishedAt;
      
      if (!date) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="text-sm">
          {format(new Date(date), "MMM dd, yyyy")}
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "h:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "analytics",
    header: "Performance",
    cell: ({ row }) => {
      const analytics = row.getValue("analytics") as SocialPost["analytics"];
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{analytics.impressions.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {analytics.clicks} clicks, {analytics.likes} likes
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
      const post = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>
              Copy post ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {post.status === "draft" && (
              <DropdownMenuItem onClick={() => onPublish(post.id)}>
                <Send className="mr-2 h-4 w-4" />
                Publish Now
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(post.id)}
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
