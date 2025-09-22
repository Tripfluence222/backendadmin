"use client";

import { format } from "date-fns";
import { X, User, Mail, Phone, Calendar, MapPin, CreditCard, FileText, CheckCircle, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/lib/api/orders";

interface BookingDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({ order, isOpen, onClose }: BookingDetailsModalProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      no_show: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Details - {order.orderId}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Order Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                </Badge>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${order.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{order.guestName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{order.guestEmail}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {order.guestPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{order.guestPhone}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Number of Guests</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{order.guests} {order.guests === 1 ? 'guest' : 'guests'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing</label>
                  <div className="font-medium">{order.listingTitle}</div>
                  <Badge variant="outline" className="mt-1">
                    {order.listingType.charAt(0).toUpperCase() + order.listingType.slice(1)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(order.date), "EEEE, MMMM dd, yyyy")}</span>
                  </div>
                  {order.time && (
                    <div className="text-sm text-muted-foreground ml-6">
                      at {order.time}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking ID</label>
                  <div className="font-mono text-sm">{order.orderId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="text-sm">
                    {format(new Date(order.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="text-sm">
                    {format(new Date(order.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {order.specialRequests && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Special Requests
              </h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">{order.specialRequests}</p>
              </div>
            </div>
          )}

          {/* Waivers */}
          {order.waivers && order.waivers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Waivers & Agreements
              </h3>
              <div className="space-y-3">
                {order.waivers.map((waiver, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {waiver.signed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{waiver.type}</div>
                        {waiver.signedAt && (
                          <div className="text-sm text-muted-foreground">
                            Signed on {format(new Date(waiver.signedAt), "MMM dd, yyyy 'at' h:mm a")}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={waiver.signed ? "default" : "destructive"}>
                      {waiver.signed ? "Signed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div className="p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                  <div className="mt-1">
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                  <div className="text-lg font-semibold">${order.totalAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
