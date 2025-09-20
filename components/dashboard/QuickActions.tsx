"use client";

import Link from "next/link";
import { Calendar, Users, TrendingUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      id: "add-event",
      href: "/listings/new?type=event",
      icon: Calendar,
      label: "Add Event",
      description: "Create a new event listing",
      testId: "qa-add-event"
    },
    {
      id: "view-customers",
      href: "/customers",
      icon: Users,
      label: "View Customers",
      description: "Manage customer relationships",
      testId: "qa-view-customers"
    },
    {
      id: "view-reports",
      href: "/reports",
      icon: TrendingUp,
      label: "View Reports",
      description: "Analytics and insights",
      testId: "qa-view-reports"
    },
    {
      id: "social-media",
      href: "/social",
      icon: Share2,
      label: "Social Media",
      description: "Manage social presence",
      testId: "qa-social"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                asChild
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                data-testid={action.testId}
                role="link"
                aria-label={action.description}
              >
                <Link href={action.href}>
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
