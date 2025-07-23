// Daily Sales Summary API
// Groups sales by driver and date for daily summary table

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Get date parameter (defaults to today)
    const date =
      searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log('Daily sales summary query:', {
      tenantId,
      date,
    });

    // Debug: Get all sales for this tenant (no date filter)
    const allSales = await prisma.sale.findMany({
      where: { tenantId },
      select: {
        id: true,
        saleDate: true,
        driver: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
      take: 10,
    });

    console.log(
      'All recent sales for tenant:',
      allSales.map((s) => ({
        id: s.id,
        saleDate: s.saleDate,
        driver: s.driver.name,
        product: s.product.name,
      }))
    );

    // Get all sales for the tenant and filter by date in JavaScript to avoid timezone issues
    const allSalesForTenant = await prisma.sale.findMany({
      where: { tenantId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
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
      orderBy: [{ driver: { name: 'asc' } }, { saleDate: 'desc' }],
    });

    // Filter sales by date in JavaScript to avoid timezone issues
    const sales = allSalesForTenant.filter((sale) => {
      const saleDate = sale.saleDate.toISOString().split('T')[0];
      return saleDate === date;
    });

    console.log(
      'Sales found for date filter:',
      sales.map((s) => ({
        id: s.id,
        saleDate: s.saleDate,
        saleDateString: s.saleDate.toISOString().split('T')[0],
        driver: s.driver.name,
        product: s.product.name,
      }))
    );

    // Group sales by driver and aggregate data
    const groupedSales = sales.reduce(
      (acc, sale) => {
        const key = `${sale.driverId}-${sale.saleDate.toISOString().split('T')[0]}`;

        if (!acc[key]) {
          acc[key] = {
            id: key,
            date: sale.saleDate.toISOString().split('T')[0],
            driverId: sale.driverId,
            driverName: sale.driver.name,
            packageSalesQty: 0,
            refillSalesQty: 0,
            totalSalesValue: 0,
            totalDiscount: 0,
            totalCashDeposited: 0,
            totalCylinderDeposited: 0,
            salesIds: [],
            canEdit: true, // Can edit today's sales
            canDelete: true, // Can delete today's sales
          };
        }

        // Aggregate the data
        if (sale.saleType === 'PACKAGE') {
          acc[key].packageSalesQty += sale.quantity;
        } else if (sale.saleType === 'REFILL') {
          acc[key].refillSalesQty += sale.quantity;
        }

        acc[key].totalSalesValue += sale.totalValue;
        acc[key].totalDiscount += sale.discount;
        acc[key].totalCashDeposited += sale.cashDeposited;
        acc[key].totalCylinderDeposited += sale.cylindersDeposited;
        acc[key].salesIds.push(sale.id);

        return acc;
      },
      {} as Record<string, any>
    );

    // Convert to array and sort by driver name
    const dailySummary = Object.values(groupedSales).sort((a: any, b: any) =>
      a.driverName.localeCompare(b.driverName)
    );

    console.log('Daily sales summary result:', {
      totalGroups: dailySummary.length,
      groups: dailySummary.map((g: any) => ({
        driver: g.driverName,
        packageQty: g.packageSalesQty,
        refillQty: g.refillSalesQty,
        totalValue: g.totalSalesValue,
        salesCount: g.salesIds.length,
      })),
    });

    // Calculate overall summary
    const overallSummary = {
      totalDrivers: dailySummary.length,
      totalPackageSales: dailySummary.reduce(
        (sum: number, item: any) => sum + item.packageSalesQty,
        0
      ),
      totalRefillSales: dailySummary.reduce(
        (sum: number, item: any) => sum + item.refillSalesQty,
        0
      ),
      totalSalesValue: dailySummary.reduce(
        (sum: number, item: any) => sum + item.totalSalesValue,
        0
      ),
      totalDiscount: dailySummary.reduce(
        (sum: number, item: any) => sum + item.totalDiscount,
        0
      ),
      totalCashDeposited: dailySummary.reduce(
        (sum: number, item: any) => sum + item.totalCashDeposited,
        0
      ),
      totalCylinderDeposited: dailySummary.reduce(
        (sum: number, item: any) => sum + item.totalCylinderDeposited,
        0
      ),
      totalSalesEntries: sales.length,
    };

    return NextResponse.json({
      success: true,
      date,
      dailySummary,
      summary: overallSummary,
    });
  } catch (error) {
    console.error('Daily sales summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
