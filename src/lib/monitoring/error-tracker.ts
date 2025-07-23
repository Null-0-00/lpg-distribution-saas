/**
 * Error tracking and alerting system
 * Comprehensive error monitoring, logging, and alerting with integrations
 */

import { redisCache } from '@/lib/cache/redis-client';
import { NextRequest } from 'next/server';

export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'critical';
  source: 'client' | 'server' | 'database' | 'external' | 'security';
  timestamp: Date;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  tags: Record<string, string>;
  metadata: Record<string, any>;
  fingerprint: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    errorType?: string;
    errorSource?: string;
    threshold: number;
    timeWindow: number; // minutes
    operator: 'greater_than' | 'less_than' | 'equals';
  };
  actions: AlertAction[];
  enabled: boolean;
  lastTriggered?: Date;
  cooldown: number; // minutes
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  config: Record<string, any>;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorRate: number;
  topErrors: Array<{
    fingerprint: string;
    message: string;
    count: number;
    lastSeen: Date;
  }>;
  errorsBySource: Record<string, number>;
  errorsByType: Record<string, number>;
  trends: Array<{
    timestamp: Date;
    count: number;
  }>;
  affectedUsers: number;
  affectedTenants: number;
}

/**
 * Error tracking and monitoring system
 */
export class ErrorTracker {
  private static instance: ErrorTracker;
  private alertRules: Map<string, AlertRule> = new Map();
  private errorBuffer: Map<string, ErrorEvent> = new Map();

  private constructor() {
    this.setupDefaultAlertRules();
    this.setupPeriodicProcessing();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Capture and process an error
   */
  async captureError(
    error: Error | string,
    context: {
      source?: 'client' | 'server' | 'database' | 'external' | 'security';
      type?: 'error' | 'warning' | 'critical';
      userId?: string;
      tenantId?: string;
      sessionId?: string;
      request?: NextRequest;
      tags?: Record<string, string>;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorStack = typeof error === 'string' ? undefined : error.stack;
      
      // Generate fingerprint for grouping similar errors
      const fingerprint = this.generateFingerprint(errorMessage, errorStack, context.source);
      
      // Check if error already exists
      let existingError = await this.getErrorByFingerprint(fingerprint);
      
      if (existingError) {
        // Update existing error
        existingError.count += 1;
        existingError.lastSeen = new Date();
        
        // Update metadata if provided
        if (context.metadata) {
          existingError.metadata = { ...existingError.metadata, ...context.metadata };
        }
      } else {
        // Create new error event
        existingError = {
          id: this.generateId(),
          message: errorMessage,
          stack: errorStack,
          type: context.type || 'error',
          source: context.source || 'server',
          timestamp: new Date(),
          userId: context.userId,
          tenantId: context.tenantId,
          sessionId: context.sessionId,
          url: context.request?.url,
          userAgent: context.request?.headers.get('user-agent') || undefined,
          ip: this.getClientIP(context.request),
          tags: context.tags || {},
          metadata: context.metadata || {},
          fingerprint,
          count: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          resolved: false,
          priority: this.calculatePriority(context.type || 'error', context.source || 'server')
        };
      }

      // Store error
      await this.storeError(existingError);
      
      // Buffer for real-time processing
      this.errorBuffer.set(fingerprint, existingError);
      
      // Check alert rules
      await this.checkAlertRules(existingError);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error captured:', {
          id: existingError.id,
          message: errorMessage,
          source: existingError.source,
          fingerprint
        });
      }

      return existingError.id;

    } catch (captureError) {
      console.error('Failed to capture error:', captureError);
      return 'capture-failed';
    }
  }

  /**
   * Get error analytics for a time period
   */
  async getAnalytics(
    timeRange: { start: Date; end: Date },
    filters: {
      tenantId?: string;
      source?: string;
      type?: string;
      userId?: string;
    } = {}
  ): Promise<ErrorAnalytics> {
    try {
      const errors = await this.getErrorsInRange(timeRange, filters);
      
      const totalErrors = errors.reduce((sum, error) => sum + error.count, 0);
      const uniqueUsers = new Set(errors.map(e => e.userId).filter(Boolean)).size;
      const uniqueTenants = new Set(errors.map(e => e.tenantId).filter(Boolean)).size;
      
      // Calculate error rate (errors per hour)
      const timeRangeHours = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60);
      const errorRate = totalErrors / Math.max(timeRangeHours, 1);
      
      // Top errors by count
      const topErrors = errors
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(error => ({
          fingerprint: error.fingerprint,
          message: error.message,
          count: error.count,
          lastSeen: error.lastSeen
        }));

      // Group by source
      const errorsBySource = errors.reduce((acc, error) => {
        acc[error.source] = (acc[error.source] || 0) + error.count;
        return acc;
      }, {} as Record<string, number>);

      // Group by type
      const errorsByType = errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + error.count;
        return acc;
      }, {} as Record<string, number>);

      // Generate hourly trends
      const trends = this.generateTrends(errors, timeRange);

      return {
        totalErrors,
        errorRate,
        topErrors,
        errorsBySource,
        errorsByType,
        trends,
        affectedUsers: uniqueUsers,
        affectedTenants: uniqueTenants
      };

    } catch (error) {
      console.error('Failed to get error analytics:', error);
      throw error;
    }
  }

  /**
   * Add alert rule
   */
  async addAlertRule(rule: Omit<AlertRule, 'id'>): Promise<string> {
    const fullRule: AlertRule = {
      id: this.generateId(),
      ...rule
    };

    this.alertRules.set(fullRule.id, fullRule);
    
    // Store in Redis
    await redisCache.set(
      'global',
      'alert_rules',
      fullRule.id,
      fullRule,
      0 // No expiration
    );

    return fullRule.id;
  }

  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) throw new Error('Alert rule not found');

    const updatedRule = { ...rule, ...updates };
    this.alertRules.set(ruleId, updatedRule);
    
    await redisCache.set(
      'global',
      'alert_rules',
      ruleId,
      updatedRule,
      0
    );
  }

  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<void> {
    this.alertRules.delete(ruleId);
    await redisCache.delete('global', 'alert_rules', ruleId);
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Resolve error
   */
  async resolveError(errorId: string, assignee?: string): Promise<void> {
    const error = await this.getErrorById(errorId);
    if (!error) throw new Error('Error not found');

    error.resolved = true;
    error.assignee = assignee;

    await this.storeError(error);
  }

  /**
   * Create error tracking middleware
   */
  createErrorTrackingMiddleware() {
    return async (request: NextRequest, error: Error) => {
      await this.captureError(error, {
        source: 'server',
        type: 'error',
        request,
        tags: {
          method: request.method,
          path: new URL(request.url).pathname
        },
        metadata: {
          headers: Object.fromEntries(request.headers.entries()),
          timestamp: new Date().toISOString()
        }
      });
    };
  }

  /**
   * Client-side error capture endpoint
   */
  async handleClientError(errorData: {
    message: string;
    stack?: string;
    url: string;
    line?: number;
    column?: number;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    return this.captureError(errorData.message, {
      source: 'client',
      type: 'error',
      userId: errorData.userId,
      sessionId: errorData.sessionId,
      tags: {
        url: errorData.url,
        line: errorData.line?.toString() || '',
        column: errorData.column?.toString() || '',
        userAgent: errorData.userAgent
      },
      metadata: {
        stack: errorData.stack,
        ...errorData.metadata
      }
    });
  }

  // Private helper methods

  private generateFingerprint(message: string, stack?: string, source?: string): string {
    // Create a consistent fingerprint for grouping similar errors
    const content = `${source || 'unknown'}:${message}:${stack?.split('\n')[0] || ''}`;
    return Buffer.from(content).toString('base64').substring(0, 16);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getClientIP(request?: NextRequest): string | undefined {
    if (!request) return undefined;
    
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           request.ip ||
           undefined;
  }

  private calculatePriority(type: string, source: string): 'low' | 'medium' | 'high' | 'critical' {
    if (type === 'critical' || source === 'security') return 'critical';
    if (type === 'error' && (source === 'database' || source === 'server')) return 'high';
    if (type === 'warning') return 'medium';
    return 'low';
  }

  private async storeError(error: ErrorEvent): Promise<void> {
    try {
      // Store in Redis with TTL
      await redisCache.set(
        'global',
        'errors',
        error.id,
        error,
        7 * 24 * 60 * 60 // 7 days
      );

      // Store by fingerprint for grouping
      await redisCache.set(
        'global',
        'errors_by_fingerprint',
        error.fingerprint,
        error,
        7 * 24 * 60 * 60
      );

      // Store in time-series for analytics
      const hourKey = new Date(error.timestamp).toISOString().substring(0, 13);
      await redisCache.set(
        'global',
        'error_timeseries',
        `${hourKey}:${error.fingerprint}`,
        {
          fingerprint: error.fingerprint,
          count: error.count,
          timestamp: error.timestamp
        },
        30 * 24 * 60 * 60 // 30 days
      );

    } catch (storeError) {
      console.error('Failed to store error:', storeError);
    }
  }

  private async getErrorByFingerprint(fingerprint: string): Promise<ErrorEvent | null> {
    try {
      return await redisCache.get<ErrorEvent>('global', 'errors_by_fingerprint', fingerprint);
    } catch {
      return null;
    }
  }

  private async getErrorById(errorId: string): Promise<ErrorEvent | null> {
    try {
      return await redisCache.get<ErrorEvent>('global', 'errors', errorId);
    } catch {
      return null;
    }
  }

  private async getErrorsInRange(
    timeRange: { start: Date; end: Date },
    filters: Record<string, any>
  ): Promise<ErrorEvent[]> {
    // In a real implementation, this would query a time-series database
    // For now, return from buffer and cache
    const errors: ErrorEvent[] = [];
    
    // Add buffered errors
    for (const error of this.errorBuffer.values()) {
      if (error.timestamp >= timeRange.start && 
          error.timestamp <= timeRange.end &&
          this.matchesFilters(error, filters)) {
        errors.push(error);
      }
    }

    return errors;
  }

  private matchesFilters(error: ErrorEvent, filters: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (value && (error as any)[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private generateTrends(errors: ErrorEvent[], timeRange: { start: Date; end: Date }): Array<{
    timestamp: Date;
    count: number;
  }> {
    const trends: Array<{ timestamp: Date; count: number }> = [];
    const hourlyBuckets = new Map<string, number>();

    // Group errors by hour
    for (const error of errors) {
      const hour = new Date(error.timestamp).toISOString().substring(0, 13);
      hourlyBuckets.set(hour, (hourlyBuckets.get(hour) || 0) + error.count);
    }

    // Fill in all hours in range
    const startHour = new Date(timeRange.start);
    startHour.setMinutes(0, 0, 0);
    
    while (startHour <= timeRange.end) {
      const hourKey = startHour.toISOString().substring(0, 13);
      trends.push({
        timestamp: new Date(startHour),
        count: hourlyBuckets.get(hourKey) || 0
      });
      startHour.setHours(startHour.getHours() + 1);
    }

    return trends;
  }

  private async checkAlertRules(error: ErrorEvent): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered && 
          Date.now() - rule.lastTriggered.getTime() < rule.cooldown * 60 * 1000) {
        continue;
      }

      // Check conditions
      if (await this.evaluateAlertCondition(rule, error)) {
        await this.triggerAlert(rule, error);
      }
    }
  }

  private async evaluateAlertCondition(rule: AlertRule, error: ErrorEvent): Promise<boolean> {
    const { condition } = rule;
    
    // Check error type and source filters
    if (condition.errorType && error.type !== condition.errorType) return false;
    if (condition.errorSource && error.source !== condition.errorSource) return false;

    // Check threshold over time window
    const windowStart = new Date(Date.now() - condition.timeWindow * 60 * 1000);
    const recentErrors = await this.getErrorsInRange(
      { start: windowStart, end: new Date() },
      {
        type: condition.errorType,
        source: condition.errorSource
      }
    );

    const totalCount = recentErrors.reduce((sum, e) => sum + e.count, 0);

    switch (condition.operator) {
      case 'greater_than':
        return totalCount > condition.threshold;
      case 'less_than':
        return totalCount < condition.threshold;
      case 'equals':
        return totalCount === condition.threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(rule: AlertRule, error: ErrorEvent): Promise<void> {
    try {
      // Update last triggered
      rule.lastTriggered = new Date();
      await this.updateAlertRule(rule.id, { lastTriggered: rule.lastTriggered });

      // Execute alert actions
      for (const action of rule.actions) {
        await this.executeAlertAction(action, rule, error);
      }

      // Log alert
      console.log(`Alert triggered: ${rule.name} for error: ${error.message}`);

    } catch (alertError) {
      console.error('Failed to trigger alert:', alertError);
    }
  }

  private async executeAlertAction(
    action: AlertAction,
    rule: AlertRule,
    error: ErrorEvent
  ): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.sendEmailAlert(action.config, rule, error);
        break;
      case 'slack':
        await this.sendSlackAlert(action.config, rule, error);
        break;
      case 'webhook':
        await this.sendWebhookAlert(action.config, rule, error);
        break;
      case 'sms':
        await this.sendSMSAlert(action.config, rule, error);
        break;
      case 'pagerduty':
        await this.sendPagerDutyAlert(action.config, rule, error);
        break;
    }
  }

  private async sendEmailAlert(config: any, rule: AlertRule, error: ErrorEvent): Promise<void> {
    // Email alert implementation would go here
    console.log('Email alert sent:', { rule: rule.name, error: error.message });
  }

  private async sendSlackAlert(config: any, rule: AlertRule, error: ErrorEvent): Promise<void> {
    // Slack alert implementation would go here
    console.log('Slack alert sent:', { rule: rule.name, error: error.message });
  }

  private async sendWebhookAlert(config: any, rule: AlertRule, error: ErrorEvent): Promise<void> {
    try {
      const payload = {
        rule: rule.name,
        error: {
          id: error.id,
          message: error.message,
          type: error.type,
          source: error.source,
          count: error.count,
          timestamp: error.timestamp
        }
      };

      await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {})
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async sendSMSAlert(config: any, rule: AlertRule, error: ErrorEvent): Promise<void> {
    // SMS alert implementation would go here
    console.log('SMS alert sent:', { rule: rule.name, error: error.message });
  }

  private async sendPagerDutyAlert(config: any, rule: AlertRule, error: ErrorEvent): Promise<void> {
    // PagerDuty alert implementation would go here
    console.log('PagerDuty alert sent:', { rule: rule.name, error: error.message });
  }

  private setupDefaultAlertRules(): void {
    // Critical errors
    this.addAlertRule({
      name: 'Critical Errors',
      condition: {
        errorType: 'critical',
        threshold: 1,
        timeWindow: 5,
        operator: 'greater_than'
      },
      actions: [
        {
          type: 'email',
          config: { recipients: ['admin@company.com'] }
        }
      ],
      enabled: true,
      cooldown: 15
    });

    // High error rate
    this.addAlertRule({
      name: 'High Error Rate',
      condition: {
        threshold: 50,
        timeWindow: 10,
        operator: 'greater_than'
      },
      actions: [
        {
          type: 'slack',
          config: { channel: '#alerts' }
        }
      ],
      enabled: true,
      cooldown: 30
    });
  }

  private setupPeriodicProcessing(): void {
    // Process error buffer every 30 seconds
    setInterval(() => {
      this.processErrorBuffer();
    }, 30000);

    // Clean up old errors every hour
    setInterval(() => {
      this.cleanupOldErrors();
    }, 3600000);
  }

  private async processErrorBuffer(): Promise<void> {
    // Aggregate similar errors and update counts
    // This would be more sophisticated in a real implementation
  }

  private async cleanupOldErrors(): Promise<void> {
    // Remove errors older than retention period
    // This would be implemented with proper time-series cleanup
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandler(): void {
  const errorTracker = ErrorTracker.getInstance();

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    errorTracker.captureError(
      reason instanceof Error ? reason : new Error(String(reason)),
      {
        source: 'server',
        type: 'critical',
        tags: { type: 'unhandledRejection' },
        metadata: { promise: promise.toString() }
      }
    );
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    errorTracker.captureError(error, {
      source: 'server',
      type: 'critical',
      tags: { type: 'uncaughtException' }
    });
  });
}

/**
 * React error boundary integration
 */
export class ErrorBoundary {
  static captureError(error: Error, errorInfo: any): void {
    const errorTracker = ErrorTracker.getInstance();
    
    errorTracker.captureError(error, {
      source: 'client',
      type: 'error',
      tags: { type: 'react-error-boundary' },
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }
}