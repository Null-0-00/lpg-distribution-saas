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
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    // Get recent activities
    const [recentSales, recentExpenses, lowStockItems] = await Promise.all([
      // Recent sales (last hour)
      prisma.dailySales.findMany({
        where: {
          tenantId,
          saleDate: {
            gte: lastHour,
          },
        },
        include: {
          driver: { select: { name: true } },
          product: { select: { name: true, size: true } },
        },
        orderBy: { saleDate: 'desc' },
        take: 10,
      }),

      // Recent expenses (last 24 hours)
      prisma.expense.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Low stock items - for now just return empty array since we need to handle this differently
      Promise.resolve([]),
    ]);

    // Generate live feed items
    const feedItems: any[] = [];

    // Add sales activities
    recentSales.forEach((sale: any) => {
      const timeAgo = Date.now() - sale.saleDate.getTime();

      feedItems.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        message: `${sale.driver.name} sold ${sale.quantity} × ${sale.product.name} (${sale.product.size}L)`,
        value: sale.netValue,
        timestamp: sale.saleDate.toISOString(),
        priority: sale.quantity >= 5 ? 'high' : 'medium',
        driverName: sale.driver.name,
        location: sale.saleLocation || 'Field',
      });
    });

    // Add payment activities (from recent sales)
    recentSales
      .filter((sale: any) => sale.cashDeposited > 0)
      .forEach((sale: any) => {
        feedItems.push({
          id: `payment-${sale.id}`,
          type: 'payment',
          message: `Payment received: ৳${sale.cashDeposited.toLocaleString()}`,
          value: sale.cashDeposited,
          timestamp: sale.saleDate.toISOString(),
          priority: sale.cashDeposited >= 2000 ? 'medium' : 'low',
          driverName: sale.driver.name,
        });
      });

    // Add expense activities
    recentExpenses.forEach((expense: any) => {
      feedItems.push({
        id: `expense-${expense.id}`,
        type: 'alert',
        message: `New expense: ${expense.description} - ৳${expense.amount.toLocaleString()}`,
        value: expense.amount,
        timestamp: expense.createdAt.toISOString(),
        priority:
          expense.amount >= 5000
            ? 'high'
            : expense.status === 'PENDING'
              ? 'medium'
              : 'low',
      });
    });

    // Add stock alerts
    lowStockItems.forEach((item: any) => {
      feedItems.push({
        id: `stock-${item.id}`,
        type: 'stock',
        message: `Low stock alert: ${item.product?.name || 'Product'} - ${item.fullCylinders || 0} remaining`,
        timestamp: new Date().toISOString(),
        priority: (item.fullCylinders || 0) < 5 ? 'high' : 'medium',
      });
    });

    // Add some system alerts based on business logic
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySalesCount = await prisma.dailySales.count({
      where: {
        tenantId,
        saleDate: {
          gte: todayStart,
        },
      },
    });

    // Performance milestone alert
    if (todaySalesCount >= 50) {
      feedItems.push({
        id: `milestone-${Date.now()}`,
        type: 'alert',
        message: `Daily sales milestone reached: ${todaySalesCount} sales completed today!`,
        timestamp: new Date().toISOString(),
        priority: 'low',
      });
    }

    // Driver performance alerts
    const topDriverToday = await prisma.dailySales.groupBy({
      by: ['driverId'],
      where: {
        tenantId,
        saleDate: {
          gte: todayStart,
        },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    if (
      topDriverToday.length > 0 &&
      topDriverToday[0]?._count?.id &&
      topDriverToday[0]._count.id >= 15
    ) {
      const driver = await prisma.driver.findUnique({
        where: { id: topDriverToday[0]?.driverId },
        select: { name: true },
      });

      if (driver) {
        feedItems.push({
          id: `driver-performance-${Date.now()}`,
          type: 'driver',
          message: `${driver.name} achieved daily target with ${topDriverToday[0]?._count.id || 0} sales!`,
          timestamp: new Date().toISOString(),
          priority: 'low',
          driverName: driver.name,
        });
      }
    }

    // Sort by timestamp (newest first) and limit to 20 items
    const sortedFeed = feedItems
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20);

    return NextResponse.json({
      feed: sortedFeed,
      lastUpdated: new Date().toISOString(),
      totalItems: sortedFeed.length,
    });
  } catch (error) {
    console.error('Error fetching live feed:', error);

    return NextResponse.json(
      { error: 'Failed to fetch live feed' },
      { status: 500 }
    );
  }
}
