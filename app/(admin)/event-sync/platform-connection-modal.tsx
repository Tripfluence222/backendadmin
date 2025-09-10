"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, CheckCircle, AlertCircle, Settings, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { connectPlatformSchema, EventSyncPlatform } from "@/lib/validation/event-sync";

interface PlatformConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function PlatformConnectionModal({ isOpen, onClose, onSubmit, isLoading }: PlatformConnectionModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<EventSyncPlatform | null>(null);

  const form = useForm({
    resolver: zodResolver(connectPlatformSchema),
    defaultValues: {
      platform: "facebook_events" as EventSyncPlatform,
      apiKey: "",
      apiSecret: "",
      accessToken: "",
      refreshToken: "",
      webhookUrl: "",
      autoSync: true,
    },
  });

  const handlePlatformSelect = (platform: EventSyncPlatform) => {
    setSelectedPlatform(platform);
    form.setValue("platform", platform);
  };

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const platforms = [
    {
      id: "facebook_events" as EventSyncPlatform,
      name: "Facebook Events",
      description: "Sync events from Facebook Pages",
      icon: "📘",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      steps: [
        "Go to Facebook Developer Console",
        "Create a new app or use existing one",
        "Add Facebook Login product",
        "Generate page access token",
        "Paste token below"
      ],
      helpUrl: "https://developers.facebook.com/docs/pages/access-tokens",
      requiredFields: ["accessToken"]
    },
    {
      id: "google_business" as EventSyncPlatform,
      name: "Google Business",
      description: "Sync events from Google My Business",
      icon: "🏢",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      steps: [
        "Go to Google Cloud Console",
        "Enable Google My Business API",
        "Create credentials (OAuth 2.0)",
        "Generate access token",
        "Paste token below"
      ],
      helpUrl: "https://developers.google.com/my-business",
      requiredFields: ["apiKey", "accessToken"]
    },
    {
      id: "eventbrite" as EventSyncPlatform,
      name: "Eventbrite",
      description: "Sync events from Eventbrite organizer account",
      icon: "🎫",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      steps: [
        "Go to Eventbrite Developer Console",
        "Create a new app",
        "Generate personal OAuth token",
        "Paste token below"
      ],
      helpUrl: "https://www.eventbrite.com/platform/api-keys/",
      requiredFields: ["accessToken"]
    },
    {
      id: "meetup" as EventSyncPlatform,
      name: "Meetup",
      description: "Sync events from Meetup groups",
      icon: "👥",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      steps: [
        "Go to Meetup API Console",
        "Create a new app",
        "Generate API key",
        "Paste key below"
      ],
      helpUrl: "https://www.meetup.com/meetup_api/",
      requiredFields: ["apiKey"]
    },
    {
      id: "airbnb_experiences" as EventSyncPlatform,
      name: "Airbnb Experiences",
      description: "Sync experiences from Airbnb host account",
      icon: "🏠",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      steps: [
        "Go to Airbnb Partner Portal",
        "Create a new app",
        "Generate API credentials",
        "Paste credentials below"
      ],
      helpUrl: "https://partners.airbnb.com/",
      requiredFields: ["apiKey", "apiSecret"]
    },
  ];

  const selectedPlatformInfo = platforms.find(p => p.id === selectedPlatform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Event Platform</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Platform</h3>
            <div className="space-y-3">
              {platforms.map((platform) => {
                const isSelected = selectedPlatform === platform.id;
                
                return (
                  <Card
                    key={platform.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? `ring-2 ring-primary ${platform.bgColor}` : "hover:bg-muted/50"
                    }`}
                    onClick={() => handlePlatformSelect(platform.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{platform.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-sm text-muted-foreground">{platform.description}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Connection Form */}
          <div className="space-y-4">
            {selectedPlatformInfo ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Connection Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedPlatformInfo.helpUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Help Guide
                  </Button>
                </div>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {selectedPlatformInfo.requiredFields.includes("apiKey") && (
                    <div>
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        {...form.register("apiKey")}
                        type="password"
                        placeholder="Enter your API key"
                        className="mt-1"
                      />
                      {form.formState.errors.apiKey && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.apiKey.message}</p>
                      )}
                    </div>
                  )}

                  {selectedPlatformInfo.requiredFields.includes("apiSecret") && (
                    <div>
                      <label className="text-sm font-medium">API Secret</label>
                      <Input
                        {...form.register("apiSecret")}
                        type="password"
                        placeholder="Enter your API secret"
                        className="mt-1"
                      />
                      {form.formState.errors.apiSecret && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.apiSecret.message}</p>
                      )}
                    </div>
                  )}

                  {selectedPlatformInfo.requiredFields.includes("accessToken") && (
                    <div>
                      <label className="text-sm font-medium">Access Token</label>
                      <Input
                        {...form.register("accessToken")}
                        type="password"
                        placeholder="Enter your access token"
                        className="mt-1"
                      />
                      {form.formState.errors.accessToken && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.accessToken.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Refresh Token (Optional)</label>
                    <Input
                      {...form.register("refreshToken")}
                      type="password"
                      placeholder="Enter refresh token if available"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Webhook URL (Optional)</label>
                    <Input
                      {...form.register("webhookUrl")}
                      placeholder="https://your-domain.com/webhook"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL to receive real-time updates from the platform
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoSync"
                      {...form.register("autoSync")}
                      className="rounded"
                    />
                    <label htmlFor="autoSync" className="text-sm">
                      Enable automatic synchronization
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Connecting..." : "Connect Platform"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a platform to continue
              </div>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        {selectedPlatformInfo && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Setup Instructions
                </CardTitle>
                <CardDescription>
                  Follow these steps to get your credentials for {selectedPlatformInfo.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPlatformInfo.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="text-sm">{step}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Security Notice</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your API credentials are encrypted and stored securely. We only use them to sync your events 
                      and never share them with third parties. You can revoke access at any time from your platform's 
                      developer console.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
