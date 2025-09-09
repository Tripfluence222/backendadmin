import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { importIcsSchema } from '@/lib/validation/availability';

// Simple ICS parser - in production, use a proper library like ical.js
function parseIcs(icsData: string) {
  const events = [];
  const lines = icsData.split('\n');
  let currentEvent: any = {};
  let inEvent = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (trimmed === 'END:VEVENT') {
      if (inEvent && currentEvent.start && currentEvent.end) {
        events.push(currentEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':');
      
      switch (key) {
        case 'DTSTART':
          currentEvent.start = parseIcsDate(value);
          break;
        case 'DTEND':
          currentEvent.end = parseIcsDate(value);
          break;
        case 'SUMMARY':
          currentEvent.title = value;
          break;
        case 'DESCRIPTION':
          currentEvent.description = value;
          break;
        case 'LOCATION':
          currentEvent.location = value;
          break;
      }
    }
  }

  return events;
}

function parseIcsDate(dateStr: string): Date {
  // Handle both date and datetime formats
  if (dateStr.length === 8) {
    // YYYYMMDD format
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`);
  } else if (dateStr.length === 15) {
    // YYYYMMDDTHHMMSS format
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(9, 11);
    const minute = dateStr.substring(11, 13);
    const second = dateStr.substring(13, 15);
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  }
  
  throw new Error(`Invalid date format: ${dateStr}`);
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { listingId, icsData } = importIcsSchema.parse(body);

    // Verify listing belongs to business
    const listing = await db.listing.findFirst({
      where: {
        id: listingId,
        businessId: actor.businessId,
      },
    });

    if (!listing) {
      return unauth('Listing not found');
    }

    const events = parseIcs(icsData);
    
    if (events.length === 0) {
      return badReq('No valid events found in ICS data');
    }

    const slots = events.map(event => ({
      listingId,
      start: event.start,
      end: event.end,
      capacity: 10, // Default capacity
      location: event.location || null,
      notes: event.title || null,
    }));

    const result = await db.inventorySlot.createMany({
      data: slots,
    });

    await logAction(actor, AUDIT_ACTIONS.SLOT_CREATED, 'InventorySlot', undefined, {
      listingId,
      importedCount: result.count,
      source: 'ICS',
    });

    return ok({ imported: result.count, events: events.length });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error importing ICS:', error);
    return serverErr('Failed to import ICS data');
  }
}
