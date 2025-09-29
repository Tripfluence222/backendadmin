"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  List,
  Calendar,
  ShoppingCart,
  Users,
  Star,
  Puzzle,
  Share2,
  Calendar as CalendarIcon,
  Megaphone,
  BarChart3,
  Settings,
  Menu,
  X,
  Plug,
  Building2,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Listings", href: "/listings", icon: List },
  { name: "Spaces", href: "/spaces", icon: Building2 },
  { name: "Space Requests", href: "/space-requests", icon: MessageSquare },
  { name: "Space Pricing", href: "/space-pricing", icon: DollarSign },
  { name: "Availability", href: "/availability", icon: Calendar },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Widgets", href: "/widgets", icon: Puzzle },
  { name: "Social", href: "/social", icon: Share2 },
  { name: "Event Sync", href: "/event-sync", icon: CalendarIcon },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden pointer-events-auto"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        data-testid="sidebar"
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-background border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:sticky lg:top-0 lg:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-lg">Tripfluence</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.name === "Orders" && (
                    <Badge variant="secondary" className="ml-auto">
                      3
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@tripfluence.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
