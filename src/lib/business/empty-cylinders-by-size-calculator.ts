// Empty Cylinders by Size Calculator using exact business formula
// Formula: Today's Empty Cylinders (Size) = Yesterday's Empty (Size) + Refill Sales (Size) + Empty Buy/Sell (Size)

import { prisma } from '@/lib/prisma';

export interface EmptyCylinderBySize {
  size: string;
  cylinderSizeId: string;
  yesterdayEmpty: number;
  refillSales: number;
  emptyBuySell: number;
  todayEmpty: number;
  formula: string;
}

/**
 * Calculate empty cylinders by size using exact business formula
 * Formula: Today's Empty = Yesterday's Empty + Refill Sales + Empty Buy/Sell
 */
export async function calculateEmptyCylindersBySize(
  tenantId: string,
  asOfDate: Date = new Date()
): Promise<EmptyCylinderBySize[]> {
  // Set up dates
  const today = new Date(asOfDate);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get all active cylinder sizes
  const cylinderSizes = await prisma.cylinderSize.findMany({
    where: { tenantId, isActive: true },
    orderBy: { size: 'asc' },
  });

  const results: EmptyCylinderBySize[] = [];

  for (const cylinderSize of cylinderSizes) {
    const size = cylinderSize.size;
    const cylinderSizeId = cylinderSize.id;

    // 1. Get Yesterday's Empty Cylinders for this size
    const yesterdayEmpty = await getYesterdayEmptyCylinders(
      tenantId,
      cylinderSizeId,
      yesterday
    );

    // 2. Get Refill Sales for this size (today)
    const refillSales = await getRefillSalesBySize(
      tenantId,
      cylinderSizeId,
      today
    );

    // 3. Get Empty Cylinder Buy/Sell for this size (today)
    const emptyBuySell = await getEmptyBuySellBySize(
      tenantId,
      cylinderSizeId,
      today
    );

    // 4. Apply the formula
    const todayEmpty = yesterdayEmpty + refillSales + emptyBuySell;

    const formula = `${yesterdayEmpty} + ${refillSales} + ${emptyBuySell} = ${todayEmpty}`;

    results.push({
      size,
      cylinderSizeId,
      yesterdayEmpty,
      refillSales,
      emptyBuySell,
      todayEmpty: Math.max(0, todayEmpty), // Can't be negative
      formula,
    });

    console.log(`📊 Empty Cylinders ${size} calculation:`, {
      size,
      yesterdayEmpty,
      refillSales,
      emptyBuySell,
      todayEmpty,
      formula,
    });
  }

  return results;
}

/**
 * Get yesterday's empty cylinders for a specific size
 */
async function getYesterdayEmptyCylinders(
  tenantId: string,
  cylinderSizeId: string,
  yesterday: Date
): Promise<number> {
  try {
    // Try to get from empty_cylinders table first
    const emptyCylinderRecord = await prisma.emptyCylinder.findFirst({
      where: {
        tenantId,
        cylinderSizeId,
        date: yesterday,
      },
      select: {
        quantity: true,
      },
    });

    if (emptyCylinderRecord) {
      return emptyCylinderRecord.quantity;
    }

    // Fallback: calculate from sales and baseline data
    const baselineRecord = await prisma.$queryRaw<Array<{ baseline: number }>>`
      SELECT COALESCE(SUM(baseline_quantity), 0) as baseline
      FROM driver_cylinder_size_baselines
      WHERE tenant_id = ${tenantId} AND cylinder_size_id = ${cylinderSizeId}
    `;

    return baselineRecord[0]?.baseline || 0;
  } catch (error) {
    console.error(
      `Error getting yesterday's empty cylinders for size ${cylinderSizeId}:`,
      error
    );
    return 0;
  }
}

/**
 * Get refill sales for a specific cylinder size (today)
 */
async function getRefillSalesBySize(
  tenantId: string,
  cylinderSizeId: string,
  today: Date
): Promise<number> {
  try {
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const refillSales = await prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COALESCE(SUM(s.quantity), 0) as total
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.tenant_id = ${tenantId}
        AND p.cylinder_size_id = ${cylinderSizeId}
        AND s.sale_type = 'REFILL'
        AND s.sale_date >= ${today}
        AND s.sale_date <= ${endOfDay}
    `;

    return refillSales[0]?.total || 0;
  } catch (error) {
    console.error(
      `Error getting refill sales for size ${cylinderSizeId}:`,
      error
    );
    return 0;
  }
}

/**
 * Get empty cylinder buy/sell transactions for a specific size (today)
 */
async function getEmptyBuySellBySize(
  tenantId: string,
  cylinderSizeId: string,
  today: Date
): Promise<number> {
  try {
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await prisma.$queryRaw<
      Array<{
        shipment_type: string;
        total: number;
      }>
    >`
      SELECT 
        sh.shipment_type,
        COALESCE(SUM(sh.quantity), 0) as total
      FROM shipments sh
      JOIN products p ON sh.product_id = p.id
      WHERE sh.tenant_id = ${tenantId}
        AND p.cylinder_size_id = ${cylinderSizeId}
        AND sh.shipment_type IN ('INCOMING_EMPTY', 'OUTGOING_EMPTY')
        AND sh.status = 'COMPLETED'
        AND sh.shipment_date >= ${today}
        AND sh.shipment_date <= ${endOfDay}
      GROUP BY sh.shipment_type
    `;

    let incoming = 0;
    let outgoing = 0;

    transactions.forEach((transaction) => {
      if (transaction.shipment_type === 'INCOMING_EMPTY') {
        incoming = transaction.total;
      } else if (transaction.shipment_type === 'OUTGOING_EMPTY') {
        outgoing = transaction.total;
      }
    });

    return incoming - outgoing; // Net change (positive = more empties, negative = less empties)
  } catch (error) {
    console.error(
      `Error getting empty buy/sell for size ${cylinderSizeId}:`,
      error
    );
    return 0;
  }
}

/**
 * Get summary totals across all sizes
 */
export function summarizeEmptyCylindersBySize(
  calculations: EmptyCylinderBySize[]
) {
  return {
    totalYesterdayEmpty: calculations.reduce(
      (sum, calc) => sum + calc.yesterdayEmpty,
      0
    ),
    totalRefillSales: calculations.reduce(
      (sum, calc) => sum + calc.refillSales,
      0
    ),
    totalEmptyBuySell: calculations.reduce(
      (sum, calc) => sum + calc.emptyBuySell,
      0
    ),
    totalTodayEmpty: calculations.reduce(
      (sum, calc) => sum + calc.todayEmpty,
      0
    ),
    bySize: calculations.reduce(
      (acc, calc) => {
        acc[calc.size] = {
          yesterdayEmpty: calc.yesterdayEmpty,
          refillSales: calc.refillSales,
          emptyBuySell: calc.emptyBuySell,
          todayEmpty: calc.todayEmpty,
          formula: calc.formula,
        };
        return acc;
      },
      {} as Record<string, any>
    ),
  };
}
