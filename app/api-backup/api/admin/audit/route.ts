import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { ok, unauth, serverErr } from '@/lib/http';
import { getAuditLogs } from '@/lib/audit';
import { auditLogFiltersSchema } from '@/lib/validation/admin';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const { searchParams } = new URL(request.url);
    const filters = auditLogFiltersSchema.parse({
      action: searchParams.get('action'),
      entity: searchParams.get('entity'),
      actorUserId: searchParams.get('actorUserId'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    const where: any = {
      businessId: actor.businessId,
    };

    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.entity) where.entity = filters.entity;
    if (filters.actorUserId) where.actorUserId = filters.actorUserId;
    if (filters.from) where.createdAt = { gte: new Date(filters.from) };
    if (filters.to) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.to),
      };
    }

    const result = await getAuditLogs(actor.businessId, filters.page, filters.limit);

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error fetching audit logs:', error);
    return serverErr('Failed to fetch audit logs');
  }
}
