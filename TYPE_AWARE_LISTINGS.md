# Type-Aware Listings System

This document describes the enhanced listings system that supports multiple listing types with type-specific fields and robust image management.

## Overview

The listings system now supports 5 distinct types:
- **RESTAURANT** - Food & dining establishments
- **RETREAT** - Wellness and retreat experiences  
- **EVENT** - Time-based events with tickets
- **ACTIVITY** - Recreational activities and experiences
- **PROPERTY** - Rental properties and spaces

## Database Schema

### Listing Model
```prisma
model Listing {
  id            String        @id @default(cuid())
  businessId    String
  title         String
  slug          String        @unique
  type          ListingType
  status        ListingStatus @default(DRAFT)
  description   String?
  category      String?
  locationCity  String?
  locationCountry String?
  photos        Json?         // string[] URLs
  currency      String?       // e.g. "USD"
  priceFrom     Int?          // minor units (cents)
  capacity      Int?
  details       Json?         // typed by Zod discriminated union
  seoMeta       String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

### Enums
```prisma
enum ListingType {
  RESTAURANT
  RETREAT
  EVENT
  ACTIVITY
  PROPERTY
}

enum ListingStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## Type-Specific Fields

### RESTAURANT
- `menuUrl` - Link to online menu
- `reservationUrl` - Booking/reservation link
- `cuisines` - Array of cuisine types
- `hours` - Operating hours (optional)

### RETREAT
- `startDate` - Retreat start date/time
- `endDate` - Retreat end date/time
- `packagePrice` - Total package price in cents
- `includes` - What's included in the retreat
- `accommodations` - Available accommodation options
- `location` - Retreat location details

### EVENT
- `start` - Event start date/time
- `end` - Event end date/time
- `venue` - Venue information (name, address, coordinates)
- `tickets` - Array of ticket tiers with pricing
- `rsvpUrl` - RSVP or booking link
- `externalLinks` - Additional event links

### ACTIVITY
- `schedule` - Activity schedule with dates and durations
- `skillLevel` - BEGINNER, INTERMEDIATE, or ADVANCED
- `equipmentProvided` - Whether equipment is included
- `pricePerPerson` - Price per participant in cents
- `meetPoint` - Meeting location

### PROPERTY
- `rentalType` - HOURLY, DAILY, or NIGHTLY
- `rate` - Base rental rate in cents
- `cleaningFee` - Cleaning fee in cents
- `securityDeposit` - Security deposit in cents
- `bedrooms` - Number of bedrooms
- `baths` - Number of bathrooms
- `amenities` - Available amenities
- `rules` - Property rules and restrictions
- `address` - Property address
- `lat/lng` - Geographic coordinates

## Image Management

### Features
- **Multi-upload**: Upload up to 10 images per listing
- **Drag & Drop**: Reorder images with drag-and-drop
- **Cover Image**: First image automatically becomes the cover
- **File Types**: JPG, PNG, WebP, AVIF supported
- **Size Limit**: 5MB per image
- **Preview**: Thumbnail previews with cover badge

### API Endpoint
```
POST /api/uploads
Content-Type: multipart/form-data

Response: { urls: string[] }
```

## Validation

### Required Fields by Type

#### EVENT
- `details.start` - Event start time
- `details.end` - Event end time  
- `details.venue.address` - Venue address
- `details.tickets` - At least one ticket tier

#### PROPERTY
- `details.rentalType` - Rental type
- `details.rate` - Base rate

#### RETREAT
- `details.startDate` - Retreat start
- `details.endDate` - Retreat end
- `details.packagePrice` - Package price

#### ACTIVITY
- `details.schedule` - At least one scheduled session
- `details.pricePerPerson` - Price per person

#### RESTAURANT
- No additional required fields beyond common fields

### Common Required Fields
- `title` - Listing title
- `slug` - URL-friendly identifier
- `type` - Listing type

## API Endpoints

### Listings
```
GET    /api/listings           - List with filters
POST   /api/listings           - Create new listing
PATCH  /api/listings?id=:id    - Update listing
GET    /api/listings/:id       - Get single listing
PATCH  /api/listings/:id       - Update single listing
DELETE /api/listings/:id       - Delete listing
```

### Filters
- `type` - Filter by listing type
- `status` - Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `city` - Filter by city
- `q` - Search in title, description, slug, category

## Form Components

### ListingTypeForm
Dynamic form that shows/hides fields based on selected type:
- Common fields always visible
- Type-specific sections appear when type is selected
- Automatic validation based on type requirements
- Image upload with drag-and-drop reordering

### ImageUploader
- Drag-and-drop file upload
- Image reordering with dnd-kit
- Cover image indication
- File validation and error handling
- Progress indicators

## Testing

### Playwright Tests
Comprehensive test suite covering:
- Creating each listing type with type-specific fields
- Image upload and reordering
- Form validation for required fields
- Filtering and search functionality
- Edit operations and updates

### Test Commands
```bash
# Run all listing tests
npm run test:e2e -- tests/e2e/listings-types.spec.ts

# Run specific test
npm run test:e2e -- tests/e2e/listings-types.spec.ts -g "Create EVENT listing"
```

## Usage Examples

### Creating an Event
```typescript
const eventData = {
  type: "EVENT",
  title: "Summer Music Festival",
  slug: "summer-music-festival",
  description: "Outdoor music festival",
  details: {
    kind: "EVENT",
    start: "2024-07-15T18:00:00Z",
    end: "2024-07-15T23:00:00Z",
    venue: {
      name: "Golden Gate Park",
      address: "Golden Gate Park, San Francisco, CA"
    },
    tickets: [
      { name: "General", price: 5000, qty: 500 }
    ]
  },
  photos: ["/uploads/festival-1.jpg", "/uploads/festival-2.jpg"]
};
```

### Creating a Property
```typescript
const propertyData = {
  type: "PROPERTY",
  title: "Luxury Downtown Loft",
  slug: "luxury-downtown-loft",
  details: {
    kind: "PROPERTY",
    rentalType: "NIGHTLY",
    rate: 20000, // $200.00
    cleaningFee: 5000, // $50.00
    bedrooms: 2,
    baths: 2,
    amenities: ["WiFi", "Kitchen", "Parking"]
  }
};
```

## Migration Notes

### Database Migration
Run the migration to update the schema:
```bash
npx prisma migrate dev --name "listing_types_v2"
```

### Data Migration
Existing listings will need to be migrated:
- `media` field → `photos` field
- `location` field → `locationCity`/`locationCountry`
- `price` field → `priceFrom` (convert to cents)
- Add `details` field with appropriate type structure

## Best Practices

### Form UX
- Show type-specific fields only when type is selected
- Provide clear validation messages for required fields
- Allow type switching with confirmation dialog
- Show image upload progress and validation

### Data Validation
- Always validate on both client and server
- Use Zod discriminated unions for type safety
- Sanitize file uploads and validate image types
- Normalize currency amounts to cents

### Performance
- Lazy load type-specific form sections
- Optimize image uploads with progress indicators
- Use pagination for large listing lists
- Cache frequently accessed listing data

## Troubleshooting

### Common Issues

1. **Image upload fails**
   - Check file size (max 5MB)
   - Verify file type (JPG, PNG, WebP, AVIF)
   - Ensure upload directory exists and is writable

2. **Validation errors**
   - Check required fields for selected type
   - Verify date formats (ISO 8601)
   - Ensure price values are in cents (integers)

3. **Type switching issues**
   - Clear details when changing type
   - Reset form validation state
   - Update default values for new type

### Debug Mode
Enable debug logging in development:
```typescript
// In lib/validation/listings.ts
const debug = process.env.NODE_ENV === 'development';
if (debug) console.log('Validation result:', result);
```

