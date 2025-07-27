import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Manual endpoint to recalculate receivables for debugging
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to manually recalculate
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const tenantId = session.user.tenantId;

    console.log(`Recalculating receivables for ${days} days...`);

    // Calculate receivables for the specified number of days
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const calcDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = calcDate.toISOString().split('T')[0];

      console.log(`Calculating receivables for ${dateStr}...`);
      await calculateDailyReceivablesForDate(tenantId, calcDate);
      results.push({ date: dateStr, status: 'calculated' });
    }

    return NextResponse.json({
      success: true,
      message: `Receivables recalculated for ${days} days`,
      results,
    });
  } catch (error) {
    console.error('Error recalculating receivables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate daily receivables for a specific date
async function calculateDailyReceivablesForDate(tenantId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];

  // Get all active retail drivers
  const drivers = await prisma.driver.findMany({
    where: { tenantId, status: 'ACTIVE', driverType: 'RETAIL' },
    select: { id: true, name: true },
  });

  console.log(`Processing ${drivers.length} drivers for ${dateStr}`);

  for (const driver of drivers) {
    // Get driver's sales for the date
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    const salesData = await prisma.sale.aggregate({
      where: {
        tenantId,
        driverId: driver.id,
        saleDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        totalValue: true,
        discount: true,
        cashDeposited: true,
        cylindersDeposited: true,
      },
    });

    // Calculate refill sales for cylinder receivables
    const refillSales = await prisma.sale.aggregate({
      where: {
        tenantId,
        driverId: driver.id,
        saleDate: {
          gte: startOfDay,
          lte: endOfDay,
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

    // EXACT FORMULAS:
    // Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
    const cashReceivablesChange = driverSalesRevenue - cashDeposits - discounts;

    // Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
    const cylinderReceivablesChange = refillQuantity - cylinderDeposits;

    // Get previous receivables (yesterday's record or onboarding receivables)
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    yesterday.setHours(0, 0, 0, 0);

    // First try to get yesterday's record
    const yesterdayRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
        date: {
          gte: yesterday,
          lt: date,
        },
      },
      orderBy: { date: 'desc' },
    });

    let yesterdayCashTotal = 0;
    let yesterdayCylinderTotal = 0;

    if (yesterdayRecord) {
      yesterdayCashTotal = yesterdayRecord.totalCashReceivables;
      yesterdayCylinderTotal = yesterdayRecord.totalCylinderReceivables;
    } else {
      // If no yesterday record, check for onboarding receivables (first record)
      const onboardingRecord = await prisma.receivableRecord.findFirst({
        where: {
          tenantId,
          driverId: driver.id,
        },
        orderBy: { date: 'asc' },
      });

      if (onboardingRecord) {
        yesterdayCashTotal = onboardingRecord.totalCashReceivables;
        yesterdayCylinderTotal = onboardingRecord.totalCylinderReceivables;
      }
    }

    // EXACT FORMULAS:
    // Today's Total = Yesterday's Total + Today's Changes
    const totalCashReceivables = yesterdayCashTotal + cashReceivablesChange;
    const totalCylinderReceivables =
      yesterdayCylinderTotal + cylinderReceivablesChange;

    // Upsert the receivable record
    const recordDate = new Date(dateStr + 'T00:00:00.000Z');

    await prisma.receivableRecord.upsert({
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

    console.log(
      `Driver ${driver.name}: Cash=${totalCashReceivables.toFixed(2)}, Cylinders=${totalCylinderReceivables}`
    );
  }
}
