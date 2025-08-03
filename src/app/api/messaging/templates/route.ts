// Message Templates API
// Manage messaging templates for different triggers

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MessageTrigger, MessageType } from '@prisma/client';

const messageTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  providerId: z.string().cuid(),
  trigger: z.nativeEnum(MessageTrigger),
  messageType: z.nativeEnum(MessageType).default(MessageType.SMS),
  template: z.string().min(1).max(1000),
  variables: z.record(z.any()).default({}),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const triggerType = searchParams.get('triggerType');
    const language = searchParams.get('language');

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (triggerType) {
      where.trigger = triggerType;
    }

    // Note: language field doesn't exist in current schema, remove filter

    const templates = await prisma.messageTemplate.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = messageTemplateSchema.parse(body);

    // Verify provider exists and belongs to tenant
    const provider = await prisma.messageProvider.findFirst({
      where: {
        id: data.providerId,
        tenantId: session.user.tenantId,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check for duplicate template name and trigger type
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: session.user.tenantId,
        name: data.name,
        trigger: data.trigger,
      },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name and trigger type already exists' },
        { status: 409 }
      );
    }

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId: session.user.tenantId,
        ...data,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating message template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
