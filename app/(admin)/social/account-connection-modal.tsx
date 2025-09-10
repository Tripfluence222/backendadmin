"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Instagram, Facebook, MessageSquare, Share2, ExternalLink, CheckCircle } from "lucide-react";

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
import { connectAccountSchema, SocialPlatform } from "@/lib/validation/social";

interface AccountConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function AccountConnectionModal({ isOpen, onClose, onSubmit, isLoading }: AccountConnectionModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  const form = useForm({
    resolver: zodResolver(connectAccountSchema),
    defaultValues: {
      platform: "instagram" as SocialPlatform,
      accountName: "",
      accessToken: "",
      refreshToken: "",
      expiresAt: undefined,
    },
  });

  const handlePlatformSelect = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    form.setValue("platform", platform);
  };

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const platforms = [
    {
      id: "instagram" as SocialPlatform,
      name: "Instagram",
      description: "Connect your Instagram business account",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      steps: [
        "Go to Facebook Developer Console",
        "Create a new app or use existing one",
        "Add Instagram Basic Display product",
        "Generate access token",
        "Paste token below"
      ],
      helpUrl: "https://developers.facebook.com/docs/instagram-basic-display-api"
    },
    {
      id: "facebook" as SocialPlatform,
      name: "Facebook",
      description: "Connect your Facebook page",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      steps: [
        "Go to Facebook Developer Console",
        "Create a new app",
        "Add Facebook Login product",
        "Generate page access token",
        "Paste token below"
      ],
      helpUrl: "https://developers.facebook.com/docs/pages/access-tokens"
    },
    {
      id: "tiktok" as SocialPlatform,
      name: "TikTok",
      description: "Connect your TikTok for Business account",
      icon: MessageSquare,
      color: "text-black",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      steps: [
        "Go to TikTok for Business",
        "Create a developer account",
        "Create a new app",
        "Generate access token",
        "Paste token below"
      ],
      helpUrl: "https://developers.tiktok.com/"
    },
    {
      id: "google_business" as SocialPlatform,
      name: "Google Business",
      description: "Connect your Google My Business account",
      icon: Share2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      steps: [
        "Go to Google Cloud Console",
        "Enable Google My Business API",
        "Create credentials",
        "Generate access token",
        "Paste token below"
      ],
      helpUrl: "https://developers.google.com/my-business"
    },
  ];

  const selectedPlatformInfo = platforms.find(p => p.id === selectedPlatform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Social Media Account</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Platform</h3>
            <div className="space-y-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
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
                        <Icon className={`h-6 w-6 ${platform.color}`} />
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
                  <div>
                    <label className="text-sm font-medium">Account Name</label>
                    <Input
                      {...form.register("accountName")}
                      placeholder="My Business Account"
                      className="mt-1"
                    />
                    {form.formState.errors.accountName && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.accountName.message}</p>
                    )}
                  </div>

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
                    <label className="text-sm font-medium">Expires At (Optional)</label>
                    <Input
                      {...form.register("expiresAt", { valueAsDate: true })}
                      type="datetime-local"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Connecting..." : "Connect Account"}
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
                <CardTitle className="text-base">Setup Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to get your access token for {selectedPlatformInfo.name}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
