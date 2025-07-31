// Daily Inventory Tracking API
// Implements exact business formulas for daily inventory calculations
// Data Sources:
// - Package/Refill Sales: Sales table (all drivers)
// - Package/Refill Purchase: Shipments table (COMPLETED status, INCOMING_FULL type)
// - Empty Cylinders Buy/Sell: Shipments table (COMPLETED status, INCOMING_EMPTY - OUTGOING_EMPTY)
// - Refill Purchases: Shipments table (ALL status, INCOMING_FULL with REFILL notes)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { InventoryCalculator } from '@/lib/business';

// Simple cache for daily inventory API (2 minute TTL)
const dailyInventoryCache = new Map<string, { data: any; timestamp: number }>();
const DAILY_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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
  fullCylinders: number;
  fullCylindersBySizes: SizeBreakdown[];
  outstandingShipments: number;
  outstandingShipmentsBySizes: SizeBreakdown[];
  emptyCylindersBuySell: number;
  emptyCylindersBuySellBySizes: SizeBreakdown[];
  emptyCylinderReceivables: number;
  emptyCylinderReceivablesBySizes: SizeBreakdown[];
  emptyCylindersInStock: number;
  emptyCylindersInStockBySizes: SizeBreakdown[];
  totalCylinders: number;
  totalCylindersBySizes: SizeBreakdown[];
  // Legacy fields for backward compatibility
  outstandingOrders?: number;
  outstandingOrdersProducts?: ProductBreakdown[];
  outstandingOrdersBySizes?: SizeBreakdown[];
  outstandingPackageOrders?: number;
  outstandingPackageOrdersProducts?: ProductBreakdown[];
  outstandingRefillOrders?: number;
  outstandingRefillOrdersProducts?: ProductBreakdown[];
  outstandingRefillOrdersBySizes?: SizeBreakdown[];
  emptyCylinders?: number;
  emptyCylindersBySizes?: SizeBreakdown[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Check cache first
    const cacheKey = `${tenantId}-${searchParams.toString()}`;
    const cached = dailyInventoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DAILY_CACHE_TTL) {
      console.log(`🚀 Returning cached daily inventory data for ${cacheKey}`);
      return NextResponse.json(cached.data);
    }

    // Get date range - default to last 3 days for better performance
    const endDate =
      searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const startDate =
      searchParams.get('startDate') ||
      (() => {
        const date = new Date();
        date.setDate(date.getDate() - 3); // Reduced from 30 to 3 days for performance
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

    console.log(`🔍 Fetching sales data for range: ${startDate} to ${endDate}`);
    console.log(
      `📅 Date range SQL: ${rangeStart.toISOString()} to ${rangeEnd.toISOString()}`
    );

    // Batch fetch all sales data for the entire range with product details
    const [
      packageSalesData,
      refillSalesData,
      packageSalesWithProducts,
      refillSalesWithProducts,
    ] = await Promise.all([
      // Package sales: Total Packages sales by all the drivers combined for that particular date
      prisma.sale.groupBy({
        by: ['saleDate'],
        where: {
          tenantId,
          saleType: 'PACKAGE',
          saleDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          // Include ALL drivers, not just active ones
        },
        _sum: {
          quantity: true,
        },
      }),
      // Refill sales: Total Refill sales by all the drivers combined for that particular date
      prisma.sale.groupBy({
        by: ['saleDate'],
        where: {
          tenantId,
          saleType: 'REFILL',
          saleDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          // Include ALL drivers, not just active ones
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

    console.log(`📊 Fetched sales data:`, {
      packageSalesData: packageSalesData.length,
      refillSalesData: refillSalesData.length,
      packageSalesWithProducts: packageSalesWithProducts.length,
      refillSalesWithProducts: refillSalesWithProducts.length,
    });

    // Batch fetch all shipment data for the entire range with product details
    const [
      emptyBuyData,
      emptySellData,
      packagePurchaseShipments,
      refillPurchaseShipments,
      allRefillPurchaseData,
      allRefillPurchaseWithProducts,
    ] = await Promise.all([
      // Empty Cylinders Buy: INCOMING_EMPTY from completed shipments with product details
      prisma.shipment.findMany({
        where: {
          tenantId,
          shipmentType: 'INCOMING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        include: {
          product: {
            include: {
              cylinderSize: true,
            },
          },
        },
        orderBy: {
          shipmentDate: 'asc',
        },
      }),
      // Empty Cylinders Sell: OUTGOING_EMPTY from completed shipments with product details
      prisma.shipment.findMany({
        where: {
          tenantId,
          shipmentType: 'OUTGOING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        include: {
          product: {
            include: {
              cylinderSize: true,
            },
          },
        },
        orderBy: {
          shipmentDate: 'asc',
        },
      }),
      // Individual completed package purchase shipments
      prisma.shipment.findMany({
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          updatedAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          OR: [{ notes: { not: { contains: 'REFILL:' } } }, { notes: null }],
        },
        include: {
          product: {
            include: {
              company: true,
              cylinderSize: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      // Individual completed refill purchase shipments
      prisma.shipment.findMany({
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          updatedAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
          notes: {
            contains: 'REFILL:',
          },
        },
        include: {
          product: {
            include: {
              company: true,
              cylinderSize: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      // All Refill Purchases: INCOMING_FULL with REFILL notes (including outstanding shipments)
      prisma.shipment.groupBy({
        by: ['shipmentDate'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
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
      // All Refill Purchases by Product: INCOMING_FULL with REFILL notes (including outstanding shipments)
      prisma.shipment.groupBy({
        by: ['shipmentDate', 'productId'],
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
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

    console.log(`📦 Fetched shipment data:`, {
      emptyBuyData: emptyBuyData.length,
      emptySellData: emptySellData.length,
      packagePurchaseShipments: packagePurchaseShipments.length,
      refillPurchaseShipments: refillPurchaseShipments.length,
      allRefillPurchaseData: allRefillPurchaseData.length,
      allRefillPurchaseWithProducts: allRefillPurchaseWithProducts.length,
    });

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
        size: product.cylinderSize?.size || product.size || 'Unknown',
        companyName: product.company.name,
      });
    });

    // Create size lookup set for available sizes
    const availableSizes = new Set(allCylinderSizes.map((size) => size.size));

    // Create lookup maps for quick access
    const packageSalesMap = new Map();
    const refillSalesMap = new Map();
    // Note: packagePurchaseMap and refillPurchaseMap removed - totals now calculated from individual shipments
    const emptyBuyMap = new Map();
    const emptySellMap = new Map();
    const emptyBuyByDateAndSizeMap = new Map<string, Map<string, number>>();
    const emptySellByDateAndSizeMap = new Map<string, Map<string, number>>();
    const allRefillPurchaseMap = new Map();

    // Create product-wise lookup maps
    const packageSalesProductMap = new Map();
    const refillSalesProductMap = new Map();
    const packagePurchaseProductMap = new Map();
    const refillPurchaseProductMap = new Map();
    const allRefillPurchaseProductMap = new Map();

    packageSalesData.forEach((item) => {
      const dateKey = item.saleDate.toISOString().split('T')[0];
      packageSalesMap.set(dateKey, item._sum.quantity || 0);
    });

    refillSalesData.forEach((item) => {
      const dateKey = item.saleDate.toISOString().split('T')[0];
      refillSalesMap.set(dateKey, item._sum.quantity || 0);
    });

    // Old packagePurchaseData and refillPurchaseData mapping removed -
    // totals now calculated directly from individual shipments

    emptyBuyData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      const cylinderSize = item.product?.cylinderSize?.size || 'Unknown';

      // Update total map
      emptyBuyMap.set(dateKey, (emptyBuyMap.get(dateKey) || 0) + item.quantity);

      // Update size-specific map
      if (!emptyBuyByDateAndSizeMap.has(dateKey)) {
        emptyBuyByDateAndSizeMap.set(dateKey, new Map());
      }
      const sizeMap = emptyBuyByDateAndSizeMap.get(dateKey)!;
      sizeMap.set(
        cylinderSize,
        (sizeMap.get(cylinderSize) || 0) + item.quantity
      );
    });

    emptySellData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      const cylinderSize = item.product?.cylinderSize?.size || 'Unknown';

      // Update total map
      emptySellMap.set(
        dateKey,
        (emptySellMap.get(dateKey) || 0) + item.quantity
      );

      // Update size-specific map
      if (!emptySellByDateAndSizeMap.has(dateKey)) {
        emptySellByDateAndSizeMap.set(dateKey, new Map());
      }
      const sizeMap = emptySellByDateAndSizeMap.get(dateKey)!;
      sizeMap.set(
        cylinderSize,
        (sizeMap.get(cylinderSize) || 0) + item.quantity
      );
    });

    allRefillPurchaseData.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      allRefillPurchaseMap.set(
        dateKey,
        (allRefillPurchaseMap.get(dateKey) || 0) + (item._sum.quantity || 0)
      );
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

    // Clear and repopulate purchase product maps with individual shipments
    packagePurchaseProductMap.clear();
    refillPurchaseProductMap.clear();

    // Process individual package purchase shipments
    packagePurchaseShipments.forEach((shipment) => {
      const dateKey = shipment.updatedAt.toISOString().split('T')[0];
      if (!packagePurchaseProductMap.has(dateKey)) {
        packagePurchaseProductMap.set(dateKey, []);
      }
      packagePurchaseProductMap.get(dateKey).push({
        productId: shipment.productId,
        productName: shipment.product.name,
        productSize:
          shipment.product.cylinderSize?.size ||
          shipment.product.size ||
          'Unknown',
        companyName: shipment.product.company.name,
        quantity: shipment.quantity,
        shipmentId: shipment.id,
        actualProductId: shipment.productId, // Keep original productId for size calculations
      });
    });

    // Process individual refill purchase shipments
    refillPurchaseShipments.forEach((shipment) => {
      const dateKey = shipment.updatedAt.toISOString().split('T')[0];
      if (!refillPurchaseProductMap.has(dateKey)) {
        refillPurchaseProductMap.set(dateKey, []);
      }
      refillPurchaseProductMap.get(dateKey).push({
        productId: shipment.productId,
        productName: shipment.product.name,
        productSize:
          shipment.product.cylinderSize?.size ||
          shipment.product.size ||
          'Unknown',
        companyName: shipment.product.company.name,
        quantity: shipment.quantity,
        shipmentId: shipment.id,
        actualProductId: shipment.productId, // Keep original productId for size calculations
      });
    });

    allRefillPurchaseWithProducts.forEach((item) => {
      const dateKey = item.shipmentDate.toISOString().split('T')[0];
      if (!allRefillPurchaseProductMap.has(dateKey)) {
        allRefillPurchaseProductMap.set(dateKey, new Map());
      }
      allRefillPurchaseProductMap
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

    // Helper function to get product breakdown from shipment arrays (for purchases)
    const getShipmentProductBreakdown = (
      dateKey: string,
      shipmentMap: Map<string, any[]>
    ): ProductBreakdown[] => {
      const shipments = shipmentMap.get(dateKey) || [];
      return shipments.map((shipment) => ({
        ...shipment,
        // Use shipmentId as the unique identifier instead of productId to avoid React key conflicts
        productId: shipment.shipmentId,
      }));
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

    // Helper function to get outstanding orders for a specific date
    const getOutstandingOrdersForDate = async (date: string) => {
      const currentDate = new Date(date);
      currentDate.setHours(23, 59, 59, 999); // End of day

      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0); // Start of next day

      // Get all orders that were outstanding on this specific date:
      // - Created on or before this date (shipmentDate <= currentDate)
      // - Either still pending OR completed after this date (updatedAt >= nextDay)

      const outstandingShipments = await prisma.shipment.findMany({
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          shipmentDate: {
            lte: currentDate,
          },
          OR: [
            // Orders that are still pending
            { status: { not: 'COMPLETED' } },
            // Orders that were completed after this date
            {
              status: 'COMPLETED',
              updatedAt: {
                gte: nextDay,
              },
            },
          ],
        },
        include: {
          product: {
            include: {
              company: true,
              cylinderSize: true,
            },
          },
        },
      });

      // Calculate totals and breakdowns
      let totalOutstanding = 0;
      let totalPackageOutstanding = 0;
      let totalRefillOutstanding = 0;

      const outstandingProducts: ProductBreakdown[] = [];
      const packageProducts: ProductBreakdown[] = [];
      const refillProducts: ProductBreakdown[] = [];

      outstandingShipments.forEach((shipment) => {
        const isRefill = shipment.notes && shipment.notes.includes('REFILL:');

        totalOutstanding += shipment.quantity;

        const productBreakdown: ProductBreakdown = {
          productId: shipment.productId,
          productName: shipment.product.name,
          productSize:
            shipment.product.cylinderSize?.size ||
            shipment.product.size ||
            'Unknown',
          companyName: shipment.product.company.name,
          quantity: shipment.quantity,
        };

        outstandingProducts.push(productBreakdown);

        if (isRefill) {
          totalRefillOutstanding += shipment.quantity;
          refillProducts.push(productBreakdown);
        } else {
          totalPackageOutstanding += shipment.quantity;
          packageProducts.push(productBreakdown);
        }
      });

      return {
        totalOutstanding,
        totalPackageOutstanding,
        totalRefillOutstanding,
        outstandingProducts,
        packageProducts,
        refillProducts,
      };
    };

    // Helper function to calculate cylinder size breakdown for inventory calculations
    const calculateCylinderSizeBreakdown = async (
      previousRecord: DailyInventoryRecord | null,
      packageSalesProducts: ProductBreakdown[],
      refillSalesProducts: ProductBreakdown[],
      packagePurchaseProducts: ProductBreakdown[],
      refillPurchaseProducts: ProductBreakdown[],
      allRefillPurchaseProducts: ProductBreakdown[],
      emptyCylindersBuySell: number,
      allRefillPurchases: number,
      actualFullCylinders: number,
      actualEmptyCylinders: number,
      tenantId: string,
      isFirstDay: boolean,
      date: string
    ): Promise<{
      fullCylindersBySizes: SizeBreakdown[];
      emptyCylindersBySizes: SizeBreakdown[];
      totalCylindersBySizes: SizeBreakdown[];
      emptyCylindersBuySellBySizes: SizeBreakdown[];
    }> => {
      // Get size breakdowns for sales and purchases
      const packageSalesSizes = getSizeBreakdown(packageSalesProducts);
      const refillSalesSizes = getSizeBreakdown(refillSalesProducts);
      const packagePurchaseSizes = getSizeBreakdown(packagePurchaseProducts);
      const refillPurchaseSizes = getSizeBreakdown(refillPurchaseProducts);
      const allRefillPurchaseSizes = getSizeBreakdown(
        allRefillPurchaseProducts
      );

      // For first day, get initial inventory breakdown from onboarding data
      let previousFullBySizes: SizeBreakdown[] = [];
      let previousEmptyBySizes: SizeBreakdown[] = [];

      if (isFirstDay) {
        // Get shipment baseline inventory breakdown from onboarding data
        // These are the initial inventory values entered during onboarding (shipment baseline values)
        const shipmentBaselineBySize = await prisma.inventoryRecord.findMany({
          where: {
            tenantId,
            productId: { not: null }, // Only product-specific records (from onboarding)
          },
        });

        // Get product details separately to avoid include issues
        const productIds = shipmentBaselineBySize
          .map((record) => record.productId)
          .filter(Boolean) as string[];
        const productsWithSizes = await prisma.product.findMany({
          where: {
            id: { in: productIds },
          },
          include: {
            cylinderSize: true,
          },
        });

        // Create a map of productId to size
        const productSizeMap = new Map<string, string>();
        productsWithSizes.forEach((product) => {
          productSizeMap.set(
            product.id,
            product.cylinderSize?.size || 'Unknown'
          );
        });

        // Group by cylinder size - these become "yesterday's" values for first day calculation
        const shipmentFullBySize = new Map<string, number>();
        const shipmentEmptyBySize = new Map<string, number>();

        shipmentBaselineBySize.forEach((record) => {
          const size = record.productId
            ? productSizeMap.get(record.productId) || 'Unknown'
            : 'Unknown';
          shipmentFullBySize.set(
            size,
            (shipmentFullBySize.get(size) || 0) + (record.fullCylinders || 0)
          );
          shipmentEmptyBySize.set(
            size,
            (shipmentEmptyBySize.get(size) || 0) + (record.emptyCylinders || 0)
          );
        });

        // Convert to arrays - these are the shipment baseline values used as "previous day" for calculations
        availableSizes.forEach((size: string) => {
          previousFullBySizes.push({
            size,
            quantity: shipmentFullBySize.get(size) || 0,
          });
          previousEmptyBySizes.push({
            size,
            quantity: shipmentEmptyBySize.get(size) || 0,
          });
        });
      } else if (previousRecord) {
        // Use previous day's data
        previousFullBySizes = previousRecord.fullCylindersBySizes || [];
        previousEmptyBySizes = previousRecord.emptyCylindersBySizes || [];
      } else {
        // Default to zero for all sizes
        availableSizes.forEach((size: string) => {
          previousFullBySizes.push({ size, quantity: 0 });
          previousEmptyBySizes.push({ size, quantity: 0 });
        });
      }

      // Calculate full cylinders by size using exact business formula
      const fullCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const previousFull =
          previousFullBySizes.find((s) => s.size === size)?.quantity || 0;
        const packageSales =
          packageSalesSizes.find((s) => s.size === size)?.quantity || 0;
        const refillSales =
          refillSalesSizes.find((s) => s.size === size)?.quantity || 0;
        const packagePurchase =
          packagePurchaseSizes.find((s) => s.size === size)?.quantity || 0;
        const refillPurchase =
          refillPurchaseSizes.find((s) => s.size === size)?.quantity || 0;

        // Apply exact formula: Previous + Purchases - Sales
        const fullQty = Math.max(
          0,
          previousFull +
            packagePurchase +
            refillPurchase -
            (packageSales + refillSales)
        );
        fullCylindersBySizes.push({ size, quantity: fullQty });
      });

      // First, calculate empty cylinders buy/sell by size using ACTUAL transaction data
      const emptyCylindersBuySellBySizes: SizeBreakdown[] = [];
      const emptyBuyBySizeForDate =
        emptyBuyByDateAndSizeMap.get(date) || new Map();
      const emptySellBySizeForDate =
        emptySellByDateAndSizeMap.get(date) || new Map();

      availableSizes.forEach((size: string) => {
        const buyQty = emptyBuyBySizeForDate.get(size) || 0;
        const sellQty = emptySellBySizeForDate.get(size) || 0;
        const netChange = buyQty - sellQty;
        emptyCylindersBuySellBySizes.push({ size, quantity: netChange });
      });

      // Calculate empty cylinders by size using exact business formula
      const emptyCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const previousEmpty =
          previousEmptyBySizes.find((s) => s.size === size)?.quantity || 0;
        const refillSales =
          refillSalesSizes.find((s) => s.size === size)?.quantity || 0;
        const allRefillPurchase =
          allRefillPurchaseSizes.find((s) => s.size === size)?.quantity || 0;

        // Use ACTUAL size-specific empty cylinder buy/sell data instead of proportional distribution
        const emptyCylinderChange =
          emptyCylindersBuySellBySizes.find((s) => s.size === size)?.quantity ||
          0;

        // Apply exact formula: স্টকে খালি সিলিন্ডার = Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell - Outstanding Refill Shipment
        const emptyQty = Math.max(
          0,
          previousEmpty + refillSales + emptyCylinderChange - allRefillPurchase
        );
        emptyCylindersBySizes.push({ size, quantity: emptyQty });
      });

      // Size-specific calculations are the source of truth
      // The aggregate totals should be derived from size breakdowns, not the other way around
      const calculatedFullTotal = fullCylindersBySizes.reduce(
        (sum, s) => sum + s.quantity,
        0
      );
      const calculatedEmptyTotal = emptyCylindersBySizes.reduce(
        (sum, s) => sum + s.quantity,
        0
      );

      // Calculate total cylinders by size (will be updated later to include outstanding refill shipments)
      const totalCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const fullQty =
          fullCylindersBySizes.find((s) => s.size === size)?.quantity || 0;
        const emptyQty =
          emptyCylindersBySizes.find((s) => s.size === size)?.quantity || 0;
        totalCylindersBySizes.push({ size, quantity: fullQty + emptyQty });
      });

      // Debug log for verification
      if (emptyCylindersBuySell !== 0) {
        console.log(`🔍 Empty cylinder buy/sell for ${date}:`, {
          total: emptyCylindersBuySell,
          buyBySize: Object.fromEntries(emptyBuyBySizeForDate),
          sellBySize: Object.fromEntries(emptySellBySizeForDate),
          sizeBreakdown: emptyCylindersBuySellBySizes,
        });
      }

      return {
        fullCylindersBySizes,
        emptyCylindersBySizes,
        totalCylindersBySizes,
        emptyCylindersBuySellBySizes,
      };
    };

    // Batch fetch all inventory records for the date range to avoid N+1 queries
    const allInventoryRecords = await prisma.inventoryRecord.findMany({
      where: {
        tenantId,
        productId: null, // Aggregated records only
        date: {
          gte: new Date(dates[dates.length - 1]), // Get from earliest date
          lte: new Date(dates[0]), // To latest date
        },
      },
      orderBy: { date: 'desc' },
    });

    // Create a map for quick lookup
    const inventoryRecordMap = new Map(
      allInventoryRecords.map((record) => [
        record.date.toISOString().split('T')[0],
        record,
      ])
    );

    console.log(
      `📚 Pre-loaded ${allInventoryRecords.length} inventory records for faster lookup`
    );

    // OPTIMIZED: Pre-load all receivables data once instead of per-date queries
    const allReceivableRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
        date: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      select: {
        driverId: true,
        totalCylinderReceivables: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    // Get the latest record per driver for the range
    const latestReceivablesByDriver = new Map<string, number>();
    allReceivableRecords.forEach((record) => {
      if (!latestReceivablesByDriver.has(record.driverId)) {
        latestReceivablesByDriver.set(
          record.driverId,
          record.totalCylinderReceivables
        );
      }
    });

    const totalReceivablesForRange = Array.from(
      latestReceivablesByDriver.values()
    ).reduce((sum, amount) => sum + amount, 0);

    console.log(`📊 Pre-loaded receivables for entire range:`, {
      totalReceivables: totalReceivablesForRange,
      driversCount: latestReceivablesByDriver.size,
    });

    // Calculate daily inventory for each date using the cached data
    const dailyRecords: DailyInventoryRecord[] = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];

      // Get product breakdowns first to calculate accurate totals
      const packageSalesProducts = getProductBreakdown(
        date,
        packageSalesProductMap
      );
      const refillSalesProducts = getProductBreakdown(
        date,
        refillSalesProductMap
      );
      const packagePurchaseProducts = getShipmentProductBreakdown(
        date,
        packagePurchaseProductMap
      );
      const refillPurchaseProducts = getShipmentProductBreakdown(
        date,
        refillPurchaseProductMap
      );

      // Calculate totals from breakdown sums to ensure consistency
      const packageSalesQty = packageSalesProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      const refillSalesQty = refillSalesProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      const totalSalesQty = packageSalesQty + refillSalesQty;

      // Calculate actual outstanding orders for this date
      const outstandingData = await getOutstandingOrdersForDate(date);
      const outstandingOrdersQty = outstandingData.totalOutstanding;
      const outstandingPackageOrdersQty =
        outstandingData.totalPackageOutstanding;
      const outstandingRefillOrdersQty = outstandingData.totalRefillOutstanding;
      const outstandingOrdersProducts = outstandingData.outstandingProducts;
      const outstandingPackageOrdersProducts = outstandingData.packageProducts;
      const outstandingRefillOrdersProducts = outstandingData.refillProducts;

      console.log(`📦 Outstanding orders for ${date}:`, {
        total: outstandingOrdersQty,
        package: outstandingPackageOrdersQty,
        refill: outstandingRefillOrdersQty,
        productsCount: outstandingOrdersProducts.length,
      });

      const allRefillPurchaseProducts = getProductBreakdown(
        date,
        allRefillPurchaseProductMap
      );

      // Calculate purchase totals from individual shipments to ensure consistency
      const packagePurchaseQty = packagePurchaseProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      const refillPurchaseQty = refillPurchaseProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );

      // Log specific date if it's 2025-07-18
      if (date === '2025-07-18') {
        console.log(`🎯 SPECIFIC DEBUG for ${date}:`, {
          'Raw packageSalesMap': Array.from(packageSalesMap.entries()),
          'Raw refillSalesMap': Array.from(refillSalesMap.entries()),
          'Package purchases for date': packagePurchaseProducts,
          'Refill purchases for date': refillPurchaseProducts,
          'Date lookup result': {
            packageSalesQty,
            refillSalesQty,
            totalSalesQty,
            packagePurchaseQty,
            refillPurchaseQty,
          },
        });
      }

      // Outstanding data is already defined above from getOutstandingOrdersForDate()

      // Calculate outstanding refill orders by size
      const outstandingRefillOrdersBySizes = getSizeBreakdown(
        outstandingRefillOrdersProducts
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

      // Empty Cylinders Buy/Sell: Total Empty Cylinders purchase or sale on that day found on the Completed table on the purchases page
      const emptyCylindersBuySell =
        (emptyBuyMap.get(date) || 0) - (emptySellMap.get(date) || 0);

      // All Refill Purchases: Total refill purchases on that day (including outstanding shipments)
      const allRefillPurchases = allRefillPurchaseMap.get(date) || 0;

      // OPTIMIZED but ACCURATE: Calculate receivables based on actual driver baseline data
      let emptyCylinderReceivables = 0;
      let emptyCylinderReceivablesBySizes: SizeBreakdown[] = [];

      try {
        // Use the optimized batch approach from cylinders-summary but for this specific date
        const cylinderReceivablesBySize = new Map<string, number>();

        // Get all active retail drivers with their latest receivables records in one query
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

        // Filter drivers with receivables and get their IDs
        const driverIds = activeDriversWithReceivables
          .filter((d) => d.receivableRecords[0]?.totalCylinderReceivables > 0)
          .map((d) => d.id);

        if (driverIds.length > 0) {
          // Get baseline data for drivers with receivables (cached from earlier if possible)
          const [allBaselineBreakdowns, allSalesWithCylinders] =
            await Promise.all([
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
                  saleDate: {
                    lte: new Date(date + 'T23:59:59.999Z'),
                  },
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

          // Group pre-loaded data by driver for efficient processing
          const baselinesByDriver = new Map<
            string,
            typeof allBaselineBreakdowns
          >();
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

          // Process each driver with pre-loaded data for EXACT calculations
          for (const driver of activeDriversWithReceivables) {
            const latestRecord = driver.receivableRecords[0];
            if (latestRecord?.totalCylinderReceivables > 0) {
              const baselineBreakdown = baselinesByDriver.get(driver.id) || [];
              const salesWithCylinders = salesByDriver.get(driver.id) || [];

              if (baselineBreakdown.length > 0) {
                // EXACT calculation: Start with onboarding baseline breakdown by size
                const sizeBreakdown: Record<string, number> = {};

                // Initialize with onboarding baseline
                baselineBreakdown.forEach((item) => {
                  const size = item.cylinderSize.size;
                  sizeBreakdown[size] = item.baselineQuantity;
                });

                // Add/subtract sales data by specific cylinder sizes (up to the specified date)
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

                // Use only positive values from the cumulative calculation
                Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
                  if (quantity > 0) {
                    cylinderReceivablesBySize.set(
                      size,
                      (cylinderReceivablesBySize.get(size) || 0) + quantity
                    );
                  }
                });
              } else {
                // Fallback: use pre-loaded sales data
                salesWithCylinders.forEach((sale) => {
                  const size =
                    sale.product?.size || sale.product?.name || 'Unknown';
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
        }

        // Convert to array format using the exact calculation
        availableSizes.forEach((size: string) => {
          const quantity = cylinderReceivablesBySize.get(size) || 0;
          emptyCylinderReceivablesBySizes.push({ size, quantity });
        });

        emptyCylinderReceivables = emptyCylinderReceivablesBySizes.reduce(
          (sum, s) => sum + s.quantity,
          0
        );

        console.log(
          `📊 Daily inventory receivables for ${date} using EXACT same method as cylinders summary:`,
          {
            emptyCylinderReceivables,
            distribution: Object.fromEntries(cylinderReceivablesBySize),
            source:
              'EXACT baseline + sales changes by SIZE with efficient batching',
          }
        );
      } catch (error) {
        console.warn(
          `Failed to calculate exact empty cylinder receivables for ${date}:`,
          error
        );
        // Fallback to using the pre-loaded total
        emptyCylinderReceivables = totalReceivablesForRange;

        // Simple proportional distribution by available cylinder sizes as fallback
        if (availableSizes.size > 0 && emptyCylinderReceivables > 0) {
          const perSizeReceivables = Math.floor(
            emptyCylinderReceivables / availableSizes.size
          );
          const remainder = emptyCylinderReceivables % availableSizes.size;

          let index = 0;
          availableSizes.forEach((size: string) => {
            const amount = perSizeReceivables + (index < remainder ? 1 : 0);
            emptyCylinderReceivablesBySizes.push({ size, quantity: amount });
            index++;
          });
        } else {
          // Default to zero for all sizes
          availableSizes.forEach((size: string) => {
            emptyCylinderReceivablesBySizes.push({ size, quantity: 0 });
          });
        }
      }

      // 6. Calculate Today's Full and Empty Cylinders using exact formulas
      let previousFullCylinders = 0;
      let previousEmptyCylinders = 0;

      if (i > 0) {
        // Get previous day's totals
        const previousRecord = dailyRecords[i - 1];
        previousFullCylinders = previousRecord.fullCylinders;
        previousEmptyCylinders = previousRecord.emptyCylinders || 0;
      } else {
        // For first day, try to get actual previous day inventory from pre-loaded records
        const previousDate = new Date(date);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateStr = previousDate.toISOString().split('T')[0];

        const previousInventory = inventoryRecordMap.get(previousDateStr);

        if (previousInventory) {
          previousFullCylinders = previousInventory.fullCylinders;
          previousEmptyCylinders = previousInventory.emptyCylinders;
        } else {
          // If no previous record exists, get shipment baseline values from onboarding data
          // These are the initial inventory values entered during onboarding (shipment values)
          const shipmentBaselineRecords = await prisma.inventoryRecord.findMany(
            {
              where: {
                tenantId,
                productId: { not: null }, // Only product-specific records (from onboarding)
              },
              select: {
                fullCylinders: true,
                emptyCylinders: true,
              },
            }
          );

          // Sum up shipment baseline inventory from onboarding - these become "yesterday's" values for first day calculation
          previousFullCylinders = shipmentBaselineRecords.reduce(
            (sum, record) => sum + (record.fullCylinders || 0),
            0
          );
          previousEmptyCylinders = shipmentBaselineRecords.reduce(
            (sum, record) => sum + (record.emptyCylinders || 0),
            0
          );

          console.log(
            `No previous inventory record found for ${previousDateStr}. Using shipment baseline values from onboarding:`,
            {
              shipmentBaselineRecords: shipmentBaselineRecords.length,
              previousFullCylinders,
              previousEmptyCylinders,
            }
          );
        }

        console.log(
          `Using shipment baseline values for first day ${date} calculation:`,
          {
            previousFullCylinders,
            previousEmptyCylinders,
            note: 'These are the onboarding shipment values used as "yesterday\'s" inventory for formula calculation',
          }
        );
      }

      // Debug logging after calculating previous values
      console.log(`🔍 Daily inventory debug for ${date}:`, {
        packageSalesQty,
        refillSalesQty,
        totalSalesQty,
        packagePurchaseQty,
        refillPurchaseQty,
        emptyCylindersBuySell,
        allRefillPurchases,
        previousFullCylinders,
        previousEmptyCylinders,
        calculatedFullCylinders:
          previousFullCylinders +
          packagePurchaseQty +
          refillPurchaseQty -
          totalSalesQty,
        calculatedEmptyCylinders:
          previousEmptyCylinders +
          refillSalesQty +
          emptyCylindersBuySell -
          allRefillPurchases,
      });

      // Apply EXACT business formulas as specified:
      // For first day: "Yesterday's" values = onboarding shipment baseline values
      // For subsequent days: "Yesterday's" values = previous day's calculated values

      // Today's Full Cylinders: Yesterday's full cylinders + Package Purchase + Refill Purchase - Total Sales
      const fullCylinders =
        previousFullCylinders +
        packagePurchaseQty +
        refillPurchaseQty -
        totalSalesQty;

      // Today's Empty Cylinders: Yesterday's Empty Cylinders + Refill sales + Empty Cylinders Buy/Sell - Refill Purchase
      const emptyCylinders =
        previousEmptyCylinders +
        refillSalesQty +
        emptyCylindersBuySell -
        allRefillPurchases;

      // Total Cylinders = Today's Full Cylinders + Today's Empty Cylinders + Outstanding refill shipment
      const totalCylinders =
        fullCylinders + emptyCylinders + outstandingRefillOrdersQty;

      // Calculate cylinder size breakdowns
      const previousRecord = i > 0 ? dailyRecords[i - 1] : null;
      const isFirstDay = i === 0;
      const cylinderSizeBreakdowns = await calculateCylinderSizeBreakdown(
        previousRecord,
        packageSalesProducts,
        refillSalesProducts,
        packagePurchaseProducts,
        refillPurchaseProducts,
        allRefillPurchaseProducts,
        emptyCylindersBuySell,
        allRefillPurchases,
        fullCylinders,
        emptyCylinders,
        tenantId,
        isFirstDay,
        date
      );

      // Update total cylinders by size to include outstanding refill shipments
      const updatedTotalCylindersBySizes: SizeBreakdown[] = [];
      availableSizes.forEach((size: string) => {
        const fullQty =
          cylinderSizeBreakdowns.fullCylindersBySizes.find(
            (s) => s.size === size
          )?.quantity || 0;
        const emptyQty =
          cylinderSizeBreakdowns.emptyCylindersBySizes.find(
            (s) => s.size === size
          )?.quantity || 0;
        const outstandingRefillQty =
          outstandingRefillOrdersBySizes.find((s) => s.size === size)
            ?.quantity || 0;
        updatedTotalCylindersBySizes.push({
          size,
          quantity: fullQty + emptyQty + outstandingRefillQty,
        });
      });

      // Calculate Empty Cylinders in Stock: Physical empty cylinders - receivables
      const emptyCylindersInStock = Math.max(
        0,
        cylinderSizeBreakdowns.emptyCylindersBySizes.reduce(
          (sum, s) => sum + s.quantity,
          0
        ) - emptyCylinderReceivables
      );
      const emptyCylindersInStockBySizes: SizeBreakdown[] = [];

      availableSizes.forEach((size: string) => {
        const physicalEmpty =
          cylinderSizeBreakdowns.emptyCylindersBySizes.find(
            (s) => s.size === size
          )?.quantity || 0;
        const receivables =
          emptyCylinderReceivablesBySizes.find((s) => s.size === size)
            ?.quantity || 0;
        const inStock = Math.max(0, physicalEmpty - receivables);
        emptyCylindersInStockBySizes.push({ size, quantity: inStock });
      });

      // Create the daily record
      const dailyRecord: DailyInventoryRecord = {
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
        fullCylinders: cylinderSizeBreakdowns.fullCylindersBySizes.reduce(
          (sum, s) => sum + s.quantity,
          0
        ),
        fullCylindersBySizes: cylinderSizeBreakdowns.fullCylindersBySizes,
        outstandingShipments: outstandingRefillOrdersQty,
        outstandingShipmentsBySizes: outstandingRefillOrdersBySizes,
        emptyCylindersBuySell,
        emptyCylindersBuySellBySizes:
          cylinderSizeBreakdowns.emptyCylindersBuySellBySizes,
        emptyCylinderReceivables,
        emptyCylinderReceivablesBySizes,
        emptyCylindersInStock,
        emptyCylindersInStockBySizes,
        totalCylinders: updatedTotalCylindersBySizes.reduce(
          (sum, s) => sum + s.quantity,
          0
        ),
        totalCylindersBySizes: updatedTotalCylindersBySizes,
        // Legacy fields for backward compatibility
        outstandingOrders: outstandingOrdersQty,
        outstandingOrdersProducts,
        outstandingOrdersBySizes: getSizeBreakdown(outstandingOrdersProducts),
        outstandingPackageOrders: outstandingPackageOrdersQty,
        outstandingPackageOrdersProducts,
        outstandingRefillOrders: outstandingRefillOrdersQty,
        outstandingRefillOrdersProducts,
        outstandingRefillOrdersBySizes,
        emptyCylinders: cylinderSizeBreakdowns.emptyCylindersBySizes.reduce(
          (sum, s) => sum + s.quantity,
          0
        ),
        emptyCylindersBySizes: cylinderSizeBreakdowns.emptyCylindersBySizes,
      };

      dailyRecords.push(dailyRecord);

      // Note: Aggregated inventory record saving removed since we now track by cylinder size
      // All inventory data is calculated and returned by cylinder size breakdown
    }

    // Return records in descending order (newest first)
    const responseData = {
      success: true,
      dailyInventory: dailyRecords.reverse(),
      summary: {
        totalDays: dailyRecords.length,
        currentFullCylinders: dailyRecords[0]?.fullCylinders || 0,
        currentEmptyCylinders: dailyRecords[0]?.emptyCylinders || 0,
        currentTotalCylinders: dailyRecords[0]?.totalCylinders || 0,
      },
    };

    // Cache the result
    dailyInventoryCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });
    console.log(`💾 Cached daily inventory data for ${cacheKey}`);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Daily inventory calculation error:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
