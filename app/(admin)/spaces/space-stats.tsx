"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, FileText, DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import { SpaceStats as SpaceStatsType } from "@/lib/api/space";

interface SpaceStatsProps {
  stats: SpaceStatsType;
}

export function SpaceStats({ stats }: SpaceStatsProps) {
  const statsCards = [
    {
      title: "Total Spaces",
      value: stats.totalSpaces,
      icon: Building2,
      description: "All spaces in your business",
    },
    {
      title: "Published",
      value: stats.publishedSpaces,
      icon: Globe,
      description: "Live and bookable",
      color: "text-green-600",
    },
    {
      title: "Draft",
      value: stats.draftSpaces,
      icon: FileText,
      description: "Not yet published",
      color: "text-yellow-600",
    },
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: Users,
      description: "All booking requests",
    },
    {
      title: "Pending",
      value: stats.pendingRequests,
      icon: Calendar,
      description: "Awaiting response",
      color: "text-orange-600",
    },
    {
      title: "Confirmed",
      value: stats.confirmedRequests,
      icon: TrendingUp,
      description: "Successfully booked",
      color: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All-time earnings",
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "This month's earnings",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color || ""}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
