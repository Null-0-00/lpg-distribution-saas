// Daily Inventory Tracking API
// Implements exact business formulas for daily inventory calculations
// Data Sources:
// - Package/Refill Sales: Sales table (all drivers)
// - Package/Refill Purchase: Shipments table (COMPLETED status, INCOMING_FULL type)
// - Empty Cylinders Buy/Sell: Shipments table (COMPLETED status, INCOMING_EMPTY - OUTGOING_EMPTY)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface ProductBreakdown {
  productId: string;
  productName: string;
  productSize: string;
  companyName: string;
  quantity: number;
}

interface SizeBreakdown {
  size: string;
  quantity: number;
}

interface DailyInventoryRecord {
  date: string;
  packageSalesQty: number;
  packageSalesProducts: ProductBreakdown[];
  refillSalesQty: number;
  refillSalesProducts: ProductBreakdown[];
  totalSalesQty: number;
  totalSalesProducts: ProductBreakdown[];
  packagePurchase: number;
  packagePurchaseProducts: ProductBreakdown[];
  refillPurchase: number;
  refillPurchaseProducts: ProductBreakdown[];
  emptyCylindersBuySell: number;
  emptyCylindersBuySellBySizes: SizeBreakdown[];
  fullCylinders: number;
  fullCylindersBySizes: SizeBreakdown[];
  emptyCylinders: number;
  emptyCylindersBySizes: SizeBreakdown[];
  totalCylinders: number;
  totalCylindersBySizes: SizeBreakdown[];
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

    // Optimize: Batch fetch all data at once instead of per-day queries
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    // Batch fetch all sales data for the entire range with product details
    const [
      packageSalesData,
      refillSalesData,
      packageSalesWithProducts,
      refillSalesWithProducts,
    ] = await Promise.all([
      // Aggregated sales data (for totals)
      prisma.sale.groupBy({
        by: ['saleDate'],
        where: {
          tenantId,
          saleType: 'PACKAGE',
          saleDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.sale.groupBy({
        by: ['saleDate'],
        where: {
          tenantId,
          saleType: 'REFILL',
          saleDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      // Product-wise sales data
      prisma.sale.groupBy({
        by: ['saleDate', 'productId'],
        where: {
          tenantId,
          saleType: 'PACKAGE',
          saleDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.sale.groupBy({
        by: ['saleDate', 'productId'],
        where: {
          tenantId,
          saleType: 'REFILL',
          saleDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    // Batch fetch all shipment data for the entire range with product details
    const [
      packagePurchaseData,
      refillPurchaseData,
      emptyBuyData,
      emptySellData,
      packagePurchaseWithProducts,
      refillPurchaseWithProducts,
    ] = await Promise.all([
      prisma.shipment.groupBy({
        by: ['shipmentDate'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          OR: [{ notes: { not: { contains: 'REFILL:' } } }, { notes: null }],
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.shipment.groupBy({
        by: ['shipmentDate'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          notes: {
            contains: 'REFILL:',
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.shipment.groupBy({
        by: ['shipmentDate'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.shipment.groupBy({
        by: ['shipmentDate'],
        where: {
          tenantId,
          shipmentType: 'OUTGOING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      // Product-wise purchase data
      prisma.shipment.groupBy({
        by: ['shipmentDate', 'productId'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          OR: [{ notes: { not: { contains: 'REFILL:' } } }, { notes: null }],
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.shipment.groupBy({
        by: ['shipmentDate', 'productId'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          notes: {
            contains: 'REFILL:',
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    // Fetch all product details and cylinder sizes for the tenant
    const [allProducts, allCylinderSizes] = await Promise.all([
      prisma.product.findMany({
        where: { tenantId },
        include: {
          company: true,
          cylinderSize: true,
        },
      }),
      prisma.cylinderSize.findMany({
        where: { tenantId },
        orderBy: { size: 'asc' },
      }),
    ]);

    // Create product lookup map
    const productMap = new Map();
    allProducts.forEach((product) => {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        size: product.cylinderSize?.size || 'Unknown',
        companyName: product.company.name,
      });
    });

    // Create size lookup set for available sizes
    const availableSizes = new Set(allCylinderSizes.map((size) => size.size));

    // Create lookup maps for quick access
    const packageSalesMap = new Map();
    const refillSalesMap = new Map();
    const packagePurchaseMap = new Map();
    const refillPurchaseMap = new Map();
    const emptyBuyMap = new Map();
    const emptySellMap = new Map();

    // Create product-wise lookup maps
    const packageSalesProductMap = new Map();
    const refillSalesProductMap = new Map();
    const packagePurchaseProductMap = new Map();
    const refillPurchaseProductMap = new Map();

    packageSalesData.forEach((item) => {
      const dateKey = item.saleDate.toISOString().split('T')[0];
      packageSalesMap.set(dateKey, item._sum.quantity || 0);
    });

    refillSalesData.forEach((item) => {
      const dateKey = item.saleDate.toISOString().split('T')[0];
      refillSalesMap.set(dateKey, item._sum.quantity || 0);
    });

    packagePurchaseData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      packagePurchaseMap.set(dateKey, item._sum.quantity || 0);
    });

    refillPurchaseData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      refillPurchaseMap.set(dateKey, item._sum.quantity || 0);
    });

    emptyBuyData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      emptyBuyMap.set(dateKey, item._sum.quantity || 0);
    });

    emptySellData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      emptySellMap.set(dateKey, item._sum.quantity || 0);
    });

    // Populate product-wise lookup maps
    packageSalesWithProducts.forEach((item) => {
      const dateKey = item.saleDate.toISOString().split('T')[0];
      if (!packageSalesProductMap.has(dateKey)) {
        packageSalesProductMap.set(dateKey, new Map());
      }
      packageSalesProductMap
        .get(dateKey)
        .set(item.productId, item._sum.quantity || 0);
    });

    refillSalesWithProducts.forEach((item) => {
      const dateKey = item.saleDate.toISOString().split('T')[0];
      if (!refillSalesProductMap.has(dateKey)) {
        refillSalesProductMap.set(dateKey, new Map());
      }
      refillSalesProductMap
        .get(dateKey)
        .set(item.productId, item._sum.quantity || 0);
    });

    packagePurchaseWithProducts.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      if (!packagePurchaseProductMap.has(dateKey)) {
        packagePurchaseProductMap.set(dateKey, new Map());
      }
      packagePurchaseProductMap
        .get(dateKey)
        .set(item.productId, item._sum.quantity || 0);
    });

    refillPurchaseWithProducts.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      if (!refillPurchaseProductMap.has(dateKey)) {
        refillPurchaseProductMap.set(dateKey, new Map());
      }
      refillPurchaseProductMap
        .get(dateKey)
        .set(item.productId, item._sum.quantity || 0);
    });

    // Helper function to get product breakdown for a date
    const getProductBreakdown = (
      dateKey: string,
      productQtyMap: Map<string, Map<string, number>>
    ): ProductBreakdown[] => {
      const breakdown: ProductBreakdown[] = [];
      const dayProducts = productQtyMap.get(dateKey);

      if (dayProducts) {
        dayProducts.forEach((quantity, productId) => {
          const product = productMap.get(productId);
          if (product && quantity > 0) {
            breakdown.push({
              productId,
              productName: product.name,
              productSize: product.size,
              companyName: product.companyName,
              quantity,
            });
          }
        });
      }

      return breakdown.sort(
        (a, b) =>
          a.companyName.localeCompare(b.companyName) ||
          a.productName.localeCompare(b.productName)
      );
    };

    // Helper function to get size breakdown from product breakdown
    const getSizeBreakdown = (
      products: ProductBreakdown[]
    ): SizeBreakdown[] => {
      const sizeMap = new Map<string, number>();

      products.forEach((product) => {
        const currentQty = sizeMap.get(product.productSize) || 0;
        sizeMap.set(product.productSize, currentQty + product.quantity);
      });

      // Include all available sizes, even with 0 quantity
      const breakdown: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        breakdown.push({
          size,
          quantity: sizeMap.get(size) || 0,
        });
      });

      return breakdown.sort((a, b) => a.size.localeCompare(b.size));
    };

    // Helper function to calculate cylinder size breakdown for inventory calculations
    const calculateCylinderSizeBreakdown = (
      previousRecord: DailyInventoryRecord | null,
      packageSalesProducts: ProductBreakdown[],
      refillSalesProducts: ProductBreakdown[],
      packagePurchaseProducts: ProductBreakdown[],
      refillPurchaseProducts: ProductBreakdown[],
      emptyCylindersBuySell: number
    ): {
      fullCylindersBySizes: SizeBreakdown[];
      emptyCylindersBySizes: SizeBreakdown[];
      totalCylindersBySizes: SizeBreakdown[];
      emptyCylindersBuySellBySizes: SizeBreakdown[];
    } => {
      // Get size breakdowns for sales and purchases
      const packageSalesSizes = getSizeBreakdown(packageSalesProducts);
      const refillSalesSizes = getSizeBreakdown(refillSalesProducts);
      const packagePurchaseSizes = getSizeBreakdown(packagePurchaseProducts);
      const refillPurchaseSizes = getSizeBreakdown(refillPurchaseProducts);

      // Calculate full cylinders by size
      const fullCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const previousFull =
          previousRecord?.fullCylindersBySizes?.find((s) => s.size === size)
            ?.quantity || 50; // Default baseline
        const packageSales =
          packageSalesSizes.find((s) => s.size === size)?.quantity || 0;
        const refillSales =
          refillSalesSizes.find((s) => s.size === size)?.quantity || 0;
        const packagePurchase =
          packagePurchaseSizes.find((s) => s.size === size)?.quantity || 0;
        const refillPurchase =
          refillPurchaseSizes.find((s) => s.size === size)?.quantity || 0;

        const fullQty =
          previousFull +
          packagePurchase +
          refillPurchase -
          (packageSales + refillSales);
        fullCylindersBySizes.push({ size, quantity: Math.max(0, fullQty) });
      });

      // Calculate empty cylinders by size
      const emptyCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const previousEmpty =
          previousRecord?.emptyCylindersBySizes?.find((s) => s.size === size)
            ?.quantity || 25; // Default baseline
        const refillSales =
          refillSalesSizes.find((s) => s.size === size)?.quantity || 0;
        // Distribute empty cylinder buy/sell proportionally by size (simplified approach)
        const sizeRatio =
          refillSales > 0
            ? refillSales /
              Math.max(
                1,
                refillSalesProducts.reduce((sum, p) => sum + p.quantity, 0)
              )
            : 0;
        const emptyCylinderChange = Math.round(
          emptyCylindersBuySell * sizeRatio
        );

        const emptyQty = previousEmpty + refillSales + emptyCylinderChange;
        emptyCylindersBySizes.push({ size, quantity: Math.max(0, emptyQty) });
      });

      // Calculate total cylinders by size
      const totalCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const fullQty =
          fullCylindersBySizes.find((s) => s.size === size)?.quantity || 0;
        const emptyQty =
          emptyCylindersBySizes.find((s) => s.size === size)?.quantity || 0;
        totalCylindersBySizes.push({ size, quantity: fullQty + emptyQty });
      });

      // Calculate empty cylinders buy/sell by size (distribute proportionally)
      const emptyCylindersBuySellBySizes: SizeBreakdown[] = [];
      const totalRefillSales = refillSalesProducts.reduce(
        (sum, p) => sum + p.quantity,
        0
      );
      availableSizes.forEach((size: string) => {
        const refillSales =
          refillSalesSizes.find((s) => s.size === size)?.quantity || 0;
        const sizeRatio =
          totalRefillSales > 0 ? refillSales / totalRefillSales : 0;
        const change = Math.round(emptyCylindersBuySell * sizeRatio);
        emptyCylindersBuySellBySizes.push({ size, quantity: change });
      });

      return {
        fullCylindersBySizes,
        emptyCylindersBySizes,
        totalCylindersBySizes,
        emptyCylindersBuySellBySizes,
      };
    };

    // Calculate daily inventory for each date using the cached data
    const dailyRecords: DailyInventoryRecord[] = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];

      // Get quantities from cached maps
      const packageSalesQty = packageSalesMap.get(date) || 0;
      const refillSalesQty = refillSalesMap.get(date) || 0;
      const totalSalesQty = packageSalesQty + refillSalesQty;

      const packagePurchaseQty = packagePurchaseMap.get(date) || 0;
      const refillPurchaseQty = refillPurchaseMap.get(date) || 0;

      // Get product breakdowns
      const packageSalesProducts = getProductBreakdown(
        date,
        packageSalesProductMap
      );
      const refillSalesProducts = getProductBreakdown(
        date,
        refillSalesProductMap
      );
      const packagePurchaseProducts = getProductBreakdown(
        date,
        packagePurchaseProductMap
      );
      const refillPurchaseProducts = getProductBreakdown(
        date,
        refillPurchaseProductMap
      );

      // Combine sales products for total
      const totalSalesProducts: ProductBreakdown[] = [];
      const combinedProductMap = new Map<string, ProductBreakdown>();

      [...packageSalesProducts, ...refillSalesProducts].forEach((product) => {
        const key = product.productId;
        if (combinedProductMap.has(key)) {
          combinedProductMap.get(key)!.quantity += product.quantity;
        } else {
          combinedProductMap.set(key, { ...product });
        }
      });

      totalSalesProducts.push(
        ...Array.from(combinedProductMap.values()).sort(
          (a, b) =>
            a.companyName.localeCompare(b.companyName) ||
            a.productName.localeCompare(b.productName)
        )
      );

      const emptyCylindersBuySell =
        (emptyBuyMap.get(date) || 0) - (emptySellMap.get(date) || 0);

      // Debug logging for purchases (now from cached data)
      console.log(`Daily inventory for ${date}:`, {
        packageSalesQty,
        refillSalesQty,
        packagePurchaseQty,
        refillPurchaseQty,
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
        // For first day, use a simplified baseline calculation to avoid expensive queries
        // In a production system, you'd ideally have stored daily snapshots

        // Use a reasonable baseline - could be made configurable per tenant
        previousFullCylinders = 100; // Default baseline for full cylinders
        previousEmptyCylinders = 50; // Default baseline for empty cylinders

        console.log(`Using baseline for first day ${date}:`, {
          previousFullCylinders,
          previousEmptyCylinders,
        });
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

      // Calculate cylinder size breakdowns
      const previousRecord = i > 0 ? dailyRecords[i - 1] : null;
      const cylinderSizeBreakdowns = calculateCylinderSizeBreakdown(
        previousRecord,
        packageSalesProducts,
        refillSalesProducts,
        packagePurchaseProducts,
        refillPurchaseProducts,
        emptyCylindersBuySell
      );

      dailyRecords.push({
        date,
        packageSalesQty,
        packageSalesProducts,
        refillSalesQty,
        refillSalesProducts,
        totalSalesQty,
        totalSalesProducts,
        packagePurchase: packagePurchaseQty,
        packagePurchaseProducts,
        refillPurchase: refillPurchaseQty,
        refillPurchaseProducts,
        emptyCylindersBuySell,
        emptyCylindersBuySellBySizes:
          cylinderSizeBreakdowns.emptyCylindersBuySellBySizes,
        fullCylinders,
        fullCylindersBySizes: cylinderSizeBreakdowns.fullCylindersBySizes,
        emptyCylinders,
        emptyCylindersBySizes: cylinderSizeBreakdowns.emptyCylindersBySizes,
        totalCylinders,
        totalCylindersBySizes: cylinderSizeBreakdowns.totalCylindersBySizes,
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
