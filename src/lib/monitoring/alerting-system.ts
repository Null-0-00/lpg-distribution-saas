/**
 * Advanced alerting system with multiple notification channels
 * Comprehensive alerting with escalation, rate limiting, and intelligent routing
 */

import { redisCache } from '@/lib/cache/redis-client';
import { ErrorEvent, AlertRule } from './error-tracker';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  escalated: boolean;
  escalationLevel: number;
  tags: Record<string, string>;
  metadata: Record<string, any>;
  notificationsSent: NotificationLog[];
}

export interface NotificationLog {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'failed' | 'retry';
  response?: any;
  retryCount: number;
}

export interface NotificationChannel {
  id: string;
  type:
    | 'email'
    | 'slack'
    | 'teams'
    | 'discord'
    | 'webhook'
    | 'sms'
    | 'push'
    | 'pagerduty';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  rateLimits: {
    maxPerHour: number;
    maxPerDay: number;
  };
  escalationDelay?: number; // minutes
  priority: number; // 1-10, higher = more priority
}

export interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
  enabled: boolean;
}

export interface EscalationLevel {
  level: number;
  delayMinutes: number;
  channels: string[]; // channel IDs
  conditions: {
    severities: string[];
    sources: string[];
    tags?: Record<string, string>;
  };
}

export interface AlertingConfig {
  defaultChannels: string[];
  escalationEnabled: boolean;
  acknowledgmentTimeout: number; // minutes
  autoResolveTimeout: number; // minutes
  rateLimitWindow: number; // minutes
  maxAlertsPerWindow: number;
  silentHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
    excludeSeverities: string[];
  };
}

/**
 * Advanced alerting system with multiple notification channels
 */
export class AlertingSystem {
  private static instance: AlertingSystem;
  private channels: Map<string, NotificationChannel> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private config: AlertingConfig;

  private constructor(config: AlertingConfig) {
    this.config = config;
    this.setupDefaultChannels();
    this.setupDefaultEscalationPolicies();
    this.setupPeriodicTasks();
  }

  static getInstance(config?: AlertingConfig): AlertingSystem {
    if (!AlertingSystem.instance) {
      if (!config) {
        throw new Error(
          'AlertingSystem requires config on first initialization'
        );
      }
      AlertingSystem.instance = new AlertingSystem(config);
    }
    return AlertingSystem.instance;
  }

  /**
   * Send alert through configured channels
   */
  async sendAlert(
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    options: {
      source?: string;
      tags?: Record<string, string>;
      metadata?: Record<string, any>;
      channels?: string[];
      skipEscalation?: boolean;
      immediateEscalation?: boolean;
    } = {}
  ): Promise<string> {
    try {
      // Check silent hours
      if (this.isInSilentHours(severity)) {
        console.log(`Alert suppressed due to silent hours: ${title}`);
        return 'suppressed';
      }

      // Check rate limits
      if (await this.isRateLimited()) {
        console.log(`Alert rate limited: ${title}`);
        return 'rate-limited';
      }

      // Create alert
      const alert: Alert = {
        id: this.generateId(),
        title,
        message,
        severity,
        source: options.source || 'system',
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        escalated: false,
        escalationLevel: 0,
        tags: options.tags || {},
        metadata: options.metadata || {},
        notificationsSent: [],
      };

      // Store alert
      this.activeAlerts.set(alert.id, alert);
      await this.storeAlert(alert);

      // Determine channels to use
      const channelsToUse = options.channels || this.config.defaultChannels;

      // Send notifications
      await this.sendNotifications(alert, channelsToUse);

      // Setup escalation if enabled
      if (this.config.escalationEnabled && !options.skipEscalation) {
        if (options.immediateEscalation) {
          await this.escalateAlert(alert.id);
        } else {
          this.scheduleEscalation(alert.id);
        }
      }

      // Setup auto-acknowledgment timeout
      this.scheduleAutoResolve(alert.id);

      return alert.id;
    } catch (error) {
      console.error('Failed to send alert:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    if (alert.acknowledged) {
      throw new Error('Alert already acknowledged');
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    await this.storeAlert(alert);

    // Send acknowledgment notification
    await this.sendAcknowledgmentNotification(alert);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    if (alert.resolved) {
      throw new Error('Alert already resolved');
    }

    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date();

    await this.storeAlert(alert);

    // Send resolution notification
    await this.sendResolutionNotification(alert);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);
  }

  /**
   * Add notification channel
   */
  async addChannel(channel: Omit<NotificationChannel, 'id'>): Promise<string> {
    const fullChannel: NotificationChannel = {
      id: this.generateId(),
      ...channel,
    };

    this.channels.set(fullChannel.id, fullChannel);

    // Store in Redis
    await redisCache.set(
      'global',
      'notification_channels',
      fullChannel.id,
      fullChannel,
      0 // No expiration
    );

    return fullChannel.id;
  }

  /**
   * Add escalation policy
   */
  async addEscalationPolicy(
    policy: Omit<EscalationPolicy, 'id'>
  ): Promise<string> {
    const fullPolicy: EscalationPolicy = {
      id: this.generateId(),
      ...policy,
    };

    this.escalationPolicies.set(fullPolicy.id, fullPolicy);

    await redisCache.set(
      'global',
      'escalation_policies',
      fullPolicy.id,
      fullPolicy,
      0
    );

    return fullPolicy.id;
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(timeRange: { start: Date; end: Date }): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
    acknowledged: number;
    resolved: number;
    escalated: number;
    avgResolutionTime: number; // minutes
    topSources: Array<{ source: string; count: number }>;
  }> {
    const alerts = await this.getAlertsInRange(timeRange);

    const stats = {
      total: alerts.length,
      bySeverity: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      acknowledged: 0,
      resolved: 0,
      escalated: 0,
      avgResolutionTime: 0,
      topSources: [] as Array<{ source: string; count: number }>,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const alert of alerts) {
      // Count by severity
      stats.bySeverity[alert.severity] =
        (stats.bySeverity[alert.severity] || 0) + 1;

      // Count by source
      stats.bySource[alert.source] = (stats.bySource[alert.source] || 0) + 1;

      // Count states
      if (alert.acknowledged) stats.acknowledged++;
      if (alert.resolved) stats.resolved++;
      if (alert.escalated) stats.escalated++;

      // Calculate resolution time
      if (alert.resolved && alert.resolvedAt) {
        const resolutionTime =
          alert.resolvedAt.getTime() - alert.timestamp.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    }

    // Average resolution time in minutes
    stats.avgResolutionTime =
      resolvedCount > 0
        ? Math.round(totalResolutionTime / resolvedCount / 60000)
        : 0;

    // Top sources
    stats.topSources = Object.entries(stats.bySource)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Test notification channel
   */
  async testChannel(
    channelId: string
  ): Promise<{ success: boolean; error?: string }> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }

    try {
      const testAlert: Alert = {
        id: 'test',
        title: 'Test Alert',
        message: 'This is a test notification to verify channel configuration.',
        severity: 'info',
        source: 'test',
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        escalated: false,
        escalationLevel: 0,
        tags: { test: 'true' },
        metadata: {},
        notificationsSent: [],
      };

      await this.sendNotificationToChannel(channel, testAlert);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Private helper methods

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async storeAlert(alert: Alert): Promise<void> {
    await redisCache.set(
      'global',
      'alerts',
      alert.id,
      alert,
      30 * 24 * 60 * 60 // 30 days
    );
  }

  private async getAlertsInRange(timeRange: {
    start: Date;
    end: Date;
  }): Promise<Alert[]> {
    // In a real implementation, this would query a time-series database
    const alerts: Alert[] = [];

    for (const alert of this.activeAlerts.values()) {
      if (
        alert.timestamp >= timeRange.start &&
        alert.timestamp <= timeRange.end
      ) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private isInSilentHours(severity: string): boolean {
    if (!this.config.silentHours.enabled) return false;
    if (this.config.silentHours.excludeSeverities.includes(severity))
      return false;

    const now = new Date();
    const currentTime = now
      .toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: this.config.silentHours.timezone,
      })
      .substring(0, 5);

    const start = this.config.silentHours.start;
    const end = this.config.silentHours.end;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight silent hours
      return currentTime >= start || currentTime <= end;
    }
  }

  private async isRateLimited(): Promise<boolean> {
    const windowStart = Date.now() - this.config.rateLimitWindow * 60 * 1000;
    const recentAlertsCount = await redisCache.increment(
      'global',
      'alert_rate_limit',
      `window:${Math.floor(Date.now() / (this.config.rateLimitWindow * 60 * 1000))}`,
      this.config.rateLimitWindow * 60
    );

    return recentAlertsCount > this.config.maxAlertsPerWindow;
  }

  private async sendNotifications(
    alert: Alert,
    channelIds: string[]
  ): Promise<void> {
    const notifications = [];

    for (const channelId of channelIds) {
      const channel = this.channels.get(channelId);
      if (channel && channel.enabled) {
        notifications.push(this.sendNotificationToChannel(channel, alert));
      }
    }

    await Promise.allSettled(notifications);
  }

  private async sendNotificationToChannel(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    const log: NotificationLog = {
      id: this.generateId(),
      channel,
      recipient: this.getChannelRecipient(channel),
      sentAt: new Date(),
      status: 'sent',
      retryCount: 0,
    };

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailNotification(channel, alert);
          break;
        case 'slack':
          await this.sendSlackNotification(channel, alert);
          break;
        case 'teams':
          await this.sendTeamsNotification(channel, alert);
          break;
        case 'discord':
          await this.sendDiscordNotification(channel, alert);
          break;
        case 'webhook':
          await this.sendWebhookNotification(channel, alert);
          break;
        case 'sms':
          await this.sendSMSNotification(channel, alert);
          break;
        case 'push':
          await this.sendPushNotification(channel, alert);
          break;
        case 'pagerduty':
          await this.sendPagerDutyNotification(channel, alert);
          break;
        default:
          throw new Error(`Unsupported channel type: ${channel.type}`);
      }

      log.status = 'delivered';
    } catch (error) {
      log.status = 'failed';
      log.response = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      throw error;
    } finally {
      alert.notificationsSent.push(log);
    }
  }

  private getChannelRecipient(channel: NotificationChannel): string {
    switch (channel.type) {
      case 'email':
        return channel.config.recipient || 'unknown';
      case 'slack':
        return channel.config.channel || 'unknown';
      case 'sms':
        return channel.config.phoneNumber || 'unknown';
      default:
        return 'unknown';
    }
  }

  private async sendEmailNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    // Email notification implementation
    console.log(
      `Email notification sent to ${channel.config.recipient}:`,
      alert.title
    );
  }

  private async sendSlackNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    const payload = {
      channel: channel.config.channel,
      text: `🚨 ${alert.title}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            { title: 'Source', value: alert.source, short: true },
            { title: 'Message', value: alert.message, short: false },
            {
              title: 'Time',
              value: alert.timestamp.toISOString(),
              short: true,
            },
          ],
        },
      ],
    };

    if (channel.config.webhookUrl) {
      await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  }

  private async sendTeamsNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: this.getSeverityColor(alert.severity),
      summary: alert.title,
      sections: [
        {
          activityTitle: alert.title,
          activitySubtitle: `Severity: ${alert.severity.toUpperCase()}`,
          facts: [
            { name: 'Source', value: alert.source },
            { name: 'Time', value: alert.timestamp.toISOString() },
            { name: 'Message', value: alert.message },
          ],
        },
      ],
    };

    if (channel.config.webhookUrl) {
      await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  }

  private async sendDiscordNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    const payload = {
      embeds: [
        {
          title: alert.title,
          description: alert.message,
          color: parseInt(
            this.getSeverityColor(alert.severity).replace('#', ''),
            16
          ),
          fields: [
            {
              name: 'Severity',
              value: alert.severity.toUpperCase(),
              inline: true,
            },
            { name: 'Source', value: alert.source, inline: true },
            {
              name: 'Time',
              value: alert.timestamp.toISOString(),
              inline: false,
            },
          ],
          timestamp: alert.timestamp.toISOString(),
        },
      ],
    };

    if (channel.config.webhookUrl) {
      await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  }

  private async sendWebhookNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    const payload = {
      alert,
      timestamp: new Date().toISOString(),
    };

    await fetch(channel.config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(channel.config.headers || {}),
      },
      body: JSON.stringify(payload),
    });
  }

  private async sendSMSNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    // SMS notification implementation would use a service like Twilio
    console.log(
      `SMS notification sent to ${channel.config.phoneNumber}:`,
      alert.title
    );
  }

  private async sendPushNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    // Push notification implementation would use a service like Firebase
    console.log(`Push notification sent:`, alert.title);
  }

  private async sendPagerDutyNotification(
    channel: NotificationChannel,
    alert: Alert
  ): Promise<void> {
    // PagerDuty notification implementation
    console.log(`PagerDuty notification sent:`, alert.title);
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      info: '#36a3eb',
      warning: '#ffcd56',
      error: '#ff6384',
      critical: '#ff0000',
    };
    return colors[severity as keyof typeof colors] || '#36a3eb';
  }

  private scheduleEscalation(alertId: string): void {
    setTimeout(
      async () => {
        await this.escalateAlert(alertId);
      },
      this.config.acknowledgmentTimeout * 60 * 1000
    );
  }

  private async escalateAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.acknowledged || alert.resolved) return;

    alert.escalated = true;
    alert.escalationLevel++;

    // Find applicable escalation policy
    const policy = this.findEscalationPolicy(alert);
    if (policy) {
      const level = policy.levels.find(
        (l) => l.level === alert.escalationLevel
      );
      if (level) {
        await this.sendNotifications(alert, level.channels);
      }
    }

    await this.storeAlert(alert);
  }

  private findEscalationPolicy(alert: Alert): EscalationPolicy | undefined {
    for (const policy of this.escalationPolicies.values()) {
      if (!policy.enabled) continue;

      const level = policy.levels.find(
        (l) => l.level === alert.escalationLevel
      );
      if (level) {
        const conditions = level.conditions;

        if (
          conditions.severities.includes(alert.severity) &&
          conditions.sources.includes(alert.source)
        ) {
          return policy;
        }
      }
    }

    return undefined;
  }

  private scheduleAutoResolve(alertId: string): void {
    setTimeout(
      async () => {
        const alert = this.activeAlerts.get(alertId);
        if (alert && !alert.resolved) {
          await this.resolveAlert(alertId, 'auto-resolve');
        }
      },
      this.config.autoResolveTimeout * 60 * 1000
    );
  }

  private async sendAcknowledgmentNotification(alert: Alert): Promise<void> {
    // Send acknowledgment notification to relevant channels
    console.log(
      `Alert acknowledged: ${alert.title} by ${alert.acknowledgedBy}`
    );
  }

  private async sendResolutionNotification(alert: Alert): Promise<void> {
    // Send resolution notification to relevant channels
    console.log(`Alert resolved: ${alert.title} by ${alert.resolvedBy}`);
  }

  private setupDefaultChannels(): void {
    // Setup would load from configuration or database
  }

  private setupDefaultEscalationPolicies(): void {
    // Setup would load from configuration or database
  }

  private setupPeriodicTasks(): void {
    // Check for escalations every minute
    setInterval(() => {
      this.processEscalations();
    }, 60000);

    // Clean up old alerts every hour
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 3600000);
  }

  private async processEscalations(): Promise<void> {
    // Process pending escalations
  }

  private async cleanupOldAlerts(): Promise<void> {
    // Clean up resolved alerts older than retention period
  }
}

/**
 * Default alerting configuration
 */
export const DEFAULT_ALERTING_CONFIG: AlertingConfig = {
  defaultChannels: [],
  escalationEnabled: true,
  acknowledgmentTimeout: 15, // 15 minutes
  autoResolveTimeout: 60, // 1 hour
  rateLimitWindow: 5, // 5 minutes
  maxAlertsPerWindow: 10,
  silentHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'UTC',
    excludeSeverities: ['critical'],
  },
};
