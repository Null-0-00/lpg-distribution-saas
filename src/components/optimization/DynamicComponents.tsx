'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { RefreshCw } from 'lucide-react';

// Loading component for dynamic imports
const LoadingSpinner = ({ text = 'Loading component...' }: { text?: string }) => (
  <div className="flex items-center justify-center p-4">
    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-blue-600" />
    <span className="text-muted-foreground text-sm">{text}</span>
  </div>
);

// Chart components - heavy libraries like recharts
export const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  {
    loading: () => <LoadingSpinner text="Loading chart..." />,
    ssr: false,
  }
);

export const DynamicPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  {
    loading: () => <LoadingSpinner text="Loading chart..." />,
    ssr: false,
  }
);

export const DynamicLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  {
    loading: () => <LoadingSpinner text="Loading chart..." />,
    ssr: false,
  }
);

export const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  {
    loading: () => <LoadingSpinner text="Loading chart container..." />,
    ssr: false,
  }
);

// Form components - complex forms can be lazy loaded
export const DynamicCombinedSaleForm = dynamic(
  () => import('@/components/forms/CombinedSaleForm').then((mod) => ({ default: mod.CombinedSaleForm })),
  {
    loading: () => <LoadingSpinner text="Loading form..." />,
    ssr: false,
  }
);

// Analytics components
export const DynamicAnalyticsPage = dynamic(
  () => import('@/app/dashboard/analytics/page'),
  {
    loading: () => <LoadingSpinner text="Loading analytics..." />,
    ssr: false,
  }
);

// Dialog components with heavy content
export const DynamicDialog = dynamic(
  () => import('@/components/ui/dialog').then((mod) => mod.Dialog),
  {
    loading: () => <LoadingSpinner text="Loading dialog..." />,
    ssr: false,
  }
);

export const DynamicDialogContent = dynamic(
  () => import('@/components/ui/dialog').then((mod) => mod.DialogContent),
  {
    loading: () => <LoadingSpinner text="Loading dialog content..." />,
    ssr: false,
  }
);

// Table components for large data sets (fallback if not found)
export const DynamicDataTable = dynamic(
  () => Promise.resolve({ default: () => <div>Table component not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading table..." />,
    ssr: false,
  }
);

// Heavy dashboard components
export const DynamicSalesPage = dynamic(
  () => import('@/app/dashboard/sales/page'),
  {
    loading: () => <LoadingSpinner text="Loading sales dashboard..." />,
    ssr: false,
  }
);

export const DynamicInventoryPage = dynamic(
  () => import('@/app/dashboard/inventory/page'),
  {
    loading: () => <LoadingSpinner text="Loading inventory dashboard..." />,
    ssr: false,
  }
);

export const DynamicReceivablesPage = dynamic(
  () => import('@/app/dashboard/receivables/page'),
  {
    loading: () => <LoadingSpinner text="Loading receivables dashboard..." />,
    ssr: false,
  }
);

// Settings and management components
export const DynamicSettingsPage = dynamic(
  () => import('@/app/dashboard/settings/page'),
  {
    loading: () => <LoadingSpinner text="Loading settings..." />,
    ssr: false,
  }
);

export const DynamicUsersPage = dynamic(
  () => import('@/app/dashboard/users/page'),
  {
    loading: () => <LoadingSpinner text="Loading user management..." />,
    ssr: false,
  }
);

export const DynamicDriversPage = dynamic(
  () => import('@/app/dashboard/drivers/page'),
  {
    loading: () => <LoadingSpinner text="Loading driver management..." />,
    ssr: false,
  }
);

// Report components
export const DynamicReportsPage = dynamic(
  () => import('@/app/dashboard/reports/page'),
  {
    loading: () => <LoadingSpinner text="Loading reports..." />,
    ssr: false,
  }
);

// Complex form components that can be lazy loaded (fallbacks if not found)
export const DynamicProductForm = dynamic(
  () => Promise.resolve({ default: () => <div>Product form not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading product form..." />,
    ssr: false,
  }
);

export const DynamicDriverForm = dynamic(
  () => Promise.resolve({ default: () => <div>Driver form not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading driver form..." />,
    ssr: false,
  }
);

// Export management for large data operations (fallback if not found)
export const DynamicExportDialog = dynamic(
  () => Promise.resolve({ default: () => <div>Export dialog not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading export options..." />,
    ssr: false,
  }
);

// Advanced analytics components (fallback if not found)
export const DynamicAdvancedAnalytics = dynamic(
  () => Promise.resolve({ default: () => <div>Advanced analytics not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading advanced analytics..." />,
    ssr: false,
  }
);

// Calendar and date picker components (fallback if not found)
export const DynamicCalendar = dynamic(
  () => Promise.resolve({ default: () => <div>Calendar not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading calendar..." />,
    ssr: false,
  }
);

// Rich text editors or complex input components (fallback if not found)
export const DynamicRichTextEditor = dynamic(
  () => Promise.resolve({ default: () => <div>Rich text editor not found</div> }),
  {
    loading: () => <LoadingSpinner text="Loading editor..." />,
    ssr: false,
  }
);

// Helper function to create dynamic components with custom loading
export function createDynamicComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  loadingText: string = 'Loading...'
) {
  return dynamic(importFn, {
    loading: () => <LoadingSpinner text={loadingText} />,
    ssr: false,
  });
}

// Helper function for conditional dynamic loading
export function conditionalDynamicImport<T = any>(
  condition: boolean,
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback: ComponentType<T>,
  loadingText: string = 'Loading...'
) {
  if (!condition) {
    return fallback;
  }

  return dynamic(importFn, {
    loading: () => <LoadingSpinner text={loadingText} />,
    ssr: false,
  });
}