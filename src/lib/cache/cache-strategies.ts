import { redisCache } from './redis-client';

/**
 * Cache TTL configurations for different data types
 */
export const CACHE_TTL = {
  // Frequently changing data
  DASHBOARD_METRICS: 300, // 5 minutes
  LIVE_INVENTORY: 600, // 10 minutes
  RECENT_SALES: 900, // 15 minutes
  
  // Moderately changing data
  USER_PROFILE: 1800, // 30 minutes
  DRIVER_LIST: 1800, // 30 minutes
  PRODUCT_LIST: 3600, // 1 hour
  
  // Rarely changing data
  COMPANY_LIST: 7200, // 2 hours
  EXPENSE_CATEGORIES: 7200, // 2 hours
  SYSTEM_SETTINGS: 14400, // 4 hours
  
  // Static-like data
  USER_PERMISSIONS: 86400, // 24 hours
  TENANT_CONFIG: 86400, // 24 hours
} as const;

/**
 * Cache namespaces for different data types
 */
export const CACHE_NAMESPACE = {
  DASHBOARD: 'dashboard',
  SALES: 'sales',
  INVENTORY: 'inventory',
  USERS: 'users',
  DRIVERS: 'drivers',
  PRODUCTS: 'products',
  COMPANIES: 'companies',
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
  SESSIONS: 'sessions',
  RATE_LIMIT: 'rate_limit',
  SEARCH: 'search',
} as const;

/**
 * Dashboard metrics caching strategy
 */
export class DashboardCache {
  static async getDashboardMetrics(tenantId: string, dateRange: string) {
    const cacheKey = `metrics:${dateRange}`;
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.DASHBOARD,
      cacheKey,
      async () => {
        // This would call your actual dashboard metrics function
        // Return mock data for now
        return {
          totalSales: 150000,
          totalOrders: 245,
          activeDrivers: 12,
          lowStockItems: 3,
          timestamp: new Date().toISOString()
        };
      },
      CACHE_TTL.DASHBOARD_METRICS
    );
  }

  static async invalidateDashboardCache(tenantId: string) {
    return redisCache.invalidateNamespace(tenantId, CACHE_NAMESPACE.DASHBOARD);
  }

  static async cacheKPIData(tenantId: string, kpiData: any, period: string) {
    const cacheKey = `kpi:${period}`;
    return redisCache.set(
      tenantId,
      CACHE_NAMESPACE.DASHBOARD,
      cacheKey,
      kpiData,
      CACHE_TTL.DASHBOARD_METRICS
    );
  }
}

/**
 * Sales data caching strategy
 */
export class SalesCache {
  static async getSalesSummary(tenantId: string, filters: any) {
    const cacheKey = `summary:${JSON.stringify(filters)}`;
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.SALES,
      cacheKey,
      async () => {
        // This would call your actual sales summary function
        return {
          totalRevenue: 125000,
          packageSales: 89,
          refillSales: 156,
          filters,
          timestamp: new Date().toISOString()
        };
      },
      CACHE_TTL.RECENT_SALES
    );
  }

  static async cacheTodaysSales(tenantId: string, salesData: any) {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `today:${today}`;
    
    return redisCache.set(
      tenantId,
      CACHE_NAMESPACE.SALES,
      cacheKey,
      salesData,
      CACHE_TTL.RECENT_SALES
    );
  }

  static async invalidateSalesCache(tenantId: string, date?: string) {
    if (date) {
      const cacheKey = `today:${date}`;
      return redisCache.delete(tenantId, CACHE_NAMESPACE.SALES, cacheKey);
    }
    return redisCache.invalidateNamespace(tenantId, CACHE_NAMESPACE.SALES);
  }
}

/**
 * Inventory caching strategy
 */
export class InventoryCache {
  static async getCurrentInventory(tenantId: string, productId?: string) {
    const cacheKey = productId ? `current:product:${productId}` : 'current:all';
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.INVENTORY,
      cacheKey,
      async () => {
        // This would call your actual inventory function
        return {
          fullCylinders: 150,
          emptyCylinders: 75,
          totalCylinders: 225,
          lowStockAlerts: 2,
          lastUpdated: new Date().toISOString()
        };
      },
      CACHE_TTL.LIVE_INVENTORY
    );
  }

  static async cacheInventoryMovement(tenantId: string, movement: any) {
    const cacheKey = `movement:${movement.id}`;
    return redisCache.set(
      tenantId,
      CACHE_NAMESPACE.INVENTORY,
      cacheKey,
      movement,
      CACHE_TTL.LIVE_INVENTORY
    );
  }

  static async invalidateInventoryCache(tenantId: string, productId?: string) {
    if (productId) {
      const cacheKey = `current:product:${productId}`;
      await redisCache.delete(tenantId, CACHE_NAMESPACE.INVENTORY, cacheKey);
    }
    
    // Always invalidate the all products cache
    await redisCache.delete(tenantId, CACHE_NAMESPACE.INVENTORY, 'current:all');
  }
}

/**
 * User and driver caching strategy
 */
export class UserCache {
  static async getUserProfile(tenantId: string, userId: string) {
    const cacheKey = `profile:${userId}`;
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.USERS,
      cacheKey,
      async () => {
        // This would call your actual user profile function
        return {
          id: userId,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'MANAGER',
          permissions: ['sales:read', 'inventory:read'],
          lastLogin: new Date().toISOString()
        };
      },
      CACHE_TTL.USER_PROFILE
    );
  }

  static async getActiveDrivers(tenantId: string) {
    const cacheKey = 'active:all';
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.DRIVERS,
      cacheKey,
      async () => {
        // This would call your actual active drivers function
        return [
          { id: '1', name: 'Driver 1', status: 'ACTIVE', route: 'Route A' },
          { id: '2', name: 'Driver 2', status: 'ACTIVE', route: 'Route B' }
        ];
      },
      CACHE_TTL.DRIVER_LIST
    );
  }

  static async invalidateUserCache(tenantId: string, userId: string) {
    const cacheKey = `profile:${userId}`;
    return redisCache.delete(tenantId, CACHE_NAMESPACE.USERS, cacheKey);
  }

  static async invalidateDriversCache(tenantId: string) {
    return redisCache.invalidateNamespace(tenantId, CACHE_NAMESPACE.DRIVERS);
  }
}

/**
 * Product and company caching strategy
 */
export class CatalogCache {
  static async getProducts(tenantId: string, companyId?: string) {
    const cacheKey = companyId ? `company:${companyId}` : 'all';
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.PRODUCTS,
      cacheKey,
      async () => {
        // This would call your actual products function
        return [
          { id: '1', name: '12L Cylinder', size: '12L', currentPrice: 950 },
          { id: '2', name: '35L Cylinder', size: '35L', currentPrice: 2100 }
        ];
      },
      CACHE_TTL.PRODUCT_LIST
    );
  }

  static async getCompanies(tenantId: string) {
    const cacheKey = 'all:active';
    
    return redisCache.getOrSet(
      tenantId,
      CACHE_NAMESPACE.COMPANIES,
      cacheKey,
      async () => {
        // This would call your actual companies function
        return [
          { id: '1', name: 'Aygaz', code: 'AYG', isActive: true },
          { id: '2', name: 'Jamuna', code: 'JAM', isActive: true }
        ];
      },
      CACHE_TTL.COMPANY_LIST
    );
  }

  static async invalidateProductsCache(tenantId: string, companyId?: string) {
    if (companyId) {
      await redisCache.delete(tenantId, CACHE_NAMESPACE.PRODUCTS, `company:${companyId}`);
    }
    await redisCache.delete(tenantId, CACHE_NAMESPACE.PRODUCTS, 'all');
  }

  static async invalidateCompaniesCache(tenantId: string) {
    return redisCache.invalidateNamespace(tenantId, CACHE_NAMESPACE.COMPANIES);
  }
}

/**
 * Search results caching
 */
export class SearchCache {
  static async cacheSearchResults(
    tenantId: string,
    query: string,
    type: string,
    results: any[]
  ) {
    const cacheKey = `${type}:${query}`;
    return redisCache.set(
      tenantId,
      CACHE_NAMESPACE.SEARCH,
      cacheKey,
      results,
      1800 // 30 minutes for search results
    );
  }

  static async getSearchResults(tenantId: string, query: string, type: string) {
    const cacheKey = `${type}:${query}`;
    return redisCache.get(tenantId, CACHE_NAMESPACE.SEARCH, cacheKey);
  }
}

/**
 * Session caching for authentication
 */
export class SessionCache {
  static async cacheUserSession(sessionId: string, sessionData: any) {
    return redisCache.set(
      'global', // Sessions are not tenant-specific
      CACHE_NAMESPACE.SESSIONS,
      sessionId,
      sessionData,
      86400 // 24 hours
    );
  }

  static async getUserSession(sessionId: string) {
    return redisCache.get('global', CACHE_NAMESPACE.SESSIONS, sessionId);
  }

  static async invalidateSession(sessionId: string) {
    return redisCache.delete('global', CACHE_NAMESPACE.SESSIONS, sessionId);
  }
}

/**
 * Rate limiting cache
 */
export class RateLimitCache {
  static async checkRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const windowSeconds = Math.floor(windowMs / 1000);
    const count = await redisCache.increment(
      'global',
      CACHE_NAMESPACE.RATE_LIMIT,
      identifier,
      windowSeconds
    );

    const remaining = Math.max(0, limit - count);
    const resetTime = Date.now() + windowMs;

    return {
      allowed: count <= limit,
      remaining,
      resetTime
    };
  }
}

/**
 * Cache warming strategies
 */
export class CacheWarmer {
  static async warmDashboardCache(tenantId: string) {
    const promises = [
      DashboardCache.getDashboardMetrics(tenantId, 'today'),
      DashboardCache.getDashboardMetrics(tenantId, 'week'),
      DashboardCache.getDashboardMetrics(tenantId, 'month'),
      InventoryCache.getCurrentInventory(tenantId),
      UserCache.getActiveDrivers(tenantId),
      CatalogCache.getProducts(tenantId),
      CatalogCache.getCompanies(tenantId)
    ];

    await Promise.allSettled(promises);
  }

  static async warmUserCache(tenantId: string, userId: string) {
    await UserCache.getUserProfile(tenantId, userId);
  }
}