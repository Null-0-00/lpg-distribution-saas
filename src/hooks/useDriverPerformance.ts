import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DriverPerformance {
  id: string;
  name: string;
  area: string;
  totalRefillSales: number;
  totalPackageSales: number;
  totalCashReceivables: number;
  totalCylinderReceivables: number;
  status: 'ACTIVE' | 'INACTIVE';
  phone?: string;
  email?: string;
  driverType: 'RETAIL' | 'SHIPMENT';
  totalRevenue: number;
  totalSales: number;
  netRevenue: number;
  cashDeposits: number;
  cylinderDeposits: number;
}

export interface DriverPerformanceSummary {
  totalDrivers: number;
  totalPackageSales: number;
  totalRefillSales: number;
  totalCashReceivables: number;
  totalCylinderReceivables: number;
  totalRevenue: number;
  averagePackageSales: number;
  averageRefillSales: number;
}

export interface DriverPerformancePeriod {
  month: number;
  year: number;
  monthName: string;
  dateRange: string;
}

interface UseDriverPerformanceProps {
  month?: number;
  year?: number;
}

export const useDriverPerformance = ({ month, year }: UseDriverPerformanceProps = {}) => {
  const [drivers, setDrivers] = useState<DriverPerformance[]>([]);
  const [summary, setSummary] = useState<DriverPerformanceSummary>({
    totalDrivers: 0,
    totalPackageSales: 0,
    totalRefillSales: 0,
    totalCashReceivables: 0,
    totalCylinderReceivables: 0,
    totalRevenue: 0,
    averagePackageSales: 0,
    averageRefillSales: 0
  });
  const [period, setPeriod] = useState<DriverPerformancePeriod>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthName: new Date().toLocaleString('default', { month: 'long' }),
    dateRange: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDriverPerformance = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      console.log('🚀 Fetching driver performance with params:', params.toString());
      const response = await fetch(`/api/drivers/performance?${params.toString()}`);
      
      console.log('📡 Driver performance response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Driver performance API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('📊 Driver performance result:', result);
      
      if (result.success) {
        setDrivers(result.data || []);
        setSummary(result.summary || {});
        setPeriod(result.period || {});
        console.log('✅ Driver performance data loaded:', {
          driversCount: result.data?.length || 0,
          summary: result.summary,
          period: result.period
        });
      } else {
        throw new Error(result.error || 'Failed to fetch driver performance');
      }
    } catch (error) {
      console.error('Error fetching driver performance:', error);
      toast({
        title: "Error",
        description: "Failed to load driver performance data. Please try again.",
        variant: "destructive"
      });
      // Set empty state on error
      setDrivers([]);
      setSummary({
        totalDrivers: 0,
        totalPackageSales: 0,
        totalRefillSales: 0,
        totalCashReceivables: 0,
        totalCylinderReceivables: 0,
        totalRevenue: 0,
        averagePackageSales: 0,
        averageRefillSales: 0
      });
    } finally {
      setLoading(false);
    }
  }, [month, year, toast]);

  const refreshData = useCallback(() => {
    fetchDriverPerformance();
  }, [fetchDriverPerformance]);

  useEffect(() => {
    fetchDriverPerformance();
  }, [fetchDriverPerformance]);

  const getTopPerformersByRefillSales = useCallback((limit = 5) => {
    return [...drivers]
      .sort((a, b) => b.totalRefillSales - a.totalRefillSales)
      .slice(0, limit);
  }, [drivers]);

  const getTopPerformersByPackageSales = useCallback((limit = 5) => {
    return [...drivers]
      .sort((a, b) => b.totalPackageSales - a.totalPackageSales)
      .slice(0, limit);
  }, [drivers]);

  const getTopPerformersByRevenue = useCallback((limit = 5) => {
    return [...drivers]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }, [drivers]);

  const getDriversWithHighReceivables = useCallback((threshold = 10000) => {
    return drivers.filter(driver => driver.totalCashReceivables > threshold);
  }, [drivers]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  return {
    drivers,
    summary,
    period,
    loading,
    refreshData,
    getTopPerformersByRefillSales,
    getTopPerformersByPackageSales,
    getTopPerformersByRevenue,
    getDriversWithHighReceivables,
    formatCurrency
  };
};