// Inventory Movements API
// Track and analyze inventory movements with detailed audit trail

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { InventoryCalculator } from '@/lib/business';
import { MovementType, UserRole } from '@prisma/client';
import { z } from 'zod';

const movementQuerySchema = z.object({
  productId: z.string().optional(),
  driverId: z.string().optional(),
  type: z.nativeEnum(MovementType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1),
  limit: z.string().transform((val) => Math.min(parseInt(val) || 50, 100)),
});

const createMovementSchema = z.object({
  productId: z.string().cuid(),
  driverId: z.string().cuid().optional(),
  type: z.nativeEnum(MovementType),
  quantity: z.number().int(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  reference: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryResult = movementQuerySchema.safeParse({
      productId: searchParams.get('productId'),
      driverId: searchParams.get('driverId'),
      type: searchParams.get('type'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { productId, driverId, type, startDate, endDate, page, limit } =
      queryResult.data;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (productId) where.productId = productId;
    if (driverId) where.driverId = driverId;
    if (type) where.type = type;

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }

    // Execute queries
    const [movements, totalCount] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              size: true,
              company: {
                select: { name: true },
              },
            },
          },
          driver: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    // Calculate movement summary
    const summary = await prisma.inventoryMovement.aggregate({
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    // Group movements by type for analysis
    const movementsByType = await prisma.inventoryMovement.groupBy({
      by: ['type'],
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      movements: movements.map((movement) => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        description: movement.description,
        reference: movement.reference,
        date: movement.date,
        product: {
          name: `${movement.product.company.name} ${movement.product.name}`,
          size: movement.product.size,
        },
        driver: movement.driver
          ? {
              name: movement.driver.name,
              phone: movement.driver.phone,
            }
          : null,
        createdAt: movement.createdAt,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalMovements: summary._count.id || 0,
        totalQuantity: summary._sum.quantity || 0,
        movementsByType: movementsByType.map((group) => ({
          type: group.type,
          count: group._count.id,
          quantity: group._sum.quantity || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Inventory movements fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role } = session.user;

    // Only admins can create manual movements
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createMovementSchema.parse(body);

    // Verify product exists
    const product = await prisma.product.findFirst({
      where: { id: validatedData.productId, tenantId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify driver if provided
    if (validatedData.driverId) {
      const driver = await prisma.driver.findFirst({
        where: { id: validatedData.driverId, tenantId },
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }
    }

    const inventoryCalculator = new InventoryCalculator(prisma);

    // Create the movement record
    await inventoryCalculator.recordInventoryMovement(
      tenantId,
      validatedData.productId,
      validatedData.type,
      validatedData.quantity,
      validatedData.description,
      validatedData.reference,
      validatedData.driverId
    );

    // Trigger inventory recalculation
    const today = new Date();
    const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
      tenantId,
      validatedData.productId
    );

    const inventoryResult = await inventoryCalculator.calculateInventoryForDate(
      {
        date: today,
        tenantId,
        productId: validatedData.productId,
        previousFullCylinders: currentLevels.fullCylinders,
        previousEmptyCylinders: currentLevels.emptyCylinders,
      }
    );

    await inventoryCalculator.updateInventoryRecord(
      tenantId,
      today,
      validatedData.productId,
      inventoryResult
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Inventory movement recorded successfully',
        movement: {
          type: validatedData.type,
          quantity: validatedData.quantity,
          description: validatedData.description,
          productName: product.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Inventory movement creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
