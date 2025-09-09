import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { createSlotSchema, createMultipleSlotsSchema, availabilityFiltersSchema } from '@/lib/validation/availability';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const { searchParams } = new URL(request.url);
    const filters = availabilityFiltersSchema.parse({
      listingId: searchParams.get('listingId'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });

    const where: any = {
      listing: {
        businessId: actor.businessId,
      },
    };

    if (filters.listingId) where.listingId = filters.listingId;
    if (filters.from) where.start = { gte: new Date(filters.from) };
    if (filters.to) where.end = { lte: new Date(filters.to) };

    const slots = await db.inventorySlot.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { start: 'asc' },
    });

    return ok({ slots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return serverErr('Failed to fetch availability');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    
    // Check if it's multiple slots or single slot
    if (body.slots && Array.isArray(body.slots)) {
      const data = createMultipleSlotsSchema.parse(body);
      
      // Verify listing belongs to business
      const listing = await db.listing.findFirst({
        where: {
          id: data.listingId,
          businessId: actor.businessId,
        },
      });

      if (!listing) {
        return unauth('Listing not found');
      }

      const slots = await db.inventorySlot.createMany({
        data: data.slots.map(slot => ({
          ...slot,
          listingId: data.listingId,
          start: new Date(slot.start),
          end: new Date(slot.end),
        })),
      });

      await logAction(actor, AUDIT_ACTIONS.SLOT_CREATED, 'InventorySlot', undefined, {
        listingId: data.listingId,
        slotCount: slots.count,
      });

      return ok({ created: slots.count }, 201);
    } else {
      const data = createSlotSchema.parse(body);
      
      // Verify listing belongs to business
      const listing = await db.listing.findFirst({
        where: {
          id: data.listingId,
          businessId: actor.businessId,
        },
      });

      if (!listing) {
        return unauth('Listing not found');
      }

      const slot = await db.inventorySlot.create({
        data: {
          ...data,
          start: new Date(data.start),
          end: new Date(data.end),
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
      });

      await logAction(actor, AUDIT_ACTIONS.SLOT_CREATED, 'InventorySlot', slot.id, {
        listingId: data.listingId,
        start: data.start,
        end: data.end,
        capacity: data.capacity,
      });

      return ok(slot, 201);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error creating availability slot:', error);
    return serverErr('Failed to create availability slot');
  }
}
