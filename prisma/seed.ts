import { PrismaClient, Role, ListingType, ListingStatus, OrderStatus, PaymentStatus, PaymentProvider, ReviewStatus, SocialProvider, SocialStatus, EventStatus, DiscountType, SpaceStatus, PricingKind, SpaceReqStatus } from '@prisma/client';
import { createOrderId, createPaymentId, createCouponCode } from '../lib/ids';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo business
  const business = await prisma.business.create({
    data: {
      name: 'Tripfluence Demo',
      slug: 'tripfluence-demo',
      domain: 'demo.tripfluence.com',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        features: ['listings', 'bookings', 'social', 'analytics'],
      },
    },
  });

  console.log('✅ Created business:', business.name);

  // Create users with different roles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        businessId: business.id,
        email: 'admin@tripfluence.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        businessId: business.id,
        email: 'manager@tripfluence.com',
        firstName: 'Manager',
        lastName: 'User',
        isActive: true,
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        businessId: business.id,
        email: 'staff@tripfluence.com',
        firstName: 'Staff',
        lastName: 'User',
        isActive: true,
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        businessId: business.id,
        email: 'influencer@tripfluence.com',
        firstName: 'Influencer',
        lastName: 'User',
        isActive: true,
        lastLoginAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Created users:', users.length);

  // Create role assignments
  await Promise.all([
    prisma.roleAssignment.create({
      data: {
        userId: users[0].id,
        businessId: business.id,
        role: Role.ADMIN,
      },
    }),
    prisma.roleAssignment.create({
      data: {
        userId: users[1].id,
        businessId: business.id,
        role: Role.MANAGER,
      },
    }),
    prisma.roleAssignment.create({
      data: {
        userId: users[2].id,
        businessId: business.id,
        role: Role.STAFF,
      },
    }),
    prisma.roleAssignment.create({
      data: {
        userId: users[3].id,
        businessId: business.id,
        role: Role.INFLUENCER,
      },
    }),
  ]);

  console.log('✅ Created role assignments');

  // Create listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        businessId: business.id,
        title: 'Sunset Yoga Retreat',
        type: ListingType.RETREAT,
        status: ListingStatus.PUBLISHED,
        slug: 'sunset-yoga-retreat',
        description: 'Transform your mind and body with our sunset yoga retreat in beautiful Bali. Perfect for beginners and experienced practitioners alike.',
        seoMeta: {
          title: 'Sunset Yoga Retreat in Bali - Transform Your Mind & Body',
          description: 'Join our transformative 3-day yoga retreat overlooking stunning Balinese sunsets. Perfect for all levels.',
          keywords: ['yoga', 'retreat', 'bali', 'wellness', 'meditation'],
        },
        media: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        ],
        location: 'Bali, Indonesia',
        capacity: 20,
        price: 299,
        currency: 'USD',
      },
    }),
    prisma.listing.create({
      data: {
        businessId: business.id,
        title: 'Farm-to-Table Cooking Class',
        type: ListingType.ACTIVITY,
        status: ListingStatus.PUBLISHED,
        slug: 'farm-to-table-cooking-class',
        description: 'An immersive cooking experience where you\'ll harvest ingredients and prepare a gourmet meal in the heart of Napa Valley.',
        seoMeta: {
          title: 'Farm-to-Table Cooking Class in Napa Valley',
          description: 'Learn to cook with fresh, local ingredients in the heart of Napa Valley wine country.',
          keywords: ['cooking', 'napa valley', 'farm to table', 'culinary', 'wine'],
        },
        media: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        ],
        location: 'Napa Valley, CA',
        capacity: 10,
        price: 150,
        currency: 'USD',
      },
    }),
    prisma.listing.create({
      data: {
        businessId: business.id,
        title: 'Adventure Hiking Tour',
        type: ListingType.TOUR,
        status: ListingStatus.PUBLISHED,
        slug: 'adventure-hiking-tour',
        description: 'A guided multi-day hiking tour through the stunning landscapes of the Italian Dolomites.',
        seoMeta: {
          title: 'Adventure Hiking Tour in the Dolomites',
          description: 'Explore breathtaking trails of the Italian Dolomites on an unforgettable hiking adventure.',
          keywords: ['hiking', 'dolomites', 'italy', 'adventure', 'mountains'],
        },
        media: [
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        ],
        location: 'Dolomites, Italy',
        capacity: 15,
        price: 450,
        currency: 'USD',
      },
    }),
    prisma.listing.create({
      data: {
        businessId: business.id,
        title: 'City Food Tour',
        type: ListingType.TOUR,
        status: ListingStatus.PUBLISHED,
        slug: 'rome-food-tour',
        description: 'A walking tour through Rome\'s culinary hotspots, sampling traditional dishes and hidden gems.',
        seoMeta: {
          title: 'Rome Food Tour - Taste the Best of Italian Cuisine',
          description: 'Discover Rome\'s street food and local delicacies on this guided culinary walking tour.',
          keywords: ['food tour', 'rome', 'italian cuisine', 'street food', 'culinary'],
        },
        media: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
        ],
        location: 'Rome, Italy',
        capacity: 12,
        price: 90,
        currency: 'USD',
      },
    }),
    prisma.listing.create({
      data: {
        businessId: business.id,
        title: 'Beginner Surfing Lesson',
        type: ListingType.ACTIVITY,
        status: ListingStatus.PUBLISHED,
        slug: 'beginner-surfing-lesson',
        description: 'Learn the basics of surfing in a fun and safe environment, perfect for beginners.',
        seoMeta: {
          title: 'Beginner Surfing Lessons in Maui',
          description: 'Catch your first wave with expert instructors on the beautiful beaches of Maui.',
          keywords: ['surfing', 'maui', 'hawaii', 'beginner', 'lessons'],
        },
        media: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        ],
        location: 'Maui, Hawaii',
        capacity: 8,
        price: 75,
        currency: 'USD',
      },
    }),
    prisma.listing.create({
      data: {
        businessId: business.id,
        title: 'Luxury Beach Villa',
        type: ListingType.PROPERTY,
        status: ListingStatus.DRAFT,
        slug: 'luxury-beach-villa',
        description: 'Stunning beachfront villa with private pool, perfect for a romantic getaway or family vacation.',
        seoMeta: {
          title: 'Luxury Beach Villa Rental - Private Pool & Ocean Views',
          description: 'Experience luxury in our beachfront villa with private pool and stunning ocean views.',
          keywords: ['villa', 'beach', 'luxury', 'rental', 'vacation'],
        },
        media: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        ],
        location: 'Malibu, CA',
        capacity: 6,
        price: 500,
        currency: 'USD',
      },
    }),
  ]);

  console.log('✅ Created listings:', listings.length);

  // Create inventory slots
  const slots = [];
  for (const listing of listings.slice(0, 5)) { // Skip the draft listing
    for (let i = 0; i < 4; i++) {
      const start = new Date();
      start.setDate(start.getDate() + i * 7); // Weekly slots
      start.setHours(10, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(start.getHours() + 2);
      
      slots.push(
        prisma.inventorySlot.create({
          data: {
            listingId: listing.id,
            start,
            end,
            capacity: listing.capacity || 10,
            remaining: Math.floor((listing.capacity || 10) * 0.7), // 70% booked
            location: listing.location,
            notes: `Available slot for ${listing.title}`,
          },
        })
      );
    }
  }

  await Promise.all(slots);
  console.log('✅ Created inventory slots:', slots.length);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        businessId: business.id,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-0123',
        loyaltyPoints: 150,
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        phone: '+1-555-0124',
        loyaltyPoints: 75,
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        email: 'mike.johnson@example.com',
        name: 'Mike Johnson',
        phone: '+1-555-0125',
        loyaltyPoints: 200,
      },
    }),
  ]);

  console.log('✅ Created customers:', customers.length);

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        id: createOrderId(),
        businessId: business.id,
        customerId: customers[0].id,
        total: 299,
        currency: 'USD',
        status: OrderStatus.PAID,
        items: [
          {
            listingId: listings[0].id,
            quantity: 1,
            price: 299,
          },
        ],
        metadata: {
          source: 'website',
          campaign: 'summer2024',
        },
      },
    }),
    prisma.order.create({
      data: {
        id: createOrderId(),
        businessId: business.id,
        customerId: customers[1].id,
        total: 150,
        currency: 'USD',
        status: OrderStatus.PAID,
        items: [
          {
            listingId: listings[1].id,
            quantity: 1,
            price: 150,
          },
        ],
        metadata: {
          source: 'mobile_app',
        },
      },
    }),
    prisma.order.create({
      data: {
        id: createOrderId(),
        businessId: business.id,
        customerId: customers[2].id,
        total: 450,
        currency: 'USD',
        status: OrderStatus.REFUNDED,
        items: [
          {
            listingId: listings[2].id,
            quantity: 1,
            price: 450,
          },
        ],
        metadata: {
          source: 'website',
          refundReason: 'Customer cancellation',
        },
      },
    }),
  ]);

  console.log('✅ Created orders:', orders.length);

  // Create payments
  await Promise.all([
    prisma.payment.create({
      data: {
        id: createPaymentId(),
        orderId: orders[0].id,
        provider: PaymentProvider.STRIPE,
        amount: 299,
        currency: 'USD',
        status: PaymentStatus.CAPTURED,
        raw: {
          paymentIntentId: 'pi_test_1234567890',
          chargeId: 'ch_test_1234567890',
        },
      },
    }),
    prisma.payment.create({
      data: {
        id: createPaymentId(),
        orderId: orders[1].id,
        provider: PaymentProvider.STRIPE,
        amount: 150,
        currency: 'USD',
        status: PaymentStatus.CAPTURED,
        raw: {
          paymentIntentId: 'pi_test_0987654321',
          chargeId: 'ch_test_0987654321',
        },
      },
    }),
    prisma.payment.create({
      data: {
        id: createPaymentId(),
        orderId: orders[2].id,
        provider: PaymentProvider.STRIPE,
        amount: 450,
        currency: 'USD',
        status: PaymentStatus.REFUNDED,
        raw: {
          paymentIntentId: 'pi_test_1122334455',
          chargeId: 'ch_test_1122334455',
          refundId: 're_test_1122334455',
        },
      },
    }),
  ]);

  console.log('✅ Created payments');

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        businessId: business.id,
        listingId: listings[0].id,
        customerId: customers[0].id,
        rating: 5,
        text: 'Amazing yoga retreat! The instructor was fantastic and the location was breathtaking.',
        status: ReviewStatus.APPROVED,
      },
    }),
    prisma.review.create({
      data: {
        businessId: business.id,
        listingId: listings[1].id,
        customerId: customers[1].id,
        rating: 4,
        text: 'Great cooking class, learned so much about farm-to-table cooking.',
        status: ReviewStatus.APPROVED,
      },
    }),
    prisma.review.create({
      data: {
        businessId: business.id,
        listingId: listings[2].id,
        customerId: customers[2].id,
        rating: 3,
        text: 'The hike was challenging but the views were worth it.',
        status: ReviewStatus.PENDING,
      },
    }),
    prisma.review.create({
      data: {
        businessId: business.id,
        listingId: listings[0].id,
        customerId: customers[1].id,
        rating: 5,
        text: 'Perfect for beginners! The retreat helped me find my inner peace.',
        status: ReviewStatus.APPROVED,
        reply: 'Thank you for the wonderful review! We\'re so glad you enjoyed your experience.',
      },
    }),
    prisma.review.create({
      data: {
        businessId: business.id,
        listingId: listings[3].id,
        customerId: customers[0].id,
        rating: 4,
        text: 'Delicious food and great guide. Highly recommend!',
        status: ReviewStatus.APPROVED,
      },
    }),
  ]);

  console.log('✅ Created reviews');

  // Create social accounts
  await Promise.all([
    prisma.socialAccount.create({
      data: {
        businessId: business.id,
        provider: SocialProvider.INSTAGRAM,
        token: 'fake_instagram_token_12345',
        scopes: ['instagram_basic', 'instagram_content_publish'],
        metadata: {
          username: 'tripfluence_demo',
          followers: 1250,
        },
      },
    }),
    prisma.socialAccount.create({
      data: {
        businessId: business.id,
        provider: SocialProvider.FACEBOOK,
        token: 'fake_facebook_token_67890',
        scopes: ['pages_manage_posts', 'pages_read_engagement'],
        metadata: {
          pageId: '123456789',
          pageName: 'Tripfluence Demo',
        },
      },
    }),
  ]);

  console.log('✅ Created social accounts');

  // Create social posts
  await Promise.all([
    prisma.socialPost.create({
      data: {
        businessId: business.id,
        title: 'New Yoga Retreat Available!',
        caption: 'Join us for an amazing sunset yoga retreat in Bali! 🌅✨ Book now and transform your mind and body. #yoga #retreat #bali #wellness',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
            alt: 'Sunset yoga session in Bali',
          },
        ],
        targets: [SocialProvider.INSTAGRAM, SocialProvider.FACEBOOK],
        scheduleAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: SocialStatus.SCHEDULED,
      },
    }),
    prisma.socialPost.create({
      data: {
        businessId: business.id,
        title: 'Cooking Class Success!',
        caption: 'Our farm-to-table cooking class was a huge success! 🍅👨‍🍳 Thank you to all participants. Next class is filling up fast!',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
            alt: 'Farm-to-table cooking class',
          },
        ],
        targets: [SocialProvider.INSTAGRAM],
        status: SocialStatus.PUBLISHED,
        results: {
          instagram: {
            success: true,
            externalId: 'post_instagram_12345',
            url: 'https://instagram.com/p/abc123',
            publishedAt: new Date().toISOString(),
          },
        },
      },
    }),
  ]);

  console.log('✅ Created social posts');

  // Create event syncs
  await Promise.all([
    prisma.eventSync.create({
      data: {
        businessId: business.id,
        listingId: listings[0].id,
        targets: ['facebook', 'google'],
        externalIds: {
          facebook: 'event_facebook_12345',
          google: 'event_google_67890',
        },
        status: EventStatus.PUBLISHED,
        lastSyncAt: new Date(),
      },
    }),
    prisma.eventSync.create({
      data: {
        businessId: business.id,
        listingId: listings[1].id,
        targets: ['eventbrite'],
        status: EventStatus.DRAFT,
      },
    }),
  ]);

  console.log('✅ Created event syncs');

  // Create webhook endpoints
  await Promise.all([
    prisma.webhookEndpoint.create({
      data: {
        businessId: business.id,
        url: 'https://demo.tripfluence.com/webhooks/orders',
        secret: 'webhook_secret_12345',
        active: true,
      },
    }),
    prisma.webhookEndpoint.create({
      data: {
        businessId: business.id,
        url: 'https://demo.tripfluence.com/webhooks/analytics',
        secret: 'webhook_secret_67890',
        active: true,
      },
    }),
  ]);

  console.log('✅ Created webhook endpoints');

  // Create coupons
  await Promise.all([
    prisma.coupon.create({
      data: {
        businessId: business.id,
        code: 'SUMMER2024',
        discountType: DiscountType.PCT,
        value: 20,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUses: 100,
        usedCount: 15,
      },
    }),
    prisma.coupon.create({
      data: {
        businessId: business.id,
        code: 'WELCOME10',
        discountType: DiscountType.AMOUNT,
        value: 10,
        currency: 'USD',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        maxUses: 50,
        usedCount: 8,
      },
    }),
    prisma.coupon.create({
      data: {
        businessId: business.id,
        code: 'EARLYBIRD',
        discountType: DiscountType.PCT,
        value: 15,
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Starts in 7 days
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        maxUses: 25,
        usedCount: 0,
      },
    }),
  ]);

  console.log('✅ Created coupons');

  // Create loyalty ledger entries
  await Promise.all([
    prisma.loyaltyLedger.create({
      data: {
        businessId: business.id,
        customerId: customers[0].id,
        delta: 50,
        reason: 'Booking completed',
        orderId: orders[0].id,
      },
    }),
    prisma.loyaltyLedger.create({
      data: {
        businessId: business.id,
        customerId: customers[1].id,
        delta: 25,
        reason: 'Booking completed',
        orderId: orders[1].id,
      },
    }),
    prisma.loyaltyLedger.create({
      data: {
        businessId: business.id,
        customerId: customers[0].id,
        delta: 10,
        reason: 'Review submitted',
      },
    }),
  ]);

  console.log('✅ Created loyalty ledger entries');

  // Create audit logs
  await Promise.all([
    prisma.auditLog.create({
      data: {
        businessId: business.id,
        actorUserId: users[0].id,
        action: 'LISTING_CREATED',
        entity: 'Listing',
        entityId: listings[0].id,
        meta: {
          title: listings[0].title,
          type: listings[0].type,
        },
        ip: '127.0.0.1',
      },
    }),
    prisma.auditLog.create({
      data: {
        businessId: business.id,
        actorUserId: users[0].id,
        action: 'LISTING_PUBLISHED',
        entity: 'Listing',
        entityId: listings[0].id,
        meta: {
          previousStatus: 'DRAFT',
          newStatus: 'PUBLISHED',
        },
        ip: '127.0.0.1',
      },
    }),
    prisma.auditLog.create({
      data: {
        businessId: business.id,
        actorUserId: users[1].id,
        action: 'ORDER_REFUNDED',
        entity: 'Order',
        entityId: orders[2].id,
        meta: {
          refundAmount: 450,
          reason: 'Customer cancellation',
        },
        ip: '127.0.0.1',
      },
    }),
    prisma.auditLog.create({
      data: {
        businessId: business.id,
        actorUserId: users[0].id,
        action: 'REVIEW_APPROVED',
        entity: 'Review',
        entityId: 'review_1',
        meta: {
          listingId: listings[0].id,
          rating: 5,
        },
        ip: '127.0.0.1',
      },
    }),
    prisma.auditLog.create({
      data: {
        businessId: business.id,
        actorUserId: users[3].id,
        action: 'SOCIAL_POST_SCHEDULED',
        entity: 'SocialPost',
        entityId: 'post_1',
        meta: {
          title: 'New Yoga Retreat Available!',
          targets: ['INSTAGRAM', 'FACEBOOK'],
        },
        ip: '127.0.0.1',
      },
    }),
  ]);

  console.log('✅ Created audit logs');

  // Create demo spaces for rental
  const spaces = await Promise.all([
    prisma.space.create({
      data: {
        businessId: business.id,
        title: 'Zen Yoga Studio',
        slug: 'zen-yoga-studio',
        description: 'A peaceful yoga studio with natural light, perfect for classes and private sessions. Features hardwood floors, mirrors, and a serene atmosphere.',
        photos: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        ],
        location: {
          address: '123 Wellness Way, San Francisco, CA 94102',
          lat: 37.7749,
          lng: -122.4194,
        },
        capacity: 25,
        floorAreaM2: 80,
        status: SpaceStatus.PUBLISHED,
      },
    }),
    prisma.space.create({
      data: {
        businessId: business.id,
        title: 'Cozy Café Corner',
        slug: 'cozy-cafe-corner',
        description: 'A charming café space perfect for small gatherings, workshops, and intimate events. Features comfortable seating and a warm atmosphere.',
        photos: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
          'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
        ],
        location: {
          address: '456 Coffee Street, San Francisco, CA 94103',
          lat: 37.7849,
          lng: -122.4094,
        },
        capacity: 15,
        floorAreaM2: 45,
        status: SpaceStatus.PUBLISHED,
      },
    }),
    prisma.space.create({
      data: {
        businessId: business.id,
        title: 'Modern Meeting Room',
        slug: 'modern-meeting-room',
        description: 'A professional meeting room equipped with modern technology, perfect for business meetings, presentations, and workshops.',
        photos: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
        ],
        location: {
          address: '789 Business Blvd, San Francisco, CA 94104',
          lat: 37.7949,
          lng: -122.3994,
        },
        capacity: 12,
        floorAreaM2: 35,
        status: SpaceStatus.DRAFT,
      },
    }),
  ]);

  console.log('✅ Created spaces:', spaces.length);

  // Create space amenities
  const amenities = [];
  for (const space of spaces) {
    if (space.title === 'Zen Yoga Studio') {
      amenities.push(
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Yoga Mats',
            category: 'Equipment',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Mirrors',
            category: 'Equipment',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Sound System',
            category: 'Audio',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Natural Light',
            category: 'Lighting',
          },
        })
      );
    } else if (space.title === 'Cozy Café Corner') {
      amenities.push(
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Coffee Machine',
            category: 'Kitchen',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'WiFi',
            category: 'Technology',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Comfortable Seating',
            category: 'Seating',
          },
        })
      );
    } else {
      amenities.push(
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Projector',
            category: 'Technology',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'Whiteboard',
            category: 'Equipment',
          },
        }),
        prisma.spaceAmenity.create({
          data: {
            spaceId: space.id,
            label: 'WiFi',
            category: 'Technology',
          },
        })
      );
    }
  }

  await Promise.all(amenities);
  console.log('✅ Created space amenities:', amenities.length);

  // Create space rules
  const rules = [];
  for (const space of spaces) {
    rules.push(
      prisma.spaceRule.create({
        data: {
          spaceId: space.id,
          label: 'No shoes on the floor',
          required: true,
        },
      }),
      prisma.spaceRule.create({
        data: {
          spaceId: space.id,
          label: 'Quiet after 9pm',
          required: true,
        },
      }),
      prisma.spaceRule.create({
        data: {
          spaceId: space.id,
          label: 'No smoking',
          required: true,
        },
      })
    );
  }

  await Promise.all(rules);
  console.log('✅ Created space rules:', rules.length);

  // Create pricing rules
  const pricingRules = [];
  for (const space of spaces) {
    // Base hourly rate
    pricingRules.push(
      prisma.spacePricingRule.create({
        data: {
          spaceId: space.id,
          kind: PricingKind.HOURLY,
          amount: space.title === 'Zen Yoga Studio' ? 5000 : space.title === 'Cozy Café Corner' ? 3000 : 4000, // $50, $30, $40
          currency: 'USD',
        },
      })
    );

    // Peak pricing (weekends)
    pricingRules.push(
      prisma.spacePricingRule.create({
        data: {
          spaceId: space.id,
          kind: PricingKind.PEAK,
          amount: space.title === 'Zen Yoga Studio' ? 7500 : space.title === 'Cozy Café Corner' ? 4500 : 6000, // $75, $45, $60
          currency: 'USD',
          dow: [0, 6], // Sunday and Saturday
        },
      })
    );

    // Cleaning fee
    pricingRules.push(
      prisma.spacePricingRule.create({
        data: {
          spaceId: space.id,
          kind: PricingKind.CLEANING_FEE,
          amount: 2000, // $20
          currency: 'USD',
        },
      })
    );

    // Security deposit
    pricingRules.push(
      prisma.spacePricingRule.create({
        data: {
          spaceId: space.id,
          kind: PricingKind.SECURITY_DEPOSIT,
          amount: 10000, // $100
          currency: 'USD',
        },
      })
    );
  }

  await Promise.all(pricingRules);
  console.log('✅ Created pricing rules:', pricingRules.length);

  // Create availability blocks
  const availabilityBlocks = [];
  for (const space of spaces.slice(0, 2)) { // Only for published spaces
    for (let i = 0; i < 10; i++) {
      const start = new Date();
      start.setDate(start.getDate() + i * 3); // Every 3 days
      start.setHours(9, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(21, 0, 0, 0); // 9 AM to 9 PM
      
      availabilityBlocks.push(
        prisma.spaceAvailability.create({
          data: {
            spaceId: space.id,
            start,
            end,
            isBlocked: false,
            notes: `Available for booking - ${space.title}`,
          },
        })
      );
    }
  }

  await Promise.all(availabilityBlocks);
  console.log('✅ Created availability blocks:', availabilityBlocks.length);

  // Create space requests
  const spaceRequests = await Promise.all([
    prisma.spaceRequest.create({
      data: {
        businessId: business.id,
        spaceId: spaces[0].id,
        organizerId: customers[0].id,
        title: 'Morning Yoga Class',
        description: 'Weekly yoga class for beginners',
        attendees: 15,
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        status: SpaceReqStatus.PENDING,
        quoteAmount: 7500, // $75 (peak weekend rate)
        currency: 'USD',
        depositAmount: 10000, // $100
        cleaningFee: 2000, // $20
        pricingBreakdown: {
          base: 5000,
          peak: 2500,
          cleaning: 2000,
          deposit: 10000,
          total: 7500,
        },
      },
    }),
    prisma.spaceRequest.create({
      data: {
        businessId: business.id,
        spaceId: spaces[1].id,
        organizerId: customers[1].id,
        title: 'Book Club Meeting',
        description: 'Monthly book club gathering',
        attendees: 8,
        start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
        end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        status: SpaceReqStatus.NEEDS_PAYMENT,
        holdExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        quoteAmount: 11000, // $110 (3 hours + cleaning)
        currency: 'USD',
        depositAmount: 10000, // $100
        cleaningFee: 2000, // $20
        pricingBreakdown: {
          base: 9000, // 3 hours * $30
          cleaning: 2000,
          deposit: 10000,
          total: 11000,
        },
      },
    }),
    prisma.spaceRequest.create({
      data: {
        businessId: business.id,
        spaceId: spaces[0].id,
        organizerId: customers[2].id,
        title: 'Corporate Wellness Session',
        description: 'Team building yoga session for our company',
        attendees: 20,
        start: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // In 3 weeks
        end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        status: SpaceReqStatus.CONFIRMED,
        quoteAmount: 12000, // $120 (2 hours + cleaning + deposit)
        currency: 'USD',
        depositAmount: 10000, // $100
        cleaningFee: 2000, // $20
        pricingBreakdown: {
          base: 10000, // 2 hours * $50
          cleaning: 2000,
          deposit: 10000,
          total: 12000,
        },
      },
    }),
  ]);

  console.log('✅ Created space requests:', spaceRequests.length);

  // Create space messages
  const messages = await Promise.all([
    prisma.spaceMessage.create({
      data: {
        spaceReqId: spaceRequests[0].id,
        senderId: customers[0].id,
        body: 'Hi! I\'m interested in booking your yoga studio for a weekly class. Would it be possible to have the same time slot every week?',
      },
    }),
    prisma.spaceMessage.create({
      data: {
        spaceReqId: spaceRequests[0].id,
        senderId: users[0].id,
        body: 'Hello! Yes, we can definitely accommodate a recurring weekly booking. I\'ve sent you a quote for the first session. Please let me know if you have any questions!',
      },
    }),
    prisma.spaceMessage.create({
      data: {
        spaceReqId: spaceRequests[1].id,
        senderId: customers[1].id,
        body: 'Thank you for approving our book club meeting! I\'ll process the payment shortly.',
      },
    }),
  ]);

  console.log('✅ Created space messages:', messages.length);

  // Create payout account (mock Stripe)
  const payoutAccount = await prisma.payoutAccount.create({
    data: {
      businessId: business.id,
      provider: 'STRIPE',
      accountId: 'acct_mock_stripe_12345',
      status: 'COMPLETE',
    },
  });

  console.log('✅ Created payout account');

  // Create payouts
  await prisma.payout.create({
    data: {
      businessId: business.id,
      spaceReqId: spaceRequests[2].id,
      amount: 12000, // $120
      currency: 'USD',
      provider: 'STRIPE',
      externalId: 'tr_mock_stripe_12345',
      status: 'PENDING',
      payoutAccount: {
        connect: {
          businessId: business.id,
        },
      },
    },
  });

  console.log('✅ Created payout');

  console.log('🎉 Database seed completed successfully!');
  console.log(`
📊 Summary:
- Business: ${business.name}
- Users: ${users.length} (Admin, Manager, Staff, Influencer)
- Listings: ${listings.length} (5 published, 1 draft)
- Inventory Slots: ${slots.length}
- Customers: ${customers.length}
- Orders: ${orders.length} (2 paid, 1 refunded)
- Reviews: 5 (4 approved, 1 pending)
- Social Accounts: 2 (Instagram, Facebook)
- Social Posts: 2 (1 scheduled, 1 published)
- Event Syncs: 2 (1 published, 1 draft)
- Webhook Endpoints: 2
- Coupons: 3
- Loyalty Entries: 3
- Audit Logs: 5
- Spaces: ${spaces.length} (2 published, 1 draft)
- Space Amenities: ${amenities.length}
- Space Rules: ${rules.length}
- Pricing Rules: ${pricingRules.length}
- Availability Blocks: ${availabilityBlocks.length}
- Space Requests: ${spaceRequests.length} (1 pending, 1 needs payment, 1 confirmed)
- Space Messages: ${messages.length}
- Payout Account: 1 (Stripe)
- Payouts: 1 (pending)

🔑 Demo Login:
- Admin: admin@tripfluence.com
- Manager: manager@tripfluence.com
- Staff: staff@tripfluence.com
- Influencer: influencer@tripfluence.com
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
