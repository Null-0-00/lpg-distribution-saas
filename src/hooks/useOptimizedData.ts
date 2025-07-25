import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Generic fetch function with error handling
const fetchData = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Optimized hook for dashboard data
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => fetchData('/api/dashboard/summary'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Optimized hook for sales data
export const useSalesData = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => {
      const params = new URLSearchParams(filters).toString();
      return fetchData(`/api/sales${params ? `?${params}` : ''}`);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!filters, // Only fetch when filters are provided
  });
};

// Optimized hook for inventory data
export const useInventoryData = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => fetchData('/api/inventory'),
    staleTime: 5 * 60 * 1000, // 5 minutes - inventory doesn't change frequently
  });
};

// Optimized hook for receivables data
export const useReceivablesData = () => {
  return useQuery({
    queryKey: ['receivables'],
    queryFn: () => fetchData('/api/receivables'),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Optimized hook for expenses data
export const useExpensesData = (month?: { month: number; year: number }) => {
  return useQuery({
    queryKey: ['expenses', month],
    queryFn: () => {
      const params = month ? `?month=${month.month}&year=${month.year}` : '';
      return fetchData(`/api/expenses${params}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for prefetching data
export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchDashboard = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['dashboard-summary'],
      queryFn: () => fetchData('/api/dashboard/summary'),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchSales = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['sales'],
      queryFn: () => fetchData('/api/sales'),
      staleTime: 1 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchInventory = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['inventory'],
      queryFn: () => fetchData('/api/inventory'),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchDashboard,
    prefetchSales,
    prefetchInventory,
  };
};

// Background data synchronization
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();

  const syncData = useCallback(async () => {
    // Invalidate and refetch critical data in background
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
      queryClient.invalidateQueries({ queryKey: ['sales'] }),
      queryClient.invalidateQueries({ queryKey: ['inventory'] }),
    ]);
  }, [queryClient]);

  return { syncData };
};