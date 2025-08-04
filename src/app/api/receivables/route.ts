// Receivables Tracking System API
// Implement exact receivables calculations with daily automation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const receivablesQuerySchema = z.object({
  driverId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1),
  limit: z.string().transform((val) => Math.min(parseInt(val) || 20, 100)),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { driverId, startDate, endDate, page, limit } =
      receivablesQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const tenantId = session.user.tenantId;

    // Default date range to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Build where clause for receivables records
    const where: Record<string, unknown> = {
      tenantId,
      date: { gte: start, lte: end },
    };

    if (driverId) where.driverId = driverId;

    // Get receivables records with driver info
    const [records, totalCount] = await Promise.all([
      prisma.receivableRecord.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              route: true,
              status: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.receivableRecord.count({ where }),
    ]);

    // Get latest receivable record for each driver to show current totals
    const drivers = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(driverId && { id: driverId }),
      },
      select: {
        id: true,
        name: true,
        route: true,
        status: true,
        receivableRecords: {
          orderBy: { date: 'desc' },
          take: 1,
          select: {
            totalCashReceivables: true,
            totalCylinderReceivables: true,
            cashReceivablesChange: true,
            cylinderReceivablesChange: true,
            date: true,
          },
        },
      },
    });

    // Calculate summary from latest records for each driver
    const summary = drivers
      .map((driver) => {
        const latestRecord = driver.receivableRecords[0];
        const currentCashReceivables = latestRecord?.totalCashReceivables || 0;
        const currentCylinderReceivables =
          latestRecord?.totalCylinderReceivables || 0;

        return {
          driver: {
            id: driver.id,
            name: driver.name,
            route: driver.route,
            status: driver.status,
          },
          totalCashChange: latestRecord?.cashReceivablesChange || 0,
          totalCylinderChange: latestRecord?.cylinderReceivablesChange || 0,
          currentCashReceivables,
          currentCylinderReceivables,
          totalReceivables: currentCashReceivables + currentCylinderReceivables,
        };
      })
      // Show all drivers, including those with zero receivables
      .sort((a, b) => b.totalReceivables - a.totalReceivables);

    // Overall totals
    const overallTotals = {
      totalCashReceivables: summary.reduce(
        (sum, s) => sum + s.currentCashReceivables,
        0
      ),
      totalCylinderReceivables: summary.reduce(
        (sum, s) => sum + s.currentCylinderReceivables,
        0
      ),
      totalReceivables: summary.reduce((sum, s) => sum + s.totalReceivables, 0),
      totalDrivers: summary.length,
    };

    return NextResponse.json({
      records: records.map((record) => ({
        id: record.id,
        date: record.date.toISOString().split('T')[0],
        driver: record.driver,
        changes: {
          cash: record.cashReceivablesChange,
          cylinders: record.cylinderReceivablesChange,
        },
        runningTotals: {
          cash: record.totalCashReceivables,
          cylinders: record.totalCylinderReceivables,
          total: record.totalCashReceivables + record.totalCylinderReceivables,
        },
        createdAt: record.createdAt,
      })),
      summary,
      totals: overallTotals,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Receivables fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Trigger automated daily receivables calculation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const schema = z.object({
      date: z.string().optional(),
      driverId: z.string().optional(),
      action: z.enum(['calculate', 'recalculate']).default('calculate'),
    });

    const { date, driverId, action } = schema.parse(body);
    const tenantId = session.user.tenantId;
    const targetDate = date ? new Date(date) : new Date();

    // EXACT RECEIVABLES CALCULATION as per prompts.md
    const result = await calculateDailyReceivables(
      tenantId,
      targetDate,
      driverId
    );

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      action,
      result,
    });
  } catch (error) {
    console.error('Receivables calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// AUTOMATED DAILY CALCULATION SERVICE
async function calculateDailyReceivables(
  tenantId: string,
  date: Date,
  driverId?: string
) {
  const dateStr = date.toISOString().split('T')[0];

  // Get all drivers if no specific driver provided
  const drivers = driverId
    ? [{ id: driverId }]
    : await prisma.driver.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { id: true },
      });

  const results = [];

  for (const driver of drivers) {
    // CASH RECEIVABLES FORMULA:
    // Today's Changes = driver_sales_revenue - cash_deposits - discounts

    // Get driver's sales for the date
    const salesData = await prisma.sale.aggregate({
      where: {
        tenantId,
        driverId: driver.id,
        saleDate: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(
            new Date(date.getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0] + 'T00:00:00.000Z'
          ),
        },
      },
      _sum: {
        totalValue: true,
        discount: true,
        cashDeposited: true,
        cylindersDeposited: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate refill sales for cylinder receivables
    const refillSales = await prisma.sale.aggregate({
      where: {
        tenantId,
        driverId: driver.id,
        saleDate: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(
            new Date(date.getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0] + 'T00:00:00.000Z'
          ),
        },
        saleType: 'REFILL',
      },
      _sum: {
        quantity: true,
      },
    });

    const driverSalesRevenue = salesData._sum.totalValue || 0;
    const cashDeposits = salesData._sum.cashDeposited || 0;
    const discounts = salesData._sum.discount || 0;
    const cylinderDeposits = salesData._sum.cylindersDeposited || 0;
    const refillQuantity = refillSales._sum.quantity || 0;

    // EXACT FORMULAS from prompts.md:
    // Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
    const cashReceivablesChange = driverSalesRevenue - cashDeposits - discounts;

    // Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
    const cylinderReceivablesChange = refillQuantity - cylinderDeposits;

    // Get previous day's receivables for this driver (includes onboarding values)
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    yesterday.setHours(0, 0, 0, 0);

    // Get the most recent receivables record before today
    const previousRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
        date: {
          lt: new Date(dateStr + 'T00:00:00.000Z'),
        },
      },
      orderBy: { date: 'desc' },
    });

    let previousCashTotal = 0;
    let previousCylinderTotal = 0;

    if (previousRecord) {
      // Use most recent record's totals (could be yesterday or onboarding)
      previousCashTotal = previousRecord.totalCashReceivables;
      previousCylinderTotal = previousRecord.totalCylinderReceivables;

      console.log(`📊 Found previous receivables for driver ${driver.id}:`, {
        date: previousRecord.date.toISOString().split('T')[0],
        cash: previousCashTotal,
        cylinders: previousCylinderTotal,
      });
    } else {
      console.log(`📊 No previous receivables found for driver ${driver.id}`);
    }

    // EXACT FORMULAS from updated requirements:
    // Today's Total = Previous Total (includes onboarding values) + Today's Changes
    const totalCashReceivables = previousCashTotal + cashReceivablesChange;
    const totalCylinderReceivables =
      previousCylinderTotal + cylinderReceivablesChange;

    console.log(`💰 Calculated receivables for driver ${driver.id}:`, {
      previousCash: previousCashTotal,
      previousCylinders: previousCylinderTotal,
      cashChange: cashReceivablesChange,
      cylinderChange: cylinderReceivablesChange,
      totalCash: totalCashReceivables,
      totalCylinders: totalCylinderReceivables,
    });

    // Upsert the receivable record
    try {
      const recordDate = new Date(dateStr + 'T00:00:00.000Z');

      // Validate data before upsert
      if (isNaN(totalCashReceivables) || isNaN(totalCylinderReceivables)) {
        console.error(`Invalid receivables values for driver ${driver.id}:`, {
          totalCashReceivables,
          totalCylinderReceivables,
          cashReceivablesChange,
          cylinderReceivablesChange,
        });
        continue;
      }

      const upsertResult = await prisma.receivableRecord.upsert({
        where: {
          tenantId_driverId_date: {
            tenantId,
            driverId: driver.id,
            date: recordDate,
          },
        },
        update: {
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
          calculatedAt: new Date(),
        },
        create: {
          tenantId,
          driverId: driver.id,
          date: recordDate,
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
        },
      });

      console.log(`✅ Receivable record saved for driver ${driver.id}:`, {
        id: upsertResult.id,
        totalCash: upsertResult.totalCashReceivables,
        totalCylinders: upsertResult.totalCylinderReceivables,
      });

      // 🚫 DRIVER RECEIVABLES MESSAGING DISABLED - customers only
      if (
        Math.abs(cashReceivablesChange) > 0 ||
        Math.abs(cylinderReceivablesChange) > 0
      ) {
        console.log(
          '🚫 Driver receivables messaging disabled - customers only'
        );
      }
    } catch (upsertError: unknown) {
      console.error(
        `❌ Failed to save receivable record for driver ${driver.id}:`,
        upsertError
      );

      // Log specific error details
      if (
        upsertError &&
        typeof upsertError === 'object' &&
        'code' in upsertError
      ) {
        if ((upsertError as any).code === 'P2002') {
          console.error('Unique constraint violation');
        }
        if ((upsertError as any).code === 'P2003') {
          console.error('Foreign key constraint violation');
        }
      }

      // Continue with other drivers instead of failing completely
      continue;
    }

    results.push({
      driverId: driver.id,
      date: dateStr,
      changes: {
        cash: cashReceivablesChange,
        cylinders: cylinderReceivablesChange,
      },
      totals: {
        cash: totalCashReceivables,
        cylinders: totalCylinderReceivables,
      },
      salesCount: salesData._count.id,
    });
  }

  return {
    processedDrivers: results.length,
    results,
  };
}
