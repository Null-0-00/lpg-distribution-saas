import { createHash } from 'crypto';

// In-memory cache fallback for development
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, value: any, ttl: number = 3600): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { data: value, expiry });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  keys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  clear(): void {
    this.cache.clear();
  }
}

export class RedisCache {
  private cache: MemoryCache;
  private defaultTTL: number = 3600; // 1 hour default

  constructor() {
    this.cache = new MemoryCache();
    console.log('Using in-memory cache fallback (Redis not available)');
  }

  /**
   * Generate cache key with tenant isolation
   */
  private generateKey(
    tenantId: string,
    namespace: string,
    identifier: string
  ): string {
    const hash = createHash('sha256')
      .update(identifier)
      .digest('hex')
      .substring(0, 16);
    return `${tenantId}:${namespace}:${hash}`;
  }

  /**
   * Get cached data with automatic deserialization
   */
  async get<T>(
    tenantId: string,
    namespace: string,
    key: string
  ): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(tenantId, namespace, key);
      const data = this.cache.get(cacheKey);

      if (!data) return null;

      return data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with automatic serialization and TTL
   */
  async set<T>(
    tenantId: string,
    namespace: string,
    key: string,
    data: T,
    ttl?: number
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(tenantId, namespace, key);
      const expiry = ttl || this.defaultTTL;

      this.cache.set(cacheKey, data, expiry);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  async delete(
    tenantId: string,
    namespace: string,
    key: string
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(tenantId, namespace, key);
      return this.cache.delete(cacheKey);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate all cache for a specific namespace
   */
  async invalidateNamespace(
    tenantId: string,
    namespace: string
  ): Promise<boolean> {
    try {
      const pattern = `${tenantId}:${namespace}:*`;
      const keys = this.cache.keys(pattern);

      keys.forEach((key) => this.cache.delete(key));

      return true;
    } catch (error) {
      console.error('Cache invalidate namespace error:', error);
      return false;
    }
  }

  /**
   * Cache with automatic refresh (cache-aside pattern)
   */
  async getOrSet<T>(
    tenantId: string,
    namespace: string,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(tenantId, namespace, key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch from source
    const data = await fetcher();

    // Store in cache for next time
    await this.set(tenantId, namespace, key, data, ttl);

    return data;
  }

  /**
   * Batch operations for multiple cache keys
   */
  async mget<T>(
    tenantId: string,
    namespace: string,
    keys: string[]
  ): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map((key) =>
        this.generateKey(tenantId, namespace, key)
      );

      return cacheKeys.map((cacheKey) => {
        const result = this.cache.get(cacheKey);
        return result || null;
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple cache entries
   */
  async mset<T>(
    tenantId: string,
    namespace: string,
    entries: Array<{ key: string; data: T; ttl?: number }>
  ): Promise<boolean> {
    try {
      entries.forEach(({ key, data, ttl }) => {
        const cacheKey = this.generateKey(tenantId, namespace, key);
        const expiry = ttl || this.defaultTTL;

        this.cache.set(cacheKey, data, expiry);
      });

      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Increment counter (useful for rate limiting)
   */
  async increment(
    tenantId: string,
    namespace: string,
    key: string,
    ttl?: number
  ): Promise<number> {
    try {
      const cacheKey = this.generateKey(tenantId, namespace, key);
      const current = this.cache.get(cacheKey) || 0;
      const count = current + 1;

      this.cache.set(cacheKey, count, ttl || this.defaultTTL);

      return count;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Set with expiration at specific time
   */
  async setExpireAt<T>(
    tenantId: string,
    namespace: string,
    key: string,
    data: T,
    expireAt: Date
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(tenantId, namespace, key);
      const ttl = Math.floor((expireAt.getTime() - Date.now()) / 1000);

      if (ttl > 0) {
        this.cache.set(cacheKey, data, ttl);
      }

      return true;
    } catch (error) {
      console.error('Cache setExpireAt error:', error);
      return false;
    }
  }

  /**
   * Health check for cache connection
   */
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      const testKey = 'health-check';
      this.cache.set(testKey, 'ok', 1);
      const result = this.cache.get(testKey);
      this.cache.delete(testKey);
      const latency = Date.now() - start;

      return result === 'ok'
        ? { status: 'healthy', latency }
        : { status: 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      return {
        type: 'memory',
        keyCount: this.cache['cache'].size,
        status: 'active',
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async disconnect(): Promise<void> {
    this.cache.clear();
  }
}

// Singleton instance
export const redisCache = new RedisCache();
