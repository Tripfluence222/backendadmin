import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, notFound, serverErr } from '@/lib/http';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const slot = await db.inventorySlot.findFirst({
      where: {
        id: params.slotId,
        listing: {
          businessId: actor.businessId,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!slot) {
      return notFound('Slot not found');
    }

    await db.inventorySlot.delete({
      where: { id: params.slotId },
    });

    await logAction(actor, AUDIT_ACTIONS.SLOT_DELETED, 'InventorySlot', params.slotId, {
      listingId: slot.listingId,
      listingTitle: slot.listing.title,
      start: slot.start,
      end: slot.end,
    });

    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error deleting availability slot:', error);
    return serverErr('Failed to delete availability slot');
  }
}
