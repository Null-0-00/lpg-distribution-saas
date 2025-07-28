// Lazy-loaded components with loading fallbacks
import { lazy, Suspense, ComponentType } from 'react';
import { RefreshCw } from 'lucide-react';

// Loading fallback component
const LoadingFallback = ({ name }: { name?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span className="text-muted-foreground text-sm">
        Loading {name || 'component'}...
      </span>
    </div>
  </div>
);

// HOC for lazy loading with fallback
export function withLazyLoading<T extends ComponentType<any>>(
  componentLoader: () => Promise<{ default: T }>,
  fallbackName?: string
) {
  const LazyComponent = lazy(componentLoader);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback name={fallbackName} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy-loaded dashboard components
// Note: These components don't exist yet and will be created when needed
// export const LazyInventoryTable = withLazyLoading(
//   () => import('@/components/inventory/InventoryTable'),
//   'Inventory Table'
// );

// export const LazyDailyInventoryChart = withLazyLoading(
//   () => import('@/components/charts/DailyInventoryChart'),
//   'Daily Inventory Chart'
// );

// export const LazyCylinderSummaryTables = withLazyLoading(
//   () => import('@/components/inventory/CylinderSummaryTables'),
//   'Cylinder Summary'
// );

// export const LazySalesChart = withLazyLoading(
//   () => import('@/components/charts/SalesChart'),
//   'Sales Chart'
// );

// export const LazyReceivablesTable = withLazyLoading(
//   () => import('@/components/receivables/ReceivablesTable'),
//   'Receivables Table'
// );

export const LazyAssetManagement = withLazyLoading(
  () => import('@/app/dashboard/assets/page'),
  'Asset Management'
);

// Skeleton components for immediate loading states
export const TableSkeleton = ({
  rows = 5,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) => (
  <div className="animate-pulse">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-muted">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 rounded bg-gray-300"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 rounded bg-gray-200"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="animate-pulse">
    <div className="rounded-lg bg-gray-200" style={{ height: `${height}px` }}>
      <div className="flex h-full items-end justify-around p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-t bg-gray-300"
            style={{
              width: '20px',
              height: `${Math.random() * 60 + 40}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-card rounded-lg p-6 shadow">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded bg-gray-300"></div>
        <div className="ml-4 flex-1">
          <div className="mb-2 h-4 rounded bg-gray-300"></div>
          <div className="mb-1 h-6 rounded bg-gray-200"></div>
          <div className="h-3 w-3/4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
);
