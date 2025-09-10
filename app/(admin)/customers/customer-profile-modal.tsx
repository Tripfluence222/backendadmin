"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Plus, 
  Settings,
  Heart,
  MessageSquare,
  Bell,
  BellOff
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Customer, CustomerBooking } from "@/lib/api/customers";
import { customersApi } from "@/lib/api/customers";

interface CustomerProfileModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (customerId: string, data: any) => void;
  onUpdatePreferences: (customerId: string, data: any) => void;
}

export function CustomerProfileModal({ 
  customer, 
  isOpen, 
  onClose, 
  onAddNote, 
  onUpdatePreferences 
}: CustomerProfileModalProps) {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<"general" | "booking" | "payment" | "support">("general");
  const [isPrivate, setIsPrivate] = useState(false);

  const { data: bookingHistory = [] } = useQuery({
    queryKey: ["customer-bookings", customer.id],
    queryFn: () => customersApi.getBookingHistory(customer.id),
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      vip: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(customer.id, {
        note: newNote.trim(),
        type: noteType,
        isPrivate,
      });
      setNewNote("");
      setIsPrivate(false);
    }
  };

  const handlePreferenceChange = (key: keyof typeof customer.preferences, value: boolean) => {
    onUpdatePreferences(customer.id, {
      [key]: value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  {customer.firstName[0]}{customer.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{customer.firstName} {customer.lastName}</h2>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customer.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {customer.lastBookingDate ? 
                      `Last: ${format(new Date(customer.lastBookingDate), "MMM dd, yyyy")}` :
                      "No bookings yet"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${customer.totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Average: ${customer.totalBookings > 0 ? Math.round(customer.totalSpent / customer.totalBookings) : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customer.loyaltyPoints.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {customer.loyaltyPoints >= 1000 ? "VIP Status" : "Regular Member"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(new Date(customer.createdAt), "MMM yyyy")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                    </div>
                    {customer.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    )}
                    {customer.dateOfBirth && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(customer.dateOfBirth), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {customer.address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <div className="text-sm">
                          {customer.address.street && <div>{customer.address.street}</div>}
                          {customer.address.city && customer.address.state && (
                            <div>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</div>
                          )}
                          {customer.address.country && <div>{customer.address.country}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  Complete booking history for {customer.firstName} {customer.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {bookingHistory.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{booking.listingTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(booking.date), "MMM dd, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Order: {booking.orderId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${booking.amount}</div>
                          <Badge 
                            variant={booking.status === "completed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No booking history found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
                <CardDescription>
                  Add and manage notes for this customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Note */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="new-note">Add New Note</Label>
                    <Textarea
                      id="new-note"
                      placeholder="Add a note about this customer..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label htmlFor="note-type">Type</Label>
                      <select
                        id="note-type"
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as any)}
                        className="ml-2 px-2 py-1 border rounded"
                      >
                        <option value="general">General</option>
                        <option value="booking">Booking</option>
                        <option value="payment">Payment</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="private-note"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                      />
                      <Label htmlFor="private-note">Private Note</Label>
                    </div>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Existing Notes */}
                <div className="space-y-3">
                  {customer.notes.map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {note.type}
                          </Badge>
                          {note.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <p className="text-sm">{note.note}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Added by {note.createdBy}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Communication Preferences
                </CardTitle>
                <CardDescription>
                  Manage how this customer receives communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Newsletter
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive our monthly newsletter with updates and offers
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={customer.preferences.newsletter}
                    onCheckedChange={(checked) => handlePreferenceChange("newsletter", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS notifications about bookings and updates
                    </p>
                  </div>
                  <Switch
                    id="sms"
                    checked={customer.preferences.sms}
                    onCheckedChange={(checked) => handlePreferenceChange("sms", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional offers and marketing communications
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={customer.preferences.marketing}
                    onCheckedChange={(checked) => handlePreferenceChange("marketing", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
