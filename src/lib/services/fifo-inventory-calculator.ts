import { prisma } from '@/lib/prisma';

interface ShipmentRecord {
  id: string;
  productId: string;
  shipmentType: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  shipmentDate: Date;
  remaining?: number; // For FIFO tracking
}

interface SaleRecord {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  saleDate: Date;
}

interface FifoInventoryBatch {
  shipmentId: string;
  productId: string;
  unitCost: number;
  originalQuantity: number;
  remainingQuantity: number;
  shipmentDate: Date;
}

interface FifoCalculationResult {
  productId: string;
  totalSoldQuantity: number;
  totalCOGS: number; // Cost of Goods Sold using FIFO
  averageBuyingPrice: number; // COGS / Total Sold Quantity
  totalSalesRevenue: number; // Total revenue from specified sale type (FIFO allocated)
  averageSellingPrice: number; // Total Sales Revenue / Total Sold Quantity for specified sale type
  remainingInventoryValue: number;
  remainingInventoryBatches: FifoInventoryBatch[];
}

export class FifoInventoryCalculator {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Extract price from shipment notes for FIFO calculations based on sale type
   * Notes format: "PACKAGE: Gas: ৳150/unit, Cylinder: ৳200/unit | Driver: ..."
   * For refill sales: use gas price only (cylinders are returned)
   * For package sales: use total price (gas + cylinder)
   */
  private extractPriceFromNotes(
    notes: string | null,
    saleType: 'REFILL' | 'PACKAGE'
  ): number | null {
    if (!notes) return null;

    // Look for gas price pattern in notes
    const gasPriceMatch = notes.match(/Gas:\s*৳?(\d+(?:\.\d+)?)/i);
    const cylinderPriceMatch = notes.match(/Cylinder:\s*৳?(\d+(?:\.\d+)?)/i);

    const gasPrice = gasPriceMatch ? parseFloat(gasPriceMatch[1]) : 0;
    const cylinderPrice = cylinderPriceMatch
      ? parseFloat(cylinderPriceMatch[1])
      : 0;

    // For refill sales, use only gas price since cylinders are returned
    if (saleType === 'REFILL') {
      return gasPrice > 0 ? gasPrice : null;
    }

    // For package sales, use total price (gas + cylinder)
    if (saleType === 'PACKAGE') {
      const totalPrice = gasPrice + cylinderPrice;
      return totalPrice > 0 ? totalPrice : null;
    }

    return null;
  }

  /**
   * Calculate FIFO-based average buying prices for all products in a given month
   * @param year - Target year
   * @param month - Target month (1-12)
   * @param driverId - Optional driver filter
   * @param saleType - Optional sale type filter ('REFILL' or 'PACKAGE'), defaults to 'REFILL'
   * @returns Map of productId to FifoCalculationResult
   */
  async calculateMonthlyFifoAnalytics(
    year: number,
    month: number,
    driverId?: string,
    saleType: 'REFILL' | 'PACKAGE' = 'REFILL'
  ): Promise<Map<string, FifoCalculationResult>> {
    // Calculate date range for the month
    const monthStartDate = new Date(year, month - 1, 1);
    const monthEndDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all products for the tenant
    const products = await prisma.product.findMany({
      where: { tenantId: this.tenantId },
      select: { id: true },
    });

    const results = new Map<string, FifoCalculationResult>();

    // Calculate FIFO for each product
    for (const product of products) {
      const fifoResult = await this.calculateProductFifo(
        product.id,
        monthStartDate,
        monthEndDate,
        driverId,
        saleType
      );
      results.set(product.id, fifoResult);
    }

    return results;
  }

  /**
   * Calculate FIFO for a single product within a date range
   */
  private async calculateProductFifo(
    productId: string,
    monthStartDate: Date,
    monthEndDate: Date,
    driverId?: string,
    saleType: 'REFILL' | 'PACKAGE' = 'REFILL'
  ): Promise<FifoCalculationResult> {
    // Get all shipments (purchases) for this product up to the end of the month
    // We need all historical shipments to maintain proper FIFO order
    const shipments = await prisma.shipment.findMany({
      where: {
        tenantId: this.tenantId,
        productId,
        shipmentType: 'INCOMING_FULL', // Only incoming full cylinders are purchases
        shipmentDate: {
          lte: monthEndDate, // All shipments up to the end of the month
        },
        unitCost: {
          not: null, // Only shipments with cost data
        },
      },
      select: {
        id: true,
        productId: true,
        shipmentType: true,
        quantity: true,
        unitCost: true,
        totalCost: true,
        shipmentDate: true,
        notes: true, // Include notes to extract gas price
      },
      orderBy: {
        shipmentDate: 'asc', // FIFO order: First In
      },
    });

    // Get sales for this product within the month based on specified sale type
    const salesFilter: any = {
      tenantId: this.tenantId,
      productId,
      saleType: saleType, // Use specified sale type (REFILL or PACKAGE)
      saleDate: {
        gte: monthStartDate,
        lte: monthEndDate,
      },
    };

    if (driverId) {
      salesFilter.driverId = driverId;
    }

    const sales = await prisma.sale.findMany({
      where: salesFilter,
      orderBy: {
        saleDate: 'asc',
      },
    });

    // Convert to our internal format
    const shipmentRecords: ShipmentRecord[] = shipments.map((s) => ({
      id: s.id,
      productId: s.productId,
      shipmentType: s.shipmentType,
      quantity: s.quantity,
      unitCost:
        this.extractPriceFromNotes(s.notes, saleType) || s.unitCost || 0,
      totalCost:
        (this.extractPriceFromNotes(s.notes, saleType) || s.unitCost || 0) *
        s.quantity,
      shipmentDate: s.shipmentDate,
      remaining: s.quantity, // Initially, all quantity is remaining
    }));

    const saleRecords: SaleRecord[] = sales.map((s) => ({
      id: s.id,
      productId: s.productId,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      totalValue: s.totalValue,
      saleDate: s.saleDate,
    }));

    // Now calculate FIFO
    return this.processFifoCalculation(productId, shipmentRecords, saleRecords);
  }

  /**
   * Process FIFO calculation for a product
   */
  private processFifoCalculation(
    productId: string,
    shipments: ShipmentRecord[],
    sales: SaleRecord[]
  ): FifoCalculationResult {
    // Create inventory batches from shipments
    const inventoryBatches: FifoInventoryBatch[] = shipments.map(
      (shipment) => ({
        shipmentId: shipment.id,
        productId: shipment.productId,
        unitCost: shipment.unitCost,
        originalQuantity: shipment.quantity,
        remainingQuantity: shipment.quantity,
        shipmentDate: shipment.shipmentDate,
      })
    );

    let totalSoldQuantity = 0;
    let totalCOGS = 0;
    let totalSalesRevenue = 0;

    // Process each sale using FIFO
    for (const sale of sales) {
      let saleQuantityRemaining = sale.quantity;
      totalSoldQuantity += sale.quantity;

      // Calculate revenue for this sale based on quantity actually allocated to batches
      let allocatedQuantity = 0;

      // Allocate sale quantity to inventory batches (FIFO: First In, First Out)
      for (const batch of inventoryBatches) {
        if (saleQuantityRemaining <= 0) break;
        if (batch.remainingQuantity <= 0) continue;

        // Take from this batch
        const quantityToTake = Math.min(
          saleQuantityRemaining,
          batch.remainingQuantity
        );
        const costForThisQuantity = quantityToTake * batch.unitCost;

        // Update totals
        totalCOGS += costForThisQuantity;
        allocatedQuantity += quantityToTake;

        // Update batch and sale remaining quantities
        batch.remainingQuantity -= quantityToTake;
        saleQuantityRemaining -= quantityToTake;
      }

      // Calculate revenue based on allocated quantity
      // Use the sale's unit price for the portion that was actually allocated
      if (allocatedQuantity > 0) {
        const revenueForAllocatedQuantity =
          (allocatedQuantity / sale.quantity) * sale.totalValue;
        totalSalesRevenue += revenueForAllocatedQuantity;
      }

      // If we still have sale quantity remaining but no inventory,
      // this indicates insufficient inventory data or negative inventory
      if (saleQuantityRemaining > 0) {
        console.warn(
          `Product ${productId}: Sale quantity ${saleQuantityRemaining} could not be allocated to inventory batches. ` +
            `This may indicate missing shipment data or negative inventory.`
        );
      }
    }

    // Calculate remaining inventory value
    let remainingInventoryValue = 0;
    const remainingBatches = inventoryBatches.filter(
      (batch) => batch.remainingQuantity > 0
    );

    for (const batch of remainingBatches) {
      remainingInventoryValue += batch.remainingQuantity * batch.unitCost;
    }

    // Calculate average buying price (COGS per unit sold)
    const averageBuyingPrice =
      totalSoldQuantity > 0 ? totalCOGS / totalSoldQuantity : 0;

    // Calculate average selling price (Total Sales Revenue per unit sold)
    const averageSellingPrice =
      totalSoldQuantity > 0 ? totalSalesRevenue / totalSoldQuantity : 0;

    return {
      productId,
      totalSoldQuantity,
      totalCOGS,
      averageBuyingPrice,
      totalSalesRevenue,
      averageSellingPrice,
      remainingInventoryValue,
      remainingInventoryBatches: remainingBatches,
    };
  }

  /**
   * Get current inventory status using FIFO for a specific product
   */
  async getCurrentInventoryStatus(productId: string): Promise<{
    totalQuantity: number;
    totalValue: number;
    averageCost: number;
    batches: FifoInventoryBatch[];
  }> {
    const now = new Date();

    // Get all shipments for this product
    const shipments = await prisma.shipment.findMany({
      where: {
        tenantId: this.tenantId,
        productId,
        shipmentType: 'INCOMING_FULL',
        shipmentDate: { lte: now },
        unitCost: { not: null },
      },
      select: {
        id: true,
        productId: true,
        shipmentType: true,
        quantity: true,
        unitCost: true,
        totalCost: true,
        shipmentDate: true,
        notes: true, // Include notes to extract gas price
      },
      orderBy: { shipmentDate: 'asc' },
    });

    // Get all REFILL sales for this product (exclude package sales)
    const sales = await prisma.sale.findMany({
      where: {
        tenantId: this.tenantId,
        productId,
        saleType: 'REFILL', // Only refill sales for selling price calculation
        saleDate: { lte: now },
      },
      orderBy: { saleDate: 'asc' },
    });

    const shipmentRecords: ShipmentRecord[] = shipments.map((s) => ({
      id: s.id,
      productId: s.productId,
      shipmentType: s.shipmentType,
      quantity: s.quantity,
      unitCost:
        this.extractPriceFromNotes(s.notes, 'REFILL') || s.unitCost || 0, // Use gas price only for inventory valuation
      totalCost:
        (this.extractPriceFromNotes(s.notes, 'REFILL') || s.unitCost || 0) *
        s.quantity,
      shipmentDate: s.shipmentDate,
    }));

    const saleRecords: SaleRecord[] = sales.map((s) => ({
      id: s.id,
      productId: s.productId,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      totalValue: s.totalValue,
      saleDate: s.saleDate,
    }));

    const fifoResult = this.processFifoCalculation(
      productId,
      shipmentRecords,
      saleRecords
    );

    const totalQuantity = fifoResult.remainingInventoryBatches.reduce(
      (sum, batch) => sum + batch.remainingQuantity,
      0
    );

    const averageCost =
      totalQuantity > 0
        ? fifoResult.remainingInventoryValue / totalQuantity
        : 0;

    return {
      totalQuantity,
      totalValue: fifoResult.remainingInventoryValue,
      averageCost,
      batches: fifoResult.remainingInventoryBatches,
    };
  }
}
