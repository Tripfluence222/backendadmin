import { z } from "zod";

export const listingTypeSchema = z.enum([
  "restaurant",
  "retreat", 
  "event",
  "activity",
  "property"
]);

export const listingStatusSchema = z.enum([
  "draft",
  "published",
  "archived"
]);

export const createListingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  type: listingTypeSchema,
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  metaDescription: z.string().max(160, "Meta description too long").optional(),
  status: listingStatusSchema,
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingType = z.infer<typeof listingTypeSchema>;
export type ListingStatus = z.infer<typeof listingStatusSchema>;
