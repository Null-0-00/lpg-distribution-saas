// Inventory Business Logic
// Implements exact formulas from PRD for LPG cylinder inventory management

import {
  PrismaClient,
  SaleType,
  PurchaseType,
  ShipmentType,
  ShipmentStatus,
  MovementType,
} from '@prisma/client';

export interface InventoryCalculationData {
  date: Date;
  tenantId: string;
  productId?: string;
  previousFullCylinders: number;
  previousEmptyCylinders: number;
}

export interface SalesData {
  packageSales: number;
  refillSales: number;
}

export interface PurchaseData {
  packagePurchase: number;
  refillPurchase: number;
  emptyCylindersBuySell: number;
}

export interface InventoryResult {
  fullCylinders: number;
  emptyCylinders: number;
  totalCylinders: number;
  salesData: SalesData;
  purchaseData: PurchaseData;
}

// Critical Business Formula: Inventory Calculations
export class InventoryCalculator {
  constructor(private prisma: PrismaClient) {}

  /**
   * Core inventory calculation using exact PRD formulas:
   * - Package Sale: -1 Full Cylinder, no Empty Cylinder change
   * - Refill Sale: -1 Full Cylinder, +1 Empty Cylinder
   * - Today's Full Cylinders = Yesterday's Full + Package Purchase + Refill Purchase - Total Sales
   * - Today's Empty Cylinders = Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell - Refill Purchase
   */
  async calculateInventoryForDate(
    data: InventoryCalculationData
  ): Promise<InventoryResult> {
    const {
      date,
      tenantId,
      productId,
      previousFullCylinders,
      previousEmptyCylinders,
    } = data;

    // Get sales data for the date
    const salesData = await this.getSalesData(tenantId, date, productId);

    // Get purchase data for the date
    const purchaseData = await this.getPurchaseData(tenantId, date, productId);

    // Apply exact PRD formulas
    const totalSales = salesData.packageSales + salesData.refillSales;

    // Today's Full Cylinders = Yesterday's Full + Package Purchase + Refill Purchase - Total Sales
    const fullCylinders =
      previousFullCylinders +
      purchaseData.packagePurchase +
      purchaseData.refillPurchase -
      totalSales;

    // Today's Empty Cylinders = Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell - Refill Purchase
    const emptyCylinders =
      previousEmptyCylinders +
      salesData.refillSales +
      purchaseData.emptyCylindersBuySell -
      purchaseData.refillPurchase;

    const totalCylinders = fullCylinders + emptyCylinders;

    return {
      fullCylinders,
      emptyCylinders,
      totalCylinders,
      salesData,
      purchaseData,
    };
  }

  /**
   * Get sales data for a specific date
   */
  private async getSalesData(
    tenantId: string,
    date: Date,
    productId?: string
  ): Promise<SalesData> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause = {
      tenantId,
      saleDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      ...(productId && { productId }),
    };

    const sales = await this.prisma.sale.findMany({
      where: whereClause,
      select: {
        saleType: true,
        quantity: true,
      },
    });

    const packageSales = sales
      .filter((sale) => sale.saleType === SaleType.PACKAGE)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    const refillSales = sales
      .filter((sale) => sale.saleType === SaleType.REFILL)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    return { packageSales, refillSales };
  }

  /**
   * Get purchase data for a specific date
   * Uses the same logic as daily inventory API - pulling from COMPLETED shipments
   */
  private async getPurchaseData(
    tenantId: string,
    date: Date,
    productId?: string
  ): Promise<PurchaseData> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Package Purchase: Total packages purchased from COMPLETED shipments (INCOMING_FULL)
    const packagePurchaseShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.INCOMING_FULL,
        status: ShipmentStatus.COMPLETED,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        // Package purchases are those without 'REFILL:' in notes
        OR: [{ notes: { not: { contains: 'REFILL:' } } }, { notes: null }],
        ...(productId && { productId }),
      },
      select: {
        quantity: true,
      },
    });

    // Refill Purchase: Total refills purchased from ALL shipments (INCOMING_FULL with REFILL notes) - including outstanding
    const refillPurchaseShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.INCOMING_FULL,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        notes: {
          contains: 'REFILL:',
        },
        ...(productId && { productId }),
      },
      select: {
        quantity: true,
      },
    });

    // Empty Cylinders Buy: From COMPLETED shipments (INCOMING_EMPTY)
    const emptyBuyShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.INCOMING_EMPTY,
        status: ShipmentStatus.COMPLETED,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(productId && { productId }),
      },
      select: {
        quantity: true,
      },
    });

    // Empty Cylinders Sell: From COMPLETED shipments (OUTGOING_EMPTY)
    const emptySellShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.OUTGOING_EMPTY,
        status: ShipmentStatus.COMPLETED,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(productId && { productId }),
      },
      select: {
        quantity: true,
      },
    });

    const packagePurchase = packagePurchaseShipments.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const refillPurchase = refillPurchaseShipments.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const emptyCylindersBuy = emptyBuyShipments.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const emptyCylindersSell = emptySellShipments.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const emptyCylindersBuySell = emptyCylindersBuy - emptyCylindersSell;

    return {
      packagePurchase,
      refillPurchase,
      emptyCylindersBuySell,
    };
  }

  /**
   * Create inventory movement record for audit trail
   */
  async recordInventoryMovement(
    tenantId: string,
    productId: string,
    type: MovementType,
    quantity: number,
    description: string,
    reference?: string,
    driverId?: string
  ): Promise<void> {
    await this.prisma.inventoryMovement.create({
      data: {
        tenantId,
        productId,
        type,
        quantity,
        description,
        reference,
        driverId,
      },
    });
  }

  /**
   * Get current inventory levels for a product
   * Calculates real-time inventory based on initial inventory, sales, and completed shipments
   */
  async getCurrentInventoryLevels(
    tenantId: string,
    productId: string
  ): Promise<{
    fullCylinders: number;
    emptyCylinders: number;
    totalCylinders: number;
  }> {
    // Calculate real-time inventory by summing all transactions

    // 0. Get initial inventory from onboarding/inventory records (package/refill purchases)
    const inventoryRecords = await this.prisma.inventoryRecord.findMany({
      where: {
        tenantId,
        productId,
      },
      select: {
        packagePurchase: true,
        refillPurchase: true,
        emptyCylindersBuySell: true,
        fullCylinders: true,
        emptyCylinders: true,
      },
    });

    // Sum up initial inventory from onboarding
    const initialPackagePurchases = inventoryRecords.reduce(
      (sum, record) => sum + record.packagePurchase,
      0
    );
    const initialRefillPurchases = inventoryRecords.reduce(
      (sum, record) => sum + record.refillPurchase,
      0
    );
    const initialEmptyCylindersBuySell = inventoryRecords.reduce(
      (sum, record) => sum + record.emptyCylindersBuySell,
      0
    );

    // Also include the actual baseline inventory values from onboarding
    const initialFullCylinders = inventoryRecords.reduce(
      (sum, record) => sum + record.fullCylinders,
      0
    );
    const initialEmptyCylinders = inventoryRecords.reduce(
      (sum, record) => sum + record.emptyCylinders,
      0
    );

    // 1. Get all sales (reduces full cylinders, refill sales add empty cylinders)
    const allSales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        productId,
      },
      select: {
        saleType: true,
        quantity: true,
      },
    });

    const packageSales = allSales
      .filter((sale) => sale.saleType === SaleType.PACKAGE)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    const refillSales = allSales
      .filter((sale) => sale.saleType === SaleType.REFILL)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    // 2. Get all shipments for purchases (including outstanding for refill purchases)
    const allShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        productId,
      },
      select: {
        shipmentType: true,
        quantity: true,
        notes: true,
        status: true,
      },
    });

    // Package purchases (INCOMING_FULL without REFILL notes) - only completed
    const packagePurchases = allShipments
      .filter(
        (shipment) =>
          shipment.shipmentType === ShipmentType.INCOMING_FULL &&
          shipment.status === ShipmentStatus.COMPLETED &&
          (!shipment.notes || !shipment.notes.includes('REFILL:'))
      )
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    // Refill purchases (INCOMING_FULL with REFILL notes) - only completed
    const refillPurchases = allShipments
      .filter(
        (shipment) =>
          shipment.shipmentType === ShipmentType.INCOMING_FULL &&
          shipment.status === ShipmentStatus.COMPLETED &&
          shipment.notes &&
          shipment.notes.includes('REFILL:')
      )
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    // Empty cylinder transactions - only completed
    const emptyBuys = allShipments
      .filter(
        (shipment) =>
          shipment.shipmentType === ShipmentType.INCOMING_EMPTY &&
          shipment.status === ShipmentStatus.COMPLETED
      )
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    const emptySells = allShipments
      .filter(
        (shipment) =>
          shipment.shipmentType === ShipmentType.OUTGOING_EMPTY &&
          shipment.status === ShipmentStatus.COMPLETED
      )
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    // 3. Apply business formulas including initial inventory
    const totalSales = packageSales + refillSales;
    const totalPurchases =
      initialPackagePurchases +
      initialRefillPurchases +
      packagePurchases +
      refillPurchases;
    const emptyCylindersBuySell =
      initialEmptyCylindersBuySell + emptyBuys - emptySells;

    // Full Cylinders = Initial Full Cylinders + Total Purchases - Total Sales
    const fullCylinders = Math.max(
      0,
      initialFullCylinders + totalPurchases - totalSales
    );

    // Get all completed refill purchases
    const allRefillPurchaseShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        productId,
        shipmentType: ShipmentType.INCOMING_FULL,
        status: ShipmentStatus.COMPLETED,
        notes: {
          contains: 'REFILL:',
        },
      },
      select: {
        quantity: true,
      },
    });

    const allRefillPurchases = allRefillPurchaseShipments.reduce(
      (sum, shipment) => sum + shipment.quantity,
      0
    );

    // Empty Cylinders = Initial Empty Cylinders + Refill Sales + Empty Cylinders Buy/Sell - All Refill Purchases (including initial)
    const emptyCylinders = Math.max(
      0,
      initialEmptyCylinders +
        refillSales +
        emptyCylindersBuySell -
        allRefillPurchases
    );

    const totalCylinders = fullCylinders + emptyCylinders;

    // Get outstanding shipments for this specific product for debugging
    const outstandingShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        productId,
        shipmentType: ShipmentType.INCOMING_FULL,
        status: { not: ShipmentStatus.COMPLETED },
        notes: {
          contains: 'REFILL:',
        },
      },
      select: {
        id: true,
        quantity: true,
        status: true,
        notes: true,
      },
    });

    // Debug logging for real-time inventory calculation
    console.log(`Real-time inventory for product ${productId}:`, {
      // Outstanding shipments
      outstandingShipments,
      // Initial inventory from onboarding
      initialPackagePurchases,
      initialRefillPurchases,
      initialEmptyCylindersBuySell,
      // Sales data
      packageSales,
      refillSales,
      totalSales,
      // Shipment purchases (completed only)
      packagePurchases,
      refillPurchases,
      allRefillPurchases,
      // Empty cylinder transactions
      emptyBuys,
      emptySells,
      // Final calculations
      totalPurchases,
      emptyCylindersBuySell,
      fullCylinders,
      emptyCylinders,
      totalCylinders,
    });

    return {
      fullCylinders,
      emptyCylinders,
      totalCylinders,
    };
  }

  /**
   * Update or create inventory record for a specific date
   */
  async updateInventoryRecord(
    tenantId: string,
    date: Date,
    productId: string | null,
    inventoryData: InventoryResult
  ): Promise<void> {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // Get cylinderSizeId from product
    const product = productId
      ? await this.prisma.product.findUnique({
          where: { id: productId },
          select: { cylinderSizeId: true },
        })
      : null;

    if (!product?.cylinderSizeId) {
      throw new Error(
        `Product ${productId} not found or missing cylinderSizeId`
      );
    }

    await this.prisma.inventoryRecord.upsert({
      where: {
        tenantId_date_productId_cylinderSizeId: {
          tenantId,
          date: dateOnly,
          productId: productId as string,
          cylinderSizeId: product.cylinderSizeId,
        },
      },
      update: {
        packageSales: inventoryData.salesData.packageSales,
        refillSales: inventoryData.salesData.refillSales,
        totalSales:
          inventoryData.salesData.packageSales +
          inventoryData.salesData.refillSales,
        packagePurchase: inventoryData.purchaseData.packagePurchase,
        refillPurchase: inventoryData.purchaseData.refillPurchase,
        emptyCylindersBuySell: inventoryData.purchaseData.emptyCylindersBuySell,
        fullCylinders: inventoryData.fullCylinders,
        emptyCylinders: inventoryData.emptyCylinders,
        totalCylinders: inventoryData.totalCylinders,
        calculatedAt: new Date(),
      },
      create: {
        tenantId,
        date: dateOnly,
        productId,
        cylinderSizeId: product.cylinderSizeId,
        packageSales: inventoryData.salesData.packageSales,
        refillSales: inventoryData.salesData.refillSales,
        totalSales:
          inventoryData.salesData.packageSales +
          inventoryData.salesData.refillSales,
        packagePurchase: inventoryData.purchaseData.packagePurchase,
        refillPurchase: inventoryData.purchaseData.refillPurchase,
        emptyCylindersBuySell: inventoryData.purchaseData.emptyCylindersBuySell,
        fullCylinders: inventoryData.fullCylinders,
        emptyCylinders: inventoryData.emptyCylinders,
        totalCylinders: inventoryData.totalCylinders,
      },
    });
  }

  /**
   * Check if product is below low stock threshold
   */
  async checkLowStockAlert(
    tenantId: string,
    productId: string
  ): Promise<{
    isLowStock: boolean;
    currentStock: number;
    threshold: number;
  }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { lowStockThreshold: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const currentLevels = await this.getCurrentInventoryLevels(
      tenantId,
      productId
    );

    return {
      isLowStock: currentLevels.fullCylinders <= product.lowStockThreshold,
      currentStock: currentLevels.fullCylinders,
      threshold: product.lowStockThreshold,
    };
  }
}
