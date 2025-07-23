'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils/formatters';

interface InventoryItem {
  product: {
    id: string;
    name: string;
    size: string;
    fullName: string;
    currentPrice: number;
    lowStockThreshold: number;
    company: {
      id: string;
      name: string;
    };
    cylinderSize?: {
      id: string;
      size: string;
      description?: string;
    };
  };
  inventory: {
    fullCylinders: number;
    emptyCylinders: number;
    totalCylinders: number;
    isLowStock: boolean;
    stockValue: number;
    stockHealth: 'good' | 'warning' | 'critical';
  };
}

interface InventorySummary {
  totalProducts: number;
  totalFullCylinders: number;
  totalEmptyCylinders: number;
  totalStockValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  stockHealth: {
    good: number;
    warning: number;
    critical: number;
  };
}

interface InventoryOverviewProps {
  onItemClick?: (item: InventoryItem) => void;
  refreshTrigger?: number;
}

export function InventoryOverview({
  onItemClick,
  refreshTrigger,
}: InventoryOverviewProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to load inventory data');
      }

      const data = await response.json();
      setInventory(data.inventory || []);
      setSummary(data.summary || null);
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load inventory'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [refreshTrigger]);

  const getStockHealthColor = (health: string) => {
    switch (health) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStockHealthIcon = (health: string) => {
    switch (health) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingDown className="h-4 w-4" />;
      case 'good':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-white p-6"
            >
              <div className="mb-2 h-4 rounded bg-gray-200"></div>
              <div className="h-8 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse rounded-lg border bg-white p-6">
          <div className="mb-4 h-4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
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
            onClick={loadInventoryData}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalProducts}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Full Cylinders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalFullCylinders}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.totalStockValue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Low Stock Items
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Stock Health Overview */}
      {summary && (
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Stock Health Overview
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadInventoryData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.stockHealth.good}
              </div>
              <div className="text-sm text-green-700">Good Stock</div>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {summary.stockHealth.warning}
              </div>
              <div className="text-sm text-orange-700">Warning</div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.stockHealth.critical}
              </div>
              <div className="text-sm text-red-700">Critical</div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Items List */}
      <div className="rounded-lg border bg-white">
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Status
            </h3>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock Levels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No inventory data available
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr
                    key={item.product.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onItemClick?.(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {item.product.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.product.company.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {item.inventory.fullCylinders} Full
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.inventory.emptyCylinders} Empty |{' '}
                          {item.inventory.totalCylinders} Total
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStockHealthColor(item.inventory.stockHealth)}`}
                      >
                        {getStockHealthIcon(item.inventory.stockHealth)}
                        <span className="ml-1 capitalize">
                          {item.inventory.stockHealth}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.inventory.stockValue)}
                        </span>
                        <span className="text-xs text-gray-500">
                          @ {formatCurrency(item.product.currentPrice)} each
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick?.(item);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
