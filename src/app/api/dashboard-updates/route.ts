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
    const lastUpdate = searchParams.get('lastUpdate');
    const type = searchParams.get('type') || 'all';
    
    const tenantId = session.user.tenantId;
    const since = lastUpdate ? new Date(lastUpdate) : new Date(Date.now() - 5 * 60 * 1000);

    const updates: any = {
      timestamp: new Date().toISOString(),
      hasUpdates: false,
      data: {}
    };

    if (type === 'all' || type === 'sales') {
      const recentSales = await prisma.sale.findMany({
        where: {
          tenantId,
          createdAt: { gte: since }
        },
        include: {
          driver: { select: { name: true } },
          product: { select: { name: true, size: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (recentSales.length > 0) {
        updates.hasUpdates = true;
        updates.data.sales = {
          recent: recentSales,
          count: recentSales.length,
          totalValue: recentSales.reduce((sum, sale) => sum + sale.netValue, 0)
        };
      }
    }

    if (type === 'all' || type === 'inventory') {
      const inventoryAlerts = await getInventoryAlerts(tenantId);
      if (inventoryAlerts.length > 0) {
        updates.hasUpdates = true;
        updates.data.inventory = {
          alerts: inventoryAlerts,
          alertCount: inventoryAlerts.length
        };
      }
    }

    if (type === 'all' || type === 'receivables') {
      const overdueReceivables = await getOverdueReceivables(tenantId);
      if (overdueReceivables.length > 0) {
        updates.hasUpdates = true;
        updates.data.receivables = {
          overdue: overdueReceivables,
          overdueCount: overdueReceivables.length
        };
      }
    }

    if (type === 'all' || type === 'performance') {
      const performanceUpdates = await getPerformanceUpdates(tenantId, since);
      if (Object.keys(performanceUpdates).length > 0) {
        updates.hasUpdates = true;
        updates.data.performance = performanceUpdates;
      }
    }

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Dashboard updates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard updates' },
      { status: 500 }
    );
  }
}

async function getInventoryAlerts(tenantId: string) {
  const products = await prisma.product.findMany({
    where: { tenantId, isActive: true },
    include: {
      company: { select: { name: true } }
    }
  });

  const latestInventory = await prisma.inventoryRecord.findMany({
    where: { tenantId },
    orderBy: { date: 'desc' },
    take: 1
  });

  const currentStock = latestInventory[0];
  if (!currentStock) return [];

  const alerts = products
    .filter(product => currentStock.fullCylinders < product.lowStockThreshold)
    .map(product => ({
      type: 'low_stock',
      productId: product.id,
      productName: product.name,
      companyName: product.company.name,
      currentStock: currentStock.fullCylinders,
      threshold: product.lowStockThreshold,
      severity: currentStock.fullCylinders === 0 ? 'critical' : 'warning',
      message: `${product.company.name} ${product.name} is ${currentStock.fullCylinders === 0 ? 'out of stock' : 'running low'}`
    }));

  return alerts;
}

async function getOverdueReceivables(tenantId: string) {
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - 30);

  const overdueSales = await prisma.sale.findMany({
    where: {
      tenantId,
      isOnCredit: true,
      saleDate: { lt: overdueDate }
    },
    include: {
      driver: { select: { name: true } },
      product: { select: { name: true } }
    },
    orderBy: { saleDate: 'asc' },
    take: 20
  });

  return overdueSales.map(sale => {
    const daysPastDue = Math.floor((new Date().getTime() - sale.saleDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      type: 'overdue_receivable',
      saleId: sale.id,
      driverName: sale.driver.name,
      productName: sale.product.name,
      amount: sale.netValue,
      daysPastDue,
      saleDate: sale.saleDate,
      severity: daysPastDue > 60 ? 'critical' : 'warning',
      message: `${sale.driver.name} has overdue payment of ৳${sale.netValue} (${daysPastDue} days)`
    };
  });
}

async function getPerformanceUpdates(tenantId: string, since: Date) {
  const updates: any = {};

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaySales, monthlyTarget] = await Promise.all([
    prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { gte: todayStart }
      }
    }),
    getTodayTarget(tenantId)
  ]);

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.netValue, 0);
  const targetAchievement = monthlyTarget > 0 ? (todayRevenue / monthlyTarget) * 100 : 0;

  if (targetAchievement >= 100) {
    updates.targetAchieved = {
      type: 'target_achieved',
      message: 'Daily sales target achieved!',
      achievement: targetAchievement,
      revenue: todayRevenue
    };
  } else if (targetAchievement >= 80) {
    updates.nearTarget = {
      type: 'near_target',
      message: 'Close to achieving daily target',
      achievement: targetAchievement,
      revenue: todayRevenue,
      remaining: monthlyTarget - todayRevenue
    };
  }

  const topDriverToday = await getTopDriverToday(tenantId, todayStart);
  if (topDriverToday) {
    updates.topDriver = topDriverToday;
  }

  return updates;
}

async function getTodayTarget(tenantId: string) {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const lastMonthSales = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: { gte: lastMonth, lt: thisMonth }
    }
  });

  const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.netValue, 0);
  const daysInMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate();
  
  return (lastMonthRevenue * 1.1) / daysInMonth;
}

async function getTopDriverToday(tenantId: string, todayStart: Date) {
  const driverSales = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: { gte: todayStart }
    },
    include: {
      driver: { select: { name: true } }
    }
  });

  const driverStats = driverSales.reduce((acc, sale) => {
    const driverId = sale.driverId;
    if (!acc[driverId]) {
      acc[driverId] = {
        name: sale.driver.name,
        sales: 0,
        revenue: 0
      };
    }
    acc[driverId].sales += 1;
    acc[driverId].revenue += sale.netValue;
    return acc;
  }, {} as Record<string, { name: string; sales: number; revenue: number }>);

  const topDriver = Object.entries(driverStats)
    .sort(([,a], [,b]) => b.revenue - a.revenue)[0];

  if (topDriver && topDriver[1].revenue > 0) {
    return {
      type: 'top_performer',
      driverName: topDriver[1].name,
      sales: topDriver[1].sales,
      revenue: topDriver[1].revenue,
      message: `${topDriver[1].name} is today's top performer with ৳${topDriver[1].revenue}`
    };
  }

  return null;
}