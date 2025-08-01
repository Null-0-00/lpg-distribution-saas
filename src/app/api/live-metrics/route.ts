import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const [todayMetrics, yesterdayMetrics, realTimeStats, activeDrivers] =
      await Promise.all([
        getDayMetrics(tenantId, todayStart, now),
        getDayMetrics(tenantId, yesterdayStart, todayStart),
        getRealTimeStats(tenantId),
        getActiveDriverStats(tenantId, todayStart),
      ]);

    const growth = calculateGrowth(todayMetrics, yesterdayMetrics);

    return NextResponse.json({
      timestamp: now.toISOString(),
      today: todayMetrics,
      yesterday: yesterdayMetrics,
      growth,
      realTime: realTimeStats,
      drivers: activeDrivers,
    });
  } catch (error) {
    console.error('Live metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live metrics' },
      { status: 500 }
    );
  }
}

async function getDayMetrics(tenantId: string, startDate: Date, endDate: Date) {
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: startDate, lt: endDate },
      },
    }),
    prisma.expense.findMany({
      where: {
        tenantId,
        expenseDate: { gte: startDate, lt: endDate },
        isApproved: true,
      },
    }),
  ]);

  const revenue = sales.reduce((sum, sale) => sum + sale.netValue, 0);
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const orderCount = sales.length;
  const quantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  const packageSales = sales.filter((s) => s.saleType === 'PACKAGE').length;
  const refillSales = sales.filter((s) => s.saleType === 'REFILL').length;
  const cashSales = sales.filter((s) => s.paymentType === 'CASH').length;
  const creditSales = sales.filter((s) => s.paymentType === 'CREDIT').length;

  return {
    revenue,
    expenses: totalExpenses,
    profit: revenue - totalExpenses,
    orderCount,
    quantity,
    avgOrderValue,
    salesBreakdown: {
      package: packageSales,
      refill: refillSales,
      cash: cashSales,
      credit: creditSales,
    },
  };
}

async function getRealTimeStats(tenantId: string) {
  const last15Minutes = new Date(Date.now() - 15 * 60 * 1000);
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);

  const [recent15MinSales, recentHourSales, currentInventory] =
    await Promise.all([
      prisma.sale.findMany({
        where: {
          tenantId,
          createdAt: { gte: last15Minutes },
        },
      }),
      prisma.sale.findMany({
        where: {
          tenantId,
          createdAt: { gte: lastHour },
        },
      }),
      prisma.inventoryRecord.findFirst({
        where: { tenantId },
        orderBy: { date: 'desc' },
      }),
    ]);

  const revenue15Min = recent15MinSales.reduce(
    (sum, sale) => sum + sale.netValue,
    0
  );
  const revenueHour = recentHourSales.reduce(
    (sum, sale) => sum + sale.netValue,
    0
  );

  const salesVelocity = recent15MinSales.length;
  const hourlyProjection = revenueHour * (24 / 1);

  return {
    last15Minutes: {
      sales: recent15MinSales.length,
      revenue: revenue15Min,
    },
    lastHour: {
      sales: recentHourSales.length,
      revenue: revenueHour,
    },
    velocity: {
      salesPerQuarter: salesVelocity,
      projectedDailyRevenue: hourlyProjection,
    },
    inventory: {
      fullCylinders: currentInventory?.fullCylinders || 0,
      emptyCylinders: currentInventory?.emptyCylinders || 0,
      lastUpdated: currentInventory?.calculatedAt || new Date(),
    },
  };
}

async function getActiveDriverStats(tenantId: string, todayStart: Date) {
  const [drivers, todaySales] = await Promise.all([
    prisma.driver.findMany({
      where: { tenantId, status: 'ACTIVE' },
    }),
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: todayStart },
      },
      include: {
        driver: { select: { name: true } },
      },
    }),
  ]);

  const driverStats = drivers.map((driver) => {
    const driverSales = todaySales.filter(
      (sale) => sale.driverId === driver.id
    );
    const revenue = driverSales.reduce((sum, sale) => sum + sale.netValue, 0);
    const quantity = driverSales.reduce((sum, sale) => sum + sale.quantity, 0);

    return {
      id: driver.id,
      name: driver.name,
      sales: driverSales.length,
      revenue,
      quantity,
      lastSale:
        driverSales.length > 0
          ? Math.max(...driverSales.map((s) => s.createdAt.getTime()))
          : null,
    };
  });

  const activeTodayCount = driverStats.filter((d) => d.sales > 0).length;
  const totalRevenue = driverStats.reduce((sum, d) => sum + d.revenue, 0);

  return {
    total: drivers.length,
    activeToday: activeTodayCount,
    totalRevenue,
    topPerformers: driverStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    recent: driverStats
      .filter((d) => d.lastSale)
      .sort((a, b) => (b.lastSale || 0) - (a.lastSale || 0))
      .slice(0, 3),
  };
}

function calculateGrowth(today: any, yesterday: any) {
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    revenue: calculatePercentChange(today.revenue, yesterday.revenue),
    orders: calculatePercentChange(today.orderCount, yesterday.orderCount),
    quantity: calculatePercentChange(today.quantity, yesterday.quantity),
    avgOrderValue: calculatePercentChange(
      today.avgOrderValue,
      yesterday.avgOrderValue
    ),
    profit: calculatePercentChange(today.profit, yesterday.profit),
  };
}
