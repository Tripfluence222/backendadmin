"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Archive, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { DrawerForm } from "@/components/forms/drawer-form";
import { listingsApi, Listing } from "@/lib/api/listings";
import { createListingSchema, updateListingSchema, ListingType, ListingStatus } from "@/lib/validation/listings";
import { columns } from "./columns";

export default function ListingsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    location: "",
  });

  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: listingsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing created successfully");
      setIsCreateOpen(false);
    },
    onError: () => {
      toast.error("Failed to create listing");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => listingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing updated successfully");
      setEditingListing(null);
    },
    onError: () => {
      toast.error("Failed to update listing");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: listingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete listing");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: listingsApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing archived successfully");
    },
    onError: () => {
      toast.error("Failed to archive listing");
    },
  });

  // Filter listings based on current filters
  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         listing.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || listing.type === filters.type;
    const matchesStatus = !filters.status || listing.status === filters.status;
    const matchesLocation = !filters.location || listing.location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingListing) {
      updateMutation.mutate({ id: editingListing.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this listing?")) {
      archiveMutation.mutate(id);
    }
  };

  const tableColumns = columns({
    onEdit: setEditingListing,
    onDelete: handleDelete,
    onArchive: handleArchive,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listings Manager</h1>
          <p className="text-muted-foreground">
            Manage your listings, events, and properties
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search listings..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="retreat">Retreat</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="property">Property</SelectItem>
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          className="w-48"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ search: "", type: "", status: "", location: "" })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{listings.length}</div>
          <div className="text-sm text-muted-foreground">Total Listings</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {listings.filter(l => l.status === "published").length}
          </div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {listings.filter(l => l.status === "draft").length}
          </div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {listings.filter(l => l.status === "archived").length}
          </div>
          <div className="text-sm text-muted-foreground">Archived</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={filteredListings}
        searchKey="title"
        searchPlaceholder="Search listings..."
      />

      {/* Create Listing Form */}
      <DrawerForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Listing"
        description="Add a new listing to your platform"
        schema={createListingSchema}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      >
        {(form) => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input {...form.register("title")} placeholder="Listing title" />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select onValueChange={(value) => form.setValue("type", value as ListingType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="retreat">Retreat</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...form.register("description")}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Describe your listing..."
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input {...form.register("category")} placeholder="e.g., Wellness, Culinary" />
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input {...form.register("location")} placeholder="City, State/Country" />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input {...form.register("slug")} placeholder="url-friendly-slug" />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select onValueChange={(value) => form.setValue("status", value as ListingStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Input {...form.register("metaDescription")} placeholder="SEO description (optional)" />
              {form.formState.errors.metaDescription && (
                <p className="text-sm text-red-500">{form.formState.errors.metaDescription.message}</p>
              )}
            </div>
          </div>
        )}
      </DrawerForm>

      {/* Edit Listing Form */}
      {editingListing && (
        <DrawerForm
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          title="Edit Listing"
          description="Update listing information"
          schema={updateListingSchema}
          defaultValues={editingListing}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input {...form.register("title")} placeholder="Listing title" />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select onValueChange={(value) => form.setValue("type", value as ListingType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="retreat">Retreat</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register("description")}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Describe your listing..."
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input {...form.register("category")} placeholder="e.g., Wellness, Culinary" />
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input {...form.register("location")} placeholder="City, State/Country" />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input {...form.register("slug")} placeholder="url-friendly-slug" />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select onValueChange={(value) => form.setValue("status", value as ListingStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Meta Description</label>
                <Input {...form.register("metaDescription")} placeholder="SEO description (optional)" />
                {form.formState.errors.metaDescription && (
                  <p className="text-sm text-red-500">{form.formState.errors.metaDescription.message}</p>
                )}
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
