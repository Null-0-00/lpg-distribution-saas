import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1),
  language: z.string().min(2).max(5),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow all authenticated users to read settings (not just admins)

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { currency: true, timezone: true, language: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Settings fetch error:', error);
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        currency: validatedData.currency,
        timezone: validatedData.timezone,
        language: validatedData.language,
        updatedAt: new Date(),
      },
      select: { currency: true, timezone: true, language: true },
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
