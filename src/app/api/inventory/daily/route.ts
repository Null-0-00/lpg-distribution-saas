// Daily Inventory Tracking API
// Implements exact business formulas for daily inventory calculations
// Data Sources:
// - Package/Refill Sales: Sales table (all drivers)
// - Package/Refill Purchase: Shipments table (COMPLETED status, INCOMING_FULL type)
// - Empty Cylinders Buy/Sell: Shipments table (COMPLETED status, INCOMING_EMPTY - OUTGOING_EMPTY)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface DailyInventoryRecord {
  date: string;
  packageSalesQty: number;
  refillSalesQty: number;
  totalSalesQty: number;
  packagePurchase: number;
  refillPurchase: number;
  emptyCylindersBuySell: number;
  fullCylinders: number;
  emptyCylinders: number;
  totalCylinders: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Get date range - default to last 30 days
    const endDate =
      searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const startDate =
      searchParams.get('startDate') ||
      (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
      })();

    // Generate date range
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    // Calculate daily inventory for each date
    const dailyRecords: DailyInventoryRecord[] = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dateStart = new Date(date);
      const dateEnd = new Date(date);
      dateEnd.setDate(dateEnd.getDate() + 1);

      // 1. Package Sales: Total package sales by all drivers for this date
      const packageSales = await prisma.sale.aggregate({
        where: {
          tenantId,
          saleType: 'PACKAGE',
          saleDate: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      // 2. Refill Sales: Total refill sales by all drivers for this date
      const refillSales = await prisma.sale.aggregate({
        where: {
          tenantId,
          saleType: 'REFILL',
          saleDate: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const packageSalesQty = packageSales._sum.quantity || 0;
      const refillSalesQty = refillSales._sum.quantity || 0;
      const totalSalesQty = packageSalesQty + refillSalesQty;

      // 3. Package Purchase: Total packages purchased from COMPLETED shipments (INCOMING_FULL)
      const packagePurchaseShipments = await prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          shipmentDate: {
            gte: dateStart,
            lt: dateEnd,
          },
          // Package purchases are those without 'REFILL:' in notes
          OR: [{ notes: { not: { contains: 'REFILL:' } } }, { notes: null }],
        },
        _sum: {
          quantity: true,
        },
      });

      // 4. Refill Purchase: Total refills purchased from COMPLETED shipments (INCOMING_FULL with REFILL notes)
      const refillPurchaseShipments = await prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          shipmentDate: {
            gte: dateStart,
            lt: dateEnd,
          },
          notes: {
            contains: 'REFILL:',
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const packagePurchaseQty = packagePurchaseShipments._sum.quantity || 0;
      const refillPurchaseQty = refillPurchaseShipments._sum.quantity || 0;

      // Debug logging for purchases
      console.log(`Daily inventory for ${date}:`, {
        packageSalesQty,
        refillSalesQty,
        packagePurchaseQty,
        refillPurchaseQty,
      });

      // 5. Empty Cylinders Buy/Sell: From COMPLETED shipments (INCOMING_EMPTY - OUTGOING_EMPTY)
      const emptyBuyShipments = await prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'INCOMING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const emptySellShipments = await prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'OUTGOING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const emptyCylindersBuySell =
        (emptyBuyShipments._sum.quantity || 0) -
        (emptySellShipments._sum.quantity || 0);

      // Debug logging for empty cylinder transactions
      console.log(`Empty cylinder transactions for ${date}:`, {
        emptyBuy: emptyBuyShipments._sum.quantity || 0,
        emptySell: emptySellShipments._sum.quantity || 0,
        emptyCylindersBuySell,
      });

      // 6. Calculate Today's Full and Empty Cylinders
      let previousFullCylinders = 0;
      let previousEmptyCylinders = 0;

      if (i > 0) {
        // Get previous day's totals
        const previousRecord = dailyRecords[i - 1];
        previousFullCylinders = previousRecord.fullCylinders;
        previousEmptyCylinders = previousRecord.emptyCylinders;
      } else {
        // For first day, get totals from a week before as baseline
        const weekBeforeStart = new Date(dateStart);
        weekBeforeStart.setDate(weekBeforeStart.getDate() - 7);

        // Get current inventory levels as baseline
        const products = await prisma.product.findMany({
          where: { tenantId, isActive: true },
        });

        // Calculate baseline from current inventory (simplified approach)
        for (const product of products) {
          const movements = await prisma.inventoryMovement.findMany({
            where: {
              tenantId,
              productId: product.id,
              createdAt: {
                lt: dateStart,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          });

          // This is a simplified calculation - in a real system, you'd have daily snapshots
          if (movements.length > 0) {
            const lastMovement = movements[0];
            if (
              lastMovement.type.includes('SALE') ||
              lastMovement.type.includes('PURCHASE')
            ) {
              previousFullCylinders += Math.max(0, 50); // Default baseline
            }
          }
        }
      }

      // Apply business formulas
      const fullCylinders =
        previousFullCylinders +
        packagePurchaseQty +
        refillPurchaseQty -
        totalSalesQty;
      const emptyCylinders =
        previousEmptyCylinders + refillSalesQty + emptyCylindersBuySell;
      const totalCylinders = fullCylinders + emptyCylinders;

      dailyRecords.push({
        date,
        packageSalesQty,
        refillSalesQty,
        totalSalesQty,
        packagePurchase: packagePurchaseQty,
        refillPurchase: refillPurchaseQty,
        emptyCylindersBuySell,
        fullCylinders,
        emptyCylinders,
        totalCylinders,
      });
    }

    // Return records in descending order (newest first)
    return NextResponse.json({
      success: true,
      dailyInventory: dailyRecords.reverse(),
      summary: {
        totalDays: dailyRecords.length,
        currentFullCylinders: dailyRecords[0]?.fullCylinders || 0,
        currentEmptyCylinders: dailyRecords[0]?.emptyCylinders || 0,
        currentTotalCylinders: dailyRecords[0]?.totalCylinders || 0,
      },
    });
  } catch (error) {
    console.error('Daily inventory calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
