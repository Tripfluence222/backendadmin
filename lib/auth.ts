import { NextRequest } from 'next/server';
import { db } from './db';
import { getUserRoles } from './rbac';

export interface Session {
  userId: string;
  businessId: string;
  roles: string[];
  email: string;
  name: string;
}

export interface Actor {
  userId: string;
  businessId: string;
  roles: string[];
  ip: string;
}

export async function getSession(request: NextRequest): Promise<Session | null> {
  // In a real app, you'd validate JWT tokens or session cookies here
  // For demo purposes, we'll use a mock session
  
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  
  // Mock token validation - in production, verify JWT
  if (token === 'demo-token') {
    const user = await db.user.findFirst({
      where: { email: 'admin@tripfluence.com' },
      include: {
        roleAssignments: true,
      },
    });

    if (!user) return null;

    const roles = await getUserRoles(user.id, user.businessId);
    
    return {
      userId: user.id,
      businessId: user.businessId,
      roles: roles.map(r => r.toString()),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    };
  }

  return null;
}

export async function getActor(request: NextRequest): Promise<Actor | null> {
  const session = await getSession(request);
  if (!session) return null;

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';

  return {
    userId: session.userId,
    businessId: session.businessId,
    roles: session.roles,
    ip,
  };
}

export function requireAuth(session: Session | null): Session {
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}
