// Daily Sales Report API
// Comprehensive daily sales report with all drivers, receivables, and cash flow

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get all sales for retail drivers only
    const allSalesForTenant = await prisma.sale.findMany({
      where: {
        tenantId,
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

    // Filter sales by date
    const sales = allSalesForTenant.filter((sale) => {
      const saleDate = sale.saleDate.toISOString().split('T')[0];
      return saleDate === date;
    });

    // We don't need to fetch current receivables data as we're calculating them from scratch using the formulas

    // Get previous day's receivables for change calculation
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayStr = previousDay.toISOString().split('T')[0];

    // First ensure receivables are calculated for the previous day and current day
    await calculateDailyReceivablesForDate(tenantId, previousDay);
    await calculateDailyReceivablesForDate(tenantId, new Date(date));

    // Then get the calculated receivables
    const previousReceivables = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
        date: {
          gte: new Date(previousDayStr + 'T00:00:00.000Z'),
          lte: new Date(previousDayStr + 'T23:59:59.999Z'),
        },
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
      },
    });

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

    // Get driver cash deposits from sales (these are also considered deposits)
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

    // Calculate available cash
    const availableCash = totals.totalDeposited + totalDeposits - totalExpenses;

    return NextResponse.json({
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
        // Driver cash deposits from sales
        ...driverCashDeposits.map((d) => ({
          id: `driver-${d.driverId}`,
          amount: d._sum.cashDeposited || 0,
          description: `Daily cash deposit`,
          particulars: `Cash deposits by driver - ${driverMap.get(d.driverId) || 'Unknown'}`,
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
    });
  } catch (error) {
    console.error('Daily sales report error:', error);
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
    select: { id: true },
  });

  for (const driver of drivers) {
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

    // EXACT FORMULAS:
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

    // EXACT FORMULAS:
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
  }
}
