import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's inventory record (same source for both APIs)
    const todaysRecord = await prisma.inventoryRecord.findFirst({
      where: {
        tenantId,
        date: today,
        productId: null, // aggregate record
      },
    });

    if (!todaysRecord) {
      return NextResponse.json({ error: 'No inventory record found' });
    }

    const totalEmptyCylinders = todaysRecord.emptyCylinders;

    // Get cylinder receivables breakdown by size (same logic for both APIs)
    const cylinderReceivablesBySize = new Map<string, number>();

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

    const driverIds = activeDriversWithReceivables
      .filter((d) => d.receivableRecords[0]?.totalCylinderReceivables > 0)
      .map((d) => d.id);

    if (driverIds.length > 0) {
      const [allBaselineBreakdowns, allSalesWithCylinders] = await Promise.all([
        prisma.driverCylinderSizeBaseline.findMany({
          where: {
            tenantId,
            driverId: { in: driverIds },
          },
          select: {
            driverId: true,
            baselineQuantity: true,
            cylinderSize: {
              select: {
                size: true,
              },
            },
          },
        }),
        prisma.sale.findMany({
          where: {
            tenantId,
            driverId: { in: driverIds },
            saleType: 'REFILL',
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

      const baselinesByDriver = new Map<string, typeof allBaselineBreakdowns>();
      const salesByDriver = new Map<string, typeof allSalesWithCylinders>();

      allBaselineBreakdowns.forEach((baseline) => {
        if (!baselinesByDriver.has(baseline.driverId)) {
          baselinesByDriver.set(baseline.driverId, []);
        }
        baselinesByDriver.get(baseline.driverId)!.push(baseline);
      });

      allSalesWithCylinders.forEach((sale) => {
        if (!salesByDriver.has(sale.driverId)) {
          salesByDriver.set(sale.driverId, []);
        }
        salesByDriver.get(sale.driverId)!.push(sale);
      });

      for (const driver of activeDriversWithReceivables) {
        const latestRecord = driver.receivableRecords[0];
        if (latestRecord?.totalCylinderReceivables > 0) {
          const baselineBreakdown = baselinesByDriver.get(driver.id) || [];
          const salesWithCylinders = salesByDriver.get(driver.id) || [];

          if (baselineBreakdown.length > 0) {
            const sizeBreakdown: Record<string, number> = {};

            baselineBreakdown.forEach((item) => {
              const size = item.cylinderSize.size;
              sizeBreakdown[size] = item.baselineQuantity;
            });

            salesWithCylinders.forEach((sale) => {
              const size =
                sale.product?.cylinderSize?.size ||
                sale.product?.size ||
                sale.product?.name ||
                'Unknown';
              const receivablesChange =
                (sale.quantity || 0) - (sale.cylindersDeposited || 0);

              sizeBreakdown[size] =
                (sizeBreakdown[size] || 0) + receivablesChange;
            });

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

    // Get all available cylinder sizes
    const cylinderSizes = await prisma.cylinderSize.findMany({
      where: { tenantId, isActive: true },
      orderBy: { size: 'asc' },
    });

    const totalReceivables = Array.from(
      cylinderReceivablesBySize.values()
    ).reduce((sum, val) => sum + val, 0);

    const results: any[] = [];

    cylinderSizes.forEach((cylinderSize) => {
      const size = cylinderSize.size;
      const receivablesForSize = cylinderReceivablesBySize.get(size) || 0;

      let emptyCylindersForSize = 0;
      let calculationMethod = '';

      if (totalReceivables > 0 && receivablesForSize > 0) {
        const proportion = receivablesForSize / totalReceivables;
        const exactCalculation = totalEmptyCylinders * proportion;
        emptyCylindersForSize = Math.floor(exactCalculation);
        calculationMethod = 'proportional';

        results.push({
          size,
          receivablesForSize,
          totalReceivables,
          proportion: Number(proportion.toFixed(4)),
          exactCalculation: Number(exactCalculation.toFixed(2)),
          flooredResult: emptyCylindersForSize,
          calculationMethod,
        });
      } else if (cylinderSizes.length > 0) {
        emptyCylindersForSize = Math.floor(
          totalEmptyCylinders / cylinderSizes.length
        );
        calculationMethod = 'equal_distribution';

        results.push({
          size,
          receivablesForSize: 0,
          totalReceivables,
          equalDistribution: emptyCylindersForSize,
          calculationMethod,
        });
      }
    });

    return NextResponse.json({
      totalEmptyCylinders,
      totalReceivables,
      cylinderReceivablesBySize: Object.fromEntries(cylinderReceivablesBySize),
      cylinderSizes: cylinderSizes.map((c) => c.size),
      calculations: results,
      summary: results.map((r) => ({
        size: r.size,
        emptyCylinders: r.flooredResult || r.equalDistribution,
      })),
    });
  } catch (error) {
    console.error('Debug cylinders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
