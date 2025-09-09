import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { createApiKeySchema } from '@/lib/validation/admin';
import { createApiKeyId } from '@/lib/ids';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN']);

    const apiKeys = await db.apiKey.findMany({
      where: { businessId: actor.businessId },
      orderBy: { createdAt: 'desc' },
    });

    return ok(apiKeys);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error fetching API keys:', error);
    return serverErr('Failed to fetch API keys');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN']);

    const body = await request.json();
    const { name } = createApiKeySchema.parse(body);

    const keyId = createApiKeyId();
    const plaintextKey = `tf_${keyId}_${Math.random().toString(36).substr(2, 32)}`;
    const hashedKey = await bcrypt.hash(plaintextKey, 12);

    const apiKey = await db.apiKey.create({
      data: {
        id: keyId,
        businessId: actor.businessId,
        name,
        hash: hashedKey,
      },
    });

    await logAction(actor, AUDIT_ACTIONS.API_KEY_CREATED, 'ApiKey', apiKey.id, {
      name: apiKey.name,
    });

    return ok({
      id: apiKey.id,
      name: apiKey.name,
      key: plaintextKey, // Only returned once
      createdAt: apiKey.createdAt,
    }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error creating API key:', error);
    return serverErr('Failed to create API key');
  }
}
