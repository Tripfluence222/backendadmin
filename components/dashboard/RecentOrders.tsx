"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ordersApi } from "@/lib/api/orders";
import { OrderDetailsDrawer } from "@/components/orders/OrderDetailsDrawer";

export function RecentOrders() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recentOrders = orders.slice(0, 5);

  const openOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const closeOrder = () => {
    setSelectedOrderId(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest bookings and orders from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted rounded w-16" />
                      <div className="h-5 bg-muted rounded w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => openOrder(order.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  data-testid={`order-row-${order.id}`}
                  aria-label={`View details for order from ${order.guestName}`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.guestName}</p>
                    <p className="text-xs text-muted-foreground">{order.listingTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.totalAmount}</p>
                    <Badge 
                      variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </div>
          <Button 
            asChild 
            variant="outline" 
            className="w-full mt-4"
            data-testid="btn-view-orders"
          >
            <Link href="/orders">
              View All Orders
            </Link>
          </Button>
        </CardContent>
      </Card>

      <OrderDetailsDrawer 
        orderId={selectedOrderId}
        onOpenChange={(open) => !open && closeOrder()}
      />
    </>
  );
}
