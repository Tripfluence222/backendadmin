"use client";

import { format } from "date-fns";
import { Calendar, Clock, Users, MapPin, Edit, Trash2, Ban, CheckCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AvailabilitySlot } from "@/lib/api/availability";

interface SlotModalProps {
  slot: AvailabilitySlot;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (slot: AvailabilitySlot) => void;
  onDelete: (id: string) => void;
  onToggleBlackout: (id: string) => void;
}

export function SlotModal({ 
  slot, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleBlackout 
}: SlotModalProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      booked: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      maintenance: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const occupancyPercentage = Math.round((slot.booked / slot.capacity) * 100);
  const occupancyColor = occupancyPercentage >= 80 ? "text-red-600" : 
                        occupancyPercentage >= 60 ? "text-yellow-600" : "text-green-600";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Slot Details</span>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(slot.status)}>
                {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
              </Badge>
              {slot.isBlackout && (
                <Badge variant="destructive">Blacked Out</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing</label>
                  <div className="font-medium">{slot.listingTitle}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(slot.date), "EEEE, MMMM dd, yyyy")}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className={`font-medium ${occupancyColor}`}>
                      {slot.booked}/{slot.capacity}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({occupancyPercentage}% full)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Available</label>
                  <div className="font-medium text-green-600">{slot.available} spots</div>
                </div>
                {slot.price && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <div className="font-medium">${slot.price}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Details */}
          {(slot.location || slot.room || slot.table) && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details
              </h3>
              <div className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {slot.location && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <div className="font-medium">{slot.location}</div>
                    </div>
                  )}
                  {slot.room && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Room</label>
                      <div className="font-medium">{slot.room}</div>
                    </div>
                  )}
                  {slot.table && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Table</label>
                      <div className="font-medium">{slot.table}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {slot.notes && (
            <div className="space-y-4">
              <h3 className="font-semibold">Notes</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">{slot.notes}</p>
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
                  {format(new Date(slot.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="text-sm">
                  {format(new Date(slot.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onToggleBlackout(slot.id)}
                className={slot.isBlackout ? "text-green-600" : "text-red-600"}
              >
                {slot.isBlackout ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Remove Blackout
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Blackout
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(slot)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(slot.id)}
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
