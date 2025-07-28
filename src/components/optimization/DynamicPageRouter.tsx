'use client';

import { ComponentType, ReactNode, Suspense } from 'react';
import { RefreshCw } from 'lucide-react';

// Enhanced loading component with different states
const PageLoadingSpinner = ({ 
  page, 
  message 
}: { 
  page?: string; 
  message?: string; 
}) => (
  <div className="flex h-64 items-center justify-center">
    <div className="text-center">
      <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
      <p className="text-muted-foreground mb-2">
        {message || `Loading ${page || 'page'}...`}
      </p>
      <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-1/3 animate-pulse bg-blue-600"></div>
      </div>
    </div>
  </div>
);

// Error boundary component for dynamic imports
class DynamicPageErrorBoundary extends Error {
  constructor(public page: string, public originalError: Error) {
    super(`Failed to load ${page}: ${originalError.message}`);
  }
}

// Error fallback component
const PageErrorFallback = ({ 
  page, 
  error, 
  retry 
}: { 
  page: string; 
  error: Error; 
  retry: () => void; 
}) => (
  <div className="flex h-64 items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-xl">⚠</span>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Failed to load {page}
      </h3>
      <p className="text-muted-foreground mb-4 text-sm">
        {error.message}
      </p>
      <button
        onClick={retry}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Route-based dynamic page loader
interface DynamicPageProps {
  children: ReactNode;
  fallback?: ReactNode;
  page?: string;
}

export function DynamicPageWrapper({ 
  children, 
  fallback, 
  page = 'content' 
}: DynamicPageProps) {
  return (
    <Suspense 
      fallback={fallback || <PageLoadingSpinner page={page} />}
    >
      {children}
    </Suspense>
  );
}

// Preload strategy for dashboard pages
export class DashboardPreloader {
  private static preloadedPages = new Set<string>();
  private static preloadPromises = new Map<string, Promise<any>>();

  static async preloadPage(pageName: string): Promise<void> {
    if (this.preloadedPages.has(pageName)) {
      return;
    }

    if (this.preloadPromises.has(pageName)) {
      return this.preloadPromises.get(pageName);
    }

    const preloadPromise = this.getPreloadFunction(pageName)();
    this.preloadPromises.set(pageName, preloadPromise);

    try {
      await preloadPromise;
      this.preloadedPages.add(pageName);
    } catch (error) {
      console.warn(`Failed to preload ${pageName}:`, error);
      this.preloadPromises.delete(pageName);
    }
  }

  private static getPreloadFunction(pageName: string) {
    const preloadMap: Record<string, () => Promise<any>> = {
      analytics: () => import('@/app/dashboard/analytics/page'),
      sales: () => import('@/app/dashboard/sales/page'),
      inventory: () => import('@/app/dashboard/inventory/page'),
      receivables: () => import('@/app/dashboard/receivables/page'),
      drivers: () => import('@/app/dashboard/drivers/page'),
      users: () => import('@/app/dashboard/users/page'),
      settings: () => import('@/app/dashboard/settings/page'),
      reports: () => import('@/app/dashboard/reports/page'),
      expenses: () => import('@/app/dashboard/expenses/page'),
      assets: () => import('@/app/dashboard/assets/page'),
      'product-management': () => import('@/app/dashboard/product-management/page'),
      shipments: () => import('@/app/dashboard/shipments/page'),
      'purchase-orders': () => import('@/app/dashboard/purchase-orders/page'),
    };

    return preloadMap[pageName] || (() => Promise.resolve());
  }

  // Preload critical pages on app initialization
  static preloadCriticalPages() {
    const criticalPages = ['analytics', 'sales', 'inventory'];
    criticalPages.forEach(page => {
      // Preload after a short delay to not block initial render
      setTimeout(() => this.preloadPage(page), 1000);
    });
  }

  // Preload pages based on user navigation patterns
  static preloadOnHover(pageName: string) {
    if (!this.preloadedPages.has(pageName)) {
      this.preloadPage(pageName);
    }
  }
}

// Hook for using dynamic page loading with error handling
export function useDynamicPage(pageName: string) {
  const preload = () => DashboardPreloader.preloadPage(pageName);
  const preloadOnHover = () => DashboardPreloader.preloadOnHover(pageName);
  
  return {
    preload,
    preloadOnHover,
    isPreloaded: DashboardPreloader['preloadedPages'].has(pageName),
  };
}

// Performance monitoring for dynamic imports
export class DynamicImportPerformance {
  private static loadTimes = new Map<string, number>();
  private static loadErrors = new Map<string, number>();

  static startTiming(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(componentName, loadTime);
      
      // Log slow loads in development
      if (process.env.NODE_ENV === 'development' && loadTime > 1000) {
        console.warn(`Slow dynamic import: ${componentName} took ${loadTime.toFixed(2)}ms`);
      }
    };
  }

  static recordError(componentName: string, error: Error) {
    const errorCount = this.loadErrors.get(componentName) || 0;
    this.loadErrors.set(componentName, errorCount + 1);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Dynamic import error for ${componentName}:`, error);
    }
  }

  static getStats() {
    return {
      loadTimes: Object.fromEntries(this.loadTimes),
      errorCounts: Object.fromEntries(this.loadErrors),
    };
  }
}

// Initialize preloading on app start
if (typeof window !== 'undefined') {
  // Start preloading critical pages after initial page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      DashboardPreloader.preloadCriticalPages();
    }, 2000);
  });
}