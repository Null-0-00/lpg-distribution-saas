'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  category: 'sales' | 'inventory' | 'receivables' | 'performance' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable?: boolean;
  read?: boolean;
}

interface RealTimeNotificationsProps {
  onNotificationAction?: (notification: Notification) => void;
}

export function RealTimeNotifications({ onNotificationAction }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      checkForNotifications();
    }, 10000);

    checkForNotifications();
    return () => clearInterval(interval);
  }, []);

  const checkForNotifications = async () => {
    try {
      const response = await fetch('/api/dashboard-updates?type=all');
      if (response.ok) {
        const data = await response.json();
        if (data.hasUpdates) {
          const newNotifications = generateNotifications(data);
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 50));
          setUnreadCount(prev => prev + newNotifications.filter(n => !n.read).length);
        }
      }
    } catch (error) {
      console.error('Failed to check for notifications:', error);
    }
  };

  const generateNotifications = (updateData: any): Notification[] => {
    const notifications: Notification[] = [];

    if (updateData.data.sales) {
      const { recent, totalValue } = updateData.data.sales;
      notifications.push({
        id: `sales-${Date.now()}`,
        type: 'success',
        title: 'New Sales Activity',
        message: `${recent.length} new sales worth ৳${totalValue.toLocaleString()}`,
        timestamp: new Date(),
        category: 'sales',
        priority: 'medium',
        actionable: true,
        read: false
      });
    }

    if (updateData.data.inventory?.alerts) {
      updateData.data.inventory.alerts.forEach((alert: any, index: number) => {
        notifications.push({
          id: `inventory-${Date.now()}-${index}`,
          type: alert.severity === 'critical' ? 'error' : 'warning',
          title: 'Inventory Alert',
          message: alert.message,
          timestamp: new Date(),
          category: 'inventory',
          priority: alert.severity === 'critical' ? 'critical' : 'high',
          actionable: true,
          read: false
        });
      });
    }

    if (updateData.data.receivables?.overdue) {
      const overdueCount = updateData.data.receivables.overdueCount;
      notifications.push({
        id: `receivables-${Date.now()}`,
        type: 'warning',
        title: 'Overdue Payments',
        message: `${overdueCount} overdue payments require attention`,
        timestamp: new Date(),
        category: 'receivables',
        priority: 'high',
        actionable: true,
        read: false
      });
    }

    if (updateData.data.performance?.targetAchieved) {
      notifications.push({
        id: `performance-${Date.now()}`,
        type: 'success',
        title: 'Target Achieved!',
        message: updateData.data.performance.targetAchieved.message,
        timestamp: new Date(),
        category: 'performance',
        priority: 'medium',
        actionable: false,
        read: false
      });
    }

    if (updateData.data.performance?.topDriver) {
      notifications.push({
        id: `driver-${Date.now()}`,
        type: 'info',
        title: 'Top Performer',
        message: updateData.data.performance.topDriver.message,
        timestamp: new Date(),
        category: 'performance',
        priority: 'low',
        actionable: false,
        read: false
      });
    }

    return notifications;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    switch (category) {
      case 'sales':
        return <DollarSign className="h-4 w-4" />;
      case 'inventory':
        return <Package className="h-4 w-4" />;
      case 'receivables':
        return <Clock className="h-4 w-4" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      default:
        switch (type) {
          case 'success':
            return <CheckCircle className="h-4 w-4" />;
          case 'warning':
            return <AlertTriangle className="h-4 w-4" />;
          case 'error':
            return <AlertTriangle className="h-4 w-4" />;
          default:
            return <Info className="h-4 w-4" />;
        }
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="secondary">High</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      default:
        return <Badge variant="default">Low</Badge>;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {notifications.length > 0 && (
              <CardDescription>
                {unreadCount} unread of {notifications.length} total
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 cursor-pointer hover:bg-muted/50 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1">
                                {getPriorityBadge(notification.priority)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismissNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-400">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                              {notification.actionable && onNotificationAction && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNotificationAction(notification);
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
}

interface LiveActivityFeedProps {
  maxItems?: number;
}

export function LiveActivityFeed({ maxItems = 10 }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveActivities();
    }, 5000);

    fetchLiveActivities();
    return () => clearInterval(interval);
  }, []);

  const fetchLiveActivities = async () => {
    try {
      const response = await fetch('/api/dashboard-updates?type=all');
      if (response.ok) {
        const data = await response.json();
        if (data.data.sales?.recent) {
          const newActivities = data.data.sales.recent.map((sale: any) => ({
            id: sale.id,
            type: 'sale',
            message: `${sale.driver.name} sold ${sale.quantity}x ${sale.product.name}`,
            amount: sale.netValue,
            timestamp: new Date(sale.createdAt),
            icon: <DollarSign className="h-4 w-4 text-green-600" />
          }));
          
          setActivities(prev => {
            const combined = [...newActivities, ...prev];
            const unique = combined.filter((item, index, self) => 
              index === self.findIndex(t => t.id === item.id)
            );
            return unique.slice(0, maxItems);
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch live activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Live Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Live Activity</span>
        </CardTitle>
        <CardDescription>Real-time business events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600">
                          ৳{activity.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}