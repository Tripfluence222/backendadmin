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
import ListingTypeForm from "./components/ListingTypeForm";

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
                         (listing.description && listing.description.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesType = !filters.type || filters.type === "all" || listing.type === filters.type;
    const matchesStatus = !filters.status || filters.status === "all" || listing.status === filters.status;
    const matchesLocation = !filters.location || 
                           (listing.locationCity && listing.locationCity.toLowerCase().includes(filters.location.toLowerCase())) ||
                           (listing.locationCountry && listing.locationCountry.toLowerCase().includes(filters.location.toLowerCase()));
    
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
            <SelectItem value="RESTAURANT">Restaurant</SelectItem>
            <SelectItem value="RETREAT">Retreat</SelectItem>
            <SelectItem value="EVENT">Event</SelectItem>
            <SelectItem value="ACTIVITY">Activity</SelectItem>
            <SelectItem value="PROPERTY">Property</SelectItem>
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
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
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
            {listings.filter(l => l.status === "PUBLISHED").length}
          </div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {listings.filter(l => l.status === "DRAFT").length}
          </div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {listings.filter(l => l.status === "ARCHIVED").length}
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
        {(form) => <ListingTypeForm />}
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
          {(form) => <ListingTypeForm />}
        </DrawerForm>
      )}
    </div>
  );
}
