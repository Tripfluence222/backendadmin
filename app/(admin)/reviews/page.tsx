"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, CheckCircle, XCircle, Flag, Star, MessageSquare, BarChart3 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { DrawerForm } from "@/components/forms/drawer-form";
import { reviewsApi, Review, ReviewMetrics } from "@/lib/api/reviews";
import { listingsApi } from "@/lib/api/listings";
import { moderateReviewSchema, replyToReviewSchema } from "@/lib/validation/reviews";
import { columns } from "./columns";
import { ReviewModal } from "./review-modal";

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    listingId: "",
    rating: "",
  });

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: reviewsApi.getAll,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: listingsApi.getAll,
  });

  const { data: metrics } = useQuery({
    queryKey: ["review-metrics"],
    queryFn: reviewsApi.getMetrics,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reviewsApi.moderate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review-metrics"] });
      toast.success("Review moderated successfully");
    },
    onError: () => {
      toast.error("Failed to moderate review");
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reviewsApi.reply(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Reply added successfully");
      setReplyingReview(null);
    },
    onError: () => {
      toast.error("Failed to add reply");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review-metrics"] });
      toast.success("Review deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });

  // Filter reviews based on current filters
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      review.content.toLowerCase().includes(filters.search.toLowerCase()) ||
      review.customerName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || review.status === filters.status;
    const matchesListing = !filters.listingId || review.listingId === filters.listingId;
    const matchesRating = !filters.rating || review.rating.toString() === filters.rating;
    
    return matchesSearch && matchesStatus && matchesListing && matchesRating;
  });

  const handleModerate = (id: string, status: string, reason?: string) => {
    moderateMutation.mutate({ 
      id, 
      data: { 
        status, 
        reason,
        moderatorNotes: reason 
      } 
    });
  };

  const handleReply = (data: any) => {
    if (replyingReview) {
      replyMutation.mutate({ id: replyingReview.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
  };

  const tableColumns = columns({
    onView: handleViewReview,
    onModerate: handleModerate,
    onReply: setReplyingReview,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Moderation</h1>
          <p className="text-muted-foreground">
            Manage customer reviews and moderation queue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search reviews..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.listingId}
          onValueChange={(value) => setFilters(prev => ({ ...prev, listingId: value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Listing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            {listings.map((listing) => (
              <SelectItem key={listing.id} value={listing.id}>
                {listing.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.rating}
          onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ search: "", status: "", listingId: "", rating: "" })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                Average: {metrics.averageRating}/5
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.approvedReviews}</div>
              <p className="text-xs text-muted-foreground">
                Live reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.rejectedReviews}</div>
              <p className="text-xs text-muted-foreground">
                Not published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.verifiedReviews}</div>
              <p className="text-xs text-muted-foreground">
                Verified purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{reviews.filter(r => r.status === "flagged").length}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of reviews by star rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = metrics.ratingDistribution[rating as keyof typeof metrics.ratingDistribution];
                const percentage = metrics.totalReviews > 0 ? (count / metrics.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={filteredReviews}
        searchKey="title"
        searchPlaceholder="Search reviews..."
      />

      {/* Review Details Modal */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          onModerate={handleModerate}
          onReply={setReplyingReview}
          onDelete={handleDelete}
        />
      )}

      {/* Reply to Review Form */}
      {replyingReview && (
        <DrawerForm
          isOpen={!!replyingReview}
          onClose={() => setReplyingReview(null)}
          title="Reply to Review"
          description={`Reply to ${replyingReview.customerName}'s review`}
          schema={replyToReviewSchema}
          defaultValues={{ reply: "", isPublic: true }}
          onSubmit={handleReply}
          isLoading={replyMutation.isPending}
          submitLabel="Send Reply"
        >
          {(form) => (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{replyingReview.customerName}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < replyingReview.rating 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{replyingReview.content}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Your Reply</label>
                <textarea
                  {...form.register("reply")}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Write your reply to this review..."
                />
                {form.formState.errors.reply && (
                  <p className="text-sm text-red-500">{form.formState.errors.reply.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...form.register("isPublic")}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Make this reply public (visible to customers)
                </label>
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
