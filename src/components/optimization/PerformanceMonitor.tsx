// Performance monitoring component for development
'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime?: number;
  apiResponseTime?: number;
  renderTime?: number;
  bundleSize?: string;
  cacheHits?: number;
  cacheMisses?: number;
}

export function PerformanceMonitor({
  metrics,
  showInProduction = false,
}: {
  metrics?: PerformanceMetrics;
  showInProduction?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics>(
    {}
  );

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || showInProduction) {
      setIsVisible(true);
    }

    // Collect performance metrics
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      setPerformanceData({
        pageLoadTime: navigation
          ? Math.round(navigation.loadEventEnd - navigation.fetchStart)
          : 0,
        renderTime: navigation
          ? Math.round(
              navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart
            )
          : 0,
        ...metrics,
      });
    }
  }, [metrics, showInProduction]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="max-w-xs rounded-lg border border-gray-600 bg-black/80 p-3 text-xs text-white backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-3 w-3" />
          <span className="font-semibold">Performance</span>
        </div>

        <div className="space-y-1">
          {performanceData.pageLoadTime && (
            <div className="flex justify-between">
              <span>Page Load:</span>
              <span
                className={
                  performanceData.pageLoadTime > 3000
                    ? 'text-red-400'
                    : 'text-green-400'
                }
              >
                {performanceData.pageLoadTime}ms
              </span>
            </div>
          )}

          {performanceData.apiResponseTime && (
            <div className="flex justify-between">
              <span>API Response:</span>
              <span
                className={
                  performanceData.apiResponseTime > 1000
                    ? 'text-red-400'
                    : 'text-green-400'
                }
              >
                {performanceData.apiResponseTime}ms
              </span>
            </div>
          )}

          {performanceData.renderTime && (
            <div className="flex justify-between">
              <span>DOM Ready:</span>
              <span
                className={
                  performanceData.renderTime > 500
                    ? 'text-red-400'
                    : 'text-green-400'
                }
              >
                {performanceData.renderTime}ms
              </span>
            </div>
          )}

          {(performanceData.cacheHits || performanceData.cacheMisses) && (
            <div className="flex justify-between">
              <span>Cache Hit Rate:</span>
              <span className="text-blue-400">
                {Math.round(
                  ((performanceData.cacheHits || 0) /
                    ((performanceData.cacheHits || 0) +
                      (performanceData.cacheMisses || 0))) *
                    100
                )}
                %
              </span>
            </div>
          )}

          {performanceData.bundleSize && (
            <div className="flex justify-between">
              <span>Bundle Size:</span>
              <span className="text-yellow-400">
                {performanceData.bundleSize}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to track component render performance
export function useRenderMetrics(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development' && renderTime > 100) {
        console.warn(
          `🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);
}

// Component to measure and display API performance
export function APIPerformanceTracker({
  endpoint,
  responseTime,
}: {
  endpoint: string;
  responseTime: number;
}) {
  const status =
    responseTime < 500 ? 'fast' : responseTime < 1000 ? 'medium' : 'slow';
  const color =
    status === 'fast'
      ? 'text-green-500'
      : status === 'medium'
        ? 'text-yellow-500'
        : 'text-red-500';

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-1 text-xs text-gray-500">
      API: {endpoint} - <span className={color}>{responseTime}ms</span>
    </div>
  );
}
