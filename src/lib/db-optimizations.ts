// Database query optimizations and connection pooling
import { PrismaClient } from '@prisma/client';

// Optimized Prisma client with connection pooling
export function createOptimizedPrismaClient() {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Add query performance monitoring removed due to TypeScript issues
  // Note: Prisma query event monitoring disabled for now

  return prisma;
}

// Optimized query patterns for common LPG operations
export class QueryOptimizer {
  constructor(private prisma: PrismaClient) {}

  // Optimized inventory query with minimal data selection
  async getInventoryOptimized(tenantId: string, includeMovements = false) {
    const baseQuery = {
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        size: true,
        currentPrice: true,
        lowStockThreshold: true,
        company: {
          select: { id: true, name: true },
        },
        // Only include movements if explicitly requested
        ...(includeMovements && {
          inventoryMovements: {
            select: {
              id: true,
              date: true,
              type: true,
              quantity: true,
              description: true,
              reference: true,
              driver: {
                select: { name: true },
              },
            },
            orderBy: { date: 'desc' as const },
            take: 10, // Limit to recent movements
          },
        }),
      },
      orderBy: [
        { company: { name: 'asc' as const } },
        { name: 'asc' as const },
      ],
    };

    return this.prisma.product.findMany(baseQuery);
  }

  // Batch query for daily inventory with date range optimization
  async getDailyInventoryBatch(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.prisma.inventoryRecord.findMany({
      where: {
        tenantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        date: true,
        fullCylinders: true,
        emptyCylinders: true,
        packageSales: true,
        refillSales: true,
        totalSales: true,
        packagePurchase: true,
        refillPurchase: true,
        emptyCylindersBuySell: true,
        totalCylinders: true,
        emptyCylinderReceivables: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  // Optimized receivables query
  async getReceivablesOptimized(tenantId: string) {
    return this.prisma.receivableRecord.findMany({
      where: { tenantId },
      select: {
        id: true,
        driverId: true,
        date: true,
        totalCashReceivables: true,
        totalCylinderReceivables: true,
        driver: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100, // Limit to recent records
    });
  }

  // Aggregated statistics query
  async getInventorySummaryFast(tenantId: string) {
    const [products, summary] = await Promise.all([
      this.prisma.product.count({
        where: { tenantId, isActive: true },
      }),
      this.prisma.product.aggregate({
        where: { tenantId, isActive: true },
        _sum: {
          currentPrice: true,
        },
      }),
    ]);

    return {
      totalProducts: products,
      totalValue: summary._sum.currentPrice || 0,
    };
  }

  // Preload critical data for dashboard
  async preloadDashboardData(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Execute all critical queries in parallel
    return Promise.all([
      this.getInventoryOptimized(tenantId, false),
      this.getDailyInventoryBatch(tenantId, yesterday, today),
      this.getReceivablesOptimized(tenantId),
      this.getInventorySummaryFast(tenantId),
    ]);
  }
}

// Connection pooling configuration
export const dbConfig = {
  // Optimize connection pool for production
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL +
        (process.env.NODE_ENV === 'production'
          ? '?connection_limit=20&pool_timeout=20&connect_timeout=60'
          : ''),
    },
  },
  // Enable query optimization features
  generator: {
    client: {
      previewFeatures: ['fullTextSearch', 'metrics', 'tracing'],
    },
  },
};

// Query performance monitoring
export function logSlowQueries(threshold = 1000) {
  return (query: string, duration: number) => {
    if (duration > threshold) {
      console.warn(
        `🐌 Slow query: ${duration}ms - ${query.substring(0, 100)}...`
      );
    }
  };
}
