// Inventory Business Logic
// Implements exact formulas from PRD for LPG cylinder inventory management

import { PrismaClient, SaleType, PurchaseType, ShipmentType, ShipmentStatus, MovementType } from "@prisma/client";

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
   * - Today's Empty Cylinders = Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell
   */
  async calculateInventoryForDate(data: InventoryCalculationData): Promise<InventoryResult> {
    const { date, tenantId, productId, previousFullCylinders, previousEmptyCylinders } = data;

    // Get sales data for the date
    const salesData = await this.getSalesData(tenantId, date, productId);
    
    // Get purchase data for the date
    const purchaseData = await this.getPurchaseData(tenantId, date, productId);

    // Apply exact PRD formulas
    const totalSales = salesData.packageSales + salesData.refillSales;
    
    // Today's Full Cylinders = Yesterday's Full + Package Purchase + Refill Purchase - Total Sales
    const fullCylinders = previousFullCylinders + 
                         purchaseData.packagePurchase + 
                         purchaseData.refillPurchase - 
                         totalSales;

    // Today's Empty Cylinders = Yesterday's Empty + Refill Sales + Empty Cylinders Buy/Sell
    const emptyCylinders = previousEmptyCylinders + 
                          salesData.refillSales + 
                          purchaseData.emptyCylindersBuySell;

    const totalCylinders = fullCylinders + emptyCylinders;

    return {
      fullCylinders,
      emptyCylinders,
      totalCylinders,
      salesData,
      purchaseData
    };
  }

  /**
   * Get sales data for a specific date
   */
  private async getSalesData(tenantId: string, date: Date, productId?: string): Promise<SalesData> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause = {
      tenantId,
      saleDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      ...(productId && { productId })
    };

    const sales = await this.prisma.sale.findMany({
      where: whereClause,
      select: {
        saleType: true,
        quantity: true
      }
    });

    const packageSales = sales
      .filter(sale => sale.saleType === SaleType.PACKAGE)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    const refillSales = sales
      .filter(sale => sale.saleType === SaleType.REFILL)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    return { packageSales, refillSales };
  }

  /**
   * Get purchase data for a specific date
   * Uses the same logic as daily inventory API - pulling from COMPLETED shipments
   */
  private async getPurchaseData(tenantId: string, date: Date, productId?: string): Promise<PurchaseData> {
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
          lte: endOfDay
        },
        // Package purchases are those without 'REFILL:' in notes
        OR: [
          { notes: { not: { contains: 'REFILL:' } } },
          { notes: null }
        ],
        ...(productId && { productId })
      },
      select: {
        quantity: true
      }
    });

    // Refill Purchase: Total refills purchased from COMPLETED shipments (INCOMING_FULL with REFILL notes)
    const refillPurchaseShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.INCOMING_FULL,
        status: ShipmentStatus.COMPLETED,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        notes: {
          contains: 'REFILL:'
        },
        ...(productId && { productId })
      },
      select: {
        quantity: true
      }
    });

    // Empty Cylinders Buy: From COMPLETED shipments (INCOMING_EMPTY)
    const emptyBuyShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.INCOMING_EMPTY,
        status: ShipmentStatus.COMPLETED,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        ...(productId && { productId })
      },
      select: {
        quantity: true
      }
    });

    // Empty Cylinders Sell: From COMPLETED shipments (OUTGOING_EMPTY)
    const emptySellShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        shipmentType: ShipmentType.OUTGOING_EMPTY,
        status: ShipmentStatus.COMPLETED,
        shipmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        ...(productId && { productId })
      },
      select: {
        quantity: true
      }
    });

    const packagePurchase = packagePurchaseShipments.reduce((sum, item) => sum + item.quantity, 0);
    const refillPurchase = refillPurchaseShipments.reduce((sum, item) => sum + item.quantity, 0);
    const emptyCylindersBuy = emptyBuyShipments.reduce((sum, item) => sum + item.quantity, 0);
    const emptyCylindersSell = emptySellShipments.reduce((sum, item) => sum + item.quantity, 0);
    const emptyCylindersBuySell = emptyCylindersBuy - emptyCylindersSell;

    return {
      packagePurchase,
      refillPurchase,
      emptyCylindersBuySell
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
        driverId
      }
    });
  }

  /**
   * Get current inventory levels for a product
   * Calculates real-time inventory based on all sales and completed shipments
   */
  async getCurrentInventoryLevels(tenantId: string, productId: string): Promise<{
    fullCylinders: number;
    emptyCylinders: number;
    totalCylinders: number;
  }> {
    // Calculate real-time inventory by summing all transactions
    
    // 1. Get all sales (reduces full cylinders, refill sales add empty cylinders)
    const allSales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        productId
      },
      select: {
        saleType: true,
        quantity: true
      }
    });

    const packageSales = allSales
      .filter(sale => sale.saleType === SaleType.PACKAGE)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    const refillSales = allSales
      .filter(sale => sale.saleType === SaleType.REFILL)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    // 2. Get all COMPLETED shipments for purchases
    const completedShipments = await this.prisma.shipment.findMany({
      where: {
        tenantId,
        productId,
        status: ShipmentStatus.COMPLETED
      },
      select: {
        shipmentType: true,
        quantity: true,
        notes: true
      }
    });

    // Package purchases (INCOMING_FULL without REFILL notes)
    const packagePurchases = completedShipments
      .filter(shipment => 
        shipment.shipmentType === ShipmentType.INCOMING_FULL &&
        (!shipment.notes || !shipment.notes.includes('REFILL:'))
      )
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    // Refill purchases (INCOMING_FULL with REFILL notes)
    const refillPurchases = completedShipments
      .filter(shipment => 
        shipment.shipmentType === ShipmentType.INCOMING_FULL &&
        shipment.notes && shipment.notes.includes('REFILL:')
      )
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    // Empty cylinder transactions
    const emptyBuys = completedShipments
      .filter(shipment => shipment.shipmentType === ShipmentType.INCOMING_EMPTY)
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    const emptySells = completedShipments
      .filter(shipment => shipment.shipmentType === ShipmentType.OUTGOING_EMPTY)
      .reduce((sum, shipment) => sum + shipment.quantity, 0);

    // 3. Apply business formulas
    const totalSales = packageSales + refillSales;
    const totalPurchases = packagePurchases + refillPurchases;
    const emptyCylindersBuySell = emptyBuys - emptySells;

    // Full Cylinders = Total Purchases - Total Sales
    const fullCylinders = Math.max(0, totalPurchases - totalSales);

    // Empty Cylinders = Refill Sales + Empty Cylinders Buy/Sell
    const emptyCylinders = Math.max(0, refillSales + emptyCylindersBuySell);

    const totalCylinders = fullCylinders + emptyCylinders;

    // Debug logging for real-time inventory calculation
    console.log(`Real-time inventory for product ${productId}:`, {
      packageSales,
      refillSales,
      totalSales,
      packagePurchases,
      refillPurchases,
      totalPurchases,
      emptyBuys,
      emptySells,
      emptyCylindersBuySell,
      fullCylinders,
      emptyCylinders,
      totalCylinders
    });

    return {
      fullCylinders,
      emptyCylinders,
      totalCylinders
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

    await this.prisma.inventoryRecord.upsert({
      where: {
        tenantId_date_productId: {
          tenantId,
          date: dateOnly,
          productId: productId as string
        }
      },
      update: {
        packageSales: inventoryData.salesData.packageSales,
        refillSales: inventoryData.salesData.refillSales,
        totalSales: inventoryData.salesData.packageSales + inventoryData.salesData.refillSales,
        packagePurchase: inventoryData.purchaseData.packagePurchase,
        refillPurchase: inventoryData.purchaseData.refillPurchase,
        emptyCylindersBuySell: inventoryData.purchaseData.emptyCylindersBuySell,
        fullCylinders: inventoryData.fullCylinders,
        emptyCylinders: inventoryData.emptyCylinders,
        totalCylinders: inventoryData.totalCylinders,
        calculatedAt: new Date()
      },
      create: {
        tenantId,
        date: dateOnly,
        productId,
        packageSales: inventoryData.salesData.packageSales,
        refillSales: inventoryData.salesData.refillSales,
        totalSales: inventoryData.salesData.packageSales + inventoryData.salesData.refillSales,
        packagePurchase: inventoryData.purchaseData.packagePurchase,
        refillPurchase: inventoryData.purchaseData.refillPurchase,
        emptyCylindersBuySell: inventoryData.purchaseData.emptyCylindersBuySell,
        fullCylinders: inventoryData.fullCylinders,
        emptyCylinders: inventoryData.emptyCylinders,
        totalCylinders: inventoryData.totalCylinders
      }
    });
  }

  /**
   * Check if product is below low stock threshold
   */
  async checkLowStockAlert(tenantId: string, productId: string): Promise<{
    isLowStock: boolean;
    currentStock: number;
    threshold: number;
  }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { lowStockThreshold: true }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const currentLevels = await this.getCurrentInventoryLevels(tenantId, productId);
    
    return {
      isLowStock: currentLevels.fullCylinders <= product.lowStockThreshold,
      currentStock: currentLevels.fullCylinders,
      threshold: product.lowStockThreshold
    };
  }
}