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
   * - Cash Receivables = Yesterday's Total + (Sales Revenue - Cash Deposits - Discounts) + Today's Onboarding Receivables
   * - Cylinder Receivables = Yesterday's Total + (Refill Sales - Cylinder Deposits) + Today's Onboarding Receivables
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

    console.log(
      `💰 Sales revenue data for driver ${driverId} on ${date.toISOString().split('T')[0]}:`,
      salesRevenue
    );

    // Check if there are onboarding receivables for today's date
    const todaysOnboardingReceivables = await this.getTodaysOnboardingReceivables(
      tenantId,
      driverId,
      date
    );

    console.log(
      `🎯 Today's onboarding receivables for driver ${driverId}:`,
      todaysOnboardingReceivables
    );

    // Apply exact PRD formulas:
    // Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
    const salesCashChange =
      salesRevenue.totalRevenue -
      salesRevenue.cashDeposited -
      salesRevenue.discounts;

    // Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
    const salesCylinderChange =
      salesRevenue.refillSales - salesRevenue.cylindersDeposited;

    // CORRECTED FORMULA: Previous Day's Total + Today's Sales Changes + Today's Onboarding
    // totalCashReceivables = cashReceivablesChange + onboardingCashReceivables + PREVIOUS DAY'S totalCashReceivables
    const cashReceivablesChange = salesCashChange; // Only sales changes (not including onboarding)
    const cylinderReceivablesChange = salesCylinderChange; // Only sales changes (not including onboarding)
    
    const totalCashReceivables = 
      cashReceivablesChange + 
      todaysOnboardingReceivables.cash + 
      previousCashReceivables;
      
    const totalCylinderReceivables = 
      cylinderReceivablesChange + 
      todaysOnboardingReceivables.cylinders + 
      previousCylinderReceivables;

    console.log(
      `🧮 DETAILED RECEIVABLES CALCULATION for driver ${driverId}:`,
      {
        "STEP 1 - Previous (Yesterday)": {
          previousCash: previousCashReceivables,
          previousCylinders: previousCylinderReceivables,
        },
        "STEP 2 - Sales Changes": {
          salesRevenue: salesRevenue.totalRevenue,
          cashDeposited: salesRevenue.cashDeposited,
          discounts: salesRevenue.discounts,
          salesCashChange: salesCashChange,
          salesCylinderChange: salesCylinderChange,
        },
        "STEP 3 - Today's Onboarding": {
          onboardingCash: todaysOnboardingReceivables.cash,
          onboardingCylinders: todaysOnboardingReceivables.cylinders,
        },
        "STEP 4 - FINAL CALCULATION": {
          formula: "cashReceivablesChange + onboardingCashReceivables + previousDay's totalCashReceivables",
          calculation: `${cashReceivablesChange} + ${todaysOnboardingReceivables.cash} + ${previousCashReceivables}`,
          finalCash: totalCashReceivables,
          finalCylinders: totalCylinderReceivables,
        },
        "EXPECTED FOR BABLU": {
          onboarding: 2000,
          sales: 5000,
          expected: 7000,
          actual: totalCashReceivables,
          correct: totalCashReceivables === 7000 ? "✅ CORRECT" : "❌ WRONG"
        }
      }
    );

    return {
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables,
      totalCylinderReceivables,
      salesRevenue,
    };
  }

  /**
   * Get onboarding receivables for today's date (if any)
   * This handles cases where onboarding happens on the same day as sales
   */
  private async getTodaysOnboardingReceivables(
    tenantId: string,
    driverId: string,
    date: Date
  ): Promise<{
    cash: number;
    cylinders: number;
  }> {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // Check if there's an onboarding record for today using the new onboarding columns
    const onboardingRecord = await this.prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId,
        date: dateOnly,
        // Look for records with onboarding values
        OR: [
          { onboardingCashReceivables: { gt: 0 } },
          { onboardingCylinderReceivables: { gt: 0 } }
        ]
      },
    });

    if (onboardingRecord) {
      console.log(
        `🎯 Found onboarding record for driver ${driverId} on ${dateOnly.toISOString().split('T')[0]}:`,
        {
          cash: onboardingRecord.onboardingCashReceivables,
          cylinders: onboardingRecord.onboardingCylinderReceivables,
        }
      );

      return {
        cash: onboardingRecord.onboardingCashReceivables,
        cylinders: onboardingRecord.onboardingCylinderReceivables,
      };
    }

    console.log(
      `🎯 No onboarding record found for driver ${driverId} on ${dateOnly.toISOString().split('T')[0]}`
    );

    return {
      cash: 0,
      cylinders: 0,
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
   * Get previous receivables for a specific date (excludes today's onboarding)
   * Returns the most recent receivables record before the given date
   * This should be yesterday's totals, not including today's onboarding
   */
  async getPreviousReceivables(
    tenantId: string,
    driverId: string,
    date: Date
  ): Promise<{
    cashReceivables: number;
    cylinderReceivables: number;
  }> {
    // Debug: Show all records for this driver
    const allRecords = await this.prisma.receivableRecord.findMany({
      where: {
        tenantId,
        driverId,
      },
      orderBy: { date: 'desc' },
    });

    console.log(
      `🔍 All receivables records for driver ${driverId}:`,
      allRecords.map(r => ({
        id: r.id,
        date: r.date.toISOString().split('T')[0],
        totalCash: r.totalCashReceivables,
        totalCylinders: r.totalCylinderReceivables,
        cashChange: r.cashReceivablesChange,
        cylinderChange: r.cylinderReceivablesChange,
        onboardingCash: r.onboardingCashReceivables || 0,
        onboardingCylinders: r.onboardingCylinderReceivables || 0,
      }))
    );

    // Check for duplicate records for the same date (should not happen with unique constraint)
    const todayRecords = allRecords.filter(r => 
      r.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
    
    if (todayRecords.length > 1) {
      console.error(
        `⚠️ DUPLICATE RECORDS FOUND for driver ${driverId} on ${date.toISOString().split('T')[0]}:`,
        todayRecords.map(r => ({
          id: r.id,
          onboardingCash: r.onboardingCashReceivables,
          totalCash: r.totalCashReceivables,
        }))
      );
    }

    // Get yesterday's date
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    yesterday.setHours(0, 0, 0, 0);

    // Get the most recent receivables record from yesterday or before
    // This excludes today's onboarding record to avoid double-counting
    const previousRecord = await this.prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId,
        date: {
          lte: yesterday,
        },
      },
      orderBy: { date: 'desc' },
    });

    if (previousRecord) {
      console.log(
        `📊 Found previous (yesterday's) receivables for driver ${driverId}:`,
        {
          id: previousRecord.id,
          date: previousRecord.date.toISOString().split('T')[0],
          cash: previousRecord.totalCashReceivables,
          cylinders: previousRecord.totalCylinderReceivables,
          cashChange: previousRecord.cashReceivablesChange,
          cylinderChange: previousRecord.cylinderReceivablesChange,
        }
      );
      
      return {
        cashReceivables: previousRecord.totalCashReceivables,
        cylinderReceivables: previousRecord.totalCylinderReceivables,
      };
    }

    console.log(`📊 No previous (yesterday's) receivables found for driver ${driverId} - using zeros`);
    
    // If no records exist, return zeros (first day after onboarding)
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

    console.log(
      `💾 Upserting receivables record for driver ${driverId} on ${dateOnly.toISOString().split('T')[0]}:`,
      {
        cashChange: receivablesData.cashReceivablesChange,
        cylinderChange: receivablesData.cylinderReceivablesChange,
        totalCash: receivablesData.totalCashReceivables,
        totalCylinders: receivablesData.totalCylinderReceivables,
      }
    );

    // Check if there's an existing record to merge with (especially onboarding data)
    const existingRecord = await this.prisma.receivableRecord.findUnique({
      where: {
        tenantId_driverId_date: {
          tenantId,
          driverId,
          date: dateOnly,
        },
      },
    });

    console.log(
      `🔍 Existing record check for driver ${driverId} on ${dateOnly.toISOString().split('T')[0]}:`,
      existingRecord ? {
        id: existingRecord.id,
        onboardingCash: existingRecord.onboardingCashReceivables,
        onboardingCylinders: existingRecord.onboardingCylinderReceivables,
        currentTotalCash: existingRecord.totalCashReceivables,
        currentTotalCylinders: existingRecord.totalCylinderReceivables,
      } : "No existing record found"
    );

    const result = await this.prisma.receivableRecord.upsert({
      where: {
        tenantId_driverId_date: {
          tenantId,
          driverId,
          date: dateOnly,
        },
      },
      update: {
        // Update only sales-related changes (not including onboarding)
        cashReceivablesChange: receivablesData.cashReceivablesChange,
        cylinderReceivablesChange: receivablesData.cylinderReceivablesChange,
        totalCashReceivables: receivablesData.totalCashReceivables,
        totalCylinderReceivables: receivablesData.totalCylinderReceivables,
        calculatedAt: new Date(),
        // PRESERVE existing onboarding values - don't overwrite them
        onboardingCashReceivables: existingRecord?.onboardingCashReceivables || 0,
        onboardingCylinderReceivables: existingRecord?.onboardingCylinderReceivables || 0,
      },
      create: {
        tenantId,
        driverId,
        date: dateOnly,
        cashReceivablesChange: receivablesData.cashReceivablesChange,
        cylinderReceivablesChange: receivablesData.cylinderReceivablesChange,
        totalCashReceivables: receivablesData.totalCashReceivables,
        totalCylinderReceivables: receivablesData.totalCylinderReceivables,
        // New records have zero onboarding (sales-only day)
        onboardingCashReceivables: 0,
        onboardingCylinderReceivables: 0,
      },
    });

    console.log(
      `✅ Receivables record saved with ID: ${result.id}`,
      {
        totalCash: result.totalCashReceivables,
        totalCylinders: result.totalCylinderReceivables,
      }
    );
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
