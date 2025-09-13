"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Eye, Edit, Trash2, Archive, Globe, FileText } from "lucide-react";
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
import { spaceApi, Space } from "@/lib/api/space";
import { SpaceCreateSchema, SpaceUpdateSchema } from "@/lib/validation/space";
import { columns } from "./columns";
import { SpaceForm } from "./space-form";
import { SpaceStats } from "./space-stats";

export default function SpacesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    city: "",
  });

  const queryClient = useQueryClient();

  // Fetch spaces
  const { data: spacesData, isLoading } = useQuery({
    queryKey: ["spaces", filters],
    queryFn: () => spaceApi.list({
      q: filters.search || undefined,
      status: filters.status === "all" ? undefined : filters.status as any,
      city: filters.city || undefined,
    }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["space-stats"],
    queryFn: () => spaceApi.getStats(),
  });

  // Create space mutation
  const createMutation = useMutation({
    mutationFn: spaceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["space-stats"] });
      setIsCreateOpen(false);
      toast.success("Space created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create space");
    },
  });

  // Update space mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => spaceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["space-stats"] });
      setIsEditOpen(false);
      setEditingSpace(null);
      toast.success("Space updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update space");
    },
  });

  // Delete space mutation
  const deleteMutation = useMutation({
    mutationFn: spaceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["space-stats"] });
      toast.success("Space deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete space");
    },
  });

  // Publish space mutation
  const publishMutation = useMutation({
    mutationFn: spaceApi.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["space-stats"] });
      toast.success("Space published successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to publish space");
    },
  });

  // Archive space mutation
  const archiveMutation = useMutation({
    mutationFn: spaceApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["space-stats"] });
      toast.success("Space archived successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to archive space");
    },
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (space: Space) => {
    setEditingSpace(space);
    setIsEditOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (editingSpace) {
      updateMutation.mutate({ id: editingSpace.id, data });
    }
  };

  const handleDelete = (space: Space) => {
    if (confirm(`Are you sure you want to delete "${space.title}"?`)) {
      deleteMutation.mutate(space.id);
    }
  };

  const handlePublish = (space: Space) => {
    publishMutation.mutate(space.id);
  };

  const handleArchive = (space: Space) => {
    archiveMutation.mutate(space.id);
  };

  const tableColumns = columns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onPublish: handlePublish,
    onArchive: handleArchive,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Space Management</h1>
          <p className="text-muted-foreground">
            Manage your rental spaces, pricing, and availability
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Space
        </Button>
      </div>

      {/* Stats */}
      {stats && <SpaceStats stats={stats} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search spaces..."
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
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="City..."
          value={filters.city}
          onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          className="w-40"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Spaces</CardTitle>
          <CardDescription>
            Manage your rental spaces and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            data={spacesData?.spaces || []}
            isLoading={isLoading}
            pagination={{
              page: spacesData?.page || 1,
              limit: spacesData?.limit || 20,
              total: spacesData?.total || 0,
            }}
          />
        </CardContent>
      </Card>

      {/* Create Space Form */}
      <DrawerForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Space"
        description="Add a new rental space to your business"
        schema={SpaceCreateSchema}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      >
        {(form) => (
          <SpaceForm
            schema={SpaceCreateSchema}
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        )}
      </DrawerForm>

      {/* Edit Space Form */}
      <DrawerForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingSpace(null);
        }}
        title="Edit Space"
        description="Update space information and settings"
        schema={SpaceUpdateSchema}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      >
        {(form) => editingSpace && (
          <SpaceForm
            schema={SpaceUpdateSchema}
            defaultValues={editingSpace}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
          />
        )}
      </DrawerForm>
    </div>
  );
}
