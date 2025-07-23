import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DailySalesRecord {
  id: string;
  saleDate: Date;
  driver: {
    id: string;
    name: string;
    route: string;
    driverType: 'RETAIL' | 'SHIPMENT';
  };
  product?: {
    id: string;
    name: string;
    size: string;
  } | null;
  packageSales: number;
  refillSales: number;
  totalSales: number;
  packageRevenue: number;
  refillRevenue: number;
  totalRevenue: number;
  cashDeposits: number;
  cylinderDeposits: number;
  netRevenue: number;
}

export interface DailySalesSummary {
  totalRecords: number;
  totalPackageSales: number;
  totalRefillSales: number;
  totalSales: number;
  totalRevenue: number;
  totalCashDeposits: number;
  totalCylinderDeposits: number;
  totalNetRevenue: number;
  uniqueDrivers: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface DailySalesPeriod {
  month: number;
  year: number;
  monthName: string;
  dateRange: string;
  driverType: 'RETAIL' | 'SHIPMENT';
}

interface UseDailySalesDataProps {
  month?: number;
  year?: number;
  driverType?: 'RETAIL' | 'SHIPMENT';
}

export const useDailySalesData = ({
  month,
  year,
  driverType = 'RETAIL',
}: UseDailySalesDataProps = {}) => {
  const [dailySales, setDailySales] = useState<DailySalesRecord[]>([]);
  const [summary, setSummary] = useState<DailySalesSummary>({
    totalRecords: 0,
    totalPackageSales: 0,
    totalRefillSales: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalCashDeposits: 0,
    totalCylinderDeposits: 0,
    totalNetRevenue: 0,
    uniqueDrivers: 0,
    dateRange: {
      start: new Date(),
      end: new Date(),
    },
  });
  const [period, setPeriod] = useState<DailySalesPeriod>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthName: new Date().toLocaleString('default', { month: 'long' }),
    dateRange: '',
    driverType,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDailySalesData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      if (driverType) params.append('driverType', driverType);

      console.log(
        '🚀 Fetching daily sales data with params:',
        params.toString()
      );
      const response = await fetch(
        `/api/drivers/daily-sales?${params.toString()}`
      );

      console.log('📡 Daily sales response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Daily sales API error:', errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log('📊 Daily sales result:', result);

      if (result.success) {
        // Convert date strings to Date objects
        const processedData = result.data.map((record: any) => ({
          ...record,
          saleDate: new Date(record.saleDate),
        }));

        setDailySales(processedData);
        setSummary({
          ...result.summary,
          dateRange: {
            start: new Date(result.summary.dateRange.start),
            end: new Date(result.summary.dateRange.end),
          },
        });
        setPeriod(result.period);

        console.log('✅ Daily sales data loaded:', {
          recordsCount: processedData.length,
          summary: result.summary,
          period: result.period,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch daily sales data');
      }
    } catch (error) {
      console.error('Error fetching daily sales data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily sales data. Please try again.',
        variant: 'destructive',
      });
      // Set empty state on error
      setDailySales([]);
      setSummary({
        totalRecords: 0,
        totalPackageSales: 0,
        totalRefillSales: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalCashDeposits: 0,
        totalCylinderDeposits: 0,
        totalNetRevenue: 0,
        uniqueDrivers: 0,
        dateRange: {
          start: new Date(),
          end: new Date(),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [month, year, driverType, toast]);

  const refreshData = useCallback(() => {
    fetchDailySalesData();
  }, [fetchDailySalesData]);

  useEffect(() => {
    fetchDailySalesData();
  }, [fetchDailySalesData]);

  const getSalesByDriver = useCallback(
    (driverId: string) => {
      return dailySales.filter((record) => record.driver.id === driverId);
    },
    [dailySales]
  );

  const getSalesByDate = useCallback(
    (date: Date) => {
      const targetDate = date.toISOString().split('T')[0];
      return dailySales.filter(
        (record) => record.saleDate.toISOString().split('T')[0] === targetDate
      );
    },
    [dailySales]
  );

  const getDriverStats = useCallback(
    (driverId: string) => {
      const driverSales = getSalesByDriver(driverId);
      return {
        totalRecords: driverSales.length,
        totalPackageSales: driverSales.reduce(
          (sum, record) => sum + record.packageSales,
          0
        ),
        totalRefillSales: driverSales.reduce(
          (sum, record) => sum + record.refillSales,
          0
        ),
        totalSales: driverSales.reduce(
          (sum, record) => sum + record.totalSales,
          0
        ),
        totalRevenue: driverSales.reduce(
          (sum, record) => sum + record.totalRevenue,
          0
        ),
        totalCashDeposits: driverSales.reduce(
          (sum, record) => sum + record.cashDeposits,
          0
        ),
        totalCylinderDeposits: driverSales.reduce(
          (sum, record) => sum + record.cylinderDeposits,
          0
        ),
        totalNetRevenue: driverSales.reduce(
          (sum, record) => sum + record.netRevenue,
          0
        ),
      };
    },
    [getSalesByDriver]
  );

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useCallback((date: Date | string | null | undefined) => {
    if (!date) return 'N/A';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  return {
    dailySales,
    summary,
    period,
    loading,
    refreshData,
    getSalesByDriver,
    getSalesByDate,
    getDriverStats,
    formatCurrency,
    formatDate,
  };
};
