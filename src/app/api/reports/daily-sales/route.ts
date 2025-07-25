// Daily Sales Report API
// Comprehensive daily sales report with all drivers, receivables, and cash flow

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Simple in-memory cache for daily reports (5 minute TTL)
const reportCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get('date') || new Date().toISOString().split('T')[0];
    const tenantId = session.user.tenantId;

    // Check cache first
    const cacheKey = `${tenantId}-${date}`;
    const cached = reportCache.get(cacheKey);

    // Clear cache to ensure fresh data for debugging
    reportCache.clear();

    if (false && cached && Date.now() - cached!.timestamp < CACHE_TTL) {
      return NextResponse.json(cached!.data);
    }

    // Get all active retail drivers
    const allDrivers = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
      select: {
        id: true,
        name: true,
        driverType: true,
      },
      orderBy: { name: 'asc' },
    });

    // Get sales for the specific date only
    const sales = await prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            driverType: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            size: true,
          },
        },
      },
      orderBy: [{ driver: { name: 'asc' } }, { saleDate: 'desc' }],
    });

    // We don't need to fetch current receivables data as we're calculating them from scratch using the formulas

    // Get previous day's receivables for change calculation
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayStr = previousDay.toISOString().split('T')[0];

    // Get previous day's receivables (calculate if not exists)
    const previousReceivables = await getOrCalculateReceivables(
      tenantId,
      previousDayStr,
      allDrivers
    );

    // Create map for quick lookup of previous day's receivables
    const previousReceivablesMap = new Map(
      previousReceivables.map((r) => [r.driverId, r])
    );

    // Group sales by driver
    const salesByDriver = sales.reduce(
      (acc, sale) => {
        const driverId = sale.driverId;
        if (!acc[driverId]) {
          acc[driverId] = [];
        }
        acc[driverId].push(sale);
        return acc;
      },
      {} as Record<string, typeof sales>
    );

    // Create driver report data
    const driverReports = allDrivers.map((driver) => {
      const driverSales = salesByDriver[driver.id] || [];
      const previousReceivables = previousReceivablesMap.get(driver.id);

      // Calculate sales metrics
      const packageSales = driverSales
        .filter((s) => s.saleType === 'PACKAGE')
        .reduce((sum, s) => sum + s.quantity, 0);

      const refillSales = driverSales
        .filter((s) => s.saleType === 'REFILL')
        .reduce((sum, s) => sum + s.quantity, 0);

      const totalSalesQty = packageSales + refillSales;
      const totalSalesValue = driverSales.reduce(
        (sum, s) => sum + s.totalValue,
        0
      );
      const discount = driverSales.reduce((sum, s) => sum + s.discount, 0);
      const cashDeposited = driverSales.reduce(
        (sum, s) => sum + s.cashDeposited,
        0
      );
      const cylinderDeposited = driverSales.reduce(
        (sum, s) => sum + s.cylindersDeposited,
        0
      );

      // EXACT FORMULAS as specified:
      // Today's Changes in Drivers Cash Receivables = driver sales revenue - cash deposits - discounts
      const todaysCashReceivableChange =
        totalSalesValue - cashDeposited - discount;

      // Today's Changes in Drivers Cylinder Receivables = driver refill sales - cylinder deposits
      const todaysCylinderReceivableChange = refillSales - cylinderDeposited;

      // Get yesterday's totals
      const yesterdaysCashReceivables =
        previousReceivables?.totalCashReceivables || 0;
      const yesterdaysCylinderReceivables =
        previousReceivables?.totalCylinderReceivables || 0;

      // EXACT FORMULAS as specified:
      // Today's Total cash receivable = Yesterday's Total + Today's Changes
      const todaysTotalCashReceivables =
        yesterdaysCashReceivables + todaysCashReceivableChange;

      // Today's Total cylinder receivable = Yesterday's Total + Today's Changes
      const todaysTotalCylinderReceivables =
        yesterdaysCylinderReceivables + todaysCylinderReceivableChange;

      // Total receivables (cash + cylinder)
      const totalReceivables =
        todaysTotalCashReceivables + todaysTotalCylinderReceivables;

      // Calculate total change in receivables
      const previousTotalReceivables =
        yesterdaysCashReceivables + yesterdaysCylinderReceivables;
      const changeInReceivables = totalReceivables - previousTotalReceivables;

      return {
        driverId: driver.id,
        driverName: driver.name,
        driverType: driver.driverType,
        packageSales,
        refillSales,
        totalSalesQty,
        totalSalesValue,
        discount,
        totalDeposited: cashDeposited,
        totalCashReceivables: todaysTotalCashReceivables,
        totalCylinderReceivables: todaysTotalCylinderReceivables,
        totalReceivables,
        changeInReceivables,
        changeInCashReceivables: todaysCashReceivableChange,
        changeInCylinderReceivables: todaysCylinderReceivableChange,
        salesCount: driverSales.length,
        // Additional data for debugging/validation
        todaysCashReceivableChange,
        todaysCylinderReceivableChange,
        yesterdaysCashReceivables,
        yesterdaysCylinderReceivables,
        todaysTotalCashReceivables,
      };
    });

    // Calculate totals
    const totals = {
      packageSales: driverReports.reduce((sum, d) => sum + d.packageSales, 0),
      refillSales: driverReports.reduce((sum, d) => sum + d.refillSales, 0),
      totalSalesQty: driverReports.reduce((sum, d) => sum + d.totalSalesQty, 0),
      totalSalesValue: driverReports.reduce(
        (sum, d) => sum + d.totalSalesValue,
        0
      ),
      discount: driverReports.reduce((sum, d) => sum + d.discount, 0),
      totalDeposited: driverReports.reduce(
        (sum, d) => sum + d.totalDeposited,
        0
      ),
      totalCashReceivables: driverReports.reduce(
        (sum, d) => sum + d.totalCashReceivables,
        0
      ),
      totalCylinderReceivables: driverReports.reduce(
        (sum, d) => sum + d.totalCylinderReceivables,
        0
      ),
      totalReceivables: driverReports.reduce(
        (sum, d) => sum + d.totalReceivables,
        0
      ),
      changeInReceivables: driverReports.reduce(
        (sum, d) => sum + d.changeInReceivables,
        0
      ),
      changeInCashReceivables: driverReports.reduce(
        (sum, d) => sum + d.changeInCashReceivables,
        0
      ),
      changeInCylinderReceivables: driverReports.reduce(
        (sum, d) => sum + d.changeInCylinderReceivables,
        0
      ),
    };

    // Get expenses for the day
    const expenses = await prisma.expense.findMany({
      where: {
        tenantId,
        expenseDate: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { expenseDate: 'desc' },
    });

    // Get deposits for the day
    const deposits = await prisma.deposit.findMany({
      where: {
        tenantId,
        depositDate: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { depositDate: 'desc' },
    });

    // Get driver cash deposits from sales (including receivable payments)
    const driverCashDeposits = await prisma.sale.groupBy({
      by: ['driverId'],
      where: {
        tenantId,
        saleDate: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
        // Include all sales (regular sales and receivable payments/returns)
      },
      _sum: {
        cashDeposited: true,
      },
      having: {
        cashDeposited: {
          _sum: {
            gt: 0,
          },
        },
      },
    });

    // Get driver names for cash deposits
    const driverIds = driverCashDeposits.map((d) => d.driverId);
    const driversWithDeposits = await prisma.driver.findMany({
      where: {
        id: { in: driverIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const driverMap = new Map(driversWithDeposits.map((d) => [d.id, d.name]));

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalDriverCashDeposits = driverCashDeposits.reduce(
      (sum, d) => sum + (d._sum.cashDeposited || 0),
      0
    );

    // Debug: Log what we found for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - Daily Sales API:', {
        date,
        salesCount: sales.length,
        driverCashDepositsCount: driverCashDeposits.length,
        totalDriverCashDeposits,
        salesWithCashDeposited: sales.filter((s) => s.cashDeposited > 0).length,
        receivablePayments: sales.filter((s) =>
          s.notes?.includes('Receivable payment')
        ).length,
      });
    }

    // Calculate available cash
    const availableCash = totals.totalDeposited + totalDeposits - totalExpenses;

    const reportData = {
      success: true,
      date,
      driverReports,
      totals,
      expenses: expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        description: e.description,
        particulars: e.particulars,
        category: e.category.name,
        user: e.user.name,
        expenseDate: e.expenseDate,
        isApproved: e.isApproved,
      })),
      deposits: [
        // Manual deposits from deposits table
        ...deposits.map((d) => ({
          id: d.id,
          amount: d.amount,
          description: d.description,
          particulars: d.particulars || 'Cash deposits by owner',
          user: d.user.name,
          depositDate: d.depositDate,
          isApproved: d.isApproved,
        })),
        // Driver cash deposits from sales (including receivable payments)
        ...driverCashDeposits.map((d) => ({
          id: `driver-${d.driverId}`,
          amount: d._sum.cashDeposited || 0,
          description: `Daily cash deposit`,
          particulars: `Cash deposits by driver - ${driverMap.get(d.driverId) || 'Unknown'} (includes receivable payments)`,
          user: driverMap.get(d.driverId) || 'Unknown Driver',
          depositDate: date,
          isApproved: true,
        })),
      ],
      summary: {
        totalDeposited: totals.totalDeposited,
        totalExpenses,
        totalManualDeposits: totalDeposits,
        totalDriverCashDeposits,
        availableCash: totals.totalDeposited + totalDeposits - totalExpenses,
      },
    };

    // Cache the result
    reportCache.set(cacheKey, { data: reportData, timestamp: Date.now() });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Daily sales report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optimized helper function to get or calculate receivables for a specific date
async function getOrCalculateReceivables(
  tenantId: string,
  dateStr: string,
  drivers: any[]
) {
  // First try to get existing receivables
  const existingReceivables = await prisma.receivableRecord.findMany({
    where: {
      tenantId,
      date: {
        gte: new Date(dateStr + 'T00:00:00.000Z'),
        lte: new Date(dateStr + 'T23:59:59.999Z'),
      },
      driver: {
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
    },
  });

  // If we have all receivables, return them
  const existingDriverIds = new Set(existingReceivables.map((r) => r.driverId));
  const missingDrivers = drivers.filter((d) => !existingDriverIds.has(d.id));

  if (missingDrivers.length === 0) {
    return existingReceivables;
  }

  // Calculate missing receivables in batch
  const date = new Date(dateStr);

  // Get all sales for missing drivers on this date in one query
  const salesByDriver = await prisma.sale.groupBy({
    by: ['driverId'],
    where: {
      tenantId,
      driverId: { in: missingDrivers.map((d) => d.id) },
      saleDate: {
        gte: new Date(dateStr + 'T00:00:00.000Z'),
        lte: new Date(dateStr + 'T23:59:59.999Z'),
      },
    },
    _sum: {
      totalValue: true,
      discount: true,
      cashDeposited: true,
      cylindersDeposited: true,
    },
  });

  // Get refill sales for cylinder receivables in one query
  const refillSalesByDriver = await prisma.sale.groupBy({
    by: ['driverId'],
    where: {
      tenantId,
      driverId: { in: missingDrivers.map((d) => d.id) },
      saleDate: {
        gte: new Date(dateStr + 'T00:00:00.000Z'),
        lte: new Date(dateStr + 'T23:59:59.999Z'),
      },
      saleType: 'REFILL',
    },
    _sum: {
      quantity: true,
    },
  });

  // Get previous day's receivables in one query
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const previousReceivables = await prisma.receivableRecord.findMany({
    where: {
      tenantId,
      driverId: { in: missingDrivers.map((d) => d.id) },
      date: {
        gte: new Date(yesterdayStr + 'T00:00:00.000Z'),
        lte: new Date(yesterdayStr + 'T23:59:59.999Z'),
      },
    },
  });

  // Create maps for quick lookup
  const salesMap = new Map(salesByDriver.map((s) => [s.driverId, s._sum]));
  const refillMap = new Map(
    refillSalesByDriver.map((r) => [r.driverId, r._sum.quantity || 0])
  );
  const previousMap = new Map(previousReceivables.map((p) => [p.driverId, p]));

  // Calculate receivables for missing drivers
  const newReceivables = [];
  for (const driver of missingDrivers) {
    const salesData = salesMap.get(driver.id);
    const refillQuantity = refillMap.get(driver.id) || 0;
    const previousRec = previousMap.get(driver.id);

    const driverSalesRevenue = salesData?.totalValue || 0;
    const cashDeposits = salesData?.cashDeposited || 0;
    const discounts = salesData?.discount || 0;
    const cylinderDeposits = salesData?.cylindersDeposited || 0;

    // EXACT FORMULAS:
    const cashReceivablesChange = driverSalesRevenue - cashDeposits - discounts;
    const cylinderReceivablesChange = refillQuantity - cylinderDeposits;

    const yesterdayCashTotal = previousRec?.totalCashReceivables || 0;
    const yesterdayCylinderTotal = previousRec?.totalCylinderReceivables || 0;

    const totalCashReceivables = yesterdayCashTotal + cashReceivablesChange;
    const totalCylinderReceivables =
      yesterdayCylinderTotal + cylinderReceivablesChange;

    newReceivables.push({
      tenantId,
      driverId: driver.id,
      date: new Date(dateStr),
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables,
      totalCylinderReceivables,
    });
  }

  // Batch insert new receivables
  if (newReceivables.length > 0) {
    await prisma.receivableRecord.createMany({
      data: newReceivables,
      skipDuplicates: true,
    });
  }

  // Return all receivables (existing + new)
  return [...existingReceivables, ...newReceivables];
}
