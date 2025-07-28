// Performance monitoring utility for database queries and API endpoints

interface PerformanceMetric {
  endpoint: string;
  duration: number;
  timestamp: number;
  tenantId?: string;
  cacheHit?: boolean;
  queryCount?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  logQuery(
    endpoint: string,
    duration: number,
    options?: {
      tenantId?: string;
      cacheHit?: boolean;
      queryCount?: number;
    }
  ) {
    const metric: PerformanceMetric = {
      endpoint,
      duration,
      timestamp: Date.now(),
      ...options,
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (duration > 1000) {
      // More than 1 second
      console.warn(
        `🐌 Slow query detected: ${endpoint} took ${duration.toFixed(2)}ms`
      );
    } else if (duration > 500) {
      // More than 500ms
      console.log(
        `⚠️ Moderate query: ${endpoint} took ${duration.toFixed(2)}ms`
      );
    }

    // Log cache hits
    if (options?.cacheHit) {
      console.log(`⚡ Cache hit: ${endpoint} served from cache`);
    }
  }

  getMetrics(endpoint?: string): PerformanceMetric[] {
    if (endpoint) {
      return this.metrics.filter((m) => m.endpoint === endpoint);
    }
    return [...this.metrics];
  }

  getAverageResponse(endpoint: string, minutes = 10): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter(
      (m) => m.endpoint === endpoint && m.timestamp > cutoff
    );

    if (recentMetrics.length === 0) return 0;

    const sum = recentMetrics.reduce((total, m) => total + m.duration, 0);
    return sum / recentMetrics.length;
  }

  getCacheHitRate(endpoint: string, minutes = 10): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter(
      (m) => m.endpoint === endpoint && m.timestamp > cutoff
    );

    if (recentMetrics.length === 0) return 0;

    const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
    return (cacheHits / recentMetrics.length) * 100;
  }

  getStats(minutes = 10) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    const endpointStats = new Map<
      string,
      {
        count: number;
        avgDuration: number;
        maxDuration: number;
        cacheHitRate: number;
      }
    >();

    recentMetrics.forEach((metric) => {
      const { endpoint, duration, cacheHit } = metric;

      if (!endpointStats.has(endpoint)) {
        endpointStats.set(endpoint, {
          count: 0,
          avgDuration: 0,
          maxDuration: 0,
          cacheHitRate: 0,
        });
      }

      const stats = endpointStats.get(endpoint)!;
      stats.count++;
      stats.avgDuration =
        (stats.avgDuration * (stats.count - 1) + duration) / stats.count;
      stats.maxDuration = Math.max(stats.maxDuration, duration);

      const cacheHits = recentMetrics.filter(
        (m) => m.endpoint === endpoint && m.cacheHit
      ).length;
      const totalCalls = recentMetrics.filter(
        (m) => m.endpoint === endpoint
      ).length;
      stats.cacheHitRate = totalCalls > 0 ? (cacheHits / totalCalls) * 100 : 0;
    });

    return Object.fromEntries(endpointStats);
  }

  // Helper method to track API execution time
  async trackExecution<T>(
    endpoint: string,
    fn: () => Promise<T>,
    options?: { tenantId?: string; queryCount?: number }
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.logQuery(endpoint, duration, { ...options, cacheHit: false });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logQuery(endpoint, duration, { ...options, cacheHit: false });
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Export a timing decorator for database queries
export function trackQuery(
  endpoint: string,
  options?: { tenantId?: string; queryCount?: number }
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (this: any, ...args: any[]) {
      return performanceMonitor.trackExecution(
        endpoint,
        () => method.apply(this, args),
        options
      );
    } as T;
  };
}
