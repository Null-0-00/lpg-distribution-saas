import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const trigger = searchParams.get('trigger');
    const status = searchParams.get('status');
    const recipientType = searchParams.get('recipientType');
    const search = searchParams.get('search');

    const tenantId = session.user.tenantId;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = { tenantId };

    if (trigger) {
      where.trigger = trigger;
    }

    if (status) {
      where.status = status;
    }

    if (recipientType) {
      where.recipientType = recipientType;
    }

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { message: { contains: search } },
      ];
    }

    // Get messages with pagination
    const [messages, totalCount] = await Promise.all([
      prisma.sentMessage.findMany({
        where,
        include: {
          template: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.sentMessage.count({ where }),
    ]);

    // Get distinct values for filters
    const [triggers, statuses, recipientTypes] = await Promise.all([
      prisma.sentMessage.findMany({
        where: { tenantId },
        select: { trigger: true },
        distinct: ['trigger'],
      }),
      prisma.sentMessage.findMany({
        where: { tenantId },
        select: { status: true },
        distinct: ['status'],
      }),
      prisma.sentMessage.findMany({
        where: { tenantId },
        select: { recipientType: true },
        distinct: ['recipientType'],
      }),
    ]);

    return NextResponse.json({
      messages: messages.map((message) => ({
        id: message.id,
        recipientType: message.recipientType,
        phoneNumber: message.phoneNumber,
        trigger: message.trigger,
        status: message.status,
        messageType: message.messageType,
        sentAt: message.sentAt,
        templateName: message.template?.name || 'Unknown',
        messagePreview:
          message.message.slice(0, 100) +
          (message.message.length > 100 ? '...' : ''),
        metadata: message.metadata,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1,
      },
      filters: {
        triggers: triggers.map((t) => t.trigger),
        statuses: statuses.map((s) => s.status),
        recipientTypes: recipientTypes.map((r) => r.recipientType),
      },
    });
  } catch (error) {
    console.error('Error fetching message logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const tenantId = session.user.tenantId;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Delete the message (only if it belongs to the tenant)
    const deletedMessage = await prisma.sentMessage.deleteMany({
      where: {
        id: messageId,
        tenantId,
      },
    });

    if (deletedMessage.count === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
