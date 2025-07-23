import { NextRequest, NextResponse } from 'next/server';
import { RateLimitCache } from '../cache/cache-strategies';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Advanced rate limiter with multiple strategies
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check rate limit for a specific identifier
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const result = await RateLimitCache.checkRateLimit(
      identifier,
      this.config.maxRequests,
      this.config.windowMs
    );

    return {
      success: result.allowed,
      limit: this.config.maxRequests,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.allowed
        ? undefined
        : Math.ceil(this.config.windowMs / 1000),
    };
  }

  /**
   * Create rate limit headers
   */
  createHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    };

    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }

    return headers;
  }

  /**
   * Create rate limited response
   */
  createRateLimitResponse(result: RateLimitResult): NextResponse {
    const response = NextResponse.json(
      {
        error: this.config.message,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
      },
      { status: 429 }
    );

    const headers = this.createHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

/**
 * Different rate limiting strategies
 */
export const RATE_LIMITS = {
  // API rate limits
  API_GENERAL: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: 'Too many API requests, please try again later.',
  }),

  API_AUTH: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
  }),

  API_ADMIN: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 200,
    message: 'Too many admin requests, please try again later.',
  }),

  // User action rate limits
  SALES_CREATION: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many sales entries, please slow down.',
  }),

  SEARCH_REQUESTS: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many search requests, please slow down.',
  }),

  FILE_UPLOAD: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many file uploads, please wait.',
  }),

  // Aggressive limits for sensitive operations
  PASSWORD_RESET: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts.',
  }),

  ADMIN_LOGIN: new RateLimiter({
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 5,
    message: 'Too many admin login attempts.',
  }),
} as const;

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(
  request: NextRequest,
  type: 'ip' | 'user' | 'tenant' = 'ip'
): string {
  switch (type) {
    case 'ip':
      return getClientIP(request);
    case 'user':
      // This would be extracted from session/JWT
      const userId = request.headers.get('x-user-id') || 'anonymous';
      return `user:${userId}`;
    case 'tenant':
      const tenantId = request.headers.get('x-tenant-id') || 'default';
      return `tenant:${tenantId}`;
    default:
      return getClientIP(request);
  }
}

/**
 * Extract client IP address
 */
export function getClientIP(request: NextRequest): string {
  // Check for forwarded IP (proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Check for real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Check for Cloudflare IP
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to request IP
  return request.ip || '127.0.0.1';
}

/**
 * Middleware factory for rate limiting
 */
export function createRateLimitMiddleware(
  rateLimiter: RateLimiter,
  identifierType: 'ip' | 'user' | 'tenant' = 'ip'
) {
  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const identifier = getClientIdentifier(request, identifierType);
    const result = await rateLimiter.checkLimit(identifier);

    if (!result.success) {
      return rateLimiter.createRateLimitResponse(result);
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    const headers = rateLimiter.createHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Sliding window rate limiter
 */
export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // This would use a more sophisticated Redis implementation
    // For now, using the simple counter approach
    const result = await RateLimitCache.checkRateLimit(
      `sliding:${identifier}:${Math.floor(now / this.windowMs)}`,
      this.maxRequests,
      Math.ceil(this.windowMs / 1000)
    );

    return {
      success: result.allowed,
      limit: this.maxRequests,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }
}

/**
 * Token bucket rate limiter
 */
export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRate: number;
  private refillPeriod: number;

  constructor(capacity: number, refillRate: number, refillPeriodMs: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.refillPeriod = refillPeriodMs;
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    // Simplified implementation - would need more sophisticated Redis logic
    const result = await RateLimitCache.checkRateLimit(
      `bucket:${identifier}`,
      this.capacity,
      Math.ceil(this.refillPeriod / 1000)
    );

    return {
      success: result.allowed,
      limit: this.capacity,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }
}

/**
 * Adaptive rate limiter that adjusts based on system load
 */
export class AdaptiveRateLimiter {
  private baseLimit: number;
  private windowMs: number;
  private loadThreshold: number;

  constructor(
    baseLimit: number,
    windowMs: number,
    loadThreshold: number = 0.8
  ) {
    this.baseLimit = baseLimit;
    this.windowMs = windowMs;
    this.loadThreshold = loadThreshold;
  }

  async getCurrentLoad(): Promise<number> {
    // This would check system metrics (CPU, memory, active connections)
    // For now, return a mock value
    return Math.random() * 0.7; // Mock load between 0-70%
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const currentLoad = await this.getCurrentLoad();

    // Reduce limit if system is under high load
    const adjustedLimit =
      currentLoad > this.loadThreshold
        ? Math.floor(this.baseLimit * (1 - currentLoad))
        : this.baseLimit;

    const result = await RateLimitCache.checkRateLimit(
      `adaptive:${identifier}`,
      adjustedLimit,
      Math.ceil(this.windowMs / 1000)
    );

    return {
      success: result.allowed,
      limit: adjustedLimit,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }
}

/**
 * DDoS protection with progressive penalties
 */
export class DDoSProtection {
  private thresholds: Array<{ requests: number; penalty: number }>;

  constructor() {
    this.thresholds = [
      { requests: 100, penalty: 60 }, // 1 minute penalty
      { requests: 500, penalty: 300 }, // 5 minute penalty
      { requests: 1000, penalty: 1800 }, // 30 minute penalty
      { requests: 5000, penalty: 7200 }, // 2 hour penalty
    ];
  }

  async checkForDDoS(
    identifier: string
  ): Promise<{ blocked: boolean; penalty?: number }> {
    // Check request count in the last hour
    const hourlyCount = await RateLimitCache.checkRateLimit(
      `ddos:hourly:${identifier}`,
      10000, // Very high limit for counting
      3600 // 1 hour
    );

    // Find applicable penalty
    const applicableThreshold = this.thresholds
      .reverse()
      .find((threshold) => 10000 - hourlyCount.remaining >= threshold.requests);

    if (applicableThreshold) {
      // Apply penalty
      await RateLimitCache.checkRateLimit(
        `ddos:penalty:${identifier}`,
        1,
        applicableThreshold.penalty
      );

      return { blocked: true, penalty: applicableThreshold.penalty };
    }

    return { blocked: false };
  }
}
