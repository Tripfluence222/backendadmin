import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceMessageSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// GET /api/space/requests/[id]/messages - Get messages for space request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if space request exists and user has access
    const spaceRequest = await db.spaceRequest.findFirst({
      where: {
        id: params.id,
        OR: [
          { organizerId: user.id },
          { 
            space: {
              businessId: user.businessId,
            },
          },
        ],
      },
    });

    if (!spaceRequest) {
      return NextResponse.json({ error: 'Space request not found' }, { status: 404 });
    }

    // Check RBAC for business users
    if (spaceRequest.organizerId !== user.id) {
      const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER', 'STAFF']);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const messages = await db.spaceMessage.findMany({
      where: {
        spaceReqId: params.id,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/space/requests/[id]/messages - Send message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = SpaceMessageSchema.parse({ ...body, spaceReqId: params.id });

    // Check if space request exists and user has access
    const spaceRequest = await db.spaceRequest.findFirst({
      where: {
        id: params.id,
        OR: [
          { organizerId: user.id },
          { 
            space: {
              businessId: user.businessId,
            },
          },
        ],
      },
      include: {
        space: {
          select: {
            title: true,
            businessId: true,
          },
        },
      },
    });

    if (!spaceRequest) {
      return NextResponse.json({ error: 'Space request not found' }, { status: 404 });
    }

    // Check RBAC for business users
    if (spaceRequest.organizerId !== user.id) {
      const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER', 'STAFF']);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Create message
    const message = await db.spaceMessage.create({
      data: {
        spaceReqId: params.id,
        senderId: user.id,
        body: data.body,
        attachments: data.attachments,
      },
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_MESSAGE_SENT',
      'SpaceMessage',
      message.id,
      spaceRequest.space.businessId,
      {
        spaceRequestId: params.id,
        spaceTitle: spaceRequest.space.title,
        messageLength: data.body.length,
        hasAttachments: data.attachments && data.attachments.length > 0,
      }
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
