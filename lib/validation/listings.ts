import { z } from 'zod';
import { ListingType, ListingStatus } from '@prisma/client';

export const createListingSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.nativeEnum(ListingType),
  description: z.string().min(1).max(5000),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  seoMeta: z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  media: z.array(z.string().url()).optional(),
  location: z.string().max(200).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
});

export const updateListingSchema = createListingSchema.partial();

export const publishListingSchema = z.object({
  status: z.nativeEnum(ListingStatus),
});

export const listingFiltersSchema = z.object({
  type: z.nativeEnum(ListingType).optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  q: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type PublishListingInput = z.infer<typeof publishListingSchema>;
export type ListingFilters = z.infer<typeof listingFiltersSchema>;
