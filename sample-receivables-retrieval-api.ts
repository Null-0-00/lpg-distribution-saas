// Sample API endpoints showing how to retrieve receivables data with all breakdowns

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/receivables/breakdown - Get complete receivables breakdown
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const driverName = searchParams.get('driver');
    const receivableType = searchParams.get('type'); // 'CASH' or 'CYLINDER'
    const size = searchParams.get('size');

    // 1. Get receivables records by driver (historical tracking)
    const receivableRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        driver: true,
      },
      orderBy: [{ driver: { name: 'asc' } }, { date: 'desc' }],
    });

    // 2. Get current customer receivables with detailed breakdown
    const customerReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId,
        status: 'CURRENT',
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
        ...(receivableType && {
          receivableType: receivableType as 'CASH' | 'CYLINDER',
        }),
        ...(size &&
          receivableType === 'CYLINDER' && {
            size: {
              contains: size,
              mode: 'insensitive',
            },
          }),
      },
      include: {
        driver: true,
      },
      orderBy: [
        { driver: { name: 'asc' } },
        { receivableType: 'asc' },
        { size: 'asc' },
      ],
    });

    // 3. Get aggregated receivables by driver
    const receivablesByDriver = await prisma.customerReceivable.groupBy({
      by: ['driverId', 'receivableType'],
      where: {
        tenantId,
        status: 'CURRENT',
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
      },
      _sum: {
        amount: true,
        quantity: true,
      },
    });

    // 4. Get cylinder receivables by size across all drivers
    const cylinderReceivablesBySize = await prisma.customerReceivable.groupBy({
      by: ['size'],
      where: {
        tenantId,
        receivableType: 'CYLINDER',
        status: 'CURRENT',
        size: { not: null },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        size: 'asc',
      },
    });

    // 5. Get latest receivable records per driver (current totals)
    const latestReceivableRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        driver: true,
      },
      orderBy: {
        date: 'desc',
      },
      distinct: ['driverId'],
    });

    return NextResponse.json({
      success: true,
      data: {
        // Historical receivables tracking
        receivableRecords: receivableRecords.map((record) => ({
          id: record.id,
          driverName: record.driver.name,
          date: record.date,
          cashReceivablesChange: record.cashReceivablesChange,
          cylinderReceivablesChange: record.cylinderReceivablesChange,
          totalCashReceivables: record.totalCashReceivables,
          totalCylinderReceivables: record.totalCylinderReceivables,
        })),

        // Current detailed receivables
        customerReceivables: customerReceivables.map((receivable) => ({
          id: receivable.id,
          driverName: receivable.driver.name,
          customerName: receivable.customerName,
          type: receivable.receivableType,
          amount: receivable.amount,
          quantity: receivable.quantity,
          size: receivable.size,
          status: receivable.status,
          createdAt: receivable.createdAt,
        })),

        // Current totals by driver
        currentTotalsByDriver: latestReceivableRecords.map((record) => ({
          driverName: record.driver.name,
          totalCashReceivables: record.totalCashReceivables,
          totalCylinderReceivables: record.totalCylinderReceivables,
          lastUpdated: record.date,
        })),

        // Cylinder receivables by size summary
        cylinderReceivablesBySize: cylinderReceivablesBySize.map((item) => ({
          size: item.size,
          totalQuantity: item._sum.quantity || 0,
        })),

        // Overall summary
        summary: {
          totalCashReceivables: customerReceivables
            .filter((r) => r.receivableType === 'CASH')
            .reduce((sum, r) => sum + (r.amount || 0), 0),
          totalCylinderReceivables: customerReceivables
            .filter((r) => r.receivableType === 'CYLINDER')
            .reduce((sum, r) => sum + (r.quantity || 0), 0),
          totalDrivers: new Set(customerReceivables.map((r) => r.driverId))
            .size,
          totalCustomers: new Set(
            customerReceivables.map((r) => r.customerName)
          ).size,
        },
      },
    });
  } catch (error) {
    console.error('Error retrieving receivables breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve receivables data' },
      { status: 500 }
    );
  }
}

// Additional specialized endpoints:

// GET /api/receivables/by-driver?driver=John
export async function getReceivablesByDriver(
  driverName: string,
  tenantId: string
) {
  const cashReceivables = await prisma.customerReceivable.findMany({
    where: {
      tenantId,
      receivableType: 'CASH',
      status: 'CURRENT',
      driver: {
        name: {
          contains: driverName,
          mode: 'insensitive',
        },
      },
    },
    include: { driver: true },
  });

  const cylinderReceivables = await prisma.customerReceivable.findMany({
    where: {
      tenantId,
      receivableType: 'CYLINDER',
      status: 'CURRENT',
      driver: {
        name: {
          contains: driverName,
          mode: 'insensitive',
        },
      },
    },
    include: { driver: true },
    orderBy: { size: 'asc' },
  });

  return {
    cashReceivables,
    cylinderReceivables,
    totals: {
      totalCash: cashReceivables.reduce((sum, r) => sum + (r.amount || 0), 0),
      totalCylinders: cylinderReceivables.reduce(
        (sum, r) => sum + (r.quantity || 0),
        0
      ),
    },
  };
}

// GET /api/receivables/by-size?size=12kg
export async function getReceivablesBySize(
  cylinderSize: string,
  tenantId: string
) {
  return await prisma.customerReceivable.findMany({
    where: {
      tenantId,
      receivableType: 'CYLINDER',
      status: 'CURRENT',
      size: {
        contains: cylinderSize,
        mode: 'insensitive',
      },
    },
    include: { driver: true },
    orderBy: { driver: { name: 'asc' } },
  });
}

// GET /api/receivables/history?driver=John&days=30
export async function getReceivablesHistory(
  driverName: string,
  days: number,
  tenantId: string
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.receivableRecord.findMany({
    where: {
      tenantId,
      date: {
        gte: startDate,
      },
      driver: {
        name: {
          contains: driverName,
          mode: 'insensitive',
        },
      },
    },
    include: { driver: true },
    orderBy: { date: 'desc' },
  });
}
