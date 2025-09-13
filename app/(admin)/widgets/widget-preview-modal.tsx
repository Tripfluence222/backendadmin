"use client";

import { useState } from "react";
import { Copy, ExternalLink, Eye, BarChart3 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Widget } from "@/lib/api/widgets";
import { widgetsApi } from "@/lib/api/widgets";

interface WidgetPreviewModalProps {
  widget: Widget;
  isOpen: boolean;
  onClose: () => void;
}

export function WidgetPreviewModal({ widget, isOpen, onClose }: WidgetPreviewModalProps) {
  const [embedCode, setEmbedCode] = useState(widget.embedCode);

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard");
  };

  const openPreview = () => {
    window.open(widget.previewUrl, '_blank');
  };

  const getTypeColor = (type: string) => {
    const colors = {
      booking: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      calendar: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      menu: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      property_grid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      reviews: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      contact_form: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Widget Preview</span>
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(widget.type)}>
                {widget.type.replace('_', ' ')}
              </Badge>
              <Badge variant={widget.isActive ? "default" : "secondary"}>
                {widget.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widget Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{widget.name}</CardTitle>
                <CardDescription>{widget.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Design Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: widget.design.primaryColor }}
                      />
                      <span>Primary: {widget.design.primaryColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: widget.design.secondaryColor }}
                      />
                      <span>Secondary: {widget.design.secondaryColor}</span>
                    </div>
                    <div>Font: {widget.design.fontFamily} ({widget.design.fontSize}px)</div>
                    <div>Theme: {widget.design.theme}</div>
                    <div>Border Radius: {widget.design.borderRadius}px</div>
                    <div>Branding: {widget.design.showBranding ? "Yes" : "No"}</div>
                  </div>
                </div>

                {widget.filters && (
                  <div>
                    <h4 className="font-medium mb-2">Filters</h4>
                    <div className="space-y-1 text-sm">
                      {widget.filters.categories && widget.filters.categories.length > 0 && (
                        <div>Categories: {widget.filters.categories.join(", ")}</div>
                      )}
                      {widget.filters.tags && widget.filters.tags.length > 0 && (
                        <div>Tags: {widget.filters.tags.join(", ")}</div>
                      )}
                      {widget.filters.location && (
                        <div>Location: {widget.filters.location}</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{widget.usage.views.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{widget.usage.clicks.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{widget.usage.conversions}</div>
                    <div className="text-sm text-muted-foreground">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {widget.usage.views > 0 ? Math.round((widget.usage.clicks / widget.usage.views) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">CTR</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Embed Code</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={openPreview}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Preview
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={embedCode}
                readOnly
                className="w-full p-3 border rounded-md bg-muted font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Copy this code and paste it into your website's HTML where you want the widget to appear.
              </p>
            </CardContent>
          </Card>

          {/* Widget Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="widget-preview" className="border rounded-lg p-8 bg-muted/20">
                <div className="text-center">
                  <div 
                    className="inline-block p-6 rounded-lg text-white font-medium"
                    style={{
                      backgroundColor: widget.design.primaryColor,
                      borderRadius: `${widget.design.borderRadius}px`,
                      fontFamily: widget.design.fontFamily,
                      fontSize: `${widget.design.fontSize}px`,
                    }}
                  >
                    {widget.type === "booking" && "Book Now"}
                    {widget.type === "calendar" && "View Calendar"}
                    {widget.type === "menu" && "View Menu"}
                    {widget.type === "property_grid" && "Browse Properties"}
                    {widget.type === "reviews" && "Read Reviews"}
                    {widget.type === "contact_form" && "Contact Us"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    This is a preview of how your widget will appear on your website.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Copy the Embed Code</h4>
                <p className="text-sm text-muted-foreground">
                  Use the "Copy Code" button above to copy the embed code to your clipboard.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Paste into Your Website</h4>
                <p className="text-sm text-muted-foreground">
                  Paste the code into your website's HTML where you want the widget to appear. 
                  This can be in a page template, content management system, or directly in HTML.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Test Your Widget</h4>
                <p className="text-sm text-muted-foreground">
                  Visit your website to ensure the widget loads correctly and functions as expected.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">4. Monitor Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Check back here regularly to monitor your widget's performance and usage statistics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
