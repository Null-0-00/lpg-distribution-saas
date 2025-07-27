// Cylinder Calculator Business Logic
// Handles Full Cylinders (পূর্ণ সিলিন্ডার) and Empty Cylinders (খালি সিলিন্ডার) calculations

import { PrismaClient } from '@prisma/client';

export interface CylinderCalculationData {
  date: Date;
  tenantId: string;
}

export interface FullCylinderData {
  productId: string;
  companyId: string;
  cylinderSizeId: string;
  quantity: number;
}

export interface EmptyCylinderData {
  cylinderSizeId: string;
  quantity: number;
  quantityInHand: number;
  quantityWithDrivers: number;
}

export class CylinderCalculator {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate and update full cylinders for a specific date using exact business formulas
   */
  async calculateFullCylinders(data: CylinderCalculationData): Promise<void> {
    const { date, tenantId } = data;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // Get all active products
    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        company: true,
        cylinderSize: true,
      },
    });

    // Calculate full cylinders for each product using real-time business formulas
    for (const product of products) {
      if (!product.cylinderSize) continue;

      // Get previous day's inventory
      const previousDate = new Date(dateOnly);
      previousDate.setDate(previousDate.getDate() - 1);

      let previousFullCylinders = 0;

      // Try to get from existing calculation first
      const previousCalculation = await this.prisma.fullCylinder.findFirst({
        where: {
          tenantId,
          productId: product.id,
          date: previousDate,
        },
      });

      if (previousCalculation) {
        previousFullCylinders = previousCalculation.quantity;
      } else {
        // If no previous calculation, get from onboarding data
        const onboardingRecord = await this.prisma.inventoryRecord.findFirst({
          where: {
            tenantId,
            productId: product.id,
          },
          orderBy: { date: 'asc' },
        });
        previousFullCylinders = onboardingRecord?.fullCylinders || 0;
      }

      // Get today's sales for this product
      const salesData = await this.prisma.sale.aggregate({
        where: {
          tenantId,
          productId: product.id,
          saleDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const totalSales = salesData._sum.quantity || 0;

      // Get today's purchases for this product (completed shipments)
      const packagePurchaseData = await this.prisma.shipment.aggregate({
        where: {
          tenantId,
          productId: product.id,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          updatedAt: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
          OR: [{ notes: { not: { contains: 'REFILL:' } } }, { notes: null }],
        },
        _sum: {
          quantity: true,
        },
      });

      const refillPurchaseData = await this.prisma.shipment.aggregate({
        where: {
          tenantId,
          productId: product.id,
          shipmentType: 'INCOMING_FULL',
          status: 'COMPLETED',
          updatedAt: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
          notes: {
            contains: 'REFILL:',
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const packagePurchase = packagePurchaseData._sum.quantity || 0;
      const refillPurchase = refillPurchaseData._sum.quantity || 0;

      // Apply exact business formula: Yesterday's Full + Package Purchase + Refill Purchase - Total Sales
      const fullCylinderQuantity = Math.max(
        0,
        previousFullCylinders + packagePurchase + refillPurchase - totalSales
      );

      // Upsert full cylinder record
      await this.prisma.fullCylinder.upsert({
        where: {
          tenantId_productId_date: {
            tenantId,
            productId: product.id,
            date: dateOnly,
          },
        },
        update: {
          quantity: fullCylinderQuantity,
          calculatedAt: new Date(),
        },
        create: {
          tenantId,
          productId: product.id,
          companyId: product.companyId,
          cylinderSizeId: product.cylinderSize.id,
          quantity: fullCylinderQuantity,
          date: dateOnly,
        },
      });
    }
  }

  /**
   * Calculate and update empty cylinders for a specific date using exact business formulas
   */
  async calculateEmptyCylinders(data: CylinderCalculationData): Promise<void> {
    const { date, tenantId } = data;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // Get all products with cylinder sizes
    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        cylinderSizeId: { not: null },
      },
      include: {
        cylinderSize: true,
      },
    });

    // Group products by cylinder size for aggregate calculations
    const productsByCylinderSize = new Map<string, typeof products>();
    products.forEach((product) => {
      if (product.cylinderSize) {
        const sizeId = product.cylinderSize.id;
        if (!productsByCylinderSize.has(sizeId)) {
          productsByCylinderSize.set(sizeId, []);
        }
        productsByCylinderSize.get(sizeId)!.push(product);
      }
    });

    // Get cylinder receivables from drivers
    const receivableRecords = await this.prisma.receivableRecord.findMany({
      where: {
        tenantId,
        date: {
          lte: dateOnly,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get latest receivables per driver
    const latestReceivablesByDriver = new Map<string, number>();
    receivableRecords.forEach((record) => {
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

    // Calculate empty cylinders for each cylinder size
    for (const [cylinderSizeId, sizeProducts] of productsByCylinderSize) {
      const cylinderSize = sizeProducts[0].cylinderSize!;
      // Get previous day's empty cylinders
      const previousDate = new Date(dateOnly);
      previousDate.setDate(previousDate.getDate() - 1);

      let previousEmptyCylinders = 0;

      // Try to get from existing calculation first
      const previousCalculation = await this.prisma.emptyCylinder.findFirst({
        where: {
          tenantId,
          cylinderSizeId: cylinderSize.id,
          date: previousDate,
        },
      });

      if (previousCalculation) {
        previousEmptyCylinders = previousCalculation.quantity;
      } else {
        // If no previous calculation, get from onboarding data for this size
        const onboardingRecords = await this.prisma.inventoryRecord.findMany({
          where: {
            tenantId,
            productId: { not: null },
          },
        });

        // Get products for size filtering
        const products = await this.prisma.product.findMany({
          where: {
            tenantId,
            cylinderSizeId: cylinderSize.id,
          },
          select: {
            id: true,
          },
        });

        const productIds = products.map((p) => p.id);

        // Filter records by products that match the cylinder size
        const sizeSpecificRecords = onboardingRecords.filter(
          (record) => record.productId && productIds.includes(record.productId)
        );
        previousEmptyCylinders = sizeSpecificRecords.reduce(
          (sum, record) => sum + (record.emptyCylinders || 0),
          0
        );
      }

      // Get today's refill sales for this size
      const refillSalesData = await this.prisma.sale.aggregate({
        where: {
          tenantId,
          saleType: 'REFILL',
          saleDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
          product: {
            cylinderSizeId: cylinderSize.id,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const refillSales = refillSalesData._sum.quantity || 0;

      // Get today's empty cylinder buy/sell for this size (proportional distribution)
      const emptyBuyData = await this.prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'INCOMING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const emptySellData = await this.prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'OUTGOING_EMPTY',
          status: 'COMPLETED',
          shipmentDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const totalEmptyBuy = emptyBuyData._sum.quantity || 0;
      const totalEmptySell = emptySellData._sum.quantity || 0;
      const totalEmptyBuySell = totalEmptyBuy - totalEmptySell;

      // Get total refill sales to calculate proportional distribution
      const totalRefillSalesData = await this.prisma.sale.aggregate({
        where: {
          tenantId,
          saleType: 'REFILL',
          saleDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const totalRefillSales = totalRefillSalesData._sum.quantity || 0;

      // Distribute empty cylinder buy/sell proportionally by size based on refill sales
      const sizeRatio =
        totalRefillSales > 0 ? refillSales / totalRefillSales : 0;
      const emptyCylinderBuySellForSize = Math.round(
        totalEmptyBuySell * sizeRatio
      );

      // Get today's refill purchases for this size (including outstanding shipments)
      const allRefillPurchaseData = await this.prisma.shipment.aggregate({
        where: {
          tenantId,
          shipmentType: 'INCOMING_FULL',
          shipmentDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
          notes: {
            contains: 'REFILL:',
          },
          product: {
            cylinderSizeId: cylinderSize.id,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const allRefillPurchase = allRefillPurchaseData._sum.quantity || 0;

      // Apply exact business formula: Yesterday's Empty + Refill Sales + Empty Buy/Sell - All Refill Purchase
      const totalEmptyCylinders = Math.max(
        0,
        previousEmptyCylinders +
          refillSales +
          emptyCylinderBuySellForSize -
          allRefillPurchase
      );

      // Calculate proportional receivables for this size
      const allSizesEmptyTotal = await this.prisma.emptyCylinder.aggregate({
        where: {
          tenantId,
          date: dateOnly,
        },
        _sum: {
          quantity: true,
        },
      });

      const totalEmptyAcrossAllSizes = allSizesEmptyTotal._sum.quantity || 0;

      let proportionalReceivables = 0;
      if (totalEmptyAcrossAllSizes > 0) {
        proportionalReceivables = Math.round(
          (totalEmptyCylinders /
            (totalEmptyAcrossAllSizes + totalEmptyCylinders)) *
            totalCylinderReceivables
        );
      }

      const quantityInHand = Math.max(
        0,
        totalEmptyCylinders - proportionalReceivables
      );
      const quantityWithDrivers = proportionalReceivables;

      // Create empty cylinder records for each product in this size
      for (const product of sizeProducts) {
        // Calculate per-product distribution based on product share
        const productShare = 1 / sizeProducts.length; // Equal distribution among products of same size
        const productQuantity = Math.round(totalEmptyCylinders * productShare);
        const productQuantityInHand = Math.round(quantityInHand * productShare);
        const productQuantityWithDrivers = Math.round(
          quantityWithDrivers * productShare
        );

        await this.prisma.emptyCylinder.upsert({
          where: {
            tenantId_productId_date: {
              tenantId,
              productId: product.id,
              date: dateOnly,
            },
          },
          update: {
            quantity: productQuantity,
            quantityInHand: productQuantityInHand,
            quantityWithDrivers: productQuantityWithDrivers,
            calculatedAt: new Date(),
          },
          create: {
            tenantId,
            productId: product.id,
            companyId: product.companyId,
            cylinderSizeId: cylinderSize.id,
            quantity: productQuantity,
            quantityInHand: productQuantityInHand,
            quantityWithDrivers: productQuantityWithDrivers,
            date: dateOnly,
          },
        });
      }
    }
  }

  /**
   * Calculate both full and empty cylinders for a specific date
   */
  async calculateAllCylinders(data: CylinderCalculationData): Promise<void> {
    await Promise.all([
      this.calculateFullCylinders(data),
      this.calculateEmptyCylinders(data),
    ]);
  }

  /**
   * Get full cylinders summary for a specific date
   */
  async getFullCylindersSummary(
    tenantId: string,
    date?: Date
  ): Promise<FullCylinderData[]> {
    const targetDate = date || new Date();
    const dateOnly = new Date(targetDate);
    dateOnly.setHours(0, 0, 0, 0);

    const fullCylinders = await this.prisma.fullCylinder.findMany({
      where: {
        tenantId,
        date: dateOnly,
      },
      include: {
        product: {
          include: {
            company: true,
            cylinderSize: true,
          },
        },
      },
      orderBy: [
        { company: { name: 'asc' } },
        { product: { cylinderSize: { size: 'asc' } } },
      ],
    });

    return fullCylinders.map((record) => ({
      productId: record.productId,
      companyId: record.companyId,
      cylinderSizeId: record.cylinderSizeId,
      quantity: record.quantity,
    }));
  }

  /**
   * Get empty cylinders summary for a specific date
   */
  async getEmptyCylindersSummary(
    tenantId: string,
    date?: Date
  ): Promise<EmptyCylinderData[]> {
    const targetDate = date || new Date();
    const dateOnly = new Date(targetDate);
    dateOnly.setHours(0, 0, 0, 0);

    const emptyCylinders = await this.prisma.emptyCylinder.findMany({
      where: {
        tenantId,
        date: dateOnly,
      },
      include: {
        cylinderSize: true,
      },
      orderBy: {
        cylinderSize: { size: 'asc' },
      },
    });

    return emptyCylinders.map((record) => ({
      cylinderSizeId: record.cylinderSizeId,
      quantity: record.quantity,
      quantityInHand: record.quantityInHand,
      quantityWithDrivers: record.quantityWithDrivers,
    }));
  }

  /**
   * Get current cylinder totals
   */
  async getCurrentCylinderTotals(tenantId: string): Promise<{
    totalFullCylinders: number;
    totalEmptyCylinders: number;
    totalCylinders: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [fullCylindersTotal, emptyCylindersTotal] = await Promise.all([
      this.prisma.fullCylinder.aggregate({
        where: {
          tenantId,
          date: today,
        },
        _sum: {
          quantity: true,
        },
      }),
      this.prisma.emptyCylinder.aggregate({
        where: {
          tenantId,
          date: today,
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    const totalFullCylinders = fullCylindersTotal._sum.quantity || 0;
    const totalEmptyCylinders = emptyCylindersTotal._sum.quantity || 0;

    return {
      totalFullCylinders,
      totalEmptyCylinders,
      totalCylinders: totalFullCylinders + totalEmptyCylinders,
    };
  }
}
