"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { useState } from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Calendar, 
  Users, 
  MapPin,
  Clock,
  DollarSign
} from "lucide-react";

// Provider utility functions
export function getProviderDisplayName(provider: string): string {
  const names: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram", 
    twitter: "Twitter",
    eventbrite: "Eventbrite",
    meetup: "Meetup",
    google_business: "Google Business"
  };
  return names[provider] || provider;
}

export function getProviderIcon(provider: string) {
  const icons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    eventbrite: Calendar,
    meetup: Users,
    google_business: MapPin
  };
  return icons[provider] || Clock;
}

export function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    facebook: "#1877F2",
    instagram: "#E4405F",
    twitter: "#1DA1F2", 
    eventbrite: "#F05537",
    meetup: "#ED1C40",
    google_business: "#4285F4"
  };
  return colors[provider] || "#6B7280";
}

export function isSocialProvider(provider: string): boolean {
  return ["facebook", "instagram", "twitter"].includes(provider);
}

export function isEventProvider(provider: string): boolean {
  return ["eventbrite", "meetup"].includes(provider);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeWrapper>
        {children}
        <Toaster />
      </ThemeWrapper>
    </QueryClientProvider>
  );
}