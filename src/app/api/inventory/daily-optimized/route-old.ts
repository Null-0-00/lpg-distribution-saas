import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { performanceMonitor } from '@/lib/performance-monitor';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    const cacheKey = `daily_inventory_optimized:${tenantId}:${startDate}:${endDate}`;

    // Check cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      performanceMonitor.logQuery('/api/inventory/daily-optimized', 0, {
        tenantId,
        cacheHit: true,
      });
      console.log('⚡ Returning cached optimized daily inventory');
      return NextResponse.json(cachedResult);
    }

    const startTime = performance.now();
    console.log(
      `🚀 Getting OPTIMIZED daily inventory for ${startDate} to ${endDate}...`
    );

    // Generate date range for query
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    // Use database function to get data for all dates efficiently
    const inventoryPromises = dates.map(async (date) => {
      const result = await prisma.$queryRaw<
        Array<{
          tenant_id: string;
          date: Date;
          package_sales_qty: bigint;
          refill_sales_qty: bigint;
          total_sales_qty: bigint;
          package_purchase_qty: bigint;
          refill_purchase_qty: bigint;
          empty_cylinders_buy_sell: bigint;
          full_cylinders: bigint;
          empty_cylinders: bigint;
          empty_cylinder_receivables: bigint;
          total_cylinders: bigint;
        }>
      >`SELECT * FROM get_daily_inventory_data(${tenantId}::text, ${date}::date)`;

      return result[0]; // Will be undefined if no data exists for that date
    });

    const inventoryResults = await Promise.all(inventoryPromises);

    // Filter out undefined results and transform data
    const dailyInventory = inventoryResults
      .filter(Boolean)
      .map((data, index) => {
        const dateStr = dates[inventoryResults.indexOf(data)];

        return {
          id: `${tenantId}-${dateStr}`,
          tenantId: data.tenant_id,
          productId: null,
          date: dateStr,
          packageSales: Number(data.package_sales_qty),
          refillSales: Number(data.refill_sales_qty),
          totalSales: Number(data.total_sales_qty),
          packagePurchase: Number(data.package_purchase_qty),
          refillPurchase: Number(data.refill_purchase_qty),
          emptyCylindersBuySell: Number(data.empty_cylinders_buy_sell),
          fullCylinders: Number(data.full_cylinders),
          emptyCylinders: Number(data.empty_cylinders),
          emptyCylinderReceivables: Number(data.empty_cylinder_receivables),
          totalCylinders: Number(data.total_cylinders),
          calculatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),

          // Additional calculated fields for compatibility
          packageSalesQty: Number(data.package_sales_qty),
          refillSalesQty: Number(data.refill_sales_qty),
          totalSalesQty: Number(data.total_sales_qty),
          packagePurchaseQty: Number(data.package_purchase_qty),
          refillPurchaseQty: Number(data.refill_purchase_qty),

          // Size breakdowns (would need additional database functions for real implementation)
          fullCylindersBySizes: [],
          emptyCylindersBySizes: [],

          // Additional data for reports
          packageSalesProducts: [],
          refillSalesProducts: [],
          packagePurchaseShipments: [],
          refillPurchaseShipments: [],
          emptyCylindersBuySellBySizes: [],
          outstandingRefillOrders: 0,
          outstandingRefillOrdersBySizes: [],
        };
      });

    // Get aggregated totals - match the expected structure
    const latestDay = dailyInventory[dailyInventory.length - 1] || {
      fullCylinders: 0,
      emptyCylinders: 0,
      totalCylinders: 0,
    };

    const summary = {
      totalDays: dailyInventory.length,
      currentFullCylinders: latestDay.fullCylinders,
      currentEmptyCylinders: latestDay.emptyCylinders,
      currentTotalCylinders: latestDay.totalCylinders,
      totalPackageSales: dailyInventory.reduce(
        (sum, day) => sum + day.packageSales,
        0
      ),
      totalRefillSales: dailyInventory.reduce(
        (sum, day) => sum + day.refillSales,
        0
      ),
      totalSales: dailyInventory.reduce((sum, day) => sum + day.totalSales, 0),
    };

    const endTime = performance.now();
    const responseData = {
      success: true,
      dailyInventory,
      summary,
      dateRange: {
        startDate,
        endDate,
        daysCount: dates.length,
        recordsFound: dailyInventory.length,
      },
      performanceMetrics: {
        queryTime: `${(endTime - startTime).toFixed(2)}ms`,
        cacheHit: false,
        optimization: 'Database functions with batch processing',
        datesQueried: dates.length,
      },
      dataSource: 'DATABASE FUNCTIONS - Ultra-fast batch queries',
      lastUpdated: new Date().toISOString(),
    };

    // Log performance metrics
    performanceMonitor.logQuery(
      '/api/inventory/daily-optimized',
      endTime - startTime,
      {
        tenantId,
        cacheHit: false,
        // dateRange: `${startDate}:${endDate}`, // Removed unknown property
        recordsCount: dailyInventory.length,
        optimization: 'database_functions',
      }
    );

    // Cache the result for 3 minutes (shorter for daily data)
    await cache.set(cacheKey, responseData, 180);

    console.log(
      `🎉 Optimized daily inventory completed in ${(endTime - startTime).toFixed(2)}ms for ${dailyInventory.length} records`
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Optimized daily inventory error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please check database functions are properly installed.',
      },
      { status: 500 }
    );
  }
}
