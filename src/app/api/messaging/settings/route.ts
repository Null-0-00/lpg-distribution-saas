// Messaging Settings API
// Manage messaging configuration for tenants

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const messagingSettingsSchema = z.object({
  whatsappEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(true),
  emailEnabled: z.boolean().default(false),
  receivablesNotificationsEnabled: z.boolean().default(true),
  paymentNotificationsEnabled: z.boolean().default(true),
  overdueRemindersEnabled: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.messagingSettings.findUnique({
      where: { tenantId: session.user.tenantId },
    });

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        whatsappEnabled: true,
        smsEnabled: true,
        emailEnabled: false,
        receivablesNotificationsEnabled: true,
        paymentNotificationsEnabled: true,
        overdueRemindersEnabled: true,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching messaging settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = messagingSettingsSchema.parse(body);

    const settings = await prisma.messagingSettings.upsert({
      where: { tenantId: session.user.tenantId },
      update: data,
      create: {
        tenantId: session.user.tenantId,
        ...data,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating messaging settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
