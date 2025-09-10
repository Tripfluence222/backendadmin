"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  ShoppingCart,
  Star,
  Eye,
  Share2
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listingsApi } from "@/lib/api/listings";
import { ordersApi } from "@/lib/api/orders";

export default function DashboardPage() {
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: listingsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate metrics with fallback values
  const totalRevenue = orders
    .filter(order => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

  const totalBookings = orders.length || 0;
  const totalCustomers = new Set(orders.map(order => order.guestEmail)).size || 0;
  const socialReach = 12500; // Mock data

  const recentOrders = orders.slice(0, 5);
  const topListings = listings
    .filter(listing => listing.status === "published")
    .slice(0, 5);

  const isLoading = listingsLoading || ordersLoading;

  // Debug logging
  console.log('Dashboard data:', { listings: listings.length, orders: orders.length, isLoading });

  // Show loading state only for a short time, then show content
  if (isLoading && listings.length === 0 && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="metric-card-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="metric-value-revenue" className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-card-bookings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="metric-value-bookings" className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-card-customers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="metric-value-customers" className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-card-social">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Reach</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="metric-value-social" className="text-2xl font-bold">{socialReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest bookings and orders from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
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
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent orders</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Top Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Listings</CardTitle>
            <CardDescription>
              Your most popular listings and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topListings.length > 0 ? (
                topListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {listing.occupancy || 0}/{listing.capacity || 0}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {listing.type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No listings available</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Listings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Add Event</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">View Customers</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Share2 className="h-6 w-6" />
              <span className="text-sm">Social Media</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
