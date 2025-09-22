"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
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
import { eventSyncApi, EventSync, ConnectedPlatform, SyncMetrics } from "@/lib/api/event-sync";
import { createEventSyncSchema, updateEventSyncSchema, connectPlatformSchema } from "@/lib/validation/event-sync";
import { columns } from "./columns";
import { PlatformConnectionModal } from "./platform-connection-modal";

export default function EventSyncPage() {
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventSync | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    platform: "",
    status: "",
  });

  const queryClient = useQueryClient();

  const { data: eventSyncs = [] } = useQuery({
    queryKey: ["event-syncs"],
    queryFn: eventSyncApi.getAllEventSyncs,
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ["connected-platforms"],
    queryFn: eventSyncApi.getConnectedPlatforms,
  });

  const { data: metrics } = useQuery({
    queryKey: ["sync-metrics"],
    queryFn: eventSyncApi.getSyncMetrics,
  });

  const createMutation = useMutation({
    mutationFn: eventSyncApi.createEventSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-syncs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-metrics"] });
      toast.success("Event sync created successfully");
    },
    onError: () => {
      toast.error("Failed to create event sync");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventSyncApi.updateEventSync(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-syncs"] });
      toast.success("Event sync updated successfully");
    },
    onError: () => {
      toast.error("Failed to update event sync");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: eventSyncApi.deleteEventSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-syncs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-metrics"] });
      toast.success("Event sync deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete event sync");
    },
  });

  const syncMutation = useMutation({
    mutationFn: eventSyncApi.syncEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-syncs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-metrics"] });
      toast.success("Event synced successfully");
    },
    onError: () => {
      toast.error("Failed to sync event");
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: eventSyncApi.syncAllEvents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-syncs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-metrics"] });
      toast.success("All events synced successfully");
    },
    onError: () => {
      toast.error("Failed to sync all events");
    },
  });

  const connectPlatformMutation = useMutation({
    mutationFn: eventSyncApi.connectPlatform,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-platforms"] });
      toast.success("Platform connected successfully");
      setIsConnectionModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to connect platform");
    },
  });

  // Filter event syncs based on current filters
  const filteredEventSyncs = eventSyncs.filter((eventSync) => {
    const matchesSearch = 
      eventSync.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      eventSync.platformEventId.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPlatform = !filters.platform || eventSync.platform === filters.platform;
    const matchesStatus = !filters.status || eventSync.status === filters.status;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event sync?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSync = (id: string) => {
    syncMutation.mutate(id);
  };

  const handleSyncAll = () => {
    syncAllMutation.mutate();
  };

  const handleConnectPlatform = (data: any) => {
    connectPlatformMutation.mutate(data);
  };

  const tableColumns = columns({
    onEdit: setEditingEvent,
    onDelete: handleDelete,
    onSync: handleSync,
  });

  const connectedPlatforms = platforms.filter(platform => platform.status === "connected");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Sync Manager</h1>
          <p className="text-muted-foreground">
            Sync your events across external platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsConnectionModalOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Connect Platform
          </Button>
          <Button variant="outline" onClick={handleSyncAll} disabled={syncAllMutation.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Button onClick={() => setEditingEvent({} as EventSync)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {connectedPlatforms.map((platform) => (
          <Card key={platform.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{platform.accountName}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {platform.platform.replace('_', ' ')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                  {platform.autoSync && (
                    <Badge variant="secondary" className="text-xs">
                      Auto Sync
                    </Badge>
                  )}
                </div>
              </div>
              {platform.lastSyncAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last sync: {new Date(platform.lastSyncAt).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <div className="h-4 w-4 rounded-full bg-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Synced</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.syncedEvents}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalEvents > 0 ? Math.round((metrics.syncedEvents / metrics.totalEvents) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.pendingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting sync
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.failedEvents}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platforms</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.platformsConnected}</div>
              <p className="text-xs text-muted-foreground">
                Connected platforms
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.platform}
          onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="facebook_events">Facebook Events</SelectItem>
            <SelectItem value="google_business">Google Business</SelectItem>
            <SelectItem value="eventbrite">Eventbrite</SelectItem>
            <SelectItem value="meetup">Meetup</SelectItem>
            <SelectItem value="airbnb_experiences">Airbnb Experiences</SelectItem>
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
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
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

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={filteredEventSyncs}
        searchKey="title"
        searchPlaceholder="Search events..."
      />

      {/* Platform Connection Modal */}
      <PlatformConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        onSubmit={handleConnectPlatform}
        isLoading={connectPlatformMutation.isPending}
      />

      {/* Edit Event Form */}
      {editingEvent && (
        <DrawerForm
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          title={editingEvent.id ? "Edit Event Sync" : "Create Event Sync"}
          description="Manage event synchronization settings"
          schema={editingEvent.id ? updateEventSyncSchema : createEventSyncSchema}
          defaultValues={editingEvent.id ? editingEvent : undefined}
          onSubmit={editingEvent.id ? handleUpdate : handleCreate}
          isLoading={editingEvent.id ? updateMutation.isPending : createMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Platform</label>
                <Select onValueChange={(value) => form.setValue("platform", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook_events">Facebook Events</SelectItem>
                    <SelectItem value="google_business">Google Business</SelectItem>
                    <SelectItem value="eventbrite">Eventbrite</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="airbnb_experiences">Airbnb Experiences</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.platform && (
                  <p className="text-sm text-red-500">{form.formState.errors.platform.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Platform Event ID</label>
                <Input {...form.register("platformEventId")} placeholder="External event ID" />
                {form.formState.errors.platformEventId && (
                  <p className="text-sm text-red-500">{form.formState.errors.platformEventId.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input {...form.register("title")} placeholder="Event title" />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register("description")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Event description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    {...form.register("startDate", { valueAsDate: true })} 
                    type="datetime-local"
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    {...form.register("endDate", { valueAsDate: true })} 
                    type="datetime-local"
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input {...form.register("location")} placeholder="Event location" />
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input 
                    {...form.register("capacity", { valueAsNumber: true })} 
                    type="number" 
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input 
                    {...form.register("price", { valueAsNumber: true })} 
                    type="number" 
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">External URL</label>
                  <Input {...form.register("externalUrl")} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
