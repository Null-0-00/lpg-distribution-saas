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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const metric = searchParams.get('metric') || 'sales';

    const tenantId = session.user.tenantId;
    const now = new Date();

    // Calculate date range
    let startDate: Date;
    let periods: string[];

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periods = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periods = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        periods = Array.from({ length: 13 }, (_, i) => `W${i + 1}`);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periods = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }

    const trendData: any[] = [];

    if (range === '7d') {
      // Daily data for last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const [salesData, activeDrivers] = await Promise.all([
          prisma.dailySales.aggregate({
            where: {
              tenantId,
              saleDate: {
                gte: date,
                lt: nextDate,
              },
            },
            _count: { id: true },
            _sum: {
              netRevenue: true,
              totalSales: true,
            },
          }),
          prisma.dailySales.findMany({
            where: {
              tenantId,
              saleDate: {
                gte: date,
                lt: nextDate,
              },
            },
            select: { driverId: true },
            distinct: ['driverId'],
          }),
        ]);

        // Calculate efficiency (assuming 10 sales per driver as target)
        const avgSalesPerDriver =
          activeDrivers.length > 0
            ? Number(salesData._count || 0) / activeDrivers.length
            : 0;
        const efficiency = (avgSalesPerDriver / 10) * 100;

        trendData.push({
          period: periods[i],
          sales: salesData._sum?.totalSales || 0,
          revenue: salesData._sum?.netRevenue || 0,
          drivers: activeDrivers.length,
          efficiency: Math.min(efficiency, 100),
        });
      }
    } else if (range === '30d') {
      // Daily data for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const salesData = await prisma.dailySales.aggregate({
          where: {
            tenantId,
            saleDate: {
              gte: date,
              lt: nextDate,
            },
          },
          _count: { id: true },
          _sum: {
            netRevenue: true,
            totalSales: true,
          },
        });

        const activeDrivers = await prisma.dailySales.findMany({
          where: {
            tenantId,
            saleDate: {
              gte: date,
              lt: nextDate,
            },
          },
          select: { driverId: true },
          distinct: ['driverId'],
        });

        const avgSalesPerDriver =
          activeDrivers.length > 0
            ? Number(salesData._count || 0) / activeDrivers.length
            : 0;
        const efficiency = (avgSalesPerDriver / 10) * 100;

        trendData.push({
          period: periods[i],
          sales: salesData._sum?.totalSales || 0,
          revenue: salesData._sum?.netRevenue || 0,
          drivers: activeDrivers.length,
          efficiency: Math.min(efficiency, 100),
        });
      }
    } else {
      // Weekly data for last 90 days (13 weeks)
      for (let i = 0; i < 13; i++) {
        const weekStart = new Date(
          startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000
        );
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const salesData = await prisma.dailySales.aggregate({
          where: {
            tenantId,
            saleDate: {
              gte: weekStart,
              lt: weekEnd,
            },
          },
          _count: { id: true },
          _sum: {
            netRevenue: true,
            totalSales: true,
          },
        });

        const activeDrivers = await prisma.dailySales.findMany({
          where: {
            tenantId,
            saleDate: {
              gte: weekStart,
              lt: weekEnd,
            },
          },
          select: { driverId: true },
          distinct: ['driverId'],
        });

        const avgSalesPerDriver =
          activeDrivers.length > 0
            ? Number(salesData._count || 0) / activeDrivers.length
            : 0;
        const efficiency = (avgSalesPerDriver / 70) * 100; // 70 sales per week target

        trendData.push({
          period: periods[i],
          sales: salesData._sum?.totalSales || 0,
          revenue: salesData._sum?.netRevenue || 0,
          drivers: activeDrivers.length,
          efficiency: Math.min(efficiency, 100),
        });
      }
    }

    // Calculate summary statistics
    const values = trendData.map((d) => d[metric]);
    const summary = {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      trend:
        values.length > 1
          ? values[values.length - 1] > values[0]
            ? 'up'
            : 'down'
          : 'stable',
    };

    return NextResponse.json({
      data: trendData,
      summary,
      metric,
      range,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching trend data:', error);

    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
}
