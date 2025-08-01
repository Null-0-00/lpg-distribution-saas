import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { performanceMonitor } from '@/lib/performance-monitor';
import { InventoryCalculator } from '@/lib/business';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `cylinders_summary:${tenantId}:${todayStr}`;

    // Check cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      performanceMonitor.logQuery('/api/inventory/cylinders-summary', 0, {
        tenantId,
        cacheHit: true,
      });
      console.log('⚡ Returning cached cylinder summary');
      return NextResponse.json(cachedResult);
    }

    const startTime = performance.now();
    console.log(
      '🔄 Creating REAL-TIME cylinder summary using live calculations...'
    );

    // Get products for real-time inventory calculation
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: {
        company: true,
        cylinderSize: true,
      },
    });

    // Initialize inventory calculator for real-time data
    const inventoryCalculator = new InventoryCalculator(prisma);

    // Define today's date for receivables calculation
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    console.log(
      `📊 Calculating real-time inventory for ${products.length} products`
    );

    // Calculate real-time inventory levels for each product
    const productInventoryData = await Promise.all(
      products.map(async (product) => {
        try {
          const currentLevels =
            await inventoryCalculator.getCurrentInventoryLevels(
              tenantId,
              product.id
            );

          return {
            product,
            fullCylinders: currentLevels.fullCylinders,
            emptyCylinders: currentLevels.emptyCylinders,
            totalCylinders: currentLevels.totalCylinders,
          };
        } catch (error) {
          console.error(
            `Error calculating inventory for product ${product.id}:`,
            error
          );
          // Return zero values if calculation fails
          return {
            product,
            fullCylinders: 0,
            emptyCylinders: 0,
            totalCylinders: 0,
          };
        }
      })
    );

    console.log(
      `✅ Successfully calculated inventory for ${productInventoryData.length} products`
    );

    // Get receivables
    const latestReceivableRecords = await prisma.receivableRecord.findMany({
      where: { tenantId },
      select: {
        driverId: true,
        totalCylinderReceivables: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    // Calculate cylinder totals by company-size combinations using REAL-TIME data
    const fullCylindersByCompanySize = new Map<
      string,
      { company: string; size: string; quantity: number }
    >();
    const emptyCylindersBySize = new Map<
      string,
      { size: string; quantity: number }
    >();
    let totalFullCylinders = 0;
    let totalEmptyCylinders = 0;

    productInventoryData.forEach(
      ({ product, fullCylinders, emptyCylinders }) => {
        if (product.cylinderSize) {
          const size = product.cylinderSize.size;
          const companyName = product.company.name;

          totalFullCylinders += fullCylinders;
          totalEmptyCylinders += emptyCylinders;

          // Add full cylinders by company-size combination (include zero values for completeness)
          const key = `${companyName}-${size}`;
          const existing = fullCylindersByCompanySize.get(key);
          fullCylindersByCompanySize.set(key, {
            company: companyName,
            size,
            quantity: (existing?.quantity || 0) + fullCylinders,
          });

          // Add empty cylinders by size (include zero values for completeness)
          const existing2 = emptyCylindersBySize.get(size);
          emptyCylindersBySize.set(size, {
            size,
            quantity: (existing2?.quantity || 0) + emptyCylinders,
          });
        }
      }
    );

    // Format full cylinders data - now shows all company-size combinations
    const fullCylindersData = Array.from(fullCylindersByCompanySize.values());

    console.log('📊 REAL-TIME full cylinders calculation details:', {
      totalProducts: products.length,
      totalProductInventoryData: productInventoryData.length,
      fullCylindersByCompanySize: Array.from(
        fullCylindersByCompanySize.entries()
      ),
      totalFullCylinders,
      fullCylindersData,
      calculationMethod:
        'Real-time using InventoryCalculator.getCurrentInventoryLevels()',
    });

    // Format empty cylinders data
    const emptyCylindersData = Array.from(emptyCylindersBySize.values()).map(
      (item) => ({
        size: item.size,
        emptyCylinders: item.quantity,
        emptyCylindersInHand: item.quantity,
      })
    );

    // Calculate total receivables and breakdown by size
    const latestReceivablesByDriver = new Map<string, number>();
    latestReceivableRecords.forEach((record) => {
      if (!latestReceivablesByDriver.has(record.driverId)) {
        latestReceivablesByDriver.set(
          record.driverId,
          record.totalCylinderReceivables
        );
      }
    });

    const totalCylinderReceivables = Array.from(
      latestReceivablesByDriver.values()
    ).reduce((sum, amount) => sum + amount, 0);

    // Calculate receivables breakdown by size using the same approach as daily inventory
    const cylinderReceivablesBySize = new Map<string, number>();

    // Get all active retail drivers with receivables
    const activeDriversWithReceivables = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
      select: {
        id: true,
        receivableRecords: {
          select: {
            totalCylinderReceivables: true,
          },
          take: 1,
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    // Filter drivers with receivables and get their baseline data
    const driverIds = activeDriversWithReceivables
      .filter((d) => d.receivableRecords[0]?.totalCylinderReceivables > 0)
      .map((d) => d.id);

    if (driverIds.length > 0) {
      // Get baseline data and refill sales to calculate size breakdown
      const [allBaselineBreakdowns, allSalesWithCylinders] = await Promise.all([
        prisma.driverCylinderSizeBaseline.findMany({
          where: {
            tenantId,
            driverId: { in: driverIds },
          },
          include: {
            cylinderSize: true,
          },
        }),
        prisma.sale.findMany({
          where: {
            tenantId,
            driverId: { in: driverIds },
            saleType: 'REFILL',
            saleDate: { lte: today },
          },
          select: {
            driverId: true,
            quantity: true,
            cylindersDeposited: true,
            product: {
              select: {
                name: true,
                size: true,
                cylinderSize: {
                  select: {
                    size: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      // Calculate receivables by size for each driver
      for (const driver of activeDriversWithReceivables) {
        if (driver.receivableRecords[0]?.totalCylinderReceivables > 0) {
          const driverBaselines = allBaselineBreakdowns.filter(
            (b) => b.driverId === driver.id
          );
          const driverSales = allSalesWithCylinders.filter(
            (s) => s.driverId === driver.id
          );

          const totalReceivables =
            driver.receivableRecords[0].totalCylinderReceivables;
          const totalBaseline = driverBaselines.reduce(
            (sum, b) => sum + b.baselineQuantity,
            0
          );

          if (driverBaselines.length > 0) {
            // EXACT calculation: Start with onboarding baseline breakdown by size
            const sizeBreakdown: Record<string, number> = {};

            // Initialize with onboarding baseline
            driverBaselines.forEach((item) => {
              const size = item.cylinderSize.size;
              sizeBreakdown[size] = item.baselineQuantity;
            });

            // Add/subtract sales data by specific cylinder sizes
            driverSales.forEach((sale) => {
              const size =
                sale.product?.cylinderSize?.size ||
                sale.product?.size ||
                'Unknown';
              const receivablesChange =
                (sale.quantity || 0) - (sale.cylindersDeposited || 0);

              sizeBreakdown[size] =
                (sizeBreakdown[size] || 0) + receivablesChange;
            });

            // Use only positive values from the cumulative calculation
            Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
              if (quantity > 0) {
                cylinderReceivablesBySize.set(
                  size,
                  (cylinderReceivablesBySize.get(size) || 0) + quantity
                );
              }
            });
          }
        }
      }
    }

    // Create receivables breakdown object
    const receivablesBreakdown = Object.fromEntries(cylinderReceivablesBySize);

    console.log('📊 Receivables breakdown calculated:', {
      totalCylinderReceivables,
      receivablesBreakdown,
      driverIdsWithReceivables: driverIds.length,
    });

    const endTime = performance.now();
    const responseData = {
      success: true,
      fullCylinders: fullCylindersData,
      emptyCylinders: emptyCylindersData,
      totals: {
        fullCylinders: totalFullCylinders,
        emptyCylinders: totalEmptyCylinders,
        emptyCylindersInHand: totalEmptyCylinders,
      },
      totalCylinderReceivables,
      receivablesBreakdown,
      lastUpdated: new Date().toISOString(),
      dataSource:
        'REAL-TIME calculation using InventoryCalculator.getCurrentInventoryLevels() with live business logic',
      performanceMetrics: {
        queryTime: `${(endTime - startTime).toFixed(2)}ms`,
        cacheHit: false,
      },
    };

    // Log performance metrics
    performanceMonitor.logQuery(
      '/api/inventory/cylinders-summary',
      endTime - startTime,
      {
        tenantId,
        cacheHit: false,
      }
    );

    // Cache the result for 2 minutes
    await cache.set(cacheKey, responseData, 120);

    console.log(
      `🎉 REAL-TIME cylinder summary completed in ${(endTime - startTime).toFixed(2)}ms with live data`
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Cylinder summary error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
