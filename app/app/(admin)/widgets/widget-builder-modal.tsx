"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check, Palette, Filter, Eye, Code } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createWidgetSchema, WidgetType } from "@/lib/validation/widgets";

interface WidgetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const steps = [
  { id: 1, title: "Widget Type", description: "Choose your widget type", icon: Check },
  { id: 2, title: "Filters", description: "Configure content filters", icon: Filter },
  { id: 3, title: "Design", description: "Customize appearance", icon: Palette },
  { id: 4, title: "Preview", description: "Review and generate", icon: Eye },
];

export function WidgetBuilderModal({ isOpen, onClose, onSubmit, isLoading }: WidgetBuilderModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedCode, setGeneratedCode] = useState("");

  const form = useForm({
    resolver: zodResolver(createWidgetSchema),
    defaultValues: {
      name: "",
      type: "booking" as WidgetType,
      description: "",
      filters: {
        categories: [],
        tags: [],
        location: "",
      },
      design: {
        primaryColor: "#3b82f6",
        secondaryColor: "#64748b",
        fontFamily: "Inter",
        fontSize: 16,
        borderRadius: 8,
        theme: "auto" as const,
        showBranding: true,
      },
      isActive: true,
    },
  });

  const widgetType = form.watch("type");
  const design = form.watch("design");

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const generatePreviewCode = () => {
    const widgetData = form.getValues();
    const code = `<script src="https://widgets.tripfluence.com/${widgetData.type}.js" data-widget-id="preview" data-config='${JSON.stringify(widgetData)}'></script>`;
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">Widget Name</label>
              <Input 
                {...form.register("name")} 
                placeholder="My Booking Widget"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Widget Type</label>
              <Select onValueChange={(value) => form.setValue("type", value as WidgetType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking Widget</SelectItem>
                  <SelectItem value="calendar">Calendar Widget</SelectItem>
                  <SelectItem value="menu">Menu Widget</SelectItem>
                  <SelectItem value="property_grid">Property Grid</SelectItem>
                  <SelectItem value="reviews">Reviews Widget</SelectItem>
                  <SelectItem value="contact_form">Contact Form</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea
                {...form.register("description")}
                className="w-full p-2 border rounded-md mt-1"
                rows={3}
                placeholder="Describe your widget..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: "booking", title: "Booking Widget", desc: "Allow customers to book services directly" },
                { type: "calendar", title: "Calendar Widget", desc: "Display availability calendar" },
                { type: "menu", title: "Menu Widget", desc: "Show restaurant menu items" },
                { type: "property_grid", title: "Property Grid", desc: "Display property listings" },
                { type: "reviews", title: "Reviews Widget", desc: "Show customer reviews" },
                { type: "contact_form", title: "Contact Form", desc: "Collect customer inquiries" },
              ].map((option) => (
                <Card 
                  key={option.type}
                  className={`cursor-pointer transition-colors ${
                    widgetType === option.type ? "ring-2 ring-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => form.setValue("type", option.type as WidgetType)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">Categories (Optional)</label>
              <Input 
                {...form.register("filters.categories")} 
                placeholder="Wellness, Culinary, Entertainment"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of categories to filter content
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Tags (Optional)</label>
              <Input 
                {...form.register("filters.tags")} 
                placeholder="yoga, meditation, healthy"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of tags to filter content
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Location (Optional)</label>
              <Input 
                {...form.register("filters.location")} 
                placeholder="Bali, Indonesia"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Filter content by specific location
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Filter Preview</h4>
              <div className="space-y-2 text-sm">
                <div>Categories: {form.watch("filters.categories") || "All"}</div>
                <div>Tags: {form.watch("filters.tags") || "All"}</div>
                <div>Location: {form.watch("filters.location") || "All"}</div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => form.setValue("design.primaryColor", e.target.value)}
                    className="w-10 h-10 border rounded"
                  />
                  <Input 
                    value={design.primaryColor}
                    onChange={(e) => form.setValue("design.primaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Secondary Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={design.secondaryColor}
                    onChange={(e) => form.setValue("design.secondaryColor", e.target.value)}
                    className="w-10 h-10 border rounded"
                  />
                  <Input 
                    value={design.secondaryColor}
                    onChange={(e) => form.setValue("design.secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Font Family</label>
                <Select onValueChange={(value) => form.setValue("design.fontFamily", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <Input 
                  type="number"
                  min="12"
                  max="24"
                  {...form.register("design.fontSize", { valueAsNumber: true })} 
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Border Radius</label>
                <Input 
                  type="number"
                  min="0"
                  max="20"
                  {...form.register("design.borderRadius", { valueAsNumber: true })} 
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Theme</label>
                <Select onValueChange={(value) => form.setValue("design.theme", value as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showBranding"
                {...form.register("design.showBranding")}
                className="rounded"
              />
              <label htmlFor="showBranding" className="text-sm">
                Show Tripfluence branding
              </label>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Design Preview</h4>
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: design.primaryColor,
                  color: "white",
                  borderRadius: `${design.borderRadius}px`,
                  fontFamily: design.fontFamily,
                  fontSize: `${design.fontSize}px`,
                }}
              >
                Sample Widget Content
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Widget Summary</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {form.watch("name")}</div>
                <div><strong>Type:</strong> {form.watch("type")}</div>
                <div><strong>Theme:</strong> {form.watch("design.theme")}</div>
                <div><strong>Primary Color:</strong> {form.watch("design.primaryColor")}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Embed Code</label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Code className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </div>
              <textarea
                value={generatedCode}
                readOnly
                className="w-full p-3 border rounded-md bg-muted font-mono text-sm"
                rows={4}
              />
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="text-center py-8 text-muted-foreground">
                Widget preview will appear here
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Widget</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive ? "border-primary bg-primary text-primary-foreground" :
                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                    "border-muted-foreground text-muted-foreground"
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <div className="ml-2">
                    <div className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-muted-foreground mx-4" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === steps.length ? (
                <Button onClick={form.handleSubmit(handleSubmit)} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Widget"}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
