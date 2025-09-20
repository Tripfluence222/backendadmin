import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpacePricingRulesBulkSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';
import { validatePricingRules } from '@/lib/space/pricing';

// GET /api/space/[id]/pricing - Get pricing rules
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const space = await db.space.findFirst({
      where: {
        id,
        businessId: user.businessId,
      },
      include: {
        pricingRules: true,
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json(space.pricingRules);
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    );
  }
}

// POST /api/space/[id]/pricing - Update pricing rules
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can update pricing
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = SpacePricingRulesBulkSchema.parse({ ...body, spaceId: id });

    // Check if space exists and belongs to user's business
    const existingSpace = await db.space.findFirst({
      where: {
        id: id,
        businessId: user.businessId,
      },
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Validate pricing rules
    const validationErrors = validatePricingRules(data.rules);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid pricing rules', details: validationErrors },
        { status: 400 }
      );
    }

    // Delete existing pricing rules
    await db.spacePricingRule.deleteMany({
      where: { spaceId: id },
    });

    // Create new pricing rules
    const pricingRules = await db.spacePricingRule.createMany({
      data: data.rules.map(rule => ({
        spaceId: id,
        kind: rule.kind,
        amount: rule.amount,
        currency: rule.currency,
        dow: rule.dow,
        startHour: rule.startHour,
        endHour: rule.endHour,
      })),
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_PRICING_UPDATED',
      'Space',
      id,
      user.businessId,
      {
        title: existingSpace.title,
        rulesCount: data.rules.length,
        rules: data.rules.map(r => ({ kind: r.kind, amount: r.amount })),
      }
    );

    return NextResponse.json({ success: true, count: pricingRules.count });
  } catch (error) {
    console.error('Error updating pricing rules:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update pricing rules' },
      { status: 500 }
    );
  }
}
