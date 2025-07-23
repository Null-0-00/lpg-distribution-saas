import { Prisma, PrismaClient } from '@prisma/client';

export class QueryOptimizer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Optimized sales queries with proper indexing strategy
   */
  async getSalesWithOptimization(
    tenantId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      driverId?: string;
      productId?: string;
      saleType?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const {
      startDate,
      endDate,
      driverId,
      productId,
      saleType,
      limit = 50,
      offset = 0,
    } = filters;

    // Use optimized query with covering indexes
    return this.prisma.sale.findMany({
      where: {
        tenantId,
        ...(startDate &&
          endDate && {
            saleDate: {
              gte: startDate,
              lte: endDate,
            },
          }),
        ...(driverId && { driverId }),
        ...(productId && { productId }),
        ...(saleType && { saleType: saleType as any }),
      },
      select: {
        id: true,
        saleDate: true,
        saleType: true,
        quantity: true,
        totalValue: true,
        netValue: true,
        paymentType: true,
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            size: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Optimized inventory queries with aggregation
   */
  async getInventoryStatsOptimized(
    tenantId: string,
    productId?: string,
    dateRange?: { start: Date; end: Date }
  ) {
    const whereClause: Prisma.InventoryRecordWhereInput = {
      tenantId,
      ...(productId && { productId }),
      ...(dateRange && {
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    };

    // Parallel execution for better performance
    const [currentLevels, trends, movements] = await Promise.all([
      // Current inventory levels
      this.prisma.inventoryRecord.findMany({
        where: whereClause,
        select: {
          productId: true,
          fullCylinders: true,
          emptyCylinders: true,
          totalCylinders: true,
          date: true,
        },
        orderBy: {
          date: 'desc',
        },
        take: productId ? 1 : 100,
      }),

      // Trend analysis
      this.prisma.inventoryRecord.groupBy({
        by: ['productId'],
        where: whereClause,
        _avg: {
          fullCylinders: true,
          emptyCylinders: true,
          totalSales: true,
        },
        _sum: {
          packageSales: true,
          refillSales: true,
          totalSales: true,
        },
      }),

      // Recent movements
      this.prisma.inventoryMovement.findMany({
        where: {
          tenantId,
          ...(productId && { productId }),
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        select: {
          type: true,
          quantity: true,
          date: true,
          description: true,
          product: {
            select: {
              name: true,
              size: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 50,
      }),
    ]);

    return {
      currentLevels,
      trends,
      movements,
    };
  }

  /**
   * Optimized dashboard metrics with caching hints
   */
  async getDashboardMetricsOptimized(
    tenantId: string,
    dateRange: { start: Date; end: Date }
  ) {
    // Use parallel execution for independent queries
    const [salesMetrics, inventoryMetrics, financialMetrics, driverMetrics] =
      await Promise.all([
        // Sales metrics
        this.prisma.sale.groupBy({
          by: ['saleType'],
          where: {
            tenantId,
            saleDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          _sum: {
            quantity: true,
            totalValue: true,
            netValue: true,
          },
          _count: {
            id: true,
          },
        }),

        // Inventory metrics
        this.prisma.inventoryRecord.findMany({
          where: {
            tenantId,
            date: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          select: {
            date: true,
            fullCylinders: true,
            emptyCylinders: true,
            totalSales: true,
          },
          orderBy: {
            date: 'desc',
          },
          take: 30, // Last 30 days
        }),

        // Financial metrics
        this.prisma.expense.groupBy({
          by: ['categoryId'],
          where: {
            tenantId,
            expenseDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
            isApproved: true,
          },
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        }),

        // Driver performance
        this.prisma.sale.groupBy({
          by: ['driverId'],
          where: {
            tenantId,
            saleDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          _sum: {
            totalValue: true,
            quantity: true,
          },
          _count: {
            id: true,
          },
          orderBy: {
            _sum: {
              totalValue: 'desc',
            },
          },
          take: 10,
        }),
      ]);

    return {
      salesMetrics,
      inventoryMetrics,
      financialMetrics,
      driverMetrics,
    };
  }

  /**
   * Optimized search with full-text search
   */
  async searchOptimized(
    tenantId: string,
    query: string,
    type: 'companies' | 'products' | 'drivers'
  ) {
    switch (type) {
      case 'companies':
        return this.prisma.$queryRaw`
          SELECT id, name, code, territory, "isActive"
          FROM companies 
          WHERE "tenantId" = ${tenantId}
          AND (
            to_tsvector('english', name) @@ plainto_tsquery('english', ${query})
            OR name ILIKE ${`%${query}%`}
            OR code ILIKE ${`%${query}%`}
          )
          AND "isActive" = true
          ORDER BY 
            CASE WHEN name ILIKE ${`${query}%`} THEN 1 ELSE 2 END,
            name
          LIMIT 20
        `;

      case 'products':
        return this.prisma.$queryRaw`
          SELECT p.id, p.name, p.size, p."currentPrice", c.name as "companyName"
          FROM products p
          JOIN companies c ON p."companyId" = c.id
          WHERE p."tenantId" = ${tenantId}
          AND (
            to_tsvector('english', p.name) @@ plainto_tsquery('english', ${query})
            OR p.name ILIKE ${`%${query}%`}
            OR p.size ILIKE ${`%${query}%`}
          )
          AND p."isActive" = true
          ORDER BY 
            CASE WHEN p.name ILIKE ${`${query}%`} THEN 1 ELSE 2 END,
            c.name, p.name
          LIMIT 20
        `;

      case 'drivers':
        return this.prisma.$queryRaw`
          SELECT id, name, phone, route, status
          FROM drivers 
          WHERE "tenantId" = ${tenantId}
          AND (
            name ILIKE ${`%${query}%`}
            OR phone ILIKE ${`%${query}%`}
            OR route ILIKE ${`%${query}%`}
          )
          AND status = 'ACTIVE'
          ORDER BY 
            CASE WHEN name ILIKE ${`${query}%`} THEN 1 ELSE 2 END,
            name
          LIMIT 20
        `;

      default:
        throw new Error('Invalid search type');
    }
  }

  /**
   * Batch operations for bulk data processing
   */
  async createSalesInBatch(salesData: any[], batchSize = 100) {
    const results = [];

    for (let i = 0; i < salesData.length; i += batchSize) {
      const batch = salesData.slice(i, i + batchSize);

      const batchResult = await this.prisma.$transaction(
        batch.map((sale) =>
          this.prisma.sale.create({
            data: sale,
          })
        )
      );

      results.push(...batchResult);
    }

    return results;
  }

  /**
   * Connection pool monitoring
   */
  async getConnectionPoolStats() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;

    return result;
  }

  /**
   * Query performance analysis
   */
  async analyzeSlowQueries() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 100 
      ORDER BY mean_time DESC 
      LIMIT 10
    `;

    return result;
  }
}
