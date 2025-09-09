import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { publishEventSyncSchema } from '@/lib/validation/event-sync';

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { listingId, targets } = publishEventSyncSchema.parse(body);

    // Verify listing belongs to business
    const listing = await db.listing.findFirst({
      where: {
        id: listingId,
        businessId: actor.businessId,
      },
    });

    if (!listing) {
      return badReq('Listing not found');
    }

    // Find or create event sync record
    let eventSync = await db.eventSync.findFirst({
      where: {
        listingId,
        businessId: actor.businessId,
      },
    });

    if (!eventSync) {
      eventSync = await db.eventSync.create({
        data: {
          businessId: actor.businessId,
          listingId,
          targets,
          status: 'DRAFT',
        },
      });
    } else {
      eventSync = await db.eventSync.update({
        where: { id: eventSync.id },
        data: {
          targets,
          status: 'DRAFT',
        },
      });
    }

    await logAction(actor, AUDIT_ACTIONS.EVENT_SYNC_PUBLISHED, 'EventSync', eventSync.id, {
      listingId,
      listingTitle: listing.title,
      targets,
    });

    // TODO: Queue background job for syncing
    // await queue.add('event.sync', { eventSyncId: eventSync.id });

    // Simulate external sync for demo
    const externalIds: Record<string, string> = {};
    targets.forEach(target => {
      externalIds[target] = `ext_${target}_${Date.now()}`;
    });

    const updatedEventSync = await db.eventSync.update({
      where: { id: eventSync.id },
      data: {
        status: 'PUBLISHED',
        externalIds,
        lastSyncAt: new Date(),
      },
    });

    return ok(updatedEventSync);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error publishing event sync:', error);
    return serverErr('Failed to publish event sync');
  }
}
