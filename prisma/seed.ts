import { PrismaClient, Role, ListingType, ListingStatus, OrderStatus, PaymentStatus, PaymentProvider, ReviewStatus, SocialProvider, SocialStatus, EventStatus, DiscountType } from '@prisma/client';
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
