"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listingsApi } from "@/lib/api/listings";

export function TopListings() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: listingsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const topListings = listings
    .filter(listing => listing.status === "published")
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Listings</CardTitle>
        <CardDescription>
          Your most popular listings and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-muted rounded w-16" />
                    <div className="h-5 bg-muted rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : topListings.length > 0 ? (
            topListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{listing.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.location}</span>
                  </div>
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
        <Button 
          asChild 
          variant="outline" 
          className="w-full mt-4"
          data-testid="btn-view-listings"
        >
          <Link href="/listings">
            View All Listings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
