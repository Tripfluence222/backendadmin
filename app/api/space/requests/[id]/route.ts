import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { getCurrentUser } from '@/lib/auth';

// GET /api/space/requests/[id] - Get space request details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only business users can access
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER', 'STAFF']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const spaceRequest = await db.spaceRequest.findFirst({
      where: {
        id: params.id,
        businessId: user.businessId,
      },
      include: {
        space: {
          include: {
            amenities: true,
            rules: true,
            pricingRules: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!spaceRequest) {
      return NextResponse.json({ error: 'Space request not found' }, { status: 404 });
    }

    return NextResponse.json(spaceRequest);
  } catch (error) {
    console.error('Error fetching space request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch space request' },
      { status: 500 }
    );
  }
}
