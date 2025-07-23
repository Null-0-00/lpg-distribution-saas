import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last-30-days';
    const tenantId = session.user.tenantId;

    const dateRange = getDateRange(period);

    const [
      salesMetrics,
      inventoryMetrics,
      receivablesMetrics,
      driverPerformance,
      financialHealth,
      trendsData,
    ] = await Promise.all([
      getSalesMetrics(tenantId, dateRange),
      getInventoryMetrics(tenantId),
      getReceivablesMetrics(tenantId, dateRange),
      getDriverPerformance(tenantId, dateRange),
      getFinancialHealth(tenantId, dateRange),
      getTrendsData(tenantId, dateRange),
    ]);

    return NextResponse.json({
      period: dateRange,
      lastUpdated: new Date().toISOString(),
      metrics: {
        sales: salesMetrics,
        inventory: inventoryMetrics,
        receivables: receivablesMetrics,
        drivers: driverPerformance,
        financial: financialHealth,
      },
      trends: trendsData,
    });
  } catch (error) {
    console.error('Executive dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function getDateRange(period: string) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );
      break;
    case 'last-7-days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last-30-days':
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'last-90-days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
  }

  return { startDate, endDate: now };
}

async function getSalesMetrics(
  tenantId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const { startDate, endDate } = dateRange;

  const [sales, previousPeriodSales] = await Promise.all([
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: startDate, lte: endDate },
      },
      include: { product: true, driver: true },
    }),
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: {
          gte: new Date(
            startDate.getTime() - (endDate.getTime() - startDate.getTime())
          ),
          lt: startDate,
        },
      },
    }),
  ]);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.netValue, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  const packageSales = sales.filter((s) => s.saleType === 'PACKAGE').length;
  const refillSales = sales.filter((s) => s.saleType === 'REFILL').length;

  const previousRevenue = previousPeriodSales.reduce(
    (sum, sale) => sum + sale.netValue,
    0
  );
  const revenueGrowth =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const dailySales = sales.reduce(
    (acc, sale) => {
      const date = sale.saleDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, quantity: 0, orders: 0 };
      }
      acc[date]!.revenue += sale.netValue;
      acc[date]!.quantity += sale.quantity;
      acc[date]!.orders += 1;
      return acc;
    },
    {} as Record<string, { revenue: number; quantity: number; orders: number }>
  );

  return {
    totalRevenue,
    totalOrders: sales.length,
    totalQuantity,
    averageOrderValue,
    packageSales,
    refillSales,
    revenueGrowth,
    dailyBreakdown: Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

async function getInventoryMetrics(tenantId: string) {
  const [products, latestInventory] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId, isActive: true },
    }),
    prisma.inventoryRecord.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      take: 1,
    }),
  ]);

  const currentInventory = latestInventory[0];
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) =>
      currentInventory && currentInventory.fullCylinders < p.lowStockThreshold
  ).length;

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + product.currentPrice * (currentInventory?.fullCylinders || 0),
    0
  );

  const turnoverRate = currentInventory
    ? (currentInventory.totalSales /
        Math.max(currentInventory.fullCylinders, 1)) *
      30
    : 0;

  return {
    totalProducts,
    fullCylinders: currentInventory?.fullCylinders || 0,
    emptyCylinders: currentInventory?.emptyCylinders || 0,
    totalCylinders: currentInventory?.totalCylinders || 0,
    lowStockProducts,
    inventoryValue,
    turnoverRate,
    stockLevel: lowStockProducts > 0 ? 'low' : 'normal',
  };
}

async function getReceivablesMetrics(
  tenantId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const { startDate, endDate } = dateRange;

  const [receivables, salesOnCredit] = await Promise.all([
    prisma.receivableRecord.findMany({
      where: {
        tenantId,
        date: { gte: startDate, lte: endDate },
      },
      include: { driver: true },
    }),
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: startDate, lte: endDate },
        OR: [{ isOnCredit: true }, { isCylinderCredit: true }],
      },
    }),
  ]);

  const totalCashReceivables = receivables.reduce(
    (sum, r) => sum + r.totalCashReceivables,
    0
  );
  const totalCylinderReceivables = receivables.reduce(
    (sum, r) => sum + r.totalCylinderReceivables,
    0
  );

  const overdueAmount = salesOnCredit
    .filter((sale) => {
      const daysDiff =
        (new Date().getTime() - sale.saleDate.getTime()) /
        (1000 * 60 * 60 * 24);
      return daysDiff > 30;
    })
    .reduce((sum, sale) => sum + sale.netValue, 0);

  const collectionRate =
    totalCashReceivables > 0
      ? ((totalCashReceivables - overdueAmount) / totalCashReceivables) * 100
      : 100;

  const agingBrackets = {
    current: 0, // 0-30 days
    days31to60: 0,
    days61to90: 0,
    over90days: 0,
  };

  salesOnCredit.forEach((sale) => {
    const daysDiff =
      (new Date().getTime() - sale.saleDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 30) agingBrackets.current += sale.netValue;
    else if (daysDiff <= 60) agingBrackets.days31to60 += sale.netValue;
    else if (daysDiff <= 90) agingBrackets.days61to90 += sale.netValue;
    else agingBrackets.over90days += sale.netValue;
  });

  return {
    totalCashReceivables,
    totalCylinderReceivables,
    overdueAmount,
    collectionRate,
    agingBrackets,
    creditSales: salesOnCredit.length,
  };
}

async function getDriverPerformance(
  tenantId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const { startDate, endDate } = dateRange;

  const [drivers, sales] = await Promise.all([
    prisma.driver.findMany({
      where: { tenantId, status: 'ACTIVE' },
    }),
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: startDate, lte: endDate },
      },
      include: { driver: true },
    }),
  ]);

  const driverStats = drivers
    .map((driver) => {
      const driverSales = sales.filter((s) => s.driverId === driver.id);
      const revenue = driverSales.reduce((sum, s) => sum + s.netValue, 0);
      const quantity = driverSales.reduce((sum, s) => sum + s.quantity, 0);

      return {
        id: driver.id,
        name: driver.name,
        totalSales: driverSales.length,
        totalRevenue: revenue,
        totalQuantity: quantity,
        averageOrderValue:
          driverSales.length > 0 ? revenue / driverSales.length : 0,
        performance: revenue, // Simple performance metric
      };
    })
    .sort((a, b) => b.performance - a.performance);

  const totalActiveDrivers = drivers.length;
  const topPerformer = driverStats[0] || null;
  const averagePerformance =
    driverStats.reduce((sum, d) => sum + d.performance, 0) /
    Math.max(driverStats.length, 1);

  return {
    totalActiveDrivers,
    topPerformer,
    averagePerformance,
    rankings: driverStats.slice(0, 10),
  };
}

async function getFinancialHealth(
  tenantId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const { startDate, endDate } = dateRange;

  const [sales, expenses, assets, liabilities] = await Promise.all([
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: startDate, lte: endDate },
      },
    }),
    prisma.expense.findMany({
      where: {
        tenantId,
        expenseDate: { gte: startDate, lte: endDate },
        isApproved: true,
      },
    }),
    prisma.asset.findMany({
      where: { tenantId, isActive: true },
    }),
    prisma.liability.findMany({
      where: { tenantId, isActive: true },
    }),
  ]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.netValue, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const currentRatio =
    totalLiabilities > 0
      ? totalAssets / totalLiabilities
      : totalAssets > 0
        ? 999
        : 1;
  const returnOnAssets = totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    totalAssets,
    totalLiabilities,
    netWorth,
    currentRatio,
    returnOnAssets,
    healthScore: Math.min(
      100,
      Math.max(
        0,
        profitMargin * 0.4 +
          Math.min(currentRatio, 3) * 10 +
          returnOnAssets * 0.3 +
          30
      )
    ),
  };
}

async function getTrendsData(
  tenantId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const { startDate } = dateRange;
  const extendedStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: extendedStart },
      },
    }),
    prisma.expense.findMany({
      where: {
        tenantId,
        expenseDate: { gte: extendedStart },
        isApproved: true,
      },
    }),
  ]);

  const dailyTrends = sales.reduce(
    (acc, sale) => {
      const date = sale.saleDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, quantity: 0, orders: 0 };
      }
      acc[date]!.revenue += sale.netValue;
      acc[date]!.quantity += sale.quantity;
      acc[date]!.orders += 1;
      return acc;
    },
    {} as Record<string, { revenue: number; quantity: number; orders: number }>
  );

  const expenseTrends = expenses.reduce(
    (acc, expense) => {
      const date = expense.expenseDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]! += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    sales: Object.entries(dailyTrends)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    expenses: Object.entries(expenseTrends)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
