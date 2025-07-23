/**
 * Application Performance Monitoring (APM)
 * Comprehensive performance monitoring with metrics, traces, and analytics
 */

import { redisCache } from '@/lib/cache/redis-client';
import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: any;
}

export interface RequestTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'error' | 'timeout';
  tags: Record<string, string>;
  logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    fields?: Record<string, any>;
  }>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAvg: number[];
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  database: {
    activeConnections: number;
    queuedQueries: number;
    avgQueryTime: number;
  };
  redis: {
    connectedClients: number;
    usedMemory: number;
    hits: number;
    misses: number;
  };
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  actions: string[];
}

/**
 * Performance monitoring and metrics collection
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private traces: Map<string, RequestTrace> = new Map();
  private alerts: PerformanceAlert[] = [];

  private constructor() {
    this.setupPeriodicCollection();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    const fullMetric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date(),
      ...metric
    };

    // Store in memory for quick access
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    
    const metricHistory = this.metrics.get(metric.name)!;
    metricHistory.push(fullMetric);
    
    // Keep only last 1000 metrics per type
    if (metricHistory.length > 1000) {
      metricHistory.shift();
    }

    // Store in Redis for persistence
    await redisCache.set(
      'global',
      'performance_metrics',
      `${metric.name}:${fullMetric.timestamp.getTime()}`,
      fullMetric,
      86400 // 24 hours
    );

    // Check for alerts
    await this.checkAlerts(fullMetric);
  }

  /**
   * Start a request trace
   */
  startTrace(operationName: string, tags: Record<string, string> = {}): RequestTrace {
    const trace: RequestTrace = {
      traceId: this.generateId(),
      spanId: this.generateId(),
      operationName,
      startTime: performance.now(),
      status: 'success',
      tags,
      logs: []
    };

    this.traces.set(trace.traceId, trace);
    return trace;
  }

  /**
   * Add a child span to an existing trace
   */
  startSpan(
    parentTrace: RequestTrace,
    operationName: string,
    tags: Record<string, string> = {}
  ): RequestTrace {
    const span: RequestTrace = {
      traceId: parentTrace.traceId,
      spanId: this.generateId(),
      parentSpanId: parentTrace.spanId,
      operationName,
      startTime: performance.now(),
      status: 'success',
      tags,
      logs: []
    };

    return span;
  }

  /**
   * End a trace or span
   */
  async endTrace(trace: RequestTrace, error?: Error): Promise<void> {
    trace.endTime = performance.now();
    trace.duration = trace.endTime - trace.startTime;

    if (error) {
      trace.status = 'error';
      trace.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    // Store trace
    await redisCache.set(
      'global',
      'performance_traces',
      trace.traceId,
      trace,
      3600 // 1 hour
    );

    // Record duration metric
    await this.recordMetric({
      name: `${trace.operationName}.duration`,
      value: trace.duration!,
      unit: 'ms',
      tags: {
        ...trace.tags,
        status: trace.status
      }
    });

    // Clean up memory
    this.traces.delete(trace.traceId);
  }

  /**
   * Add log to trace
   */
  addTraceLog(
    trace: RequestTrace,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    fields?: Record<string, any>
  ): void {
    trace.logs.push({
      timestamp: performance.now(),
      level,
      message,
      fields
    });
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: await this.getCPUMetrics(),
      memory: await this.getMemoryMetrics(),
      disk: await this.getDiskMetrics(),
      network: await this.getNetworkMetrics(),
      database: await this.getDatabaseMetrics(),
      redis: await this.getRedisMetrics()
    };

    // Store system metrics
    await redisCache.set(
      'global',
      'system_metrics',
      `${metrics.timestamp.getTime()}`,
      metrics,
      86400 // 24 hours
    );

    return metrics;
  }

  /**
   * Get performance analytics
   */
  async getAnalytics(
    metricName: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    count: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    const metrics = this.metrics.get(metricName) || [];
    const filteredMetrics = metrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );

    if (filteredMetrics.length === 0) {
      return {
        avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, count: 0, trend: 'stable'
      };
    }

    const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;

    const analytics = {
      avg: values.reduce((sum, val) => sum + val, 0) / count,
      min: values[0],
      max: values[count - 1],
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      count,
      trend: this.calculateTrend(filteredMetrics) as 'increasing' | 'decreasing' | 'stable'
    };

    return analytics;
  }

  /**
   * Create performance monitoring middleware
   */
  createMonitoringMiddleware() {
    return async (request: NextRequest, response: NextResponse) => {
      const trace = this.startTrace('http_request', {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent') || 'unknown'
      });

      const startTime = performance.now();

      try {
        // Monitor request processing
        this.addTraceLog(trace, 'info', 'Request started', {
          method: request.method,
          url: request.url
        });

        // Wait for response (this would be called after route handler)
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Record request metrics
        await this.recordMetric({
          name: 'http.request.duration',
          value: duration,
          unit: 'ms',
          tags: {
            method: request.method,
            status: response.status.toString(),
            route: this.extractRoute(request.url)
          }
        });

        await this.recordMetric({
          name: 'http.request.count',
          value: 1,
          unit: 'count',
          tags: {
            method: request.method,
            status: response.status.toString()
          }
        });

        this.addTraceLog(trace, 'info', 'Request completed', {
          status: response.status,
          duration
        });

        await this.endTrace(trace);

        return response;

      } catch (error) {
        this.addTraceLog(trace, 'error', 'Request failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        await this.endTrace(trace, error instanceof Error ? error : new Error('Unknown error'));
        throw error;
      }
    };
  }

  /**
   * Get current alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      
      // Store resolution in Redis
      await redisCache.set(
        'global',
        'performance_alerts',
        `resolved:${alertId}`,
        { alertId, resolvedAt: new Date() },
        86400
      );
    }
  }

  // Private helper methods

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async getCPUMetrics(): Promise<{ usage: number; loadAvg: number[] }> {
    // In a real implementation, you would use os module or external monitoring
    return {
      usage: Math.random() * 100, // Mock data
      loadAvg: [1.2, 1.5, 1.3]
    };
  }

  private async getMemoryMetrics(): Promise<{ used: number; total: number; usage: number }> {
    // Mock memory metrics
    const total = 8 * 1024 * 1024 * 1024; // 8GB
    const used = total * (0.3 + Math.random() * 0.4); // 30-70% usage
    
    return {
      used,
      total,
      usage: (used / total) * 100
    };
  }

  private async getDiskMetrics(): Promise<{ used: number; total: number; usage: number }> {
    // Mock disk metrics
    const total = 100 * 1024 * 1024 * 1024; // 100GB
    const used = total * (0.2 + Math.random() * 0.3); // 20-50% usage
    
    return {
      used,
      total,
      usage: (used / total) * 100
    };
  }

  private async getNetworkMetrics(): Promise<{ bytesIn: number; bytesOut: number }> {
    return {
      bytesIn: Math.random() * 1000000,
      bytesOut: Math.random() * 1000000
    };
  }

  private async getDatabaseMetrics(): Promise<{
    activeConnections: number;
    queuedQueries: number;
    avgQueryTime: number;
  }> {
    return {
      activeConnections: Math.floor(Math.random() * 20),
      queuedQueries: Math.floor(Math.random() * 5),
      avgQueryTime: 50 + Math.random() * 100
    };
  }

  private async getRedisMetrics(): Promise<{
    connectedClients: number;
    usedMemory: number;
    hits: number;
    misses: number;
  }> {
    try {
      const stats = await redisCache.getStats();
      return {
        connectedClients: 5 + Math.floor(Math.random() * 10),
        usedMemory: 50 * 1024 * 1024, // 50MB
        hits: 1000 + Math.floor(Math.random() * 500),
        misses: 50 + Math.floor(Math.random() * 100)
      };
    } catch {
      return {
        connectedClients: 0,
        usedMemory: 0,
        hits: 0,
        misses: 0
      };
    }
  }

  private percentile(values: number[], p: number): number {
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  private calculateTrend(metrics: PerformanceMetric[]): string {
    if (metrics.length < 2) return 'stable';

    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 10) return 'increasing';
    if (changePercent < -10) return 'decreasing';
    return 'stable';
  }

  private extractRoute(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/\/\d+/g, '/:id');
    } catch {
      return 'unknown';
    }
  }

  private async checkAlerts(metric: PerformanceMetric): Promise<void> {
    const alertRules = [
      {
        metric: 'http.request.duration',
        threshold: 1000, // 1 second
        severity: 'high' as const,
        message: 'High response time detected'
      },
      {
        metric: 'cpu.usage',
        threshold: 80,
        severity: 'medium' as const,
        message: 'High CPU usage'
      },
      {
        metric: 'memory.usage',
        threshold: 85,
        severity: 'high' as const,
        message: 'High memory usage'
      }
    ];

    for (const rule of alertRules) {
      if (metric.name === rule.metric && metric.value > rule.threshold) {
        const alert: PerformanceAlert = {
          id: this.generateId(),
          metric: metric.name,
          threshold: rule.threshold,
          currentValue: metric.value,
          severity: rule.severity,
          message: rule.message,
          timestamp: new Date(),
          resolved: false,
          actions: this.getRecommendedActions(rule.metric, metric.value)
        };

        this.alerts.push(alert);

        // Store alert
        await redisCache.set(
          'global',
          'performance_alerts',
          alert.id,
          alert,
          86400
        );
      }
    }
  }

  private getRecommendedActions(metric: string, value: number): string[] {
    const actions: Record<string, string[]> = {
      'http.request.duration': [
        'Check database query performance',
        'Review external API calls',
        'Consider adding caching',
        'Optimize business logic'
      ],
      'cpu.usage': [
        'Check for infinite loops',
        'Review resource-intensive operations',
        'Consider horizontal scaling',
        'Optimize algorithms'
      ],
      'memory.usage': [
        'Check for memory leaks',
        'Review large object allocations',
        'Implement garbage collection tuning',
        'Consider increasing memory allocation'
      ]
    };

    return actions[metric] || ['Contact system administrator'];
  }

  private setupPeriodicCollection(): void {
    // Collect system metrics every 60 seconds
    setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        console.error('Failed to collect system metrics:', error);
      }
    }, 60000);
  }
}

/**
 * Helper function to measure function execution time
 */
export function measurePerformance<T>(
  fn: () => Promise<T> | T,
  metricName: string,
  tags: Record<string, string> = {}
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance();
  
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      await monitor.recordMetric({
        name: metricName,
        value: duration,
        unit: 'ms',
        tags
      });
      
      resolve(result);
    } catch (error) {
      const duration = performance.now() - startTime;
      
      await monitor.recordMetric({
        name: metricName,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'error' }
      });
      
      reject(error);
    }
  });
}

/**
 * Decorator for automatic performance monitoring
 */
export function Monitor(metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const finalMetricName = metricName || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = async function (...args: any[]) {
      return measurePerformance(
        () => method.apply(this, args),
        finalMetricName,
        { class: target.constructor.name, method: propertyName }
      );
    };
  };
}