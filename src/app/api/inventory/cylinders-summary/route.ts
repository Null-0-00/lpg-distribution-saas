import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const todayStr = new Date().toISOString().split('T')[0];

    console.log(
      '🔄 Creating FRESH cylinder summary from daily inventory data...'
    );

    // Get today's daily inventory data directly - this is the source of truth
    const baseUrl = request.url.split('/api/')[0];
    const dailyInventoryUrl = `${baseUrl}/api/inventory/daily?startDate=${todayStr}&endDate=${todayStr}&_t=${Date.now()}`;

    const dailyResponse = await fetch(dailyInventoryUrl, {
      headers: {
        Cookie: request.headers.get('Cookie') || '',
        Authorization: request.headers.get('Authorization') || '',
      },
    });

    if (!dailyResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to get daily inventory data: ${dailyResponse.status}`,
          suggestion:
            "Please refresh the inventory page to generate today's data.",
        },
        { status: 500 }
      );
    }

    const dailyData = await dailyResponse.json();
    const todaysRecord = dailyData.dailyInventory?.[0];

    if (!todaysRecord) {
      return NextResponse.json(
        {
          error: 'No daily inventory data available for today',
          suggestion:
            "Please refresh the inventory page to generate today's data.",
        },
        { status: 404 }
      );
    }

    console.log('✅ Got daily inventory record:', {
      date: todaysRecord.date,
      fullCylinders: todaysRecord.fullCylinders,
      emptyCylinders: todaysRecord.emptyCylinders,
      fullSizeBreakdowns: todaysRecord.fullCylindersBySizes?.length || 0,
      emptySizeBreakdowns: todaysRecord.emptyCylindersBySizes?.length || 0,
    });

    // Get cylinder receivables for calculating "empty cylinders in hand"
    const latestReceivableRecords = await prisma.receivableRecord.findMany({
      where: { tenantId },
      select: {
        driverId: true,
        totalCylinderReceivables: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    // Get the latest record per driver
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

    // Get all products for company mapping in full cylinders
    const allProducts = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: {
        company: true,
        cylinderSize: true,
      },
    });

    // Build FULL CYLINDERS data directly from daily inventory size breakdowns
    const fullCylindersData: Array<{
      company: string;
      size: string;
      quantity: number;
    }> = [];

    // Group products by size for company assignment
    const productsBySize = new Map<string, typeof allProducts>();
    allProducts.forEach((product) => {
      const size = product.cylinderSize?.size;
      if (size) {
        if (!productsBySize.has(size)) {
          productsBySize.set(size, []);
        }
        productsBySize.get(size)!.push(product);
      }
    });

    // Create full cylinders breakdown from daily inventory data
    if (
      todaysRecord.fullCylindersBySizes &&
      todaysRecord.fullCylindersBySizes.length > 0
    ) {
      todaysRecord.fullCylindersBySizes.forEach((sizeBreakdown: any) => {
        if (sizeBreakdown.quantity > 0) {
          const productsForSize = productsBySize.get(sizeBreakdown.size) || [];

          if (productsForSize.length > 0) {
            // Use the first company for this size (in real scenario, distribute based on actual data)
            fullCylindersData.push({
              company: productsForSize[0].company.name,
              size: sizeBreakdown.size,
              quantity: sizeBreakdown.quantity,
            });
          } else {
            fullCylindersData.push({
              company: 'Unknown',
              size: sizeBreakdown.size,
              quantity: sizeBreakdown.quantity,
            });
          }
        }
      });
    }

    // Calculate EMPTY CYLINDERS using exact business formula:
    // Today's Empty Cylinders = Yesterday's Empty Cylinders + Refill sales + Empty Cylinders Buy/Sell - Outstanding refill shipment
    const emptyCylindersData: Array<{
      size: string;
      emptyCylinders: number;
      emptyCylindersInHand: number;
    }> = [];

    // Get today's refill sales, empty cylinders buy/sell, and outstanding refill orders from daily inventory
    const todaysRefillSales = todaysRecord.refillSalesQty || 0;
    const todaysEmptyCylindersBuySell = todaysRecord.emptyCylindersBuySell || 0;
    const todaysOutstandingRefillOrders =
      todaysRecord.outstandingRefillOrders || 0;

    // Calculate yesterday's empty cylinders by getting daily inventory for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayDailyUrl = `${baseUrl}/api/inventory/daily?startDate=${yesterdayStr}&endDate=${yesterdayStr}&_t=${Date.now()}`;
    let yesterdaysEmptyCylinders = 0;
    let yesterdaysEmptyCylindersBySizes: any[] = [];

    try {
      const yesterdayResponse = await fetch(yesterdayDailyUrl, {
        headers: {
          Cookie: request.headers.get('Cookie') || '',
          Authorization: request.headers.get('Authorization') || '',
        },
      });

      if (yesterdayResponse.ok) {
        const yesterdayData = await yesterdayResponse.json();
        const yesterdayRecord = yesterdayData.dailyInventory?.[0];
        if (yesterdayRecord) {
          yesterdaysEmptyCylinders = yesterdayRecord.emptyCylinders || 0;
          yesterdaysEmptyCylindersBySizes =
            yesterdayRecord.emptyCylindersBySizes || [];
        }
      }
    } catch (error) {
      console.warn(
        "Could not fetch yesterday's data, using 0 as baseline:",
        error
      );
    }

    console.log('🏗️ Building empty cylinders with EXACT formula:', {
      formula:
        "Today's Empty Cylinders = Yesterday's Empty Cylinders + Refill sales + Empty Cylinders Buy/Sell - Outstanding refill shipment",
      yesterdaysEmptyCylinders,
      todaysRefillSales,
      todaysEmptyCylindersBuySell,
      todaysOutstandingRefillOrders,
      calculation: `${yesterdaysEmptyCylinders} + ${todaysRefillSales} + ${todaysEmptyCylindersBuySell} - ${todaysOutstandingRefillOrders} = ${yesterdaysEmptyCylinders + todaysRefillSales + todaysEmptyCylindersBuySell - todaysOutstandingRefillOrders}`,
    });

    // Get EXACT cylinder receivables breakdown by size (not proportional!)
    const cylinderReceivablesBySize = new Map<string, number>();

    // Get all active retail drivers with their latest receivables records
    const activeDriversWithReceivables = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
      select: {
        id: true,
        name: true,
        receivableRecords: {
          select: {
            date: true,
            totalCylinderReceivables: true,
          },
          take: 1,
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    // Get the exact size breakdown for each driver's receivables
    for (const driver of activeDriversWithReceivables) {
      const latestRecord = driver.receivableRecords[0];
      if (latestRecord?.totalCylinderReceivables > 0) {
        // Get the EXACT baseline breakdown (from permanent table, not proportional)
        const baselineBreakdown =
          await prisma.driverCylinderSizeBaseline.findMany({
            where: {
              tenantId,
              driverId: driver.id,
            },
            select: {
              baselineQuantity: true,
              cylinderSize: {
                select: {
                  size: true,
                },
              },
            },
          });

        if (baselineBreakdown.length > 0) {
          // STEP 1: Start with onboarding baseline breakdown by size
          const sizeBreakdown: Record<string, number> = {};

          // Initialize with onboarding baseline
          baselineBreakdown.forEach((item) => {
            const size = item.cylinderSize.size;
            sizeBreakdown[size] = item.baselineQuantity;
          });

          // STEP 2: Add/subtract sales data by specific cylinder sizes
          const salesWithCylinders = await prisma.sale.findMany({
            where: {
              tenantId,
              driverId: driver.id,
              saleType: 'REFILL',
            },
            select: {
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
          });

          // Apply sales transactions to the baseline
          salesWithCylinders.forEach((sale) => {
            const size =
              sale.product?.cylinderSize?.size ||
              sale.product?.size ||
              sale.product?.name ||
              'Unknown';
            const receivablesChange =
              (sale.quantity || 0) - (sale.cylindersDeposited || 0);

            // Add/subtract from the baseline for this specific size
            sizeBreakdown[size] =
              (sizeBreakdown[size] || 0) + receivablesChange;
          });

          // STEP 3: Use only positive values from the cumulative calculation
          Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
            if (quantity > 0) {
              cylinderReceivablesBySize.set(
                size,
                (cylinderReceivablesBySize.get(size) || 0) + quantity
              );
            }
          });
        } else {
          // Fallback: try to get from actual sales data
          const salesWithCylinders = await prisma.sale.findMany({
            where: {
              tenantId,
              driverId: driver.id,
              saleType: 'REFILL',
            },
            select: {
              quantity: true,
              cylindersDeposited: true,
              product: {
                select: {
                  name: true,
                  size: true,
                },
              },
            },
          });

          salesWithCylinders.forEach((sale) => {
            const size = sale.product?.size || sale.product?.name || 'Unknown';
            const receivables =
              (sale.quantity || 0) - (sale.cylindersDeposited || 0);
            if (receivables > 0) {
              cylinderReceivablesBySize.set(
                size,
                (cylinderReceivablesBySize.get(size) || 0) + receivables
              );
            }
          });
        }
      }
    }

    // Calculate by size using the same formula
    if (
      todaysRecord.emptyCylindersBySizes &&
      todaysRecord.emptyCylindersBySizes.length > 0
    ) {
      todaysRecord.emptyCylindersBySizes.forEach((sizeBreakdown: any) => {
        const size = sizeBreakdown.size;

        // Get yesterday's empty cylinders for this size
        const yesterdayForSize =
          yesterdaysEmptyCylindersBySizes.find((s) => s.size === size)
            ?.quantity || 0;

        // Get today's components for this size
        const refillSalesForSize =
          todaysRecord.refillSalesProducts
            ?.filter((p: any) => p.productSize === size)
            .reduce((sum: number, p: any) => sum + p.quantity, 0) || 0;
        const emptyCylindersBuySellForSize =
          todaysRecord.emptyCylindersBuySellBySizes?.find(
            (s: any) => s.size === size
          )?.quantity || 0;
        const outstandingRefillForSize =
          todaysRecord.outstandingRefillOrdersBySizes?.find(
            (s: any) => s.size === size
          )?.quantity || 0;

        // Apply EXACT formula: Today's Empty Cylinders = Yesterday's Empty Cylinders + Refill sales + Empty Cylinders Buy/Sell - Outstanding refill shipment
        const totalEmptyCylindersForSize = Math.max(
          0,
          yesterdayForSize +
            refillSalesForSize +
            emptyCylindersBuySellForSize -
            outstandingRefillForSize
        );

        // Get EXACT cylinder receivables for this size (not proportional!)
        const totalCylindersReceivableForThisSize =
          cylinderReceivablesBySize.get(size) || 0;

        // Apply formula: Empty cylinders in hand = total empty cylinders for that particular size - total cylinders receivable for that particular size
        const emptyCylindersInHand = Math.max(
          0,
          totalEmptyCylindersForSize - totalCylindersReceivableForThisSize
        );

        console.log(
          `✅ Size ${size} calculation with EXACT size-specific receivables (NO PROPORTIONAL):`,
          {
            yesterdayForSize,
            refillSalesForSize,
            emptyCylindersBuySellForSize,
            outstandingRefillForSize,
            totalEmptyCylindersForSize,
            exactReceivablesForSize: totalCylindersReceivableForThisSize,
            emptyCylindersInHand,
            formula: `${yesterdayForSize} + ${refillSalesForSize} + ${emptyCylindersBuySellForSize} - ${outstandingRefillForSize} = ${totalEmptyCylindersForSize}`,
            inHandFormula: `${totalEmptyCylindersForSize} - ${totalCylindersReceivableForThisSize} = ${emptyCylindersInHand}`,
            source:
              'EXACT baseline + sales changes by SIZE - ZERO proportional distribution',
          }
        );

        emptyCylindersData.push({
          size: size,
          emptyCylinders: totalEmptyCylindersForSize,
          emptyCylindersInHand: emptyCylindersInHand,
        });
      });
    } else {
      // Fallback: create empty entries for all available sizes
      const allCylinderSizes = await prisma.cylinderSize.findMany({
        where: { tenantId, isActive: true },
        orderBy: { size: 'asc' },
      });

      allCylinderSizes.forEach((cylinderSize) => {
        emptyCylindersData.push({
          size: cylinderSize.size,
          emptyCylinders: 0,
          emptyCylindersInHand: 0,
        });
      });
    }

    // Calculate totals from our calculated values
    const fullCylindersTotal = todaysRecord.fullCylinders || 0;
    const emptyCylindersTotal = emptyCylindersData.reduce(
      (sum, item) => sum + item.emptyCylinders,
      0
    );
    const emptyCylindersInHandTotal = emptyCylindersData.reduce(
      (sum, item) => sum + item.emptyCylindersInHand,
      0
    );

    // Also calculate using the aggregate formula for verification
    const aggregateEmptyCalculation =
      yesterdaysEmptyCylinders +
      todaysRefillSales +
      todaysEmptyCylindersBuySell -
      todaysOutstandingRefillOrders;

    console.log(
      '📊 Cylinder summary with EXACT size-specific receivables (NOT proportional):',
      {
        fullCylindersTotal,
        emptyCylindersTotal,
        emptyCylindersInHandTotal,
        totalCylinderReceivables,
        formula:
          "Today's Empty Cylinders = Yesterday's Empty Cylinders + Refill sales + Empty Cylinders Buy/Sell - Outstanding refill shipment",
        receivablesSource:
          'EXACT baseline + sales changes by SIZE - ZERO proportional distribution',
        cylinderReceivablesBySize: Object.fromEntries(
          cylinderReceivablesBySize
        ),
        aggregateCalculation: {
          yesterdaysEmptyCylinders,
          todaysRefillSales,
          todaysEmptyCylindersBuySell,
          todaysOutstandingRefillOrders,
          result: aggregateEmptyCalculation,
        },
        verification: {
          dailyInventoryFull: todaysRecord.fullCylinders,
          dailyInventoryEmpty: todaysRecord.emptyCylinders,
          calculatedEmpty: emptyCylindersTotal,
          aggregateEmpty: aggregateEmptyCalculation,
          fullMatch: fullCylindersTotal === todaysRecord.fullCylinders,
          emptyDifference: emptyCylindersTotal - todaysRecord.emptyCylinders,
        },
      }
    );

    return NextResponse.json({
      success: true,
      fullCylinders: fullCylindersData,
      emptyCylinders: emptyCylindersData,
      totals: {
        fullCylinders: fullCylindersTotal,
        emptyCylinders: emptyCylindersTotal,
        emptyCylindersInHand: emptyCylindersInHandTotal,
      },
      totalCylinderReceivables: totalCylinderReceivables,
      lastUpdated: new Date().toISOString(),
      dataSource:
        'EXACT baseline + sales changes by SIZE - ZERO proportional distribution',
      formula:
        "Today's Empty Cylinders = Yesterday's Empty Cylinders + Refill sales + Empty Cylinders Buy/Sell - Outstanding refill shipment",
      receivablesBreakdown: Object.fromEntries(cylinderReceivablesBySize),
    });
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
