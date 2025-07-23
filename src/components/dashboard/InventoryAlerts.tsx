'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, Package, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface InventoryAlert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'MOVEMENT_ANOMALY';
  severity: 'critical' | 'warning' | 'info';
  product: {
    id: string;
    name: string;
    size: string;
    company: string;
  };
  message: string;
  currentStock: number;
  threshold?: number;
  recommendedAction: string;
  createdAt: string;
}

interface AlertsSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  byType: {
    outOfStock: number;
    lowStock: number;
    overstock: number;
    anomalies: number;
  };
}

interface InventoryAlertsProps {
  onAlertClick?: (alert: InventoryAlert) => void;
  refreshTrigger?: number;
  compact?: boolean;
}

export function InventoryAlerts({ onAlertClick, refreshTrigger, compact = false }: InventoryAlertsProps) {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [summary, setSummary] = useState<AlertsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = selectedSeverity === 'all' 
        ? '/api/inventory/alerts'
        : `/api/inventory/alerts?severity=${selectedSeverity}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load inventory alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity, refreshTrigger]); // loadAlerts is stable due to useCallback pattern

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK': return <Package className="h-4 w-4 text-red-600" />;
      case 'LOW_STOCK': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'OVERSTOCK': return <Package className="h-4 w-4 text-blue-600" />;
      case 'MOVEMENT_ANOMALY': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800 border-red-200';
      case 'LOW_STOCK': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OVERSTOCK': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MOVEMENT_ANOMALY': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAlerts}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Active Alerts</h3>
          {summary && (
            <Badge variant="outline" className="text-xs">
              {summary.total} alerts
            </Badge>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="flex items-center text-green-600 text-sm">
            <BellOff className="h-4 w-4 mr-2" />
            No active alerts
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${getSeverityColor(alert.severity)}`}
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {alert.product.company} {alert.product.name}
                      </p>
                      <p className="text-xs opacity-75 truncate">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={() => onAlertClick?.(alerts[0])}>
                  View {alerts.length - 3} more alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      {summary && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alert Overview</h3>
            <div className="flex space-x-2">
              {['all', 'critical', 'warning', 'info'].map((severity) => (
                <Button
                  key={severity}
                  variant={selectedSeverity === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity(severity)}
                  className="capitalize"
                >
                  {severity === 'all' ? 'All' : severity}
                  {severity !== 'all' && (
                    <Badge variant="secondary" className="ml-1">
                      {summary[severity as keyof typeof summary] as number}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">{summary.byType.outOfStock}</div>
              <div className="text-xs text-red-700">Out of Stock</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-lg font-bold text-orange-600">{summary.byType.lowStock}</div>
              <div className="text-xs text-orange-700">Low Stock</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-600">{summary.byType.overstock}</div>
              <div className="text-xs text-blue-700">Overstock</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-lg font-bold text-purple-600">{summary.byType.anomalies}</div>
              <div className="text-xs text-purple-700">Anomalies</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedSeverity === 'all' ? 'All Alerts' : `${selectedSeverity.charAt(0).toUpperCase() + selectedSeverity.slice(1)} Alerts`}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No alerts found</p>
              <p className="text-sm">All inventory levels are within normal ranges.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-6 hover:bg-muted/50 cursor-pointer"
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.product.company} {alert.product.name} ({alert.product.size}L)
                        </p>
                        <Badge className={getTypeBadgeColor(alert.type)}>
                          {alert.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Current Stock: {alert.currentStock}</span>
                        {alert.threshold && (
                          <span>Threshold: {alert.threshold}</span>
                        )}
                        <span>{formatDate(alert.createdAt)}</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 font-medium">
                          Recommended Action:
                        </p>
                        <p className="text-xs text-gray-600">
                          {alert.recommendedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-1 capitalize">{alert.severity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}