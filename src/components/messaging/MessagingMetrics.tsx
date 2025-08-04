'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface MessagingMetrics {
  currentMonth: {
    total: number;
    percentageChange: number;
    monthName: string;
  };
  previousMonth: {
    total: number;
    monthName: string;
  };
  breakdown: {
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
  dailyCounts: Record<string, number>;
}

export default function MessagingMetrics() {
  const [metrics, setMetrics] = useState<MessagingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messaging/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch messaging metrics');
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIVABLES_CHANGE':
        return 'Receivables Change';
      case 'PAYMENT_RECEIVED':
        return 'Payment Received';
      case 'CYLINDER_RETURN':
        return 'Cylinder Return';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center">
          <XCircle className="mr-2 h-5 w-5 text-red-500" />
          <p className="text-red-700">Error loading metrics: {error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="py-8 text-center text-gray-500">
        No messaging metrics available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Messaging Metrics
        </h3>
        <button
          onClick={fetchMetrics}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Current Month Total */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">This Month</p>
              <p className="text-foreground text-2xl font-bold">
                {metrics.currentMonth.total}
              </p>
              <p className="text-muted-foreground text-xs">
                {metrics.currentMonth.monthName}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Previous Month Comparison */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Previous Month</p>
              <p className="text-foreground text-2xl font-bold">
                {metrics.previousMonth.total}
              </p>
              <p className="text-muted-foreground text-xs">
                {metrics.previousMonth.monthName}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        {/* Percentage Change */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Monthly Change</p>
              <p
                className={`text-2xl font-bold ${
                  metrics.currentMonth.percentageChange >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {metrics.currentMonth.percentageChange >= 0 ? '+' : ''}
                {metrics.currentMonth.percentageChange}%
              </p>
              <p className="text-muted-foreground text-xs">vs last month</p>
            </div>
            {metrics.currentMonth.percentageChange >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Messages by Type */}
        <div className="bg-card rounded-lg border p-4">
          <h4 className="text-foreground mb-4 font-medium">Messages by Type</h4>
          <div className="space-y-3">
            {metrics.breakdown.byType.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground text-sm">
                  {getTypeLabel(item.type)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-16 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${(item.count / metrics.currentMonth.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages by Status */}
        <div className="bg-card rounded-lg border p-4">
          <h4 className="text-foreground mb-4 font-medium">
            Messages by Status
          </h4>
          <div className="space-y-3">
            {metrics.breakdown.byStatus.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="text-muted-foreground text-sm capitalize">
                    {item.status.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-16 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        item.status.toLowerCase() === 'sent'
                          ? 'bg-green-500'
                          : item.status.toLowerCase() === 'failed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${(item.count / metrics.currentMonth.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
