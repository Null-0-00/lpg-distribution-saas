'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendIndicator } from './analytics-charts';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Gauge,
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
}

export function KPICard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  progress,
}: KPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'destructive':
        return 'border-red-200 bg-red-50';
      default:
        return '';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return val;
  };

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
        {trend && (
          <div className="mt-2">
            <TrendIndicator value={trend.value} label={trend.label} />
          </div>
        )}
        {progress && (
          <div className="mt-3">
            <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
              <span>{progress.label || 'Progress'}</span>
              <span>{((progress.value / progress.max) * 100).toFixed(0)}%</span>
            </div>
            <Progress
              value={(progress.value / progress.max) * 100}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SalesKPIsProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    totalQuantity: number;
    averageOrderValue: number;
    revenueGrowth: number;
  };
  target?: {
    revenue: number;
    orders: number;
  };
}

export function SalesKPIs({ data, target }: SalesKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Revenue"
        value={data.totalRevenue}
        description="Today's revenue"
        trend={{
          value: data.revenueGrowth,
          label: 'vs yesterday',
        }}
        icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
        variant={
          data.revenueGrowth > 0
            ? 'success'
            : data.revenueGrowth < -5
              ? 'destructive'
              : 'default'
        }
        progress={
          target
            ? {
                value: data.totalRevenue,
                max: target.revenue,
                label: 'Daily Target',
              }
            : undefined
        }
      />

      <KPICard
        title="Total Orders"
        value={data.totalOrders}
        description="Orders processed"
        icon={<ShoppingCart className="text-muted-foreground h-4 w-4" />}
        progress={
          target
            ? {
                value: data.totalOrders,
                max: target.orders,
                label: 'Order Target',
              }
            : undefined
        }
      />

      <KPICard
        title="Cylinders Sold"
        value={data.totalQuantity}
        description="Units moved"
        icon={<Package className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Avg Order Value"
        value={data.averageOrderValue}
        description="Per order"
        icon={<BarChart3 className="text-muted-foreground h-4 w-4" />}
      />
    </div>
  );
}

interface InventoryKPIsProps {
  data: {
    fullCylinders: number;
    emptyCylinders: number;
    totalCylinders: number;
    lowStockProducts: number;
    inventoryValue: number;
    turnoverRate: number;
    stockLevel: 'low' | 'normal' | 'high';
  };
}

export function InventoryKPIs({ data }: InventoryKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Full Cylinders"
        value={data.fullCylinders}
        description="Ready for sale"
        icon={<Package className="text-muted-foreground h-4 w-4" />}
        variant={data.stockLevel === 'low' ? 'warning' : 'default'}
      />

      <KPICard
        title="Empty Cylinders"
        value={data.emptyCylinders}
        description="Awaiting refill"
        icon={<Package className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Low Stock Alerts"
        value={data.lowStockProducts}
        description="Products below threshold"
        icon={<AlertTriangle className="text-muted-foreground h-4 w-4" />}
        variant={data.lowStockProducts > 0 ? 'warning' : 'success'}
      />

      <KPICard
        title="Inventory Value"
        value={data.inventoryValue}
        description="Current stock value"
        icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
      />
    </div>
  );
}

interface ReceivablesKPIsProps {
  data: {
    totalCashReceivables: number;
    totalCylinderReceivables: number;
    overdueAmount: number;
    collectionRate: number;
    creditSales: number;
  };
}

export function ReceivablesKPIs({ data }: ReceivablesKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Cash Receivables"
        value={data.totalCashReceivables}
        description="Outstanding amount"
        icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Cylinder Receivables"
        value={data.totalCylinderReceivables}
        description="Cylinders on credit"
        icon={<Package className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Overdue Amount"
        value={data.overdueAmount}
        description="Past due payments"
        icon={<Clock className="text-muted-foreground h-4 w-4" />}
        variant={data.overdueAmount > 0 ? 'destructive' : 'success'}
      />

      <KPICard
        title="Collection Rate"
        value={`${data.collectionRate.toFixed(1)}%`}
        description="Payment efficiency"
        icon={<Target className="text-muted-foreground h-4 w-4" />}
        variant={
          data.collectionRate > 90
            ? 'success'
            : data.collectionRate > 70
              ? 'warning'
              : 'destructive'
        }
      />
    </div>
  );
}

interface DriverKPIsProps {
  data: {
    totalActiveDrivers: number;
    topPerformer: {
      name: string;
      totalRevenue: number;
    } | null;
    averagePerformance: number;
  };
}

export function DriverKPIs({ data }: DriverKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Active Drivers"
        value={data.totalActiveDrivers}
        description="Currently active"
        icon={<Users className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Top Performer"
        value={data.topPerformer?.name || 'N/A'}
        description={
          data.topPerformer
            ? `৳${data.topPerformer.totalRevenue.toLocaleString()}`
            : 'No sales today'
        }
        icon={<TrendingUp className="text-muted-foreground h-4 w-4" />}
        variant={data.topPerformer ? 'success' : 'default'}
      />

      <KPICard
        title="Avg Performance"
        value={data.averagePerformance.toLocaleString()}
        description="Revenue per driver"
        icon={<Gauge className="text-muted-foreground h-4 w-4" />}
      />
    </div>
  );
}

interface FinancialKPIsProps {
  data: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    healthScore: number;
  };
}

export function FinancialKPIs({ data }: FinancialKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Revenue"
        value={data.totalRevenue}
        description="Total income"
        icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Expenses"
        value={data.totalExpenses}
        description="Total costs"
        icon={<TrendingDown className="text-muted-foreground h-4 w-4" />}
      />

      <KPICard
        title="Net Profit"
        value={data.netProfit}
        description="After expenses"
        icon={<TrendingUp className="text-muted-foreground h-4 w-4" />}
        variant={data.netProfit > 0 ? 'success' : 'destructive'}
      />

      <KPICard
        title="Health Score"
        value={`${data.healthScore.toFixed(0)}%`}
        description="Overall financial health"
        icon={<Gauge className="text-muted-foreground h-4 w-4" />}
        variant={
          data.healthScore > 70
            ? 'success'
            : data.healthScore > 50
              ? 'warning'
              : 'destructive'
        }
        progress={{
          value: data.healthScore,
          max: 100,
          label: 'Health Score',
        }}
      />
    </div>
  );
}
