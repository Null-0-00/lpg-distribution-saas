/**
 * HTTPS enforcement and SSL/TLS security configuration
 * Comprehensive HTTPS security with certificate management and transport security
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/cache/redis-client';

export interface HTTPSConfig {
  forceHTTPS: boolean;
  hstsMaxAge: number;
  hstsIncludeSubdomains: boolean;
  hstsPreload: boolean;
  upgradeInsecureRequests: boolean;
  checkCertificateExpiry: boolean;
  allowedHosts: string[];
  trustedProxies: string[];
}

export interface SSLHealthCheck {
  domain: string;
  isValid: boolean;
  expiresAt?: Date;
  issuer?: string;
  subject?: string;
  warnings: string[];
  errors: string[];
}

/**
 * HTTPS enforcement and SSL/TLS security manager
 */
export class HTTPSEnforcer {
  private config: HTTPSConfig;

  constructor(config: HTTPSConfig) {
    this.config = config;
  }

  /**
   * Enforce HTTPS and apply transport security
   */
  async enforceHTTPS(request: NextRequest): Promise<NextResponse | null> {
    try {
      // Check if request is already HTTPS
      const isHTTPS = this.isSecureRequest(request);

      // In production, force HTTPS redirect
      if (
        this.config.forceHTTPS &&
        !isHTTPS &&
        process.env.NODE_ENV === 'production'
      ) {
        return this.redirectToHTTPS(request);
      }

      // Validate host against allowed hosts
      const hostValidation = this.validateHost(request);
      if (!hostValidation.isValid) {
        return NextResponse.json(
          { error: 'Host not allowed', details: hostValidation.error },
          { status: 403 }
        );
      }

      // Log security events
      await this.logSecurityEvent({
        type: 'HTTPS_ACCESS',
        request: {
          url: request.url,
          method: request.method,
          isHTTPS,
          host: request.headers.get('host'),
          userAgent: request.headers.get('user-agent'),
        },
        timestamp: new Date(),
        isSecure: isHTTPS,
      });

      return null; // Continue with request
    } catch (error) {
      console.error('HTTPS enforcement error:', error);
      return NextResponse.json(
        { error: 'Security enforcement failed' },
        { status: 500 }
      );
    }
  }

  /**
   * Generate security headers for HTTPS enforcement
   */
  generateSecurityHeaders(request: NextRequest): Record<string, string> {
    const headers: Record<string, string> = {};

    // HSTS (HTTP Strict Transport Security)
    if (
      this.isSecureRequest(request) ||
      process.env.NODE_ENV === 'production'
    ) {
      const hstsDirectives = [`max-age=${this.config.hstsMaxAge}`];

      if (this.config.hstsIncludeSubdomains) {
        hstsDirectives.push('includeSubDomains');
      }

      if (this.config.hstsPreload) {
        hstsDirectives.push('preload');
      }

      headers['Strict-Transport-Security'] = hstsDirectives.join('; ');
    }

    // Upgrade insecure requests
    if (this.config.upgradeInsecureRequests) {
      headers['Content-Security-Policy'] =
        (headers['Content-Security-Policy']
          ? headers['Content-Security-Policy'] + '; '
          : '') + 'upgrade-insecure-requests';
    }

    // Additional transport security headers
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Certificate transparency
    headers['Expect-CT'] = `max-age=86400, enforce`;

    // Cross-Origin policies
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    return headers;
  }

  /**
   * Check SSL certificate health
   */
  async checkSSLHealth(domain: string): Promise<SSLHealthCheck> {
    const result: SSLHealthCheck = {
      domain,
      isValid: false,
      warnings: [],
      errors: [],
    };

    try {
      // In a real implementation, you would use a library like 'ssl-checker'
      // or make actual TLS connections to check certificate validity

      // For now, we'll simulate the check
      const cachedResult = await redisCache.get<SSLHealthCheck>(
        'global',
        'ssl_checks',
        domain
      );

      if (cachedResult) {
        return cachedResult;
      }

      // Simulate SSL certificate check
      result.isValid = true;
      result.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
      result.issuer = "Let's Encrypt Authority X3";
      result.subject = domain;

      // Check for certificate expiry warnings
      const daysUntilExpiry = Math.ceil(
        (result.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      if (daysUntilExpiry < 30) {
        result.warnings.push(`Certificate expires in ${daysUntilExpiry} days`);
      }

      if (daysUntilExpiry < 7) {
        result.errors.push(
          `Certificate expires very soon (${daysUntilExpiry} days)`
        );
        result.isValid = false;
      }

      // Cache the result for 1 hour
      await redisCache.set('global', 'ssl_checks', domain, result, 3600);

      return result;
    } catch (error) {
      result.errors.push(
        `SSL check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return result;
    }
  }

  /**
   * Validate certificate chain
   */
  async validateCertificateChain(domain: string): Promise<{
    isValid: boolean;
    chain: Array<{
      subject: string;
      issuer: string;
      validFrom: Date;
      validTo: Date;
      fingerprint: string;
    }>;
    errors: string[];
  }> {
    try {
      // In a real implementation, this would validate the complete certificate chain
      // For now, we'll return a mock response

      return {
        isValid: true,
        chain: [
          {
            subject: domain,
            issuer: "Let's Encrypt Authority X3",
            validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            fingerprint: 'sha256:1234567890abcdef...',
          },
        ],
        errors: [],
      };
    } catch (error) {
      return {
        isValid: false,
        chain: [],
        errors: [
          `Certificate chain validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Monitor SSL certificate expiration
   */
  async monitorCertificateExpiration(domains: string[]): Promise<{
    alerts: Array<{
      domain: string;
      severity: 'warning' | 'critical';
      message: string;
      expiresAt: Date;
    }>;
    summary: {
      total: number;
      expiringSoon: number;
      expired: number;
    };
  }> {
    const alerts: any[] = [];
    let expiringSoon = 0;
    let expired = 0;

    for (const domain of domains) {
      try {
        const sslCheck = await this.checkSSLHealth(domain);

        if (sslCheck.expiresAt) {
          const daysUntilExpiry = Math.ceil(
            (sslCheck.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          );

          if (daysUntilExpiry < 0) {
            expired++;
            alerts.push({
              domain,
              severity: 'critical' as const,
              message: `Certificate expired ${Math.abs(daysUntilExpiry)} days ago`,
              expiresAt: sslCheck.expiresAt,
            });
          } else if (daysUntilExpiry <= 7) {
            expiringSoon++;
            alerts.push({
              domain,
              severity: 'critical' as const,
              message: `Certificate expires in ${daysUntilExpiry} days`,
              expiresAt: sslCheck.expiresAt,
            });
          } else if (daysUntilExpiry <= 30) {
            expiringSoon++;
            alerts.push({
              domain,
              severity: 'warning' as const,
              message: `Certificate expires in ${daysUntilExpiry} days`,
              expiresAt: sslCheck.expiresAt,
            });
          }
        }
      } catch (error) {
        alerts.push({
          domain,
          severity: 'critical' as const,
          message: `Failed to check certificate: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expiresAt: new Date(),
        });
      }
    }

    return {
      alerts,
      summary: {
        total: domains.length,
        expiringSoon,
        expired,
      },
    };
  }

  /**
   * Create middleware for HTTPS enforcement
   */
  createHTTPSMiddleware() {
    return async (request: NextRequest) => {
      const result = await this.enforceHTTPS(request);

      if (result) {
        return result; // Redirect or error response
      }

      // Add security headers to all responses
      const headers = this.generateSecurityHeaders(request);

      return {
        status: 200,
        headers,
      };
    };
  }

  // Private helper methods

  private isSecureRequest(request: NextRequest): boolean {
    // Check various indicators of HTTPS
    const proto = request.headers.get('x-forwarded-proto');
    const scheme = request.headers.get('x-forwarded-scheme');
    const isHTTPS = request.url.startsWith('https://');

    return (
      isHTTPS ||
      proto === 'https' ||
      scheme === 'https' ||
      request.headers.get('x-forwarded-ssl') === 'on'
    );
  }

  private redirectToHTTPS(request: NextRequest): NextResponse {
    const httpsUrl = request.url.replace(/^http:/, 'https:');

    const response = NextResponse.redirect(httpsUrl, 301);

    // Add HSTS header to redirect response
    response.headers.set(
      'Strict-Transport-Security',
      `max-age=${this.config.hstsMaxAge}; includeSubDomains; preload`
    );

    return response;
  }

  private validateHost(request: NextRequest): {
    isValid: boolean;
    error?: string;
  } {
    const host = request.headers.get('host');

    if (!host) {
      return { isValid: false, error: 'Missing host header' };
    }

    // Check against allowed hosts
    if (this.config.allowedHosts.length > 0) {
      const isAllowed = this.config.allowedHosts.some((allowedHost) => {
        if (allowedHost.startsWith('*.')) {
          const domain = allowedHost.slice(2);
          return host.endsWith(domain);
        }
        return host === allowedHost;
      });

      if (!isAllowed) {
        return { isValid: false, error: `Host ${host} not in allowed list` };
      }
    }

    // Additional host validation
    if (host.includes('..') || host.includes('/')) {
      return { isValid: false, error: 'Invalid host format' };
    }

    return { isValid: true };
  }

  private async logSecurityEvent(event: any): Promise<void> {
    try {
      await redisCache.set(
        'global',
        'security_events',
        `https:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
        event,
        86400 // 24 hours
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

/**
 * Default HTTPS configuration
 */
export const DEFAULT_HTTPS_CONFIG: HTTPSConfig = {
  forceHTTPS: process.env.NODE_ENV === 'production',
  hstsMaxAge: 63072000, // 2 years
  hstsIncludeSubdomains: true,
  hstsPreload: true,
  upgradeInsecureRequests: true,
  checkCertificateExpiry: true,
  allowedHosts: [], // Empty means allow all
  trustedProxies: ['127.0.0.1', '::1'], // localhost
};

/**
 * Security headers utility
 */
export class SecurityHeaders {
  /**
   * Generate comprehensive security headers
   */
  static getSecurityHeaders(
    options: {
      cspNonce?: string;
      environment?: 'development' | 'production';
      reportUri?: string;
    } = {}
  ): Record<string, string> {
    const { cspNonce, environment = 'production', reportUri } = options;

    const headers: Record<string, string> = {
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',

      // Prevent clickjacking
      'X-Frame-Options': 'DENY',

      // Enable XSS filtering
      'X-XSS-Protection': '1; mode=block',

      // Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Feature policy
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()',

      // Disable DNS prefetching
      'X-DNS-Prefetch-Control': 'off',

      // Prevent IE from executing downloads in site's context
      'X-Download-Options': 'noopen',

      // Disable Adobe Flash cross-domain policies
      'X-Permitted-Cross-Domain-Policies': 'none',

      // Cross-Origin policies
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };

    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self'${cspNonce ? ` 'nonce-${cspNonce}'` : " 'unsafe-inline'"} 'strict-dynamic'`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' wss: ws:",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "manifest-src 'self'",
      "worker-src 'self'",
    ];

    if (environment === 'production') {
      cspDirectives.push('upgrade-insecure-requests');
    }

    if (reportUri) {
      cspDirectives.push(`report-uri ${reportUri}`);
    }

    headers['Content-Security-Policy'] = cspDirectives.join('; ');

    return headers;
  }

  /**
   * Apply security headers to response
   */
  static applyToResponse(
    response: NextResponse,
    options: Parameters<typeof SecurityHeaders.getSecurityHeaders>[0] = {}
  ): NextResponse {
    const headers = this.getSecurityHeaders(options);

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}
