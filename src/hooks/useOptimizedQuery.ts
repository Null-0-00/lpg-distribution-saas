// Optimized React Query hooks with caching and error handling
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

// Custom hook for optimized data fetching
export function useOptimizedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
    // Cache for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes (gcTime replaces cacheTime)
    gcTime: 10 * 60 * 1000,
    // Refetch on window focus only for critical data
    refetchOnWindowFocus: false,
    // Retry failed requests 2 times
    retry: 2,
    // Retry delay increases exponentially
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  // Prefetch related data when this query succeeds
  const prefetchRelated = useCallback(
    (relatedQueries: Array<{ key: any[]; fn: () => Promise<any> }>) => {
      if (query.isSuccess) {
        relatedQueries.forEach(({ key, fn }) => {
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn: fn,
            staleTime: 5 * 60 * 1000,
          });
        });
      }
    },
    [query.isSuccess, queryClient]
  );

  return {
    ...query,
    prefetchRelated,
  };
}

// Hook for dashboard data with specific optimizations
export function useDashboardData(includeMovements = false) {
  const queryKey = ['dashboard', includeMovements];

  return useOptimizedQuery(
    queryKey,
    async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        includeMovements: includeMovements.toString(),
        startDate: yesterday.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      });

      const response = await fetch(`/api/inventory/dashboard?${params}`, {
        headers: {
          'Cache-Control': 'max-age=30',
        },
      });

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`);
      }

      return response.json();
    },
    {
      // Dashboard data should be fresh
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 2 * 60 * 1000, // 2 minutes
      // Refetch when user comes back to tab
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for inventory data with background updates
export function useInventoryData() {
  return useOptimizedQuery(
    ['inventory'],
    async () => {
      const response = await fetch('/api/inventory?includeMovements=false');
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    {
      staleTime: 60 * 1000, // 1 minute
      refetchInterval: 5 * 60 * 1000, // Background refetch every 5 minutes
      refetchIntervalInBackground: false,
    }
  );
}

// Hook for cached sales data
export function useSalesData(startDate?: string, endDate?: string) {
  const queryKey = ['sales', startDate || '', endDate || ''];

  return useOptimizedQuery(
    queryKey,
    async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/sales?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json();
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      // Don't refetch automatically for historical data
      refetchOnWindowFocus: !startDate && !endDate,
    }
  );
}
