// Receivables Business Logic
// Implements exact formulas from PRD for cash and cylinder receivables tracking

import { PrismaClient, SaleType } from '@prisma/client';

export interface ReceivablesCalculationData {
  date: Date;
  tenantId: string;
  driverId: string;
  previousCashReceivables: number;
  previousCylinderReceivables: number;
}

export interface DailySalesRevenue {
  totalRevenue: number;
  cashDeposited: number;
  cylindersDeposited: number;
  discounts: number;
  refillSales: number;
}

export interface ReceivablesResult {
  cashReceivablesChange: number;
  cylinderReceivablesChange: number;
  totalCashReceivables: number;
  totalCylinderReceivables: number;
  salesRevenue: DailySalesRevenue;
}

// Critical Business Formula: Receivables Calculations
export class ReceivablesCalculator {
  constructor(private prisma: PrismaClient) {}

  /**
   * Core receivables calculation using exact PRD formulas:
   * - Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
   * - Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
   *
   * Note: For drivers with no sales activity, preserve existing receivables (from onboarding)
   */
  async calculateReceivablesForDate(
    data: ReceivablesCalculationData
  ): Promise<ReceivablesResult> {
    const {
      date,
      tenantId,
      driverId,
      previousCashReceivables,
      previousCylinderReceivables,
    } = data;

    // Get daily sales revenue data
    const salesRevenue = await this.getDailySalesRevenue(
      tenantId,
      driverId,
      date
    );

    // Check if driver has any sales activity
    const hasSalesActivity =
      salesRevenue.totalRevenue > 0 ||
      salesRevenue.cashDeposited > 0 ||
      salesRevenue.cylindersDeposited > 0 ||
      salesRevenue.discounts > 0;

    // If no sales activity and there are existing receivables, preserve them
    // This protects initial balances set during onboarding
    if (
      !hasSalesActivity &&
      (previousCashReceivables > 0 || previousCylinderReceivables > 0)
    ) {
      return {
        cashReceivablesChange: 0,
        cylinderReceivablesChange: 0,
        totalCashReceivables: previousCashReceivables,
        totalCylinderReceivables: previousCylinderReceivables,
        salesRevenue,
      };
    }

    // Apply exact PRD formulas for active drivers
    // Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
    const cashReceivablesChange =
      salesRevenue.totalRevenue -
      salesRevenue.cashDeposited -
      salesRevenue.discounts;

    // Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
    const cylinderReceivablesChange =
      salesRevenue.refillSales - salesRevenue.cylindersDeposited;

    // Calculate running totals - include onboarding receivables
    const totalCashReceivables =
      previousCashReceivables + cashReceivablesChange;
    const totalCylinderReceivables =
      previousCylinderReceivables + cylinderReceivablesChange;

    return {
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables,
      totalCylinderReceivables,
      salesRevenue,
    };
  }

  /**
   * Get daily sales revenue data for a specific driver and date
   */
  private async getDailySalesRevenue(
    tenantId: string,
    driverId: string,
    date: Date
  ): Promise<DailySalesRevenue> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        driverId,
        saleDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        saleType: true,
        quantity: true,
        totalValue: true,
        discount: true,
        cashDeposited: true,
        cylindersDeposited: true,
      },
    });

    // Calculate total revenue (sum of all total values)
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalValue, 0);

    // Calculate total cash deposited
    const cashDeposited = sales.reduce(
      (sum, sale) => sum + sale.cashDeposited,
      0
    );

    // Calculate total cylinders deposited
    const cylindersDeposited = sales.reduce(
      (sum, sale) => sum + sale.cylindersDeposited,
      0
    );

    // Calculate total discounts
    const discounts = sales.reduce((sum, sale) => sum + sale.discount, 0);

    // Calculate refill sales quantity (for cylinder receivables)
    const refillSales = sales
      .filter((sale) => sale.saleType === SaleType.REFILL)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    return {
      totalRevenue,
      cashDeposited,
      cylindersDeposited,
      discounts,
      refillSales,
    };
  }

  /**
   * Get current receivables balances for a driver
   * This method ensures onboarding receivables are included in calculations
   */
  async getCurrentReceivablesBalances(
    tenantId: string,
    driverId: string
  ): Promise<{
    cashReceivables: number;
    cylinderReceivables: number;
  }> {
    // Get the most recent receivables record
    const latestRecord = await this.prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (latestRecord) {
      return {
        cashReceivables: latestRecord.totalCashReceivables,
        cylinderReceivables: latestRecord.totalCylinderReceivables,
      };
    }

    // If no records exist, return zeros
    return {
      cashReceivables: 0,
      cylinderReceivables: 0,
    };
  }

  /**
   * Get previous day's receivables or onboarding receivables for first calculation
   */
  async getPreviousReceivables(
    tenantId: string,
    driverId: string,
    date: Date
  ): Promise<{
    cashReceivables: number;
    cylinderReceivables: number;
  }> {
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    yesterday.setHours(0, 0, 0, 0);

    // First try to get yesterday's record
    const yesterdayRecord = await this.prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId,
        date: {
          gte: yesterday,
          lt: date,
        },
      },
      orderBy: { date: 'desc' },
    });

    if (yesterdayRecord) {
      return {
        cashReceivables: yesterdayRecord.totalCashReceivables,
        cylinderReceivables: yesterdayRecord.totalCylinderReceivables,
      };
    }

    // If no yesterday record, check for onboarding receivables (first record)
    const onboardingRecord = await this.prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId,
      },
      orderBy: { date: 'asc' },
    });

    if (onboardingRecord) {
      return {
        cashReceivables: onboardingRecord.totalCashReceivables,
        cylinderReceivables: onboardingRecord.totalCylinderReceivables,
      };
    }

    // If no records exist, return zeros
    return {
      cashReceivables: 0,
      cylinderReceivables: 0,
    };
  }

  /**
   * Update or create receivables record for a specific date and driver
   */
  async updateReceivablesRecord(
    tenantId: string,
    driverId: string,
    date: Date,
    receivablesData: ReceivablesResult
  ): Promise<void> {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    await this.prisma.receivableRecord.upsert({
      where: {
        tenantId_driverId_date: {
          tenantId,
          driverId,
          date: dateOnly,
        },
      },
      update: {
        cashReceivablesChange: receivablesData.cashReceivablesChange,
        cylinderReceivablesChange: receivablesData.cylinderReceivablesChange,
        totalCashReceivables: receivablesData.totalCashReceivables,
        totalCylinderReceivables: receivablesData.totalCylinderReceivables,
        calculatedAt: new Date(),
      },
      create: {
        tenantId,
        driverId,
        date: dateOnly,
        cashReceivablesChange: receivablesData.cashReceivablesChange,
        cylinderReceivablesChange: receivablesData.cylinderReceivablesChange,
        totalCashReceivables: receivablesData.totalCashReceivables,
        totalCylinderReceivables: receivablesData.totalCylinderReceivables,
      },
    });
  }

  /**
   * Get receivables summary for all drivers
   */
  async getReceivablesSummary(
    tenantId: string,
    date?: Date
  ): Promise<{
    totalCashReceivables: number;
    totalCylinderReceivables: number;
    driverBreakdown: Array<{
      driverId: string;
      driverName: string;
      cashReceivables: number;
      cylinderReceivables: number;
    }>;
  }> {
    const targetDate = date || new Date();
    const dateOnly = new Date(targetDate);
    dateOnly.setHours(0, 0, 0, 0);

    // Get latest receivables for each driver up to target date
    const receivables = await this.prisma.receivableRecord.findMany({
      where: {
        tenantId,
        date: {
          lte: dateOnly,
        },
      },
      include: {
        driver: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ driverId: 'asc' }, { date: 'desc' }],
    });

    // Get the latest record for each driver
    const latestByDriver = new Map<string, (typeof receivables)[0]>();

    for (const record of receivables) {
      if (!latestByDriver.has(record.driverId)) {
        latestByDriver.set(record.driverId, record);
      }
    }

    const driverBreakdown = Array.from(latestByDriver.values()).map(
      (record) => ({
        driverId: record.driverId,
        driverName: record.driver.name,
        cashReceivables: record.totalCashReceivables,
        cylinderReceivables: record.totalCylinderReceivables,
      })
    );

    const totalCashReceivables = driverBreakdown.reduce(
      (sum, driver) => sum + driver.cashReceivables,
      0
    );

    const totalCylinderReceivables = driverBreakdown.reduce(
      (sum, driver) => sum + driver.cylinderReceivables,
      0
    );

    return {
      totalCashReceivables,
      totalCylinderReceivables,
      driverBreakdown,
    };
  }

  /**
   * Get driver performance metrics based on receivables
   */
  async getDriverPerformanceMetrics(
    tenantId: string,
    driverId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalSalesRevenue: number;
    totalCashCollected: number;
    totalCylindersCollected: number;
    collectionEfficiency: number;
    outstandingCash: number;
    outstandingCylinders: number;
  }> {
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        driverId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalValue: true,
        cashDeposited: true,
        cylindersDeposited: true,
        saleType: true,
        quantity: true,
      },
    });

    const totalSalesRevenue = sales.reduce(
      (sum, sale) => sum + sale.totalValue,
      0
    );
    const totalCashCollected = sales.reduce(
      (sum, sale) => sum + sale.cashDeposited,
      0
    );
    const totalCylindersCollected = sales.reduce(
      (sum, sale) => sum + sale.cylindersDeposited,
      0
    );

    const totalRefillSales = sales
      .filter((sale) => sale.saleType === SaleType.REFILL)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    // Collection efficiency metrics
    const cashCollectionEfficiency =
      totalSalesRevenue > 0
        ? (totalCashCollected / totalSalesRevenue) * 100
        : 100;

    const cylinderCollectionEfficiency =
      totalRefillSales > 0
        ? (totalCylindersCollected / totalRefillSales) * 100
        : 100;

    const collectionEfficiency =
      (cashCollectionEfficiency + cylinderCollectionEfficiency) / 2;

    // Get current outstanding amounts
    const currentReceivables = await this.getCurrentReceivablesBalances(
      tenantId,
      driverId
    );

    return {
      totalSalesRevenue,
      totalCashCollected,
      totalCylindersCollected,
      collectionEfficiency,
      outstandingCash: currentReceivables.cashReceivables,
      outstandingCylinders: currentReceivables.cylinderReceivables,
    };
  }

  /**
   * Record receivables payment/collection
   */
  async recordReceivablesCollection(
    tenantId: string,
    driverId: string,
    cashAmount: number,
    cylinderQuantity: number
  ): Promise<void> {
    // Get current balances
    const currentBalances = await this.getCurrentReceivablesBalances(
      tenantId,
      driverId
    );

    // Calculate new balances
    const newCashReceivables = Math.max(
      0,
      currentBalances.cashReceivables - cashAmount
    );
    const newCylinderReceivables = Math.max(
      0,
      currentBalances.cylinderReceivables - cylinderQuantity
    );

    // Create adjustment record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.updateReceivablesRecord(tenantId, driverId, today, {
      cashReceivablesChange: -cashAmount,
      cylinderReceivablesChange: -cylinderQuantity,
      totalCashReceivables: newCashReceivables,
      totalCylinderReceivables: newCylinderReceivables,
      salesRevenue: {
        totalRevenue: 0,
        cashDeposited: cashAmount,
        cylindersDeposited: cylinderQuantity,
        discounts: 0,
        refillSales: 0,
      },
    });
  }
}
