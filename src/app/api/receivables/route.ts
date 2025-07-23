// Receivables Tracking System API
// Implement exact receivables calculations with daily automation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

    // Get driver-wise summary for the period
    const driverSummary = await prisma.receivableRecord.groupBy({
      by: ['driverId'],
      where: {
        tenantId,
        date: { gte: start, lte: end },
        ...(driverId && { driverId }),
      },
      _sum: {
        cashReceivablesChange: true,
        cylinderReceivablesChange: true,
        totalCashReceivables: true,
        totalCylinderReceivables: true,
      },
    });

    // Get driver names for summary
    const driverIds = driverSummary.map((s) => s.driverId);
    const drivers = await prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, name: true, route: true, status: true },
    });

    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    const summary = driverSummary
      .map((item) => ({
        driver: driverMap.get(item.driverId),
        totalCashChange: item._sum.cashReceivablesChange || 0,
        totalCylinderChange: item._sum.cylinderReceivablesChange || 0,
        currentCashReceivables: item._sum.totalCashReceivables || 0,
        currentCylinderReceivables: item._sum.totalCylinderReceivables || 0,
        totalReceivables:
          (item._sum.totalCashReceivables || 0) +
          (item._sum.totalCylinderReceivables || 0),
      }))
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

    // Get yesterday's totals
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
        date: {
          gte: new Date(
            yesterday.toISOString().split('T')[0] + 'T00:00:00.000Z'
          ),
          lt: new Date(dateStr + 'T00:00:00.000Z'),
        },
      },
      orderBy: { date: 'desc' },
    });

    const yesterdayCashTotal = yesterdayRecord?.totalCashReceivables || 0;
    const yesterdayCylinderTotal =
      yesterdayRecord?.totalCylinderReceivables || 0;

    // EXACT FORMULAS from prompts.md:
    // Today's Total = Yesterday's Total + Today's Changes
    const totalCashReceivables = yesterdayCashTotal + cashReceivablesChange;
    const totalCylinderReceivables =
      yesterdayCylinderTotal + cylinderReceivablesChange;

    // Upsert the receivable record
    await prisma.receivableRecord.upsert({
      where: {
        tenantId_driverId_date: {
          tenantId,
          driverId: driver.id,
          date: new Date(dateStr),
        },
      },
      update: {
        cashReceivablesChange,
        cylinderReceivablesChange,
        totalCashReceivables,
        totalCylinderReceivables,
      },
      create: {
        tenantId,
        driverId: driver.id,
        date: new Date(dateStr),
        cashReceivablesChange,
        cylinderReceivablesChange,
        totalCashReceivables,
        totalCylinderReceivables,
      },
    });

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
