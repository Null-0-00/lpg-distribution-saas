// Redis-based caching layer for database queries
import Redis from 'ioredis';

class CacheManager {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { data: any; expiry: number }>();
  private readonly defaultTTL = 300; // 5 minutes
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    if (this.isProduction && process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
        console.log('✅ Redis cache initialized');
      } catch (error) {
        console.warn(
          '⚠️ Redis connection failed, falling back to memory cache'
        );
      }
    }
  }

  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key];
          return result;
        },
        {} as Record<string, any>
      );

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      } else {
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttl = this.defaultTTL): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
      } else {
        this.memoryCache.set(key, {
          data,
          expiry: Date.now() + ttl * 1000,
        });

        // Clean up expired entries periodically
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiry <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // High-level cache methods for common use cases
  async cacheQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await queryFn();
    await this.set(cacheKey, result, ttl);
    return result;
  }

  // Specific cache methods for LPG business data
  async cacheInventoryData(tenantId: string, data: any): Promise<void> {
    await this.set(`inventory:${tenantId}`, data, 60); // 1 minute cache
  }

  async getCachedInventoryData(tenantId: string): Promise<any> {
    return this.get(`inventory:${tenantId}`);
  }

  async cacheDailyInventory(
    tenantId: string,
    date: string,
    data: any
  ): Promise<void> {
    await this.set(`daily_inventory:${tenantId}:${date}`, data, 300); // 5 minutes
  }

  async getCachedDailyInventory(tenantId: string, date: string): Promise<any> {
    return this.get(`daily_inventory:${tenantId}:${date}`);
  }

  async invalidateInventoryCache(tenantId: string): Promise<void> {
    await this.invalidate(`inventory:${tenantId}*`);
    await this.invalidate(`daily_inventory:${tenantId}*`);
    await this.invalidate(`cylinders_summary:${tenantId}*`);
  }
}

export const cache = new CacheManager();
