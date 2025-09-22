import { z } from "zod";

export const ImageUrl = z.string().url().refine(
  u => /\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i.test(u), 
  "Unsupported image type"
);

export const CommonSchema = {
  title: z.string().min(3),
  description: z.string().max(5000).optional(),
  category: z.string().optional(),
  locationCity: z.string().max(120).optional(),
  locationCountry: z.string().max(120).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).default("DRAFT"),
  photos: z.array(ImageUrl).max(10).default([]),
  currency: z.string().length(3).optional(),
  priceFrom: z.number().int().nonnegative().optional(), // cents
  capacity: z.number().int().positive().optional(),
  seoMeta: z.string().max(160).optional(),
};

// Type-specific schemas
const RestaurantDetails = z.object({
  kind: z.literal("RESTAURANT"),
  menuUrl: z.string().url().optional(),
  hours: z.array(z.object({ 
    day: z.string(), 
    open: z.string(), 
    close: z.string() 
  })).optional(),
  reservationUrl: z.string().url().optional(),
  cuisines: z.array(z.string()).optional(),
});

const RetreatDetails = z.object({
  kind: z.literal("RETREAT"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  packagePrice: z.number().int().nonnegative(),
  includes: z.array(z.string()).optional(),
  accommodations: z.array(z.object({ 
    name: z.string(), 
    beds: z.number().int().positive(), 
    price: z.number().int().nonnegative() 
  })).optional(),
  location: z.object({ 
    address: z.string().optional(), 
    lat: z.number().optional(), 
    lng: z.number().optional() 
  }).optional(),
});

const EventTicketTier = z.object({
  name: z.string(),
  price: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
});

const EventDetails = z.object({
  kind: z.literal("EVENT"),
  start: z.string().datetime(),
  end: z.string().datetime(),
  venue: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  tickets: z.array(EventTicketTier).min(1),
  rsvpUrl: z.string().url().optional(),
  externalLinks: z.array(z.string().url()).optional(),
});

const ActivityDetails = z.object({
  kind: z.literal("ACTIVITY"),
  schedule: z.array(z.object({ 
    date: z.string().datetime(), 
    durationMin: z.number().int().positive() 
  })).min(1),
  skillLevel: z.enum(["BEGINNER","INTERMEDIATE","ADVANCED"]).optional(),
  equipmentProvided: z.boolean().optional(),
  pricePerPerson: z.number().int().nonnegative(),
  meetPoint: z.string().optional(),
});

const PropertyDetails = z.object({
  kind: z.literal("PROPERTY"),
  rentalType: z.enum(["HOURLY","DAILY","NIGHTLY"]),
  rate: z.number().int().nonnegative(),
  cleaningFee: z.number().int().nonnegative().optional(),
  securityDeposit: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  baths: z.number().int().nonnegative().optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const DetailsUnion = z.discriminatedUnion("kind", [
  RestaurantDetails, 
  RetreatDetails, 
  EventDetails, 
  ActivityDetails, 
  PropertyDetails
]);

export const ListingCreateSchema = z.object({
  type: z.enum(["RESTAURANT","RETREAT","EVENT","ACTIVITY","PROPERTY"]),
  ...CommonSchema,
  details: DetailsUnion,
});

export const ListingUpdateSchema = ListingCreateSchema.extend({
  id: z.string(),
}).partial({ // allow patch
  title: true, 
  description: true, 
  category: true, 
  locationCity: true, 
  locationCountry: true,
  slug: true, 
  status: true, 
  photos: true, 
  currency: true, 
  priceFrom: true, 
  capacity: true, 
  seoMeta: true, 
  details: true, 
  type: true,
});

export type ListingCreateInput = z.infer<typeof ListingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof ListingUpdateSchema>;

// Backward compatibility exports
export const createListingSchema = ListingCreateSchema;
export const updateListingSchema = ListingUpdateSchema;

// Export enums for backward compatibility
export const ListingType = z.enum(["RESTAURANT","RETREAT","EVENT","ACTIVITY","PROPERTY"]);
export const ListingStatus = z.enum(["DRAFT","PUBLISHED","ARCHIVED"]);

// Helper function to get default details for a type
export function getDefaultDetailsForType(type: string) {
  switch (type) {
    case "RESTAURANT":
      return { kind: "RESTAURANT" as const };
    case "RETREAT":
      return { 
        kind: "RETREAT" as const, 
        startDate: "", 
        endDate: "", 
        packagePrice: 0 
      };
    case "EVENT":
      return { 
        kind: "EVENT" as const, 
        start: "", 
        end: "", 
        venue: {}, 
        tickets: [{ name: "General", price: 0, qty: 100 }] 
      };
    case "ACTIVITY":
      return { 
        kind: "ACTIVITY" as const, 
        schedule: [{ date: "", durationMin: 60 }], 
        pricePerPerson: 0 
      };
    case "PROPERTY":
      return { 
        kind: "PROPERTY" as const, 
        rentalType: "HOURLY" as const, 
        rate: 0 
      };
    default:
      return {};
  }
}

// Validation helpers for required fields by type
export function getRequiredFieldsForType(type: string): string[] {
  switch (type) {
    case "EVENT":
      return ["details.start", "details.end", "details.venue.address", "details.tickets"];
    case "PROPERTY":
      return ["details.rentalType", "details.rate"];
    case "RETREAT":
      return ["details.startDate", "details.endDate", "details.packagePrice"];
    case "ACTIVITY":
      return ["details.schedule", "details.pricePerPerson"];
    case "RESTAURANT":
      return []; // No required fields beyond common
    default:
      return [];
  }
}