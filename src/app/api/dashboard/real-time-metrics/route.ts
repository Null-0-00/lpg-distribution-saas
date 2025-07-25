import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate sales velocity (sales per hour)
    const [currentHourSales, previousHourSales] = await Promise.all([
      prisma.dailySales.count({
        where: {
          tenantId,
          saleDate: {
            gte: oneHourAgo,
            lte: now,
          },
        },
      }),
      prisma.dailySales.count({
        where: {
          tenantId,
          saleDate: {
            gte: twoHoursAgo,
            lt: oneHourAgo,
          },
        },
      }),
    ]);

    const salesVelocityChange = currentHourSales - previousHourSales;
    const salesVelocityPercent =
      previousHourSales > 0
        ? (salesVelocityChange / previousHourSales) * 100
        : 0;

    // Calculate revenue rate (revenue per hour)
    const [currentHourRevenue, previousHourRevenue] = await Promise.all([
      prisma.dailySales.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: oneHourAgo,
            lte: now,
          },
        },
        _sum: {
          totalRevenue: true,
        },
      }),
      prisma.dailySales.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: twoHoursAgo,
            lt: oneHourAgo,
          },
        },
        _sum: {
          totalRevenue: true,
        },
      }),
    ]);

    const currentRevenue = currentHourRevenue._sum?.totalRevenue || 0;
    const previousRevenue = previousHourRevenue._sum?.totalRevenue || 0;
    const revenueChange = currentRevenue - previousRevenue;
    const revenuePercent =
      previousRevenue > 0 ? (revenueChange / previousRevenue) * 100 : 0;

    // Calculate driver efficiency (today vs yesterday)
    const [todayDriverStats, yesterdayDriverStats] = await Promise.all([
      prisma.dailySales.groupBy({
        by: ['driverId'],
        where: {
          tenantId,
          saleDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
        _count: {
          id: true,
        },
      }),
      prisma.dailySales.groupBy({
        by: ['driverId'],
        where: {
          tenantId,
          saleDate: {
            gte: new Date(
              yesterday.getFullYear(),
              yesterday.getMonth(),
              yesterday.getDate()
            ),
            lt: new Date(
              yesterday.getFullYear(),
              yesterday.getMonth(),
              yesterday.getDate() + 1
            ),
          },
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const todayAvgSales =
      todayDriverStats.length > 0
        ? todayDriverStats.reduce(
            (sum, driver) => sum + (driver._count?.id || 0),
            0
          ) / todayDriverStats.length
        : 0;

    const yesterdayAvgSales =
      yesterdayDriverStats.length > 0
        ? yesterdayDriverStats.reduce(
            (sum, driver) => sum + (driver._count?.id || 0),
            0
          ) / yesterdayDriverStats.length
        : 0;

    // Assume target is 10 sales per driver per day
    const targetSales = 10;
    const todayEfficiency = (todayAvgSales / targetSales) * 100;
    const yesterdayEfficiency = (yesterdayAvgSales / targetSales) * 100;
    const efficiencyChange = todayEfficiency - yesterdayEfficiency;
    const efficiencyPercent =
      yesterdayEfficiency > 0
        ? (efficiencyChange / yesterdayEfficiency) * 100
        : 0;

    // Calculate stock turnover (this week vs last week)
    const [thisWeekSales, lastWeekSales] = await Promise.all([
      prisma.dailySales.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - now.getDay()
            ),
            lte: now,
          },
        },
        _sum: {
          totalSales: true,
        },
      }),
      prisma.dailySales.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: lastWeek,
            lt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - now.getDay()
            ),
          },
        },
        _sum: {
          totalSales: true,
        },
      }),
    ]);

    // Get average inventory to calculate turnover
    const avgInventory = await prisma.inventoryRecord.aggregate({
      where: { tenantId },
      _avg: {
        fullCylinders: true,
      },
    });

    const avgStock = avgInventory._avg.fullCylinders || 100;
    const thisWeekTurnover = thisWeekSales._sum?.totalSales
      ? thisWeekSales._sum.totalSales / avgStock
      : 0;
    const lastWeekTurnover = lastWeekSales._sum?.totalSales
      ? lastWeekSales._sum.totalSales / avgStock
      : 0;

    const turnoverChange = thisWeekTurnover - lastWeekTurnover;
    const turnoverPercent =
      lastWeekTurnover > 0 ? (turnoverChange / lastWeekTurnover) * 100 : 0;

    // Determine trends
    const getTrend = (current: number, previous: number) => {
      if (Math.abs(current - previous) < 0.1) return 'stable';
      return current > previous ? 'up' : 'down';
    };

    const metrics = {
      salesVelocity: {
        current: currentHourSales,
        previous: previousHourSales,
        trend: getTrend(currentHourSales, previousHourSales),
        change: salesVelocityChange,
        changePercent: salesVelocityPercent,
      },
      revenueRate: {
        current: currentRevenue,
        previous: previousRevenue,
        trend: getTrend(currentRevenue, previousRevenue),
        change: revenueChange,
        changePercent: revenuePercent,
      },
      driverEfficiency: {
        current: todayEfficiency,
        previous: yesterdayEfficiency,
        trend: getTrend(todayEfficiency, yesterdayEfficiency),
        change: efficiencyChange,
        changePercent: efficiencyPercent,
      },
      stockTurnover: {
        current: thisWeekTurnover,
        previous: lastWeekTurnover,
        trend: getTrend(thisWeekTurnover, lastWeekTurnover),
        change: turnoverChange,
        changePercent: turnoverPercent,
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);

    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    );
  }
}
