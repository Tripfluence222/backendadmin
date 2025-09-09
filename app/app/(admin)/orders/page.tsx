"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Eye, Edit, RotateCcw, X, Calendar } from "lucide-react";
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ordersApi, Order } from "@/lib/api/orders";
import { updateOrderSchema, refundOrderSchema, rescheduleOrderSchema } from "@/lib/validation/orders";
import { columns } from "./columns";
import { BookingDetailsModal } from "./booking-details-modal";

export default function OrdersPage() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [refundingOrder, setRefundingOrder] = useState<Order | null>(null);
  const [reschedulingOrder, setReschedulingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "",
    orderStatus: "",
    listingType: "",
    dateRange: undefined as any,
  });

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ordersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated successfully");
      setEditingOrder(null);
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) => 
      ordersApi.refund(id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order refunded successfully");
      setRefundingOrder(null);
    },
    onError: () => {
      toast.error("Failed to refund order");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel order");
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: string; newDate: string; newTime?: string }) => 
      ordersApi.reschedule(id, newDate, newTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order rescheduled successfully");
      setReschedulingOrder(null);
    },
    onError: () => {
      toast.error("Failed to reschedule order");
    },
  });

  // Filter orders based on current filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.listingTitle.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
    const matchesOrderStatus = !filters.orderStatus || order.status === filters.orderStatus;
    const matchesListingType = !filters.listingType || order.listingType === filters.listingType;
    
    let matchesDateRange = true;
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const orderDate = new Date(order.date);
      matchesDateRange = orderDate >= filters.dateRange.from && orderDate <= filters.dateRange.to;
    }
    
    return matchesSearch && matchesPaymentStatus && matchesOrderStatus && matchesListingType && matchesDateRange;
  });

  const handleUpdate = (data: any) => {
    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, data });
    }
  };

  const handleRefund = (data: any) => {
    if (refundingOrder) {
      refundMutation.mutate({ 
        id: refundingOrder.id, 
        amount: data.amount, 
        reason: data.reason 
      });
    }
  };

  const handleReschedule = (data: any) => {
    if (reschedulingOrder) {
      rescheduleMutation.mutate({ 
        id: reschedulingOrder.id, 
        newDate: data.newDate.toISOString().split('T')[0], 
        newTime: data.newTime 
      });
    }
  };

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelMutation.mutate(id);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const tableColumns = columns({
    onView: handleViewOrder,
    onEdit: setEditingOrder,
    onRefund: setRefundingOrder,
    onCancel: handleCancel,
    onReschedule: setReschedulingOrder,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders & Bookings</h1>
          <p className="text-muted-foreground">
            Manage customer orders and booking details
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Input
          placeholder="Search orders..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
        
        <Select
          value={filters.paymentStatus}
          onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.orderStatus}
          onValueChange={(value) => setFilters(prev => ({ ...prev, orderStatus: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.listingType}
          onValueChange={(value) => setFilters(prev => ({ ...prev, listingType: value }))}
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

        <DateRangePicker
          date={filters.dateRange}
          onDateChange={(date) => setFilters(prev => ({ ...prev, dateRange: date }))}
          placeholder="Date range"
          className="w-64"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ 
            search: "", 
            paymentStatus: "", 
            orderStatus: "", 
            listingType: "", 
            dateRange: undefined 
          })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{orders.length}</div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {orders.filter(o => o.paymentStatus === "paid").length}
          </div>
          <div className="text-sm text-muted-foreground">Paid</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {orders.filter(o => o.paymentStatus === "pending").length}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {orders.filter(o => o.status === "confirmed").length}
          </div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={filteredOrders}
        searchKey="guestName"
        searchPlaceholder="Search orders..."
      />

      {/* Booking Details Modal */}
      {selectedOrder && (
        <BookingDetailsModal
          order={selectedOrder}
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Edit Order Form */}
      {editingOrder && (
        <DrawerForm
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          title="Edit Order"
          description="Update order information"
          schema={updateOrderSchema}
          defaultValues={editingOrder}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        >
          {(form) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Guest Name</label>
                  <Input {...form.register("guestName")} />
                  {form.formState.errors.guestName && (
                    <p className="text-sm text-red-500">{form.formState.errors.guestName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Guest Email</label>
                  <Input {...form.register("guestEmail")} type="email" />
                  {form.formState.errors.guestEmail && (
                    <p className="text-sm text-red-500">{form.formState.errors.guestEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Number of Guests</label>
                  <Input {...form.register("guests", { valueAsNumber: true })} type="number" />
                  {form.formState.errors.guests && (
                    <p className="text-sm text-red-500">{form.formState.errors.guests.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <Input {...form.register("totalAmount", { valueAsNumber: true })} type="number" />
                  {form.formState.errors.totalAmount && (
                    <p className="text-sm text-red-500">{form.formState.errors.totalAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select onValueChange={(value) => form.setValue("paymentStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.paymentStatus && (
                    <p className="text-sm text-red-500">{form.formState.errors.paymentStatus.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Order Status</label>
                  <Select onValueChange={(value) => form.setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Special Requests</label>
                <textarea
                  {...form.register("specialRequests")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Any special requests or notes..."
                />
                {form.formState.errors.specialRequests && (
                  <p className="text-sm text-red-500">{form.formState.errors.specialRequests.message}</p>
                )}
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* Refund Order Form */}
      {refundingOrder && (
        <DrawerForm
          isOpen={!!refundingOrder}
          onClose={() => setRefundingOrder(null)}
          title="Refund Order"
          description={`Refund order ${refundingOrder.orderId}`}
          schema={refundOrderSchema}
          defaultValues={{ amount: refundingOrder.totalAmount, reason: "" }}
          onSubmit={handleRefund}
          isLoading={refundMutation.isPending}
          submitLabel="Process Refund"
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Refund Amount</label>
                <Input 
                  {...form.register("amount", { valueAsNumber: true })} 
                  type="number" 
                  step="0.01"
                  max={refundingOrder.totalAmount}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum refund: ${refundingOrder.totalAmount}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Refund Reason</label>
                <textarea
                  {...form.register("reason")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Reason for refund..."
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>
                )}
              </div>
            </div>
          )}
        </DrawerForm>
      )}

      {/* Reschedule Order Form */}
      {reschedulingOrder && (
        <DrawerForm
          isOpen={!!reschedulingOrder}
          onClose={() => setReschedulingOrder(null)}
          title="Reschedule Order"
          description={`Reschedule order ${reschedulingOrder.orderId}`}
          schema={rescheduleOrderSchema}
          defaultValues={{ 
            newDate: new Date(reschedulingOrder.date), 
            newTime: reschedulingOrder.time || "",
            reason: "" 
          }}
          onSubmit={handleReschedule}
          isLoading={rescheduleMutation.isPending}
          submitLabel="Reschedule"
        >
          {(form) => (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Date</label>
                <Input 
                  {...form.register("newDate", { valueAsDate: true })} 
                  type="date"
                />
                {form.formState.errors.newDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.newDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">New Time (Optional)</label>
                <Input 
                  {...form.register("newTime")} 
                  type="time"
                />
                {form.formState.errors.newTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.newTime.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Reason (Optional)</label>
                <textarea
                  {...form.register("reason")}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Reason for rescheduling..."
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>
                )}
              </div>
            </div>
          )}
        </DrawerForm>
      )}
    </div>
  );
}
