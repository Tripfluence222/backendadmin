"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/uploader/ImageUploader";
import { ListingCreateInput, getDefaultDetailsForType } from "@/lib/validation/listings";
import { useEffect } from "react";

export default function ListingTypeForm() {
  const { control, register, setValue, watch } = useFormContext<ListingCreateInput>();
  const type = useWatch({ control, name: "type" });
  const details = watch("details");

  // Reset details when type changes
  useEffect(() => {
    if (type && (!details || details.kind !== type)) {
      setValue("details", getDefaultDetailsForType(type));
    }
  }, [type, details, setValue]);

  return (
    <div className="space-y-6">
      {/* Common Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input 
                {...register("title")} 
                placeholder="Listing title" 
                data-testid="listing-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type *</label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="listing-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                      <SelectItem value="RETREAT">Retreat</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                      <SelectItem value="ACTIVITY">Activity</SelectItem>
                      <SelectItem value="PROPERTY">Property</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              {...register("description")} 
              placeholder="Describe your listing..." 
              rows={4}
              data-testid="listing-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input 
                {...register("category")} 
                placeholder="e.g., Wellness, Culinary" 
                data-testid="listing-category"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  {...register("locationCity")} 
                  placeholder="City" 
                  data-testid="listing-city"
                />
                <Input 
                  {...register("locationCountry")} 
                  placeholder="Country" 
                  data-testid="listing-country"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input 
                {...register("slug")} 
                placeholder="url-friendly-slug" 
                data-testid="listing-slug"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="listing-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Currency</label>
              <Input 
                {...register("currency")} 
                placeholder="USD" 
                maxLength={3}
                data-testid="listing-currency"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price From (cents)</label>
              <Input 
                type="number" 
                {...register("priceFrom", { valueAsNumber: true })} 
                placeholder="e.g., 15000" 
                data-testid="listing-price"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <Input 
                type="number" 
                {...register("capacity", { valueAsNumber: true })} 
                placeholder="e.g., 40" 
                data-testid="listing-capacity"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Images</label>
            <Controller
              name="photos"
              control={control}
              render={({ field }) => (
                <ImageUploader 
                  value={field.value || []} 
                  onChange={field.onChange} 
                />
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              First image becomes the cover. JPG/PNG/WebP/AVIF up to 5MB. Max 10.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">SEO Meta Description</label>
            <Textarea 
              {...register("seoMeta")} 
              placeholder="Brief description for search engines..." 
              rows={2}
              maxLength={160}
              data-testid="listing-seo"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {watch("seoMeta")?.length || 0}/160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific sections */}
      {type === "EVENT" && (
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date & Time *</label>
                <Input 
                  type="datetime-local"
                  {...register("details.start")} 
                  data-testid="event-start"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date & Time *</label>
                <Input 
                  type="datetime-local"
                  {...register("details.end")} 
                  data-testid="event-end"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Venue Name</label>
                <Input 
                  {...register("details.venue.name")} 
                  placeholder="Venue name" 
                  data-testid="event-venue-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Venue Address *</label>
                <Input 
                  {...register("details.venue.address")} 
                  placeholder="Venue address" 
                  data-testid="event-venue-address"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">RSVP URL</label>
              <Input 
                {...register("details.rsvpUrl")} 
                placeholder="https://..." 
                data-testid="event-rsvp"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ticket Tiers *</label>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    {...register("details.tickets.0.name")} 
                    placeholder="Tier name" 
                    defaultValue="General"
                    data-testid="event-ticket-name"
                  />
                  <Input 
                    type="number"
                    {...register("details.tickets.0.price", { valueAsNumber: true })} 
                    placeholder="Price (cents)" 
                    data-testid="event-ticket-price"
                  />
                  <Input 
                    type="number"
                    {...register("details.tickets.0.qty", { valueAsNumber: true })} 
                    placeholder="Quantity" 
                    defaultValue={100}
                    data-testid="event-ticket-qty"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {type === "RESTAURANT" && (
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Menu URL</label>
              <Input 
                {...register("details.menuUrl")} 
                placeholder="https://..." 
                data-testid="restaurant-menu"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reservation URL</label>
              <Input 
                {...register("details.reservationUrl")} 
                placeholder="https://..." 
                data-testid="restaurant-reservation"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cuisines</label>
              <Input 
                {...register("details.cuisines")} 
                placeholder="Italian, Mediterranean, Fine Dining" 
                data-testid="restaurant-cuisines"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === "RETREAT" && (
        <Card>
          <CardHeader>
            <CardTitle>Retreat Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input 
                  type="datetime-local"
                  {...register("details.startDate")} 
                  data-testid="retreat-start"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date *</label>
                <Input 
                  type="datetime-local"
                  {...register("details.endDate")} 
                  data-testid="retreat-end"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Package Price (cents) *</label>
              <Input 
                type="number"
                {...register("details.packagePrice", { valueAsNumber: true })} 
                placeholder="e.g., 50000" 
                data-testid="retreat-price"
              />
            </div>
            <div>
              <label className="text-sm font-medium">What's Included</label>
              <Textarea 
                {...register("details.includes")} 
                placeholder="Accommodation, meals, activities..." 
                rows={3}
                data-testid="retreat-includes"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === "ACTIVITY" && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Price Per Person (cents) *</label>
              <Input 
                type="number"
                {...register("details.pricePerPerson", { valueAsNumber: true })} 
                placeholder="e.g., 2500" 
                data-testid="activity-price"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meeting Point</label>
              <Input 
                {...register("details.meetPoint")} 
                placeholder="Where to meet" 
                data-testid="activity-meetpoint"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Skill Level</label>
              <Controller
                control={control}
                name="details.skillLevel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="activity-skill">
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                {...register("details.equipmentProvided")} 
                data-testid="activity-equipment"
              />
              <label className="text-sm font-medium">Equipment Provided</label>
            </div>
          </CardContent>
        </Card>
      )}

      {type === "PROPERTY" && (
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rental Type *</label>
              <Controller
                control={control}
                name="details.rentalType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="property-rental-type">
                      <SelectValue placeholder="Select rental type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">Hourly</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="NIGHTLY">Nightly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Base Rate (cents) *</label>
                <Input 
                  type="number"
                  {...register("details.rate", { valueAsNumber: true })} 
                  placeholder="e.g., 10000" 
                  data-testid="property-rate"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cleaning Fee (cents)</label>
                <Input 
                  type="number"
                  {...register("details.cleaningFee", { valueAsNumber: true })} 
                  placeholder="e.g., 5000" 
                  data-testid="property-cleaning"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Security Deposit (cents)</label>
                <Input 
                  type="number"
                  {...register("details.securityDeposit", { valueAsNumber: true })} 
                  placeholder="e.g., 20000" 
                  data-testid="property-deposit"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Bedrooms</label>
                <Input 
                  type="number"
                  {...register("details.bedrooms", { valueAsNumber: true })} 
                  placeholder="e.g., 2" 
                  data-testid="property-bedrooms"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bathrooms</label>
                <Input 
                  type="number"
                  {...register("details.baths", { valueAsNumber: true })} 
                  placeholder="e.g., 1" 
                  data-testid="property-baths"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input 
                {...register("details.address")} 
                placeholder="Property address" 
                data-testid="property-address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amenities</label>
              <Textarea 
                {...register("details.amenities")} 
                placeholder="WiFi, Parking, Kitchen, Pool..." 
                rows={3}
                data-testid="property-amenities"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rules</label>
              <Textarea 
                {...register("details.rules")} 
                placeholder="No smoking, No pets, Quiet hours..." 
                rows={3}
                data-testid="property-rules"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

