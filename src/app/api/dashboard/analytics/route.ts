import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = session.user.tenantId;
    const today = new Date();
    
    // Get last 7 days of sales data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Get sales data for last 7 days
    const weekSalesData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dailySales = await prisma.sale.aggregate({
          where: {
            tenantId,
            saleDate: {
              gte: date,
              lt: nextDay
            }
          },
          _sum: {
            quantity: true,
            netValue: true
          },
          _count: {
            id: true
          }
        });

        return {
          date: date.toISOString().split('T')[0],
          quantity: dailySales._sum.quantity || 0,
          revenue: dailySales._sum.netValue || 0,
          salesCount: dailySales._count.id || 0
        };
      })
    );

    // Get top drivers performance for today
    const topDriversToday = await prisma.sale.groupBy({
      by: ['driverId'],
      where: {
        tenantId,
        saleDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        quantity: true,
        netValue: true
      },
      _count: {
        id: true
      }
    });

    // Get driver details
    const topDriversWithDetails = await Promise.all(
      topDriversToday
        .sort((a, b) => (b._sum.quantity || 0) - (a._sum.quantity || 0))
        .slice(0, 4)
        .map(async (driverData) => {
          const driver = await prisma.driver.findUnique({
            where: { id: driverData.driverId },
            select: { name: true, phone: true }
          });

          const maxSales = Math.max(...topDriversToday.map(d => d._sum.quantity || 0));
          const percentage = maxSales > 0 ? Math.round(((driverData._sum.quantity || 0) / maxSales) * 100) : 0;

          return {
            name: driver?.name || 'Unknown Driver',
            sales: driverData._sum.quantity || 0,
            revenue: driverData._sum.netValue || 0,
            percentage
          };
        })
    );

    // Get recent business alerts
    const [inventoryRecords, receivableRecords, recentSales] = await Promise.all([
      // Check inventory records for low stock
      prisma.inventoryRecord.findMany({
        where: {
          tenantId,
          fullCylinders: { lt: 10 }
        },
        orderBy: { fullCylinders: 'asc' },
        take: 3
      }),

      // Get receivable records with high balances
      prisma.receivableRecord.findMany({
        where: {
          tenantId,
          totalCashReceivables: { gt: 5000 }
        },
        include: {
          driver: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        take: 3
      }),

      // Recent sales for activity feed
      prisma.sale.findMany({
        where: { tenantId },
        include: {
          driver: { select: { name: true } },
          product: { select: { name: true, size: true } }
        },
        orderBy: { saleDate: 'desc' },
        take: 5
      })
    ]);

    // Generate alerts
    const alerts = [
      ...inventoryRecords.map(item => ({
        type: 'low_stock',
        priority: 'high',
        message: `Low stock alert: ${item.fullCylinders} full cylinders remaining`,
        timestamp: new Date().toISOString(),
        category: 'inventory'
      })),
      ...receivableRecords.map(payment => ({
        type: 'payment_overdue',
        priority: 'medium',
        message: `High receivables balance of ৳${payment.totalCashReceivables.toLocaleString()} - ${payment.driver.name}`,
        timestamp: payment.date.toISOString(),
        category: 'finance'
      }))
    ];

    // Add some positive alerts if performance is good
    const topDriver = topDriversWithDetails[0];
    if (topDriver && topDriver.sales >= 15) {
      alerts.unshift({
        type: 'sales_milestone',
        priority: 'low',
        message: `${topDriver.name} completed ${topDriver.sales} sales - daily target achieved!`,
        timestamp: new Date().toISOString(),
        category: 'achievement'
      });
    }

    // Generate recent activity
    const recentActivity = recentSales.map(sale => ({
      type: 'sale',
      message: `${sale.driver.name} sold ${sale.quantity} ${sale.product.name} - ৳${sale.netValue.toLocaleString()}`,
      timestamp: sale.saleDate.toISOString(),
      amount: sale.netValue
    }));

    return NextResponse.json({
      weekSalesData: weekSalesData.map(day => day.quantity),
      topDrivers: topDriversWithDetails,
      alerts: alerts.slice(0, 4), // Limit to 4 most important alerts
      recentActivity: recentActivity.slice(0, 3),
      performanceMetrics: {
        salesTrend: (weekSalesData[6]?.quantity ?? 0) > (weekSalesData[5]?.quantity ?? 0) ? 'up' : 'down',
        totalWeekSales: weekSalesData.reduce((sum, day) => sum + day.quantity, 0),
        avgDailySales: weekSalesData.reduce((sum, day) => sum + day.quantity, 0) / 7
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    );
  }
}