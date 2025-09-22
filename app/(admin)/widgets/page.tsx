"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Copy, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
import { widgetsApi, Widget } from "@/lib/api/widgets";
import { createWidgetSchema, updateWidgetSchema, WidgetType } from "@/lib/validation/widgets";
import { columns } from "./columns";
import { WidgetBuilderModal } from "./widget-builder-modal";
import { WidgetPreviewModal } from "./widget-preview-modal";

export default function WidgetsPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [previewingWidget, setPreviewingWidget] = useState<Widget | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
  });

  const queryClient = useQueryClient();

  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ["widgets"],
    queryFn: widgetsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: widgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget created successfully");
      setIsBuilderOpen(false);
    },
    onError: () => {
      toast.error("Failed to create widget");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => widgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget updated successfully");
      setEditingWidget(null);
    },
    onError: () => {
      toast.error("Failed to update widget");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: widgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete widget");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: widgetsApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      toast.success("Widget status updated");
    },
    onError: () => {
      toast.error("Failed to update widget status");
    },
  });

  const copyEmbedCodeMutation = useMutation({
    mutationFn: widgetsApi.generateEmbedCode,
    onSuccess: (embedCode) => {
      navigator.clipboard.writeText(embedCode);
      toast.success("Embed code copied to clipboard");
    },
    onError: () => {
      toast.error("Failed to copy embed code");
    },
  });

  // Filter widgets based on current filters
  const filteredWidgets = widgets.filter((widget) => {
    const matchesSearch = 
      widget.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      widget.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || widget.type === filters.type;
    const matchesStatus = !filters.status || 
      (filters.status === "active" && widget.isActive) ||
      (filters.status === "inactive" && !widget.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingWidget) {
      updateMutation.mutate({ id: editingWidget.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this widget?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate(id);
  };

  const handleCopyEmbedCode = (id: string) => {
    copyEmbedCodeMutation.mutate(id);
  };

  const handlePreview = (widget: Widget) => {
    setPreviewingWidget(widget);
  };

  const tableColumns = columns({
    onEdit: setEditingWidget,
    onDelete: handleDelete,
    onToggleActive: handleToggleActive,
    onCopyEmbedCode: handleCopyEmbedCode,
    onPreview: handlePreview,
  });

  // Calculate total metrics
  const totalViews = widgets.reduce((sum, widget) => sum + widget.usage.views, 0);
  const totalClicks = widgets.reduce((sum, widget) => sum + widget.usage.clicks, 0);
  const totalConversions = widgets.reduce((sum, widget) => sum + widget.usage.conversions, 0);
  const activeWidgets = widgets.filter(w => w.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Widget Builder</h1>
          <p className="text-muted-foreground">
            Create and manage embeddable widgets for your website
          </p>
        </div>
        <Button onClick={() => setIsBuilderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Widget
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search widgets..."
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
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="menu">Menu</SelectItem>
            <SelectItem value="property_grid">Property Grid</SelectItem>
            <SelectItem value="reviews">Reviews</SelectItem>
            <SelectItem value="contact_form">Contact Form</SelectItem>
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ search: "", type: "", status: "" })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Widgets</CardTitle>
            <div className="h-4 w-4 rounded-full bg-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgets.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeWidgets} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all widgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0}% CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              {totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0}% rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={filteredWidgets}
        searchKey="name"
        searchPlaceholder="Search widgets..."
      />

      {/* Widget Builder Modal */}
      <WidgetBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Widget Preview Modal */}
      {previewingWidget && (
        <WidgetPreviewModal
          widget={previewingWidget}
          isOpen={!!previewingWidget}
          onClose={() => setPreviewingWidget(null)}
        />
      )}

      {/* Edit Widget Form */}
      {editingWidget && (
        <DrawerForm
          isOpen={!!editingWidget}
          onClose={() => setEditingWidget(null)}
          title="Edit Widget"
          description="Update widget settings"
          schema={updateWidgetSchema}
          defaultValues={editingWidget}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Widget Name</label>
                <Input {...form.register("name")} placeholder="My Widget" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register("description")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Widget description..."
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={form.watch("isActive") ? "active" : "inactive"}
                  onValueChange={(value) => form.setValue("isActive", value === "active")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
