import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { rbacServer } from '@/lib/rbac-server';
import { addEventSyncJob } from '@/jobs/queue';
import { SocialProvider } from '@prisma/client';

const publishEventSchema = z.object({
  businessId: z.string().cuid(),
  listingId: z.string().cuid(),
  platforms: z.array(z.enum(['facebook', 'eventbrite', 'meetup'])).min(1),
  forceUpdate: z.boolean().default(false),
  meetupGroupUrlName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = publishEventSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { businessId, listingId, platforms, forceUpdate, meetupGroupUrlName } = validation.data;

    // Check RBAC permissions
    const user = await rbacServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacServer.checkPermission(
      user.id,
      businessId,
      ['ADMIN', 'MANAGER', 'INFLUENCER']
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify listing exists and belongs to business
    const listing = await db.listing.findFirst({
      where: {
        id: listingId,
        businessId,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found or access denied' },
        { status: 404 }
      );
    }

    // Check if feature flag is enabled
    const useRealProviders = process.env.FEATURE_REAL_PROVIDERS === 'true';

    // Check for existing event sync
    let eventSync = await db.eventSync.findFirst({
      where: {
        businessId,
        listingId,
      },
    });

    if (eventSync && !forceUpdate) {
      return NextResponse.json(
        { error: 'Event sync already exists. Use forceUpdate=true to overwrite.' },
        { status: 409 }
      );
    }

    // Create or update event sync
    if (eventSync) {
      eventSync = await db.eventSync.update({
        where: { id: eventSync.id },
        data: {
          platforms: platforms.map(p => {
            switch (p) {
              case 'facebook': return 'FACEBOOK_PAGE';
              case 'eventbrite': return 'EVENTBRITE';
              case 'meetup': return 'MEETUP';
              default: return p.toUpperCase() as SocialProvider;
            }
          }),
          lastSyncStatus: 'PENDING',
          lastSyncAt: null,
          lastSyncError: null,
          syncData: {},
          externalIds: [],
        },
      });
    } else {
      eventSync = await db.eventSync.create({
        data: {
          businessId,
          listingId,
          platforms: platforms.map(p => {
            switch (p) {
              case 'facebook': return 'FACEBOOK_PAGE';
              case 'eventbrite': return 'EVENTBRITE';
              case 'meetup': return 'MEETUP';
              default: return p.toUpperCase() as SocialProvider;
            }
          }),
          lastSyncStatus: 'PENDING',
          syncData: {},
          externalIds: [],
        },
      });
    }

    // If real providers are enabled, enqueue sync job
    if (useRealProviders) {
      await addEventSyncJob({
        eventSyncId: eventSync.id,
        direction: 'export',
        forceUpdate,
      });
    } else {
      // Mock mode - simulate successful sync
      await db.eventSync.update({
        where: { id: eventSync.id },
        data: {
          lastSyncStatus: 'SUCCESS',
          lastSyncAt: new Date(),
          externalIds: platforms.map(p => `mock-${p}-${Date.now()}`),
          syncData: {
            mock: true,
            platforms: platforms.reduce((acc, p) => {
              acc[p] = { eventUrl: `https://${p}.com/events/mock-${Date.now()}` };
              return acc;
            }, {} as any),
          },
        },
      });
    }

    // Log audit trail
    await logAction(
      user.id,
      'user',
      'EVENT_SYNC_INITIATED',
      'EventSync',
      eventSync.id,
      businessId,
      { 
        listingId, 
        platforms, 
        forceUpdate, 
        useRealProviders,
        meetupGroupUrlName,
      }
    );

    return NextResponse.json({
      success: true,
      eventSync: {
        id: eventSync.id,
        listingId: eventSync.listingId,
        platforms: eventSync.platforms,
        lastSyncStatus: eventSync.lastSyncStatus,
        lastSyncAt: eventSync.lastSyncAt,
        externalIds: eventSync.externalIds,
        syncData: eventSync.syncData,
        createdAt: eventSync.createdAt,
        updatedAt: eventSync.updatedAt,
      },
    });

  } catch (error) {
    console.error('Event sync publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish event sync' },
      { status: 500 }
    );
  }
}