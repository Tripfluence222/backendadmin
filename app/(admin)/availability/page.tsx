"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, Clock, Users, MapPin, Filter, Download, Upload } from "lucide-react";
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
import { DrawerForm } from "@/components/forms/drawer-form";
import { availabilityApi, AvailabilitySlot } from "@/lib/api/availability";
import { listingsApi } from "@/lib/api/listings";
import { createSlotSchema, updateSlotSchema, bulkCreateSlotsSchema } from "@/lib/validation/availability";
import { SlotModal } from "./slot-modal";

export default function AvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [filters, setFilters] = useState({
    listingId: "",
    view: "month" as "month" | "week",
  });

  const queryClient = useQueryClient();

  const { data: slots = [] } = useQuery({
    queryKey: ["availability", currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: () => {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return availabilityApi.getByDateRange(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: listingsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: availabilityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Slot created successfully");
      setIsCreateOpen(false);
    },
    onError: () => {
      toast.error("Failed to create slot");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => availabilityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Slot updated successfully");
      setEditingSlot(null);
    },
    onError: () => {
      toast.error("Failed to update slot");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: availabilityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Slot deleted successfully");
      setSelectedSlot(null);
    },
    onError: () => {
      toast.error("Failed to delete slot");
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: availabilityApi.bulkCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Slots created successfully");
      setIsBulkCreateOpen(false);
    },
    onError: () => {
      toast.error("Failed to create slots");
    },
  });

  const toggleBlackoutMutation = useMutation({
    mutationFn: availabilityApi.toggleBlackout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Blackout status updated");
    },
    onError: () => {
      toast.error("Failed to update blackout status");
    },
  });

  // Filter slots by listing
  const filteredSlots = filters.listingId 
    ? slots.filter(slot => slot.listingId === filters.listingId)
    : slots;

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    return filteredSlots.filter(slot => isSameDay(new Date(slot.date), date));
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingSlot) {
      updateMutation.mutate({ id: editingSlot.id, data });
    }
  };

  const handleBulkCreate = (data: any) => {
    bulkCreateMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this slot?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleBlackout = (id: string) => {
    toggleBlackoutMutation.mutate(id);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability & Inventory</h1>
          <p className="text-muted-foreground">
            Manage your availability calendar and inventory slots
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkCreateOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Create
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select
          value={filters.listingId}
          onValueChange={(value) => setFilters(prev => ({ ...prev, listingId: value }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Listings" />
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
          value={filters.view}
          onValueChange={(value: "month" | "week") => setFilters(prev => ({ ...prev, view: value }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ listingId: "", view: "month" })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            ← Previous
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            Next →
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export iCal
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import iCal
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 border rounded-lg">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center font-medium text-sm bg-muted">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day) => {
          const daySlots = getSlotsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border border-border ${
                isCurrentMonth ? 'bg-background' : 'bg-muted/50'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </span>
                {daySlots.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {daySlots.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {daySlots.slice(0, 3).map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-1 rounded text-xs cursor-pointer ${
                      slot.isBlackout 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : slot.status === 'booked'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="font-medium truncate">{slot.listingTitle}</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {slot.startTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {slot.booked}/{slot.capacity}
                    </div>
                  </div>
                ))}
                {daySlots.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{daySlots.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSlots.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSlots.filter(s => s.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Open slots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSlots.filter(s => s.status === 'booked').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reserved slots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blacked Out</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSlots.filter(s => s.isBlackout).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unavailable slots
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <SlotModal
          slot={selectedSlot}
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onEdit={setEditingSlot}
          onDelete={handleDelete}
          onToggleBlackout={handleToggleBlackout}
        />
      )}

      {/* Create Slot Form */}
      <DrawerForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Slot"
        description="Add a new availability slot"
        schema={createSlotSchema}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      >
        {(form) => (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Listing</label>
              <Select onValueChange={(value) => form.setValue("listingId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select listing" />
                </SelectTrigger>
                <SelectContent>
                  {listings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.listingId && (
                <p className="text-sm text-red-500">{form.formState.errors.listingId.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Date</label>
              <Input 
                {...form.register("date", { valueAsDate: true })} 
                type="date"
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input {...form.register("startTime")} type="time" />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input {...form.register("endTime")} type="time" />
                {form.formState.errors.endTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Capacity</label>
                <Input 
                  {...form.register("capacity", { valueAsNumber: true })} 
                  type="number" 
                  min="1"
                />
                {form.formState.errors.capacity && (
                  <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Price (Optional)</label>
                <Input 
                  {...form.register("price", { valueAsNumber: true })} 
                  type="number" 
                  step="0.01"
                  min="0"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input {...form.register("location")} placeholder="e.g., Main Hall" />
              </div>
              <div>
                <label className="text-sm font-medium">Room</label>
                <Input {...form.register("room")} placeholder="e.g., Room A" />
              </div>
              <div>
                <label className="text-sm font-medium">Table</label>
                <Input {...form.register("table")} placeholder="e.g., Table 1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                {...form.register("notes")}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )}
      </DrawerForm>

      {/* Bulk Create Form */}
      <DrawerForm
        isOpen={isBulkCreateOpen}
        onClose={() => setIsBulkCreateOpen(false)}
        title="Bulk Create Slots"
        description="Create multiple slots for a date range"
        schema={bulkCreateSlotsSchema}
        onSubmit={handleBulkCreate}
        isLoading={bulkCreateMutation.isPending}
      >
        {(form) => (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Listing</label>
              <Select onValueChange={(value) => form.setValue("listingId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select listing" />
                </SelectTrigger>
                <SelectContent>
                  {listings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.id}>
                      {listing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.listingId && (
                <p className="text-sm text-red-500">{form.formState.errors.listingId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  {...form.register("startDate", { valueAsDate: true })} 
                  type="date"
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  {...form.register("endDate", { valueAsDate: true })} 
                  type="date"
                />
                {form.formState.errors.endDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input {...form.register("startTime")} type="time" />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input {...form.register("endTime")} type="time" />
                {form.formState.errors.endTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Capacity</label>
              <Input 
                {...form.register("capacity", { valueAsNumber: true })} 
                type="number" 
                min="1"
              />
              {form.formState.errors.capacity && (
                <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Days of Week</label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={(e) => {
                        const currentDays = form.getValues("daysOfWeek") || [0, 1, 2, 3, 4, 5, 6];
                        if (e.target.checked) {
                          form.setValue("daysOfWeek", [...currentDays, index]);
                        } else {
                          form.setValue("daysOfWeek", currentDays.filter(d => d !== index));
                        }
                      }}
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </DrawerForm>

      {/* Edit Slot Form */}
      {editingSlot && (
        <DrawerForm
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          title="Edit Slot"
          description="Update slot information"
          schema={updateSlotSchema}
          defaultValues={{
            ...editingSlot,
            date: new Date(editingSlot.date),
          }}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input 
                  {...form.register("date", { valueAsDate: true })} 
                  type="date"
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input {...form.register("startTime")} type="time" />
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input {...form.register("endTime")} type="time" />
                  {form.formState.errors.endTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input 
                    {...form.register("capacity", { valueAsNumber: true })} 
                    type="number" 
                    min="1"
                  />
                  {form.formState.errors.capacity && (
                    <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Price (Optional)</label>
                  <Input 
                    {...form.register("price", { valueAsNumber: true })} 
                    type="number" 
                    step="0.01"
                    min="0"
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input {...form.register("location")} placeholder="e.g., Main Hall" />
                </div>
                <div>
                  <label className="text-sm font-medium">Room</label>
                  <Input {...form.register("room")} placeholder="e.g., Room A" />
                </div>
                <div>
                  <label className="text-sm font-medium">Table</label>
                  <Input {...form.register("table")} placeholder="e.g., Table 1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  {...form.register("notes")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
