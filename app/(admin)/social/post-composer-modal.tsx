"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Send, Clock, Instagram, Facebook, MessageSquare, Share2 } from "lucide-react";

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
import { createSocialPostSchema, SocialPlatform } from "@/lib/validation/social";

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function PostComposerModal({ isOpen, onClose, onSubmit, isLoading }: PostComposerModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["instagram"]);
  const [isScheduled, setIsScheduled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createSocialPostSchema),
    defaultValues: {
      content: "",
      media: [],
      hashtags: [],
      links: [],
      platforms: ["instagram"],
      scheduledAt: undefined,
      isPublished: false,
    },
  });

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const currentPlatforms = form.getValues("platforms") || [];
    if (currentPlatforms.includes(platform)) {
      const newPlatforms = currentPlatforms.filter(p => p !== platform);
      form.setValue("platforms", newPlatforms);
      setSelectedPlatforms(newPlatforms);
    } else {
      const newPlatforms = [...currentPlatforms, platform];
      form.setValue("platforms", newPlatforms);
      setSelectedPlatforms(newPlatforms);
    }
  };

  const handleSubmit = (data: any) => {
    const submitData = {
      ...data,
      platforms: selectedPlatforms,
      isPublished: !isScheduled,
    };
    onSubmit(submitData);
  };

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { id: "tiktok", name: "TikTok", icon: MessageSquare, color: "text-black" },
    { id: "google_business", name: "Google Business", icon: Share2, color: "text-green-600" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Social Media Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Select Platforms</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id as SocialPlatform);
                
                return (
                  <Card
                    key={platform.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handlePlatformToggle(platform.id as SocialPlatform)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${platform.color}`} />
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {form.formState.errors.platforms && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.platforms.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium">Post Content</label>
            <textarea
              {...form.register("content")}
              className="w-full p-3 border rounded-md mt-1"
              rows={6}
              placeholder="What's on your mind? Share your thoughts, updates, or promotions..."
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.content.message}</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {form.watch("content")?.length || 0}/2000 characters
              </span>
              <div className="text-xs text-muted-foreground">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-sm font-medium">Hashtags (Optional)</label>
            <Input
              {...form.register("hashtags")}
              placeholder="#yoga #wellness #retreat #mindfulness"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate hashtags with spaces. They will be automatically formatted.
            </p>
          </div>

          {/* Links */}
          <div>
            <label className="text-sm font-medium">Links (Optional)</label>
            <Input
              {...form.register("links")}
              placeholder="https://tripfluence.com/retreats/bali-yoga"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add links to your website, booking pages, or other relevant content.
            </p>
          </div>

          {/* Media Upload */}
          <div>
            <label className="text-sm font-medium">Media (Optional)</label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center mt-1">
              <div className="text-muted-foreground">
                <div className="text-sm">Drag and drop images or videos here</div>
                <div className="text-xs mt-1">or click to browse</div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-2">
                  Choose Files
                </Button>
              </label>
            </div>
          </div>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="publish-now"
                  name="publish-option"
                  checked={!isScheduled}
                  onChange={() => setIsScheduled(false)}
                  className="rounded"
                />
                <label htmlFor="publish-now" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Publish Now</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="schedule"
                  name="publish-option"
                  checked={isScheduled}
                  onChange={() => setIsScheduled(true)}
                  className="rounded"
                />
                <label htmlFor="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule for Later</span>
                </label>
              </div>

              {isScheduled && (
                <div className="ml-6">
                  <label className="text-sm font-medium">Schedule Date & Time</label>
                  <Input
                    type="datetime-local"
                    {...form.register("scheduledAt", { valueAsDate: true })}
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>
                How your post will appear on selected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedPlatforms.map((platform) => {
                  const platformInfo = platforms.find(p => p.id === platform);
                  const Icon = platformInfo?.icon;
                  
                  return (
                    <div key={platform} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {Icon && <Icon className={`h-4 w-4 ${platformInfo.color}`} />}
                        <span className="font-medium">{platformInfo?.name}</span>
                      </div>
                      <div className="text-sm">
                        {form.watch("content") || "Your post content will appear here..."}
                      </div>
                      {form.watch("hashtags") && (
                        <div className="text-sm text-blue-600 mt-2">
                          {form.watch("hashtags")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || selectedPlatforms.length === 0}>
              {isLoading ? (
                "Creating..."
              ) : isScheduled ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule Post
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Now
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
