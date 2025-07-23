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

    const tenantId = session.user.tenantId;

    // Get current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Calculate month boundaries
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    console.log('Performance query date range:', {
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      targetMonth,
      targetYear,
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
        // Current customer receivables for accurate totals
        customerReceivables: {
          where: {
            status: 'CURRENT',
          },
          select: {
            receivableType: true,
            amount: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
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

      // Calculate current customer receivables (same as receivables page)
      const currentCustomerCashTotal = driver.customerReceivables
        .filter((r) => r.receivableType === 'CASH')
        .reduce((sum, r) => sum + r.amount, 0);

      const currentCustomerCylinderTotal = driver.customerReceivables
        .filter((r) => r.receivableType === 'CYLINDER')
        .reduce((sum, r) => sum + r.quantity, 0);

      // If no daily sales data, calculate from individual sales
      let packageSalesCount = dailySalesTotal.packageSales;
      let refillSalesCount = dailySalesTotal.refillSales;

      // Use customer receivables for consistency with receivables page
      let totalCashReceivables = currentCustomerCashTotal;
      let totalCylinderReceivables = currentCustomerCylinderTotal;

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
        // Use current customer receivables for consistency with receivables page
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

    return NextResponse.json({
      success: true,
      data: performanceData,
      summary,
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: monthStart.toLocaleString('default', { month: 'long' }),
        dateRange: `${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`,
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
