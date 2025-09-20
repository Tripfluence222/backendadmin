import { z } from 'zod';

// Base schema for all listings
const BaseListingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Event-specific schema
export const EventSchema = BaseListingSchema.extend({
  type: z.literal('event'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  organizer: z.string().min(1, 'Organizer is required'),
  category: z.enum([
    'conference',
    'workshop',
    'networking',
    'entertainment',
    'sports',
    'culture',
    'education',
    'business',
    'other'
  ]),
  venue: z.object({
    name: z.string().min(1, 'Venue name is required'),
    address: z.string().min(1, 'Venue address is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  ticketTypes: z.array(z.object({
    name: z.string(),
    price: z.number().nonnegative(),
    quantity: z.number().int().positive(),
    description: z.string().optional(),
  })).min(1, 'At least one ticket type is required'),
  tags: z.array(z.string()).default([]),
  requirements: z.string().optional(),
  cancellationPolicy: z.string().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Retreat-specific schema
export const RetreatSchema = BaseListingSchema.extend({
  type: z.literal('retreat'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  durationDays: z.number().int().positive('Duration must be positive'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  pricePerPerson: z.number().positive('Price per person must be positive'),
  inclusions: z.array(z.string()).min(1, 'At least one inclusion is required'),
  exclusions: z.array(z.string()).default([]),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  instructor: z.object({
    name: z.string().min(1, 'Instructor name is required'),
    bio: z.string().min(10, 'Instructor bio is required'),
    certifications: z.array(z.string()).default([]),
    experience: z.string().optional(),
  }),
  accommodation: z.object({
    type: z.enum(['hotel', 'resort', 'camping', 'hostel', 'villa', 'other']),
    description: z.string(),
    amenities: z.array(z.string()),
  }),
  meals: z.object({
    included: z.boolean(),
    dietaryOptions: z.array(z.string()),
    description: z.string().optional(),
  }),
  activities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    duration: z.string(),
    optional: z.boolean().default(false),
  })),
  equipment: z.object({
    provided: z.array(z.string()),
    required: z.array(z.string()),
  }),
  minimumAge: z.number().int().min(0).optional(),
  fitnessLevel: z.enum(['low', 'moderate', 'high', 'extreme']),
  groupSize: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine(data => data.groupSize.max >= data.groupSize.min, {
  message: 'Maximum group size must be greater than or equal to minimum',
  path: ['groupSize', 'max'],
});

// Activity-specific schema
export const ActivitySchema = BaseListingSchema.extend({
  type: z.literal('activity'),
  durationHours: z.number().positive('Duration must be positive'),
  difficultyLevel: z.enum(['easy', 'moderate', 'challenging', 'extreme']),
  equipmentProvided: z.array(z.string()).default([]),
  equipmentRequired: z.array(z.string()).default([]),
  minimumAge: z.number().int().min(0, 'Minimum age cannot be negative'),
  maximumAge: z.number().int().positive().optional(),
  maxParticipants: z.number().int().positive('Maximum participants must be positive'),
  instructor: z.object({
    name: z.string().min(1, 'Instructor name is required'),
    qualifications: z.array(z.string()),
    experience: z.string(),
  }),
  safetyNotes: z.string().min(1, 'Safety notes are required'),
  prerequisites: z.array(z.string()).default([]),
  cancellationPolicy: z.string(),
  weatherDependent: z.boolean().default(false),
  physicalRequirements: z.string().optional(),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  meetingPoint: z.object({
    name: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    instructions: z.string().optional(),
  }),
  categories: z.array(z.enum([
    'adventure',
    'cultural',
    'nature',
    'sports',
    'educational',
    'relaxation',
    'culinary',
    'artistic'
  ])).min(1, 'At least one category is required'),
}).refine(data => {
  if (data.maximumAge && data.minimumAge >= data.maximumAge) {
    return false;
  }
  return true;
}, {
  message: 'Maximum age must be greater than minimum age',
  path: ['maximumAge'],
});

// Coworking space-specific schema
export const CoworkingSchema = BaseListingSchema.extend({
  type: z.literal('coworking'),
  address: z.string().min(1, 'Address is required'),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional(),
  }),
  pricing: z.object({
    hourlyRate: z.number().positive('Hourly rate must be positive'),
    dayPassRate: z.number().positive('Day pass rate must be positive'),
    weeklyRate: z.number().positive().optional(),
    monthlyRate: z.number().positive().optional(),
  }),
  amenities: z.array(z.object({
    name: z.string(),
    category: z.enum(['workspace', 'technology', 'kitchen', 'wellness', 'meeting', 'other']),
    description: z.string().optional(),
    available: z.boolean().default(true),
  })).min(1, 'At least one amenity is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
  wifiSpeed: z.object({
    download: z.number().positive('Download speed must be positive'),
    upload: z.number().positive('Upload speed must be positive'),
    unit: z.enum(['Mbps', 'Gbps']).default('Mbps'),
  }),
  meetingRooms: z.array(z.object({
    name: z.string(),
    capacity: z.number().int().positive(),
    hourlyRate: z.number().nonnegative(),
    amenities: z.array(z.string()),
  })).default([]),
  parking: z.object({
    available: z.boolean(),
    type: z.enum(['free', 'paid', 'street']).optional(),
    spaces: z.number().int().nonnegative().optional(),
    cost: z.number().nonnegative().optional(),
  }),
  accessibility: z.object({
    wheelchairAccessible: z.boolean(),
    elevatorAccess: z.boolean(),
    accessibleBathroom: z.boolean(),
    brailleSignage: z.boolean().default(false),
    hearingLoop: z.boolean().default(false),
  }),
  rules: z.array(z.string()).default([]),
  minimumBookingDuration: z.number().positive('Minimum booking duration must be positive').default(1),
  cancellationPolicy: z.string(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }),
});

// Restaurant-specific schema
export const RestaurantSchema = BaseListingSchema.extend({
  type: z.literal('restaurant'),
  cuisineType: z.array(z.enum([
    'italian',
    'chinese',
    'japanese',
    'indian',
    'mexican',
    'french',
    'thai',
    'mediterranean',
    'american',
    'fusion',
    'vegetarian',
    'vegan',
    'seafood',
    'steakhouse',
    'breakfast',
    'cafe',
    'other'
  ])).min(1, 'At least one cuisine type is required'),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
  address: z.string().min(1, 'Address is required'),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional(),
  }),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  menuHighlights: z.array(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().positive(),
    category: z.enum(['appetizer', 'main', 'dessert', 'beverage', 'special']),
    dietary: z.array(z.enum(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'])).default([]),
  })).min(1, 'At least one menu highlight is required'),
  dietaryOptions: z.array(z.enum([
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'keto',
    'paleo',
    'halal',
    'kosher'
  ])).default([]),
  reservationsRequired: z.boolean().default(false),
  capacity: z.number().int().positive('Capacity must be positive'),
  ambiance: z.array(z.enum([
    'casual',
    'fine-dining',
    'family-friendly',
    'romantic',
    'business',
    'outdoor',
    'bar',
    'fast-casual'
  ])).min(1, 'At least one ambiance type is required'),
  parking: z.object({
    available: z.boolean(),
    type: z.enum(['free', 'paid', 'valet', 'street']).optional(),
    description: z.string().optional(),
  }),
  features: z.array(z.enum([
    'takeout',
    'delivery',
    'outdoor-seating',
    'bar',
    'live-music',
    'private-dining',
    'catering',
    'wifi',
    'pet-friendly'
  ])).default([]),
  averageMealDuration: z.number().positive().optional(),
  dressCode: z.enum(['casual', 'smart-casual', 'business', 'formal']).default('casual'),
  acceptedPayments: z.array(z.enum(['cash', 'credit', 'debit', 'mobile'])).min(1),
});

// Union type for all listing schemas
export const ListingSchema = z.discriminatedUnion('type', [
  EventSchema,
  RetreatSchema,
  ActivitySchema,
  CoworkingSchema,
  RestaurantSchema,
]);

// Type exports
export type Event = z.infer<typeof EventSchema>;
export type Retreat = z.infer<typeof RetreatSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Coworking = z.infer<typeof CoworkingSchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type Listing = z.infer<typeof ListingSchema>;

// Helper functions for validation
export const validateListing = (data: unknown): Listing => {
  return ListingSchema.parse(data);
};

export const validateEvent = (data: unknown): Event => {
  return EventSchema.parse(data);
};

export const validateRetreat = (data: unknown): Retreat => {
  return RetreatSchema.parse(data);
};

export const validateActivity = (data: unknown): Activity => {
  return ActivitySchema.parse(data);
};

export const validateCoworking = (data: unknown): Coworking => {
  return CoworkingSchema.parse(data);
};

export const validateRestaurant = (data: unknown): Restaurant => {
  return RestaurantSchema.parse(data);
};

// Schema lookup by type
export const getSchemaByType = (type: string) => {
  switch (type) {
    case 'event':
      return EventSchema;
    case 'retreat':
      return RetreatSchema;
    case 'activity':
      return ActivitySchema;
    case 'coworking':
      return CoworkingSchema;
    case 'restaurant':
      return RestaurantSchema;
    default:
      throw new Error(`Unknown listing type: ${type}`);
  }
};

// Form field definitions for dynamic forms
export const getRequiredFields = (type: string): string[] => {
  const baseFields = ['title', 'description', 'location', 'images', 'price'];
  
  switch (type) {
    case 'event':
      return [...baseFields, 'startDate', 'endDate', 'startTime', 'endTime', 'capacity', 'organizer', 'category', 'venue'];
    case 'retreat':
      return [...baseFields, 'startDate', 'endDate', 'durationDays', 'capacity', 'pricePerPerson', 'difficultyLevel', 'instructor'];
    case 'activity':
      return [...baseFields, 'durationHours', 'difficultyLevel', 'minimumAge', 'maxParticipants', 'instructor', 'safetyNotes'];
    case 'coworking':
      return [...baseFields, 'address', 'operatingHours', 'pricing', 'amenities', 'capacity', 'wifiSpeed'];
    case 'restaurant':
      return [...baseFields, 'cuisineType', 'priceRange', 'address', 'operatingHours', 'menuHighlights', 'capacity'];
    default:
      return baseFields;
  }
};