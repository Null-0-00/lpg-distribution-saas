// Areas Management API
// Manage geographical areas for customer organization

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAreaSchema = z.object({
  name: z.string().min(1).max(100),
  code: z
    .string()
    .max(10)
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  description: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  isActive: z.boolean().default(true),
});

const updateAreaSchema = createAreaSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeCustomers = searchParams.get('includeCustomers') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (activeOnly) {
      where.isActive = true;
    }

    const areas = await prisma.area.findMany({
      where,
      include: {
        customers: includeCustomers
          ? {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                customerCode: true,
                phone: true,
                customerType: true,
                driver: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            }
          : false,
        _count: {
          select: {
            customers: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch areas' },
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

    // Check admin permissions
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create areas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = createAreaSchema.parse(body);

    // Generate code if not provided
    if (!data.code) {
      const nameWords = data.name.split(' ');
      data.code = nameWords
        .map((word) => word.substring(0, 2).toUpperCase())
        .join('')
        .substring(0, 10);
    }

    // Check for duplicate name or code
    const existingArea = await prisma.area.findFirst({
      where: {
        tenantId: session.user.tenantId,
        OR: [{ name: data.name }, { code: data.code }],
      },
    });

    if (existingArea) {
      return NextResponse.json(
        {
          error:
            existingArea.name === data.name
              ? 'Area with this name already exists'
              : 'Area with this code already exists',
        },
        { status: 409 }
      );
    }

    const area = await prisma.area.create({
      data: {
        tenantId: session.user.tenantId,
        ...data,
      },
      include: {
        _count: {
          select: {
            customers: true,
          },
        },
      },
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating area:', error);
    return NextResponse.json(
      { error: 'Failed to create area' },
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
        { error: 'Only admins can update areas' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('id');

    if (!areaId) {
      return NextResponse.json(
        { error: 'Area ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateAreaSchema.parse(body);

    // Verify area belongs to tenant
    const existingArea = await prisma.area.findFirst({
      where: {
        id: areaId,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingArea) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }

    // Check for duplicate name or code if being updated
    if (data.name || data.code) {
      const duplicateCheck = await prisma.area.findFirst({
        where: {
          tenantId: session.user.tenantId,
          id: { not: areaId },
          OR: [
            ...(data.name ? [{ name: data.name }] : []),
            ...(data.code ? [{ code: data.code }] : []),
          ],
        },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Area with this name or code already exists' },
          { status: 409 }
        );
      }
    }

    const area = await prisma.area.update({
      where: { id: areaId },
      data,
      include: {
        _count: {
          select: {
            customers: true,
          },
        },
      },
    });

    return NextResponse.json(area);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating area:', error);
    return NextResponse.json(
      { error: 'Failed to update area' },
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete areas' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('id');

    if (!areaId) {
      return NextResponse.json(
        { error: 'Area ID is required' },
        { status: 400 }
      );
    }

    // Check if area has customers
    const customerCount = await prisma.customer.count({
      where: { areaId },
    });

    if (customerCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete area with customers. Please move or delete customers first.',
          customerCount,
        },
        { status: 409 }
      );
    }

    await prisma.area.delete({
      where: {
        id: areaId,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json(
      { error: 'Failed to delete area' },
      { status: 500 }
    );
  }
}
