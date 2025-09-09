import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { ok, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { dispatchToAllEndpoints } from '@/lib/webhooks';

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const payload = body.payload || {
      event: 'test.webhook',
      data: {
        message: 'This is a test webhook from Tripfluence Admin',
        timestamp: new Date().toISOString(),
        businessId: actor.businessId,
      },
    };

    const results = await dispatchToAllEndpoints(actor.businessId, payload);

    return ok({
      dispatched: results.length,
      results,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error testing webhooks:', error);
    return serverErr('Failed to test webhooks');
  }
}
