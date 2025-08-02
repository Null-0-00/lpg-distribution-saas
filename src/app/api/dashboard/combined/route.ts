import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getTranslation } from '@/lib/i18n/translations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    // Get user's language preference - using 'bn' as default since language field doesn't exist in User model
    const userLanguage = 'bn';

    // Get timezone setting from tenant settings
    const tenantSettings = await prisma.tenant.findFirst({
      where: { id: tenantId },
      select: { timezone: true },
    });
    const timezone = tenantSettings?.timezone || 'Asia/Dhaka';

    // Create timezone-aware date boundaries for "today"
    const now = new Date();
    const today = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Convert back to UTC for database queries
    const todayUTC = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    );
    const tomorrowUTC = new Date(
      tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
    );

    // Batch all dashboard data queries
    const [
      todaysSales,
      totalRevenue,
      pendingReceivables,
      lowStockAlerts,
      pendingApprovals,
      monthlyExpenses,
      weekSalesData,
      topDriversData,
      recentActivity,
    ] = await Promise.all([
      // Metrics data - Sum of quantities sold today (refill + package sales)
      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: todayUTC,
            lt: tomorrowUTC,
          },
        },
        _sum: {
          quantity: true,
        },
      }),

      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: todayUTC,
            lt: tomorrowUTC,
          },
        },
        _sum: {
          netValue: true,
        },
      }),

      // Get sum of latest cash receivables from all active retail drivers
      prisma.driver.findMany({
        where: {
          tenantId,
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
        select: {
          id: true,
          receivableRecords: {
            select: {
              totalCashReceivables: true,
              totalCylinderReceivables: true,
            },
            take: 1,
            orderBy: {
              date: 'desc',
            },
          },
        },
      }),

      prisma.inventoryRecord.count({
        where: {
          tenantId,
          fullCylinders: {
            lt: 10,
          },
        },
      }),

      prisma.expense.count({
        where: {
          tenantId,
          isApproved: false,
        },
      }),

      prisma.expense.aggregate({
        where: {
          tenantId,
          isApproved: true,
          expenseDate: {
            gte: new Date(todayUTC.getFullYear(), todayUTC.getMonth(), 1),
            lt: new Date(todayUTC.getFullYear(), todayUTC.getMonth() + 1, 1),
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Analytics data - last 7 days sales
      prisma.sale.groupBy({
        by: ['saleDate'],
        where: {
          tenantId,
          saleDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lte: todayUTC,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          saleDate: 'asc',
        },
      }),

      // Top drivers today
      prisma.sale.groupBy({
        by: ['driverId'],
        where: {
          tenantId,
          saleDate: {
            gte: todayUTC,
            lt: tomorrowUTC,
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          netValue: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 4,
      }),

      // Recent activity - last 10 sales
      prisma.sale.findMany({
        where: { tenantId },
        include: {
          driver: {
            select: { name: true },
          },
          product: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Process top drivers data with single optimized query
    const topDrivers =
      topDriversData.length > 0
        ? await Promise.resolve(topDriversData).then(async (results) => {
            const driverIds = results.map((r) => r.driverId);
            const drivers = await prisma.driver.findMany({
              where: { id: { in: driverIds }, tenantId },
              select: { id: true, name: true },
            });

            const maxSales = results[0]?._count.id || 1;
            return results.map((driverSales) => {
              const driverInfo = drivers.find(
                (d) => d.id === driverSales.driverId
              );
              return {
                name: driverInfo?.name || 'Unknown Driver',
                sales: driverSales._count.id,
                revenue: driverSales._sum.netValue || 0,
                percentage: Math.round(
                  (driverSales._count.id / maxSales) * 100
                ),
              };
            });
          })
        : [];

    // Process week sales data (fill missing days with 0)
    const weekSales = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);

      const dayData = weekSalesData.find((d) => {
        const saleDate = new Date(d.saleDate);
        const saleDateInTimezone = new Date(
          saleDate.toLocaleString('en-US', { timeZone: timezone })
        );
        return saleDateInTimezone.toDateString() === date.toDateString();
      });

      return dayData?._count.id || 0;
    });

    // Process recent activity
    const processedActivity = recentActivity.map((sale) => ({
      type: 'sale',
      message: `${sale.driver?.name || getTranslation(userLanguage, 'unknownDriver')} ${getTranslation(userLanguage, 'completedSale')}`,
      timestamp: sale.createdAt.toISOString(),
      amount: sale.netValue,
    }));

    // Combined response
    const dashboardData = {
      metrics: {
        todaySales: todaysSales._sum.quantity || 0,
        totalRevenue: totalRevenue._sum.netValue || 0,
        pendingReceivables: pendingReceivables
          ? pendingReceivables
              .filter((driver) => driver.receivableRecords.length > 0)
              .reduce(
                (sum, driver) =>
                  sum + driver.receivableRecords[0].totalCashReceivables,
                0
              )
          : 0,
        lowStockAlerts,
        pendingApprovals,
        monthlyExpenses: monthlyExpenses._sum.amount || 0,
      },
      analytics: {
        weekSalesData: weekSales,
        topDrivers,
        alerts: [], // Can be populated with system alerts
        recentActivity: processedActivity,
        performanceMetrics: {
          salesTrend: (weekSales[6] ?? 0) > (weekSales[5] ?? 0) ? 'up' : 'down',
          totalWeekSales: weekSales.reduce((sum, sales) => sum + sales, 0),
          avgDailySales: weekSales.reduce((sum, sales) => sum + sales, 0) / 7,
        },
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching combined dashboard data:', error);

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
