# Space Rental Feature - Tripfluence Admin

## Overview

The Space Rental feature allows yoga studios, cafés, and other venues to list their spaces for rent, manage bookings, and process payments. It includes both admin management tools and public discovery pages.

## Features Implemented

### ✅ Data Model & Database
- **Prisma Schema**: Complete data model with Space, SpaceAmenity, SpaceRule, SpacePricingRule, SpaceAvailability, SpaceRequest, SpaceMessage, PayoutAccount, and Payout models
- **Migrations**: Database migrations for all space rental tables
- **Seed Data**: Demo data including 3 spaces (2 yoga studios, 1 café) with amenities, rules, pricing, and sample requests

### ✅ Validation & Business Logic
- **Zod Schemas**: Comprehensive validation for all space rental operations
- **Pricing Engine**: Smart pricing calculation with hourly/daily rates, peak pricing, cleaning fees, and security deposits
- **RBAC**: Role-based access control for admin operations

### ✅ API Routes
- **Admin APIs**: Complete CRUD operations for spaces, pricing, availability, and requests
- **Public APIs**: Read-only APIs for venue discovery and booking requests
- **Request Management**: Approve/decline requests, quote management, messaging
- **Hold System**: 24-hour hold expiry with background job processing

### ✅ Background Jobs
- **BullMQ Integration**: Space hold expiry job processing
- **Worker System**: Automated request expiry handling
- **Queue Management**: Redis-based job queuing

### ✅ Public Discovery Pages
- **Homepage**: Landing page with hero section and feature highlights
- **Venue Listing**: Search and filter venues with map integration
- **City Pages**: SEO-optimized city landing pages
- **Venue Details**: Complete venue information with booking form
- **Search Results**: Advanced search with filters and pagination

### ✅ UI Components
- **Search & Filters**: Advanced search with date, capacity, amenities, and price filters
- **Venue Cards**: Responsive venue cards with photos and key information
- **Booking Form**: Complete request-to-book form with date/time selection
- **Map Integration**: Venue location display (ready for MapLibre/Leaflet integration)
- **Responsive Design**: Mobile-first design with Tailwind CSS

### ✅ SEO & Performance
- **Sitemap**: Dynamic sitemap generation for all published venues
- **Robots.txt**: Search engine optimization
- **Metadata**: OpenGraph and Twitter card support
- **ISR**: Incremental Static Regeneration for fast loading
- **Image Optimization**: Next.js Image component with responsive sizing

## File Structure

```
├── prisma/
│   └── schema.prisma                 # Extended with space rental models
├── lib/
│   ├── validation/
│   │   └── space.ts                  # Zod validation schemas
│   ├── space/
│   │   └── pricing.ts                # Pricing engine
│   ├── auth.ts                       # Authentication utilities
│   ├── rbac-server.ts                # Server-side RBAC
│   ├── logger.ts                     # Logging utilities
│   └── ids.ts                        # ID generation utilities
├── app/
│   ├── api/
│   │   ├── space/                    # Admin space APIs
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── publish/route.ts
│   │   │   │   ├── pricing/route.ts
│   │   │   │   └── availability/route.ts
│   │   │   └── availability/[slotId]/route.ts
│   │   ├── space/requests/           # Request management APIs
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── quote/route.ts
│   │   │       ├── approve/route.ts
│   │   │       ├── decline/route.ts
│   │   │       ├── cancel/route.ts
│   │   │       └── messages/route.ts
│   │   └── public/                   # Public discovery APIs
│   │       ├── space/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── availability/route.ts
│   │       └── quote/route.ts
│   ├── (public)/                     # Public pages
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Homepage
│   │   ├── venues/
│   │   │   ├── page.tsx              # Venue listing
│   │   │   └── [city]/
│   │   │       ├── page.tsx          # City landing
│   │   │       └── [slug]/page.tsx   # Venue detail
│   │   └── search/page.tsx           # Search results
│   ├── sitemap.ts                    # Dynamic sitemap
│   └── robots.ts                     # Robots.txt
├── components/
│   ├── public/                       # Public components
│   │   ├── SearchBar.tsx
│   │   ├── Filters.tsx
│   │   ├── VenueGrid.tsx
│   │   ├── VenueCard.tsx
│   │   ├── VenueDetail.tsx
│   │   ├── RequestToBook.tsx
│   │   ├── CityLanding.tsx
│   │   ├── SearchResults.tsx
│   │   ├── Map.tsx
│   │   └── Skeletons.tsx
│   └── ui/                           # UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── skeleton.tsx
│       ├── calendar.tsx
│       ├── popover.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── slider.tsx
│       ├── checkbox.tsx
│       ├── label.tsx
│       └── separator.tsx
├── jobs/
│   ├── queue.ts                      # Extended with space queue
│   └── worker.ts                     # Extended with space worker
└── hooks/
    └── use-toast.ts                  # Toast notifications
```

## API Endpoints

### Admin APIs (Protected)
- `GET /api/space` - List spaces with filters
- `POST /api/space` - Create new space
- `GET /api/space/[id]` - Get space details
- `PATCH /api/space/[id]` - Update space
- `DELETE /api/space/[id]` - Delete space
- `POST /api/space/[id]/publish` - Publish space
- `GET /api/space/[id]/pricing` - Get pricing rules
- `POST /api/space/[id]/pricing` - Update pricing rules
- `GET /api/space/[id]/availability` - Get availability
- `POST /api/space/[id]/availability` - Add availability blocks
- `DELETE /api/space/availability/[slotId]` - Remove availability block
- `GET /api/space/requests` - List booking requests
- `POST /api/space/requests` - Create booking request
- `GET /api/space/requests/[id]` - Get request details
- `POST /api/space/requests/[id]/quote` - Update quote
- `POST /api/space/requests/[id]/approve` - Approve request
- `POST /api/space/requests/[id]/decline` - Decline request
- `POST /api/space/requests/[id]/cancel` - Cancel request
- `GET /api/space/requests/[id]/messages` - Get messages
- `POST /api/space/requests/[id]/messages` - Send message

### Public APIs (Open)
- `GET /api/public/space` - List published spaces
- `GET /api/public/space/[id]` - Get space details
- `GET /api/public/availability` - Get availability
- `POST /api/public/quote` - Get pricing quote

## Database Models

### Core Models
- **Space**: Main venue entity with photos, location, capacity, amenities, rules
- **SpaceAmenity**: Amenities like WiFi, parking, audio system
- **SpaceRule**: House rules like "No shoes", "Quiet after 9pm"
- **SpacePricingRule**: Pricing with hourly/daily rates, peak pricing, fees
- **SpaceAvailability**: Available time blocks and blackouts
- **SpaceRequest**: Booking requests with status tracking
- **SpaceMessage**: Communication between hosts and guests
- **PayoutAccount**: Stripe Connect account for hosts
- **Payout**: Payment records for hosts

### Enums
- **SpaceStatus**: DRAFT, PUBLISHED, ARCHIVED
- **PricingKind**: HOURLY, DAILY, PEAK, CLEANING_FEE, SECURITY_DEPOSIT
- **SpaceReqStatus**: PENDING, NEEDS_PAYMENT, PAID_HOLD, CONFIRMED, DECLINED, EXPIRED, CANCELLED

## Pricing Engine

The pricing engine calculates costs based on:
- **Base Rate**: Hourly or daily pricing
- **Peak Pricing**: Higher rates for weekends or specific hours
- **Cleaning Fee**: Optional cleaning charge
- **Security Deposit**: Refundable deposit
- **Duration**: Automatic calculation based on start/end times

## Background Jobs

### Space Hold Expiry
- **Queue**: `space.hold.expire`
- **Trigger**: When request is approved (NEEDS_PAYMENT status)
- **Action**: Expires request after 24 hours if not paid
- **Worker**: `spaceWorker` in `jobs/worker.ts`

## Public Pages

### Homepage (`/`)
- Hero section with search
- Feature highlights
- Popular amenities
- Call-to-action sections

### Venue Listing (`/venues`)
- Search bar with filters
- Grid view of venues
- Map integration
- Pagination

### City Pages (`/venues/[city]`)
- SEO-optimized city landing pages
- Featured venues for the city
- Local information
- Call-to-action

### Venue Details (`/venues/[city]/[slug]`)
- Photo gallery
- Complete venue information
- Amenities and rules
- Booking form
- Host information

### Search Results (`/search`)
- Advanced search with filters
- Results grid
- Pagination
- No results handling

## Security & RBAC

### Role-Based Access Control
- **ADMIN**: Full access to all space operations
- **MANAGER**: Can manage spaces, approve requests, update pricing
- **STAFF**: Read-only access, can message guests
- **INFLUENCER**: View published spaces only

### Security Features
- **Input Validation**: Zod schemas for all inputs
- **RBAC Checks**: Server-side permission validation
- **Audit Logging**: All actions logged with user context
- **Rate Limiting**: API rate limiting (ready for implementation)
- **CSRF Protection**: Next.js built-in protection

## SEO & Performance

### SEO Features
- **Dynamic Sitemap**: Auto-generated sitemap with all published venues
- **Meta Tags**: OpenGraph and Twitter cards
- **Structured Data**: JSON-LD for LocalBusiness schema
- **Canonical URLs**: Proper URL structure
- **Robots.txt**: Search engine directives

### Performance
- **ISR**: Incremental Static Regeneration
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components and images
- **Caching**: API response caching
- **Bundle Optimization**: Code splitting

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Redis (for BullMQ)
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Map Integration
NEXT_PUBLIC_MAPBOX_TOKEN="pk..."
# or
NEXT_PUBLIC_LEAFLET_CDN="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Start Redis**
   ```bash
   brew install redis
   brew services start redis
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Public site: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

## Next Steps

### Pending Features
- [ ] **Admin UI**: Complete admin dashboard for space management
- [ ] **Stripe Connect**: Payment processing and payouts
- [ ] **E2E Tests**: Playwright tests for all workflows
- [ ] **Map Integration**: Real map with MapLibre GL JS or Leaflet
- [ ] **Email Notifications**: Booking confirmations and updates
- [ ] **Advanced Search**: Algolia integration for fast search
- [ ] **Mobile App**: React Native app for hosts and guests

### Production Considerations
- [ ] **Monitoring**: Sentry error tracking
- [ ] **Analytics**: Google Analytics or Mixpanel
- [ ] **CDN**: Image and static asset delivery
- [ ] **Load Balancing**: Multiple server instances
- [ ] **Database Optimization**: Query optimization and indexing
- [ ] **Security**: Rate limiting, DDoS protection
- [ ] **Backup**: Automated database backups

## Demo Data

The seed script creates:
- **3 Demo Spaces**: 2 yoga studios, 1 café
- **Amenities**: WiFi, audio systems, projectors, etc.
- **Pricing Rules**: Hourly rates, peak pricing, fees
- **Availability**: 10 availability blocks over 30 days
- **Sample Requests**: 3 requests in different states
- **Messages**: Sample conversation threads
- **Payout Account**: Mock Stripe Connect account

## Support

For questions or issues with the Space Rental feature, please refer to:
- API documentation in the code comments
- Database schema in `prisma/schema.prisma`
- Component documentation in the component files
- Test files for usage examples
