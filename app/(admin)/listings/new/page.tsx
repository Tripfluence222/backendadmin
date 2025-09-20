"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, MapPin, Users, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const CreateListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["event", "space", "service"]),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  floorAreaM2: z.number().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().default("USD"),
});

type CreateListingForm = z.infer<typeof CreateListingSchema>;

function NewListingPageContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<Array<{ label: string; category?: string }>>([]);
  const [rules, setRules] = useState<Array<{ label: string; required: boolean }>>([]);
  const [newPhoto, setNewPhoto] = useState("");
  const [newAmenity, setNewAmenity] = useState({ label: "", category: "" });
  const [newRule, setNewRule] = useState({ label: "", required: false });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateListingForm>({
    resolver: zodResolver(CreateListingSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      type: (typeParam as "event" | "space" | "service") || "event",
      location: { address: "", lat: 0, lng: 0 },
      capacity: 1,
      floorAreaM2: undefined,
      price: 0,
      currency: "USD",
    },
  });

  const watchedType = watch("type");

  const addPhoto = () => {
    if (newPhoto && newPhoto.trim()) {
      setPhotos(prev => [...prev, newPhoto.trim()]);
      setNewPhoto("");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.label.trim()) {
      setAmenities(prev => [...prev, { ...newAmenity, label: newAmenity.label.trim() }]);
      setNewAmenity({ label: "", category: "" });
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(prev => prev.filter((_, i) => i !== index));
  };

  const addRule = () => {
    if (newRule.label.trim()) {
      setRules(prev => [...prev, { ...newRule, label: newRule.label.trim() }]);
      setNewRule({ label: "", required: false });
    }
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateListingForm) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        photos,
        amenities,
        rules,
        status: "draft" as const,
      };

      // Here you would call your API to create the listing
      console.log("Creating listing:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Listing created successfully!");
      // Redirect to listings page or the created listing
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Listing</h1>
        <p className="text-muted-foreground">
          Add a new {watchedType} to your business
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="create-listing-form">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Serene Yoga Studio"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="e.g., serene-yoga-studio"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe your listing, its features, and what makes it special..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={watchedType} onValueChange={(value) => setValue("type", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="space">Space</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="capacity"
                    type="number"
                    {...register("capacity", { valueAsNumber: true })}
                    className="pl-10"
                    min="1"
                  />
                </div>
                {errors.capacity && (
                  <p className="text-sm text-destructive">{errors.capacity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="floorAreaM2">Floor Area (m²)</Label>
                <div className="relative">
                  <Square className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="floorAreaM2"
                    type="number"
                    {...register("floorAreaM2", { valueAsNumber: true })}
                    className="pl-10"
                    min="1"
                  />
                </div>
                {errors.floorAreaM2 && (
                  <p className="text-sm text-destructive">{errors.floorAreaM2.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  {...register("location.address")}
                  className="pl-10"
                  placeholder="Enter the full address"
                />
              </div>
              {errors.location?.address && (
                <p className="text-sm text-destructive">{errors.location.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                placeholder="Enter photo URL"
                className="flex-1"
              />
              <Button type="button" onClick={addPhoto} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Listing photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAmenity.label}
                onChange={(e) => setNewAmenity(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Amenity name"
                className="flex-1"
              />
              <Input
                value={newAmenity.category}
                onChange={(e) => setNewAmenity(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Category (optional)"
                className="w-32"
              />
              <Button type="button" onClick={addAmenity} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {amenity.label}
                    {amenity.category && <span className="text-xs">({amenity.category})</span>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeAmenity(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newRule.label}
                onChange={(e) => setNewRule(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Rule description"
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="required">Required</Label>
                <Switch
                  id="required"
                  checked={newRule.required}
                  onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, required: checked }))}
                />
              </div>
              <Button type="button" onClick={addRule} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {rules.length > 0 && (
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{rule.label}</span>
                      {rule.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewListingPageContent />
    </Suspense>
  );
}
