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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const driverType = searchParams.get('driverType') || 'RETAIL'; // Default to retail drivers

    const tenantId = session.user.tenantId;

    // Get current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Calculate month boundaries
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    console.log('Daily sales query:', {
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      targetMonth,
      targetYear,
      driverType,
    });

    // Get daily sales data - try from DailySales table first
    const dailySalesRecords = await prisma.dailySales.findMany({
      where: {
        tenantId,
        saleDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        driver: {
          driverType: driverType as 'RETAIL' | 'SHIPMENT',
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            route: true,
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
      orderBy: [{ saleDate: 'desc' }, { driver: { name: 'asc' } }],
    });

    // If no daily sales records, aggregate from individual sales
    let dailySalesData = [];

    if (dailySalesRecords.length === 0) {
      console.log(
        'No daily sales records found, aggregating from individual sales...'
      );

      // Get individual sales and aggregate by driver and date
      const individualSales = await prisma.sale.findMany({
        where: {
          tenantId,
          saleDate: {
            gte: monthStart,
            lte: monthEnd,
          },
          driver: {
            driverType: driverType as 'RETAIL' | 'SHIPMENT',
          },
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              route: true,
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
        orderBy: [{ saleDate: 'desc' }, { driver: { name: 'asc' } }],
      });

      // Group sales by driver and date
      const salesByDriverAndDate = new Map<
        string,
        {
          date: Date;
          driver: any;
          packageSales: number;
          refillSales: number;
          totalSales: number;
          packageRevenue: number;
          refillRevenue: number;
          totalRevenue: number;
          cashDeposits: number;
          cylinderDeposits: number;
          netRevenue: number;
        }
      >();

      individualSales.forEach((sale) => {
        const dateKey = `${sale.driverId}-${sale.saleDate.toISOString().split('T')[0]}`;

        if (!salesByDriverAndDate.has(dateKey)) {
          salesByDriverAndDate.set(dateKey, {
            date: sale.saleDate,
            driver: sale.driver,
            packageSales: 0,
            refillSales: 0,
            totalSales: 0,
            packageRevenue: 0,
            refillRevenue: 0,
            totalRevenue: 0,
            cashDeposits: 0,
            cylinderDeposits: 0,
            netRevenue: 0,
          });
        }

        const record = salesByDriverAndDate.get(dateKey)!;

        if (sale.saleType === 'PACKAGE') {
          record.packageSales += sale.quantity;
          record.packageRevenue += sale.totalValue;
        } else if (sale.saleType === 'REFILL') {
          record.refillSales += sale.quantity;
          record.refillRevenue += sale.totalValue;
        }

        record.totalSales += sale.quantity;
        record.totalRevenue += sale.totalValue;
        record.cashDeposits += sale.cashDeposited;
        record.cylinderDeposits += sale.cylindersDeposited;
        record.netRevenue += sale.netValue;
      });

      // Convert map to array
      dailySalesData = Array.from(salesByDriverAndDate.values()).map(
        (record) => ({
          id: `${record.driver.id}-${record.date.toISOString().split('T')[0]}`,
          saleDate: record.date,
          driver: record.driver,
          product: null, // Aggregated across all products
          packageSales: record.packageSales,
          refillSales: record.refillSales,
          totalSales: record.totalSales,
          packageRevenue: record.packageRevenue,
          refillRevenue: record.refillRevenue,
          totalRevenue: record.totalRevenue,
          cashDeposits: record.cashDeposits,
          cylinderDeposits: record.cylinderDeposits,
          netRevenue: record.netRevenue,
        })
      );
    } else {
      // Use daily sales records
      dailySalesData = dailySalesRecords.map((record) => ({
        id: record.id,
        saleDate: record.saleDate,
        driver: record.driver,
        product: record.product,
        packageSales: record.packageSales,
        refillSales: record.refillSales,
        totalSales: record.totalSales,
        packageRevenue: record.packageRevenue,
        refillRevenue: record.refillRevenue,
        totalRevenue: record.totalRevenue,
        cashDeposits: record.cashDeposits,
        cylinderDeposits: record.cylinderDeposits,
        netRevenue: record.netRevenue,
      }));
    }

    // Calculate summary statistics
    const summary = {
      totalRecords: dailySalesData.length,
      totalPackageSales: dailySalesData.reduce(
        (sum, record) => sum + record.packageSales,
        0
      ),
      totalRefillSales: dailySalesData.reduce(
        (sum, record) => sum + record.refillSales,
        0
      ),
      totalSales: dailySalesData.reduce(
        (sum, record) => sum + record.totalSales,
        0
      ),
      totalRevenue: dailySalesData.reduce(
        (sum, record) => sum + record.totalRevenue,
        0
      ),
      totalCashDeposits: dailySalesData.reduce(
        (sum, record) => sum + record.cashDeposits,
        0
      ),
      totalCylinderDeposits: dailySalesData.reduce(
        (sum, record) => sum + record.cylinderDeposits,
        0
      ),
      totalNetRevenue: dailySalesData.reduce(
        (sum, record) => sum + record.netRevenue,
        0
      ),
      uniqueDrivers: new Set(dailySalesData.map((record) => record.driver.id))
        .size,
      dateRange: {
        start: monthStart,
        end: monthEnd,
      },
    };

    return NextResponse.json({
      success: true,
      data: dailySalesData,
      summary,
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: monthStart.toLocaleString('default', { month: 'long' }),
        dateRange: `${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`,
        driverType,
      },
    });
  } catch (error) {
    console.error('Daily sales fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
