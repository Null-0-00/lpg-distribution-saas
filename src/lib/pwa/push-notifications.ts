/**
 * Push Notifications Service
 * Handles web push notifications for important updates and real-time alerts
 */

import React from 'react';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
  timestamp?: number;
  vibrate?: number[];
  url?: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  userId?: string;
  tenantId?: string;
  deviceId?: string;
  preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  enabled: boolean;
  sales: boolean;
  inventory: boolean;
  alerts: boolean;
  reports: boolean;
  reminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: 'sales' | 'inventory' | 'alert' | 'report' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  icon?: string;
  actions?: NotificationAction[];
  variables?: string[];
}

/**
 * Push Notifications Manager
 */
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private vapidPublicKey: string;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private templates: Map<string, NotificationTemplate> = new Map();

  private constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    this.setupNotificationTemplates();
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Check for service worker support
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Check for push notification support
      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported');
        return false;
      }

      // Check for notification permission
      if (Notification.permission === 'denied') {
        console.warn('Notification permission denied');
        return false;
      }

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;

      // Setup message listener
      this.setupMessageListener();

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted');
        await this.subscribeUser();
      } else {
        console.log('Notification permission denied');
      }

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribeUser(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();

      if (this.subscription) {
        console.log('User already subscribed');
        await this.savePushSubscription(this.subscription);
        return this.subscription;
      }

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      console.log('User subscribed to push notifications');
      await this.savePushSubscription(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return null;
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribeUser(): Promise<boolean> {
    try {
      if (!this.subscription) {
        return true;
      }

      const unsubscribed = await this.subscription.unsubscribe();

      if (unsubscribed) {
        console.log('User unsubscribed from push notifications');
        await this.removePushSubscription();
        this.subscription = null;
      }

      return unsubscribed;
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      return false;
    }
  }

  /**
   * Send push notification using template
   */
  async sendNotification(
    templateId: string,
    variables: Record<string, string> = {},
    options: Partial<PushNotificationPayload> = {}
  ): Promise<boolean> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Replace variables in template
      const title = this.replaceVariables(template.title, variables);
      const body = this.replaceVariables(template.body, variables);

      const payload: PushNotificationPayload = {
        title,
        body,
        icon: template.icon || '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        data: {
          templateId,
          category: template.category,
          priority: template.priority,
          timestamp: Date.now(),
          ...options.data,
        },
        actions: template.actions,
        ...options,
      };

      // Check if we should send based on user preferences
      const shouldSend = await this.shouldSendNotification(template);
      if (!shouldSend) {
        console.log('Notification blocked by user preferences');
        return false;
      }

      // Send to server for delivery
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Show local notification (for immediate display)
   */
  async showLocalNotification(
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/images/icons/icon-192x192.png',
        badge: payload.badge || '/images/icons/badge-72x72.png',
        // image: payload.image, // Not supported in NotificationOptions
        data: payload.data || {},
        // actions: payload.actions || [], // Not supported in NotificationOptions
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        tag: payload.tag,
        // renotify: payload.renotify || false, // Not supported in NotificationOptions
        // timestamp: payload.timestamp || Date.now(), // Not supported in NotificationOptions
        // vibrate: payload.vibrate || [200, 100, 200], // Not supported in NotificationOptions
      });

      return true;
    } catch (error) {
      console.error('Failed to show local notification:', error);
      return false;
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
    }

    // Default preferences
    return {
      enabled: true,
      sales: true,
      inventory: true,
      alerts: true,
      reports: false,
      reminders: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      frequency: 'immediate',
    };
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`/api/notifications/history?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get notification history:', error);
    }

    return [];
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<boolean> {
    return this.showLocalNotification({
      title: 'Test Notification',
      body: 'This is a test notification to verify push notification functionality.',
      icon: '/images/icons/icon-192x192.png',
      data: { test: true },
      actions: [
        {
          action: 'acknowledge',
          title: 'OK',
        },
      ],
    });
  }

  // Private helper methods

  private setupNotificationTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'low-inventory-alert',
        name: 'Low Inventory Alert',
        title: 'Low Inventory Warning',
        body: '{{productName}} is running low ({{currentStock}} remaining)',
        category: 'inventory',
        priority: 'high',
        icon: '/images/icons/inventory-alert.png',
        actions: [
          { action: 'view-inventory', title: 'View Inventory' },
          { action: 'order-stock', title: 'Order Stock' },
        ],
        variables: ['productName', 'currentStock'],
      },
      {
        id: 'daily-sales-summary',
        name: 'Daily Sales Summary',
        title: 'Daily Sales Report',
        body: "Today's sales: {{totalSales}} with {{totalRevenue}} revenue",
        category: 'report',
        priority: 'normal',
        icon: '/images/icons/sales-report.png',
        actions: [{ action: 'view-report', title: 'View Report' }],
        variables: ['totalSales', 'totalRevenue'],
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        title: 'Payment Due Reminder',
        body: 'Payment of {{amount}} is due for {{customerName}}',
        category: 'reminder',
        priority: 'normal',
        icon: '/images/icons/payment-reminder.png',
        actions: [
          { action: 'view-payment', title: 'View Details' },
          { action: 'mark-paid', title: 'Mark as Paid' },
        ],
        variables: ['amount', 'customerName'],
      },
      {
        id: 'driver-alert',
        name: 'Driver Alert',
        title: 'Driver Update',
        body: 'Driver {{driverName}} has {{action}}',
        category: 'alert',
        priority: 'high',
        icon: '/images/icons/driver-alert.png',
        actions: [{ action: 'view-drivers', title: 'View Drivers' }],
        variables: ['driverName', 'action'],
      },
      {
        id: 'system-maintenance',
        name: 'System Maintenance',
        title: 'System Maintenance Notice',
        body: 'System maintenance scheduled for {{maintenanceTime}}',
        category: 'alert',
        priority: 'normal',
        icon: '/images/icons/maintenance-alert.png',
        variables: ['maintenanceTime'],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  private setupMessageListener(): void {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'NOTIFICATION_CLICKED':
          this.handleNotificationClick(payload);
          break;
        case 'NOTIFICATION_CLOSED':
          this.handleNotificationClose(payload);
          break;
      }
    });
  }

  private async savePushSubscription(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey('p256dh')!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))
          ),
        },
        userAgent: navigator.userAgent,
        deviceId: await this.getDeviceId(),
        preferences: await this.getNotificationPreferences(),
      };

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });
    } catch (error) {
      console.error('Failed to save push subscription:', error);
    }
  }

  private async removePushSubscription(): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to remove push subscription:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private replaceVariables(
    text: string,
    variables: Record<string, string>
  ): string {
    let result = text;

    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return result;
  }

  private async shouldSendNotification(
    template: NotificationTemplate
  ): Promise<boolean> {
    const preferences = await this.getNotificationPreferences();

    if (!preferences.enabled) {
      return false;
    }

    // Check category preferences
    switch (template.category) {
      case 'sales':
        if (!preferences.sales) return false;
        break;
      case 'inventory':
        if (!preferences.inventory) return false;
        break;
      case 'alert':
        if (!preferences.alerts) return false;
        break;
      case 'report':
        if (!preferences.reports) return false;
        break;
      case 'reminder':
        if (!preferences.reminders) return false;
        break;
    }

    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().substr(0, 5);
      const { start, end } = preferences.quietHours;

      if (this.isInQuietHours(currentTime, start, end)) {
        // Only allow urgent notifications during quiet hours
        return template.priority === 'urgent';
      }
    }

    return true;
  }

  private isInQuietHours(
    currentTime: string,
    start: string,
    end: string
  ): boolean {
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight quiet hours
      return currentTime >= start || currentTime <= end;
    }
  }

  private async getDeviceId(): Promise<string> {
    // Generate or retrieve a unique device ID
    let deviceId = localStorage.getItem('deviceId');

    if (!deviceId) {
      deviceId =
        'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
  }

  private handleNotificationClick(payload: any): void {
    console.log('Notification clicked:', payload);

    // Track notification interaction
    this.trackNotificationInteraction('click', payload);

    // Handle specific actions
    if (payload.action) {
      this.handleNotificationAction(payload.action, payload.data);
    }
  }

  private handleNotificationClose(payload: any): void {
    console.log('Notification closed:', payload);

    // Track notification interaction
    this.trackNotificationInteraction('close', payload);
  }

  private async trackNotificationInteraction(
    action: string,
    payload: any
  ): Promise<void> {
    try {
      await fetch('/api/notifications/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notificationId: payload.notificationId,
          templateId: payload.templateId,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Failed to track notification interaction:', error);
    }
  }

  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'view-inventory':
        window.open('/inventory', '_blank');
        break;
      case 'view-report':
        window.open('/reports', '_blank');
        break;
      case 'view-drivers':
        window.open('/drivers', '_blank');
        break;
      case 'view-payment':
        window.open(`/payments/${data.paymentId}`, '_blank');
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }
}

// Export singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance();

/**
 * React hook for push notifications
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [permission, setPermission] =
    React.useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  React.useEffect(() => {
    const initializeNotifications = async () => {
      const supported = await pushNotificationManager.initialize();
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        // Check subscription status
        const subscription = await navigator.serviceWorker.ready.then((reg) =>
          reg.pushManager.getSubscription()
        );
        setIsSubscribed(!!subscription);
      }
    };

    initializeNotifications();
  }, []);

  const requestPermission = async () => {
    const newPermission = await pushNotificationManager.requestPermission();
    setPermission(newPermission);
    setIsSubscribed(newPermission === 'granted');
    return newPermission;
  };

  const subscribe = async () => {
    const subscription = await pushNotificationManager.subscribeUser();
    setIsSubscribed(!!subscription);
    return subscription;
  };

  const unsubscribe = async () => {
    const success = await pushNotificationManager.unsubscribeUser();
    if (success) {
      setIsSubscribed(false);
    }
    return success;
  };

  const sendNotification = (
    templateId: string,
    variables?: Record<string, string>
  ) => {
    return pushNotificationManager.sendNotification(templateId, variables);
  };

  const testNotification = () => {
    return pushNotificationManager.testNotification();
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
    testNotification,
  };
}
