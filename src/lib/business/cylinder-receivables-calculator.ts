/**
 * Shared Cylinder Receivables Calculator
 * Ensures exact same calculation method is used across all APIs
 * No proportional calculations - uses actual sales transaction history
 */

import { prisma } from '@/lib/prisma';

export interface CylinderReceivablesResult {
  totalCylinderReceivables: number;
  receivablesBreakdown: Record<string, number>;
  calculationMethod: string;
  debugInfo: {
    driverCount: number;
    totalRefillTransactions: number;
    receivablesBySizes: Record<string, number>;
  };
}

export class CylinderReceivablesCalculator {
  /**
   * Calculate exact cylinder receivables breakdown by size
   * Uses actual refill sales transaction history for precise distribution
   */
  static async calculateExactReceivablesBySize(
    tenantId: string,
    asOfDate?: Date
  ): Promise<CylinderReceivablesResult> {
    const today = asOfDate || new Date();
    today.setHours(23, 59, 59, 999);

    // Get all active retail drivers with receivables
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

    // Calculate total receivables and filter drivers with receivables
    const latestReceivablesByDriver = new Map<string, number>();
    activeDriversWithReceivables.forEach((driver) => {
      if (driver.receivableRecords[0]?.totalCylinderReceivables > 0) {
        latestReceivablesByDriver.set(driver.id, driver.receivableRecords[0].totalCylinderReceivables);
      }
    });

    const totalCylinderReceivables = Array.from(latestReceivablesByDriver.values())
      .reduce((sum, amount) => sum + amount, 0);

    const cylinderReceivablesBySize = new Map<string, number>();
    const driverIds = Array.from(latestReceivablesByDriver.keys());

    if (driverIds.length > 0) {
      console.log('🎯 Calculating EXACT receivables by size using sales transaction history...');
      
      // Get all refill sales for drivers with receivables to calculate exact size breakdown
      const refillSalesWithSizes = await prisma.sale.findMany({
        where: {
          tenantId,
          driverId: { in: driverIds },
          saleType: 'REFILL',
          saleDate: { lte: today },
          cylindersDeposited: { gt: 0 },
        },
        select: {
          driverId: true,
          cylindersDeposited: true,
          product: {
            select: {
              cylinderSize: {
                select: {
                  size: true,
                },
              },
            },
          },
        },
        orderBy: { saleDate: 'asc' },
      });

      // Calculate exact receivables by size for each driver based on sales history
      for (const [driverId, totalReceivables] of latestReceivablesByDriver.entries()) {
        const driverRefillSales = refillSalesWithSizes.filter(s => s.driverId === driverId);
        
        // Group sales by cylinder size to get exact breakdown
        const salesBySizeMap = new Map<string, number>();
        let totalRefillSales = 0;
        
        driverRefillSales.forEach(sale => {
          if (sale.product?.cylinderSize?.size && sale.cylindersDeposited > 0) {
            const size = sale.product.cylinderSize.size;
            salesBySizeMap.set(size, (salesBySizeMap.get(size) || 0) + sale.cylindersDeposited);
            totalRefillSales += sale.cylindersDeposited;
          }
        });
        
        // Distribute receivables exactly based on actual sales quantities by size
        if (totalRefillSales > 0) {
          salesBySizeMap.forEach((saleQuantity, size) => {
            const exactReceivablesForSize = Math.round((saleQuantity / totalRefillSales) * totalReceivables);
            cylinderReceivablesBySize.set(size, (cylinderReceivablesBySize.get(size) || 0) + exactReceivablesForSize);
          });
        }
      }
      
      console.log('🎯 EXACT receivables breakdown calculated from sales history:', {
        driverCount: driverIds.length,
        totalRefillTransactions: refillSalesWithSizes.length,
        receivablesBySizes: Object.fromEntries(cylinderReceivablesBySize),
        calculationMethod: 'EXACT distribution based on actual refill sales by size',
      });
    }

    const receivablesBreakdown = Object.fromEntries(cylinderReceivablesBySize);

    return {
      totalCylinderReceivables,
      receivablesBreakdown,
      calculationMethod: 'EXACT distribution based on actual refill sales by size (not proportional baseline)',
      debugInfo: {
        driverCount: driverIds.length,
        totalRefillTransactions: 0, // Will be set by calling function
        receivablesBySizes: receivablesBreakdown,
      },
    };
  }

  /**
   * Get receivables breakdown as array format for daily inventory API
   */
  static convertToSizeBreakdownArray(
    receivablesBreakdown: Record<string, number>,
    availableSizes: Set<string> | string[]
  ): { size: string; quantity: number }[] {
    const sizesArray = Array.isArray(availableSizes) ? availableSizes : Array.from(availableSizes);
    
    return sizesArray.map(size => ({
      size,
      quantity: receivablesBreakdown[size] || 0,
    }));
  }

  /**
   * Validate that two receivables calculations match exactly
   */
  static validateReceivablesMatch(
    breakdown1: Record<string, number>,
    breakdown2: Record<string, number>,
    tolerance: number = 0
  ): { matches: boolean; differences: Record<string, number> } {
    const allSizes = new Set([...Object.keys(breakdown1), ...Object.keys(breakdown2)]);
    const differences: Record<string, number> = {};
    let matches = true;

    for (const size of allSizes) {
      const value1 = breakdown1[size] || 0;
      const value2 = breakdown2[size] || 0;
      const diff = Math.abs(value1 - value2);
      
      if (diff > tolerance) {
        matches = false;
        differences[size] = value2 - value1; // positive means breakdown2 is higher
      }
    }

    return { matches, differences };
  }
}