'use client';

import React, { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

// Lazy load heavy dashboard components
const LazyDashboardHome = lazy(() => import('@/app/dashboard/page'));
const LazySalesPage = lazy(() => import('@/app/dashboard/sales/page'));
const LazyInventoryPage = lazy(() => import('@/app/dashboard/inventory/page'));
const LazyReceivablesPage = lazy(
  () => import('@/app/dashboard/receivables/page')
);
const LazyExpensesPage = lazy(() => import('@/app/dashboard/expenses/page'));
const LazyAnalyticsPage = lazy(() => import('@/app/dashboard/analytics/page'));
const LazyDriversPage = lazy(() => import('@/app/dashboard/drivers/page'));
const LazyUsersPage = lazy(() => import('@/app/dashboard/users/page'));
const LazyAssetsPage = lazy(() => import('@/app/dashboard/assets/page'));
const LazyReportsPage = lazy(() => import('@/app/dashboard/reports/page'));
const LazyDailySalesPage = lazy(
  () => import('@/app/dashboard/reports/daily-sales/page')
);
const LazyShipmentsPage = lazy(() => import('@/app/dashboard/shipments/page'));
const LazyProductManagementPage = lazy(
  () => import('@/app/dashboard/product-management/page')
);
const LazySettingsPage = lazy(() => import('@/app/dashboard/settings/page'));

interface DynamicPageProps {
  pathname: string;
  children?: React.ReactNode;
}

export const DynamicPage: React.FC<DynamicPageProps> = ({
  pathname,
  children,
}) => {
  const getPageComponent = () => {
    switch (pathname) {
      case '/dashboard':
        return <LazyDashboardHome />;
      case '/dashboard/sales':
        return <LazySalesPage />;
      case '/dashboard/inventory':
        return <LazyInventoryPage />;
      case '/dashboard/receivables':
        return <LazyReceivablesPage />;
      case '/dashboard/expenses':
        return <LazyExpensesPage />;
      case '/dashboard/analytics':
        return <LazyAnalyticsPage />;
      case '/dashboard/drivers':
        return <LazyDriversPage />;
      case '/dashboard/users':
        return <LazyUsersPage />;
      case '/dashboard/assets':
        return <LazyAssetsPage />;
      case '/dashboard/reports':
        return <LazyReportsPage />;
      case '/dashboard/reports/daily-sales':
        return <LazyDailySalesPage />;
      case '/dashboard/shipments':
        return <LazyShipmentsPage />;
      case '/dashboard/product-management':
        return <LazyProductManagementPage />;
      case '/dashboard/settings':
        return <LazySettingsPage />;
      default:
        return children;
    }
  };

  return (
    <Suspense fallback={<LoadingSkeleton variant="page" />}>
      {getPageComponent()}
    </Suspense>
  );
};

// Prefetch critical pages
export const prefetchCriticalPages = () => {
  if (typeof window !== 'undefined') {
    // Prefetch critical pages after initial load
    setTimeout(() => {
      import('@/app/dashboard/page');
      import('@/app/dashboard/sales/page');
      import('@/app/dashboard/inventory/page');
    }, 1000);
  }
};
