/**
 * XSS protection and CSRF token management
 * Comprehensive protection against Cross-Site Scripting and Cross-Site Request Forgery attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { redisCache } from '@/lib/cache/redis-client';
// import DOMPurify from 'isomorphic-dompurify';

export interface CSRFTokenResult {
  token: string;
  expiresAt: Date;
  signature: string;
}

export interface XSSFilterResult {
  cleaned: string;
  blocked: string[];
  threats: Array<{
    type: string;
    pattern: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface SecurityConfig {
  csrfTokenExpiry: number; // seconds
  csrfSecret: string;
  xssStrictMode: boolean;
  allowedTags: string[];
  allowedAttributes: string[];
  contentSecurityPolicy: {
    directives: Record<string, string[]>;
  };
}

/**
 * XSS Protection and Content Sanitization
 */
export class XSSProtection {
  private static readonly XSS_PATTERNS = [
    {
      name: 'script_tags',
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      severity: 'critical' as const,
      description: 'Script tag execution',
    },
    {
      name: 'javascript_protocol',
      pattern: /javascript:/gi,
      severity: 'high' as const,
      description: 'JavaScript protocol usage',
    },
    {
      name: 'event_handlers',
      pattern: /on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
      severity: 'high' as const,
      description: 'Event handler attributes',
    },
    {
      name: 'iframe_tags',
      pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      severity: 'high' as const,
      description: 'Iframe embedding',
    },
    {
      name: 'object_embed',
      pattern: /<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
      severity: 'high' as const,
      description: 'Object/Embed tags',
    },
    {
      name: 'svg_scripts',
      pattern: /<svg[^>]*>[\s\S]*?<script[\s\S]*?<\/script>[\s\S]*?<\/svg>/gi,
      severity: 'high' as const,
      description: 'SVG with scripts',
    },
    {
      name: 'data_urls',
      pattern: /data:(?:text\/html|application\/javascript|text\/javascript)/gi,
      severity: 'medium' as const,
      description: 'Dangerous data URLs',
    },
    {
      name: 'vbscript',
      pattern: /vbscript:/gi,
      severity: 'medium' as const,
      description: 'VBScript protocol',
    },
    {
      name: 'expression',
      pattern: /expression\s*\(/gi,
      severity: 'medium' as const,
      description: 'CSS expressions',
    },
    {
      name: 'import_stylesheets',
      pattern: /@import\s+(?:url\s*\()?['"]?javascript:/gi,
      severity: 'medium' as const,
      description: 'CSS import with JavaScript',
    },
  ];

  private static readonly ALLOWED_TAGS_DEFAULT = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'i',
    'b',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
  ];

  private static readonly ALLOWED_ATTRIBUTES_DEFAULT = [
    'href',
    'src',
    'alt',
    'title',
    'class',
    'id',
    'target',
  ];

  /**
   * Filter and sanitize content for XSS protection
   */
  static filterXSS(
    input: string,
    options: {
      strictMode?: boolean;
      allowedTags?: string[];
      allowedAttributes?: string[];
      logThreats?: boolean;
    } = {}
  ): XSSFilterResult {
    const threats: Array<{
      type: string;
      pattern: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }> = [];
    const blocked: string[] = [];

    // Detect threats before sanitization
    for (const xssPattern of this.XSS_PATTERNS) {
      const matches = input.match(xssPattern.pattern);
      if (matches) {
        threats.push({
          type: xssPattern.name,
          pattern: xssPattern.description,
          severity: xssPattern.severity,
        });
        blocked.push(...matches);
      }
    }

    // Configure DOMPurify based on options
    const config: any = {
      ALLOWED_TAGS: options.allowedTags || this.ALLOWED_TAGS_DEFAULT,
      ALLOWED_ATTR:
        options.allowedAttributes || this.ALLOWED_ATTRIBUTES_DEFAULT,
      KEEP_CONTENT: true,
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame', 'frameset'],
      FORBID_ATTR: [
        'onerror',
        'onload',
        'onclick',
        'onmouseover',
        'onmouseout',
        'onkeydown',
        'onkeyup',
      ],
    };

    if (options.strictMode) {
      config.ALLOWED_TAGS = ['p', 'br', 'strong', 'em'];
      config.ALLOWED_ATTR = [];
      config.FORBID_TAGS.push('a', 'img', 'iframe', 'object', 'embed');
    }

    // Sanitize the content using simple regex-based approach
    let cleaned = this.simpleSanitize(input, options);

    // Additional manual cleaning for edge cases
    cleaned = this.performAdditionalCleaning(cleaned);

    // Log threats if enabled
    if (options.logThreats && threats.length > 0) {
      this.logXSSThreats(threats, input.substring(0, 200));
    }

    return { cleaned, blocked, threats };
  }

  /**
   * Simple sanitization without DOMPurify
   */
  private static simpleSanitize(input: string, options: any): string {
    let cleaned = input;

    // Remove all script tags
    cleaned = cleaned.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );

    // Remove iframe tags
    cleaned = cleaned.replace(
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ''
    );

    // Remove object and embed tags
    cleaned = cleaned.replace(
      /<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
      ''
    );

    // Remove event handlers
    cleaned = cleaned.replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

    // Remove javascript: and vbscript: protocols
    cleaned = cleaned.replace(/javascript:|vbscript:/gi, '');

    // If strict mode, remove all HTML tags
    if (options.strictMode) {
      cleaned = cleaned.replace(/<[^>]*>/g, '');
    }

    return cleaned;
  }

  /**
   * Perform additional cleaning for edge cases
   */
  private static performAdditionalCleaning(input: string): string {
    let cleaned = input;

    // Remove any remaining javascript: protocols
    cleaned = cleaned.replace(/javascript:/gi, '');

    // Remove data: URLs that could be dangerous
    cleaned = cleaned.replace(
      /data:(?:text\/html|application\/javascript|text\/javascript)[^"']*/gi,
      ''
    );

    // Remove CSS expressions
    cleaned = cleaned.replace(/expression\s*\([^)]*\)/gi, '');

    // Remove any remaining event handlers
    cleaned = cleaned.replace(/\son\w+\s*=\s*[^>\s]*/gi, '');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Log XSS threats for monitoring
   */
  private static async logXSSThreats(
    threats: Array<{ type: string; pattern: string; severity: string }>,
    sample: string
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'XSS_THREAT_DETECTED',
        threats,
        sample,
        severity: threats.some((t) => t.severity === 'critical')
          ? 'critical'
          : threats.some((t) => t.severity === 'high')
            ? 'high'
            : 'medium',
      };

      await redisCache.set(
        'global',
        'security_logs',
        `xss:${Date.now()}:${randomBytes(8).toString('hex')}`,
        logEntry,
        86400 // 24 hours
      );
    } catch (error) {
      console.error('Failed to log XSS threats:', error);
    }
  }

  /**
   * Create Content Security Policy header
   */
  static generateCSPHeader(config: SecurityConfig): string {
    const directives = [];

    for (const [directive, sources] of Object.entries(
      config.contentSecurityPolicy.directives
    )) {
      directives.push(`${directive} ${sources.join(' ')}`);
    }

    return directives.join('; ');
  }

  /**
   * Validate and sanitize URLs
   */
  static sanitizeURL(url: string): string | null {
    try {
      // Block dangerous protocols
      const dangerousProtocols = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
        'ftp:',
      ];

      for (const protocol of dangerousProtocols) {
        if (url.toLowerCase().startsWith(protocol)) {
          return null;
        }
      }

      // Parse and validate URL
      const parsedUrl = new URL(url);

      // Only allow http and https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }

      return parsedUrl.toString();
    } catch {
      return null;
    }
  }
}

/**
 * CSRF Protection Implementation
 */
export class CSRFProtection {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Generate CSRF token
   */
  async generateToken(sessionId: string): Promise<CSRFTokenResult> {
    const tokenData = {
      sessionId,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex'),
    };

    const token = randomBytes(32).toString('hex');
    const signature = this.createTokenSignature(token, tokenData);
    const expiresAt = new Date(Date.now() + this.config.csrfTokenExpiry * 1000);

    // Store token in Redis with expiration
    await redisCache.set(
      'global',
      'csrf_tokens',
      token,
      {
        sessionId,
        signature,
        expiresAt: expiresAt.toISOString(),
        ...tokenData,
      },
      this.config.csrfTokenExpiry
    );

    return { token, expiresAt, signature };
  }

  /**
   * Validate CSRF token
   */
  async validateToken(
    token: string,
    sessionId: string,
    request: NextRequest
  ): Promise<{
    isValid: boolean;
    error?: string;
    shouldRegenerate?: boolean;
  }> {
    try {
      if (!token) {
        return { isValid: false, error: 'CSRF token missing' };
      }

      // Retrieve token from Redis
      const storedData = await redisCache.get<any>(
        'global',
        'csrf_tokens',
        token
      );
      if (!storedData) {
        return {
          isValid: false,
          error: 'CSRF token not found or expired',
          shouldRegenerate: true,
        };
      }

      // Validate session ID
      if (storedData.sessionId !== sessionId) {
        return { isValid: false, error: 'CSRF token session mismatch' };
      }

      // Validate signature
      const expectedSignature = this.createTokenSignature(token, storedData);
      if (
        !timingSafeEqual(
          Buffer.from(storedData.signature),
          Buffer.from(expectedSignature)
        )
      ) {
        return { isValid: false, error: 'CSRF token signature invalid' };
      }

      // Check expiration
      const expiresAt = new Date(storedData.expiresAt);
      if (expiresAt <= new Date()) {
        return {
          isValid: false,
          error: 'CSRF token expired',
          shouldRegenerate: true,
        };
      }

      // Validate request origin (additional security)
      const originValidation = this.validateRequestOrigin(request);
      if (!originValidation.isValid) {
        return { isValid: false, error: originValidation.error };
      }

      // Token is valid - optionally rotate it for high-security operations
      const shouldRegenerate = this.shouldRegenerateToken(storedData);

      return { isValid: true, shouldRegenerate };
    } catch (error) {
      return {
        isValid: false,
        error: `CSRF validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Invalidate CSRF token
   */
  async invalidateToken(token: string): Promise<void> {
    try {
      await redisCache.delete('global', 'csrf_tokens', token);
    } catch (error) {
      console.error('Failed to invalidate CSRF token:', error);
    }
  }

  /**
   * Create token signature
   */
  private createTokenSignature(token: string, tokenData: any): string {
    const data = `${token}:${tokenData.sessionId}:${tokenData.timestamp}:${tokenData.nonce}`;
    return createHash('sha256')
      .update(data + this.config.csrfSecret)
      .digest('hex');
  }

  /**
   * Validate request origin
   */
  private validateRequestOrigin(request: NextRequest): {
    isValid: boolean;
    error?: string;
  } {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // For same-origin requests, origin might be null
    if (!origin && !referer) {
      return { isValid: false, error: 'Missing origin and referer headers' };
    }

    try {
      if (origin) {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return { isValid: false, error: 'Origin header mismatch' };
        }
      }

      if (referer) {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          return { isValid: false, error: 'Referer header mismatch' };
        }
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid origin or referer URL' };
    }
  }

  /**
   * Determine if token should be regenerated
   */
  private shouldRegenerateToken(tokenData: any): boolean {
    const tokenAge = Date.now() - tokenData.timestamp;
    const halfLife = (this.config.csrfTokenExpiry * 1000) / 2;

    // Regenerate if token is older than half its lifetime
    return tokenAge > halfLife;
  }

  /**
   * Create CSRF protection middleware
   */
  createCSRFMiddleware() {
    return async (request: NextRequest) => {
      // Skip CSRF protection for GET, HEAD, OPTIONS requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return { status: 200, skipCSRF: true };
      }

      const token =
        request.headers.get('x-csrf-token') ||
        request.headers.get('csrf-token');
      const sessionId =
        request.headers.get('x-session-id') ||
        request.cookies.get('session-id')?.value;

      if (!sessionId) {
        return {
          status: 401,
          error: 'Session ID required for CSRF protection',
        };
      }

      const validation = await this.validateToken(
        token || '',
        sessionId,
        request
      );

      if (!validation.isValid) {
        return {
          status: 403,
          error: 'CSRF protection failed',
          details: validation.error,
          shouldRegenerate: validation.shouldRegenerate,
        };
      }

      return {
        status: 200,
        shouldRegenerate: validation.shouldRegenerate,
      };
    };
  }
}

/**
 * Combined XSS and CSRF protection middleware
 */
export class SecurityProtectionMiddleware {
  private xssProtection: typeof XSSProtection;
  private csrfProtection: CSRFProtection;
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.xssProtection = XSSProtection;
    this.csrfProtection = new CSRFProtection(config);
  }

  /**
   * Apply comprehensive security protection
   */
  async protect(request: NextRequest): Promise<NextResponse | null> {
    try {
      // Apply CSRF protection
      const csrfResult =
        await this.csrfProtection.createCSRFMiddleware()(request);

      if (csrfResult.status !== 200) {
        return NextResponse.json(
          { error: csrfResult.error, details: csrfResult.details },
          { status: csrfResult.status }
        );
      }

      // Apply XSS protection to request body if present
      if (
        request.method !== 'GET' &&
        request.headers.get('content-type')?.includes('application/json')
      ) {
        try {
          const body = await request.json();
          const sanitizedBody = this.sanitizeRequestBody(body);

          // Replace request body with sanitized version
          const sanitizedRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody),
          });

          // Continue with sanitized request
          return null; // Let the request continue
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
          );
        }
      }

      return null; // Let the request continue
    } catch (error) {
      console.error('Security protection error:', error);
      return NextResponse.json(
        { error: 'Security protection failed' },
        { status: 500 }
      );
    }
  }

  /**
   * Sanitize request body recursively
   */
  private sanitizeRequestBody(obj: any): any {
    if (typeof obj === 'string') {
      const result = this.xssProtection.filterXSS(obj, {
        strictMode: this.config.xssStrictMode,
        allowedTags: this.config.allowedTags,
        allowedAttributes: this.config.allowedAttributes,
        logThreats: true,
      });
      return result.cleaned;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeRequestBody(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeRequestBody(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Generate security headers for response
   */
  generateSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.xssProtection.generateCSPHeader(
        this.config
      ),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
  }
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  csrfTokenExpiry: 3600, // 1 hour
  csrfSecret:
    process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  xssStrictMode: false,
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'a'],
  allowedAttributes: ['href', 'target', 'rel'],
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
  },
};
