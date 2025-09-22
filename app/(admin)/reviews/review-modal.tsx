"use client";

import { format } from "date-fns";
import { 
  Star, 
  User, 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Flag, 
  MessageSquare, 
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Review } from "@/lib/api/reviews";

interface ReviewModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
  onModerate: (id: string, status: string, reason?: string) => void;
  onReply: (review: Review) => void;
  onDelete: (id: string) => void;
}

export function ReviewModal({ 
  review, 
  isOpen, 
  onClose, 
  onModerate, 
  onReply, 
  onDelete 
}: ReviewModalProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      flagged: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Details</span>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(review.status)}>
                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
              </Badge>
              {review.isVerified && (
                <Badge variant="default">Verified</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Content */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{review.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {review.rating} out of 5 stars
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm leading-relaxed">{review.content}</p>
            </div>

            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {review.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="font-medium">{review.customerName}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{review.customerEmail}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing</label>
                  <div className="font-medium">{review.listingTitle}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Review Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {format(new Date(review.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Review Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {review.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Image {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply */}
          {review.reply && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Business Reply
                {review.reply.isPublic ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </h3>
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <p className="text-sm leading-relaxed">{review.reply.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-muted-foreground">
                    Replied by {review.reply.createdBy}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(review.reply.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Moderator Notes */}
          {review.moderatorNotes && (
            <div className="space-y-4">
              <h3 className="font-semibold">Moderator Notes</h3>
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <p className="text-sm">{review.moderatorNotes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="font-semibold">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <div className="text-sm">
                  {format(new Date(review.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="text-sm">
                  {format(new Date(review.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {review.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onModerate(review.id, "approved")}
                    className="text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onModerate(review.id, "rejected")}
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {review.status === "flagged" && (
                <Button
                  variant="outline"
                  onClick={() => onModerate(review.id, "approved")}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {review.status === "approved" && (
                <Button
                  variant="outline"
                  onClick={() => onModerate(review.id, "flagged")}
                  className="text-orange-600"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Flag
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {!review.reply && (
                <Button variant="outline" onClick={() => onReply(review)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => onDelete(review.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
