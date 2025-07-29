// API Route: /api/receivables/driver-size-breakdown
// This endpoint tracks cylinder receivables by size for each driver

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);

    // Optional filters
    const driverName = searchParams.get('driver');
    const cylinderSize = searchParams.get('size');
    const includeZero = searchParams.get('includeZero') === 'true';

    // Get cylinder receivables with driver and size breakdown
    const cylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId,
        receivableType: 'CYLINDER',
        status: 'CURRENT',
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
        ...(cylinderSize && {
          size: {
            contains: cylinderSize,
            mode: 'insensitive',
          },
        }),
        ...(!includeZero && {
          quantity: {
            gt: 0,
          },
        }),
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            driverType: true,
          },
        },
      },
      orderBy: [{ driver: { name: 'asc' } }, { size: 'asc' }],
    });

    // Group data by driver
    const driverBreakdown = cylinderReceivables.reduce(
      (acc, receivable) => {
        const driverId = receivable.driver.id;
        const driverName = receivable.driver.name;

        if (!acc[driverId]) {
          acc[driverId] = {
            driverId,
            driverName,
            driverPhone: receivable.driver.phone,
            driverType: receivable.driver.driverType,
            cylinderReceivables: [],
            totalCylinders: 0,
          };
        }

        acc[driverId].cylinderReceivables.push({
          size: receivable.size,
          quantity: receivable.quantity,
          customerName: receivable.customerName,
          createdAt: receivable.createdAt,
        });

        acc[driverId].totalCylinders += receivable.quantity || 0;

        return acc;
      },
      {} as Record<string, any>
    );

    // Group data by size
    const sizeBreakdown = cylinderReceivables.reduce(
      (acc, receivable) => {
        const size = receivable.size || 'Unknown';

        if (!acc[size]) {
          acc[size] = {
            size,
            drivers: [],
            totalQuantity: 0,
            driverCount: 0,
          };
        }

        acc[size].drivers.push({
          driverId: receivable.driver.id,
          driverName: receivable.driver.name,
          quantity: receivable.quantity,
        });

        acc[size].totalQuantity += receivable.quantity || 0;
        acc[size].driverCount = acc[size].drivers.length;

        return acc;
      },
      {} as Record<string, any>
    );

    // Calculate summary statistics
    const summary = {
      totalDriversWithReceivables: Object.keys(driverBreakdown).length,
      totalCylinderSizes: Object.keys(sizeBreakdown).length,
      totalCylinderReceivables: cylinderReceivables.reduce(
        (sum, r) => sum + (r.quantity || 0),
        0
      ),
      averageReceivablesPerDriver:
        Object.keys(driverBreakdown).length > 0
          ? Math.round(
              cylinderReceivables.reduce(
                (sum, r) => sum + (r.quantity || 0),
                0
              ) / Object.keys(driverBreakdown).length
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        // Breakdown by driver (each driver's cylinder receivables by size)
        byDriver: Object.values(driverBreakdown),

        // Breakdown by size (each size's receivables across all drivers)
        bySize: Object.values(sizeBreakdown),

        // Raw detailed records
        detailedRecords: cylinderReceivables.map((r) => ({
          id: r.id,
          driverName: r.driver.name,
          driverPhone: r.driver.phone,
          size: r.size,
          quantity: r.quantity,
          customerName: r.customerName,
          status: r.status,
          createdAt: r.createdAt,
        })),

        // Summary statistics
        summary,
      },

      // Metadata
      meta: {
        totalRecords: cylinderReceivables.length,
        filters: {
          driver: driverName,
          size: cylinderSize,
          includeZero,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error retrieving cylinder receivables breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cylinder receivables data' },
      { status: 500 }
    );
  }
}

// Additional helper functions for specific queries

// Get receivables for a specific driver
export async function getDriverCylinderReceivables(
  tenantId: string,
  driverId: string
) {
  return await prisma.customerReceivable.findMany({
    where: {
      tenantId,
      driverId,
      receivableType: 'CYLINDER',
      status: 'CURRENT',
      quantity: { gt: 0 },
    },
    orderBy: { size: 'asc' },
  });
}

// Get receivables for a specific size across all drivers
export async function getSizeCylinderReceivables(
  tenantId: string,
  size: string
) {
  return await prisma.customerReceivable.findMany({
    where: {
      tenantId,
      size,
      receivableType: 'CYLINDER',
      status: 'CURRENT',
      quantity: { gt: 0 },
    },
    include: {
      driver: {
        select: { id: true, name: true, phone: true },
      },
    },
    orderBy: { driver: { name: 'asc' } },
  });
}

// Get receivables for specific driver and size combination
export async function getDriverSizeCylinderReceivables(
  tenantId: string,
  driverId: string,
  size: string
) {
  return await prisma.customerReceivable.findFirst({
    where: {
      tenantId,
      driverId,
      size,
      receivableType: 'CYLINDER',
      status: 'CURRENT',
    },
    include: {
      driver: {
        select: { id: true, name: true, phone: true },
      },
    },
  });
}

// Update cylinder receivables (for payments/collections)
export async function updateCylinderReceivables(
  tenantId: string,
  driverId: string,
  size: string,
  newQuantity: number,
  reason: string = 'Manual adjustment'
) {
  return await prisma.$transaction(async (tx) => {
    // Find existing receivable record
    const existingReceivable = await tx.customerReceivable.findFirst({
      where: {
        tenantId,
        driverId,
        size,
        receivableType: 'CYLINDER',
        status: 'CURRENT',
      },
    });

    if (existingReceivable) {
      // Update existing record
      await tx.customerReceivable.update({
        where: { id: existingReceivable.id },
        data: {
          quantity: newQuantity,
          notes: reason,
          updatedAt: new Date(),
        },
      });
    } else if (newQuantity > 0) {
      // Create new record if quantity > 0
      await tx.customerReceivable.create({
        data: {
          tenantId,
          driverId,
          customerName: 'Adjusted Balance',
          receivableType: 'CYLINDER',
          quantity: newQuantity,
          size,
          status: 'CURRENT',
          notes: reason,
        },
      });
    }

    // Update receivable record for tracking
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const latestRecord = await tx.receivableRecord.findFirst({
      where: { tenantId, driverId, date: currentDate },
    });

    if (latestRecord) {
      // Update today's record
      const newTotal = await tx.customerReceivable.aggregate({
        where: {
          tenantId,
          driverId,
          receivableType: 'CYLINDER',
          status: 'CURRENT',
        },
        _sum: { quantity: true },
      });

      await tx.receivableRecord.update({
        where: { id: latestRecord.id },
        data: {
          totalCylinderReceivables: newTotal._sum.quantity || 0,
          updatedAt: new Date(),
        },
      });
    }
  });
}
