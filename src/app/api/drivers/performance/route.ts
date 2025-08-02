import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const tenantId = session.user.tenantId;

    // Get current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Check cache first
    const cacheKey = `drivers_performance:${tenantId}:${targetYear}-${targetMonth}`;
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
        },
      });
    }

    // Calculate month boundaries
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    console.log('Performance query date range:', {
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      targetMonth,
      targetYear,
      tenantId,
    });

    // Get all drivers with their performance data
    const drivers = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        // Sales data for this month
        sales: {
          where: {
            saleDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          select: {
            saleType: true,
            quantity: true,
            totalValue: true,
            netValue: true,
            cashDeposited: true,
            cylindersDeposited: true,
            isOnCredit: true,
            isCylinderCredit: true,
          },
        },
        // Daily sales aggregated data for this month
        dailySales: {
          where: {
            saleDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          select: {
            packageSales: true,
            refillSales: true,
            totalSales: true,
            packageRevenue: true,
            refillRevenue: true,
            totalRevenue: true,
            cashDeposits: true,
            cylinderDeposits: true,
            netRevenue: true,
          },
        },
        // Current receivables (latest record regardless of month)
        receivableRecords: {
          select: {
            totalCashReceivables: true,
            totalCylinderReceivables: true,
            date: true,
          },
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('Found drivers:', drivers.length);
    drivers.forEach((driver) => {
      console.log(`Driver ${driver.name}:`, {
        id: driver.id,
        receivableRecordsCount: driver.receivableRecords.length,
        receivableRecords: driver.receivableRecords,
      });
    });

    // Process the data to calculate performance metrics
    const performanceData = drivers.map((driver) => {
      // Calculate totals from daily sales (more accurate than individual sales)
      const dailySalesTotal = driver.dailySales.reduce(
        (acc, daily) => ({
          packageSales: acc.packageSales + daily.packageSales,
          refillSales: acc.refillSales + daily.refillSales,
          totalSales: acc.totalSales + daily.totalSales,
          packageRevenue: acc.packageRevenue + daily.packageRevenue,
          refillRevenue: acc.refillRevenue + daily.refillRevenue,
          totalRevenue: acc.totalRevenue + daily.totalRevenue,
          cashDeposits: acc.cashDeposits + daily.cashDeposits,
          cylinderDeposits: acc.cylinderDeposits + daily.cylinderDeposits,
          netRevenue: acc.netRevenue + daily.netRevenue,
        }),
        {
          packageSales: 0,
          refillSales: 0,
          totalSales: 0,
          packageRevenue: 0,
          refillRevenue: 0,
          totalRevenue: 0,
          cashDeposits: 0,
          cylinderDeposits: 0,
          netRevenue: 0,
        }
      );

      // Get current receivables from latest receivable record (same as receivables page)
      const latestReceivableRecord = driver.receivableRecords[0];
      const currentCashTotal =
        latestReceivableRecord?.totalCashReceivables || 0;
      const currentCylinderTotal =
        latestReceivableRecord?.totalCylinderReceivables || 0;

      // Debug logging for receivables data
      if (
        process.env.NODE_ENV === 'development' &&
        driver.receivableRecords.length > 0
      ) {
        console.log(`Driver ${driver.name} receivables:`, {
          recordsCount: driver.receivableRecords.length,
          latestRecord: latestReceivableRecord,
          currentCashTotal,
          currentCylinderTotal,
        });
      }

      // If no daily sales data, calculate from individual sales
      let packageSalesCount = dailySalesTotal.packageSales;
      let refillSalesCount = dailySalesTotal.refillSales;

      // Use latest receivable records for consistency with receivables page
      const totalCashReceivables = currentCashTotal;
      const totalCylinderReceivables = currentCylinderTotal;

      // If no daily sales aggregated data, calculate from individual sales
      if (dailySalesTotal.totalSales === 0 && driver.sales.length > 0) {
        packageSalesCount = driver.sales
          .filter((sale) => sale.saleType === 'PACKAGE')
          .reduce((sum, sale) => sum + sale.quantity, 0);
        refillSalesCount = driver.sales
          .filter((sale) => sale.saleType === 'REFILL')
          .reduce((sum, sale) => sum + sale.quantity, 0);

        // Calculate revenue from individual sales
        dailySalesTotal.totalRevenue = driver.sales.reduce(
          (sum, sale) => sum + sale.totalValue,
          0
        );
        dailySalesTotal.netRevenue = driver.sales.reduce(
          (sum, sale) => sum + sale.netValue,
          0
        );
      }

      return {
        id: driver.id,
        name: driver.name,
        area: driver.route || 'N/A',
        totalRefillSales: refillSalesCount,
        totalPackageSales: packageSalesCount,
        // Use latest receivable records for consistency with receivables page
        totalCashReceivables: Math.max(0, totalCashReceivables),
        totalCylinderReceivables: Math.max(0, totalCylinderReceivables),
        status: driver.status,
        phone: driver.phone,
        email: driver.email,
        driverType: driver.driverType,
        // Additional metrics for context
        totalRevenue: dailySalesTotal.totalRevenue,
        totalSales: packageSalesCount + refillSalesCount,
        netRevenue: dailySalesTotal.netRevenue,
        cashDeposits: dailySalesTotal.cashDeposits,
        cylinderDeposits: dailySalesTotal.cylinderDeposits,
      };
    });

    // Calculate summary statistics
    const summary = {
      totalDrivers: performanceData.length,
      totalPackageSales: performanceData.reduce(
        (sum, d) => sum + d.totalPackageSales,
        0
      ),
      totalRefillSales: performanceData.reduce(
        (sum, d) => sum + d.totalRefillSales,
        0
      ),
      totalCashReceivables: performanceData.reduce(
        (sum, d) => sum + d.totalCashReceivables,
        0
      ),
      totalCylinderReceivables: performanceData.reduce(
        (sum, d) => sum + d.totalCylinderReceivables,
        0
      ),
      totalRevenue: performanceData.reduce((sum, d) => sum + d.totalRevenue, 0),
      averagePackageSales:
        performanceData.length > 0
          ? performanceData.reduce((sum, d) => sum + d.totalPackageSales, 0) /
            performanceData.length
          : 0,
      averageRefillSales:
        performanceData.length > 0
          ? performanceData.reduce((sum, d) => sum + d.totalRefillSales, 0) /
            performanceData.length
          : 0,
    };

    const responseData = {
      success: true,
      data: performanceData,
      summary,
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: monthStart.toLocaleString('default', { month: 'long' }),
        dateRange: `${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`,
      },
    };

    // Cache the result for 5 minutes (performance data doesn't change often)
    await cache.set(cacheKey, responseData, 300);

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Driver performance fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
