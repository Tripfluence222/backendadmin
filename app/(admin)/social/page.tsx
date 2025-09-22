"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, BarChart3, Share2, Instagram, Facebook, MessageSquare, Settings } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";

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
import { socialApi, SocialPost, SocialAccount, SocialAnalyticsSummary } from "@/lib/api/social";
import { createSocialPostSchema, updateSocialPostSchema, connectAccountSchema } from "@/lib/validation/social";
import { columns } from "./columns";
import { PostComposerModal } from "./post-composer-modal";
import { AccountConnectionModal } from "./account-connection-modal";

export default function SocialPage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    search: "",
    platform: "",
    status: "",
  });

  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ["social-posts"],
    queryFn: socialApi.getAllPosts,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: socialApi.getAccounts,
  });

  const { data: analytics } = useQuery({
    queryKey: ["social-analytics"],
    queryFn: socialApi.getAnalyticsSummary,
  });

  const createMutation = useMutation({
    mutationFn: socialApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["social-analytics"] });
      toast.success("Post created successfully");
      setIsComposerOpen(false);
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => socialApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      toast.success("Post updated successfully");
      setEditingPost(null);
    },
    onError: () => {
      toast.error("Failed to update post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: socialApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["social-analytics"] });
      toast.success("Post deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const publishMutation = useMutation({
    mutationFn: socialApi.publishPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["social-analytics"] });
      toast.success("Post published successfully");
    },
    onError: () => {
      toast.error("Failed to publish post");
    },
  });

  const connectAccountMutation = useMutation({
    mutationFn: socialApi.connectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Account connected successfully");
      setIsAccountModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to connect account");
    },
  });

  // Filter posts based on current filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.content.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPlatform = !filters.platform || post.platforms.includes(filters.platform as any);
    const matchesStatus = !filters.status || post.status === filters.status;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => {
      if (post.scheduledAt) {
        return isSameDay(new Date(post.scheduledAt), date);
      }
      if (post.publishedAt) {
        return isSameDay(new Date(post.publishedAt), date);
      }
      return false;
    });
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate(id);
  };

  const handleConnectAccount = (data: any) => {
    connectAccountMutation.mutate(data);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const tableColumns = columns({
    onEdit: setEditingPost,
    onDelete: handleDelete,
    onPublish: handlePublish,
  });

  const connectedAccounts = accounts.filter(account => account.isConnected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Hub</h1>
          <p className="text-muted-foreground">
            Manage your social media presence and content calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAccountModalOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
          <Button onClick={() => setIsComposerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {connectedAccounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {account.platform === "instagram" && <Instagram className="h-5 w-5" />}
                  {account.platform === "facebook" && <Facebook className="h-5 w-5" />}
                  {account.platform === "tiktok" && <MessageSquare className="h-5 w-5" />}
                  {account.platform === "google_business" && <Share2 className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-medium">{account.accountName}</div>
                  <div className="text-sm text-muted-foreground">{account.accountHandle}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                Published posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.engagementRate}% engagement rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {analytics.totalBookings} bookings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                Schedule and manage your social media posts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                ← Previous
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                Next →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 border rounded-lg">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-sm bg-muted">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayPosts = getPostsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border ${
                    isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayPosts.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayPosts.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={`p-1 rounded text-xs cursor-pointer ${
                          post.status === "published" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : post.status === "scheduled"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                      >
                        <div className="truncate">{post.content.substring(0, 30)}...</div>
                        <div className="flex items-center gap-1">
                          {post.platforms.map((platform) => (
                            <div key={platform} className="text-xs">
                              {platform === "instagram" && "📷"}
                              {platform === "facebook" && "📘"}
                              {platform === "tiktok" && "🎵"}
                              {platform === "google_business" && "🏢"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayPosts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search posts..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.platform}
          onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="google_business">Google Business</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ search: "", platform: "", status: "" })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Posts Table */}
      <DataTable
        columns={tableColumns}
        data={filteredPosts}
        searchKey="content"
        searchPlaceholder="Search posts..."
      />

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Account Connection Modal */}
      <AccountConnectionModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleConnectAccount}
        isLoading={connectAccountMutation.isPending}
      />

      {/* Edit Post Form */}
      {editingPost && (
        <DrawerForm
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          title="Edit Post"
          description="Update post content and settings"
          schema={updateSocialPostSchema}
          defaultValues={editingPost}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  {...form.register("content")}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Write your post content..."
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Platforms</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["instagram", "facebook", "tiktok", "google_business"].map((platform) => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={form.watch("platforms")?.includes(platform)}
                        onChange={(e) => {
                          const currentPlatforms = form.getValues("platforms") || [];
                          if (e.target.checked) {
                            form.setValue("platforms", [...currentPlatforms, platform]);
                          } else {
                            form.setValue("platforms", currentPlatforms.filter(p => p !== platform));
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{platform.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Hashtags (Optional)</label>
                <Input 
                  {...form.register("hashtags")} 
                  placeholder="#yoga #wellness #retreat"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate hashtags with spaces
                </p>
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
