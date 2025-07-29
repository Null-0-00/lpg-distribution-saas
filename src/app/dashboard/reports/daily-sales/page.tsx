'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverReport {
  driverId: string;
  driverName: string;
  driverType: 'RETAIL' | 'WHOLESALE';
  packageSales: number;
  refillSales: number;
  totalSalesQty: number;
  totalSalesValue: number;
  discount: number;
  totalDeposited: number;
  totalCashReceivables: number;
  totalCylinderReceivables: number;
  totalReceivables: number;
  changeInReceivables: number;
  changeInCashReceivables: number;
  changeInCylinderReceivables: number;
  salesCount: number;
  // Additional fields for formula-based calculations
  todaysCashReceivableChange: number;
  todaysCylinderReceivableChange: number;
  yesterdaysCashReceivables: number;
  yesterdaysCylinderReceivables: number;
  todaysTotalCashReceivables: number;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  particulars: string;
  category: string;
  user: string;
  expenseDate: string;
  isApproved: boolean;
}

interface Deposit {
  id: string;
  amount: number;
  description: string;
  particulars: string;
  user: string;
  depositDate: string;
  isApproved: boolean;
}

interface DailySalesReportData {
  date: string;
  driverReports: DriverReport[];
  totals: {
    packageSales: number;
    refillSales: number;
    totalSalesQty: number;
    totalSalesValue: number;
    discount: number;
    totalDeposited: number;
    totalCashReceivables: number;
    totalCylinderReceivables: number;
    totalReceivables: number;
    changeInReceivables: number;
    changeInCashReceivables: number;
    changeInCylinderReceivables: number;
  };
  expenses: Expense[];
  deposits: Deposit[];
  summary: {
    totalDeposited: number;
    totalExpenses: number;
    totalManualDeposits?: number;
    totalDriverCashDeposits?: number;
    availableCash: number;
  };
}

interface CylinderReceivablesBreakdown {
  [size: string]: number;
}

interface DriverReceivablesData {
  [driverId: string]: {
    cylinderSizeBreakdown: Record<string, number>;
  };
}

export default function DailySalesReportPage() {
  const { formatCurrency, formatDate, t } = useSettings();

  // Helper function to translate common English patterns
  const translateText = (text: string | null | undefined): string => {
    if (!text) return '';

    // Replace common English patterns with translations
    return text
      .replace(/Cash deposits by driver/g, t('cashDepositsByDriver'))
      .replace(
        /\(includes receivable payments\)/g,
        t('includesReceivablePayments')
      )
      .replace(/Driver Expense/gi, t('driverExpense'))
      .replace(/Fuel Expense/gi, t('fuelExpense'))
      .replace(/Maintenance Expense/gi, t('maintenanceExpense'))
      .replace(/Office Expense/gi, t('officeExpense'))
      .replace(/Transport Expense/gi, t('transportExpense'))
      .replace(/Miscellaneous Expense/gi, t('miscellaneousExpense'))
      .replace(/General Expense/gi, t('generalExpense'));
  };
  const [reportData, setReportData] = useState<DailySalesReportData | null>(
    null
  );
  const [cylinderReceivablesBreakdown, setCylinderReceivablesBreakdown] =
    useState<CylinderReceivablesBreakdown>({});
  const [driverReceivablesData, setDriverReceivablesData] =
    useState<DriverReceivablesData>({});
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [reportTableLoading, setReportTableLoading] = useState(true);
  const [depositsExpensesLoading, setDepositsExpensesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchCylinderReceivablesBreakdown = useCallback(async () => {
    try {
      // Fetch both global breakdown and driver-specific breakdowns
      const [summaryResponse, receivablesResponse] = await Promise.all([
        fetch(`/api/inventory/cylinders-summary?_t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }),
        fetch(`/api/receivables/customers?_t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }),
      ]);

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setCylinderReceivablesBreakdown(summaryData.receivablesBreakdown || {});
      }

      if (receivablesResponse.ok) {
        const receivablesData = await receivablesResponse.json();
        const driverData: DriverReceivablesData = {};

        if (receivablesData.driverReceivables) {
          receivablesData.driverReceivables.forEach((driver: any) => {
            driverData[driver.id] = {
              cylinderSizeBreakdown: driver.cylinderSizeBreakdown || {},
            };
          });
        }

        setDriverReceivablesData(driverData);
      }
    } catch (error) {
      console.error('Failed to load cylinder receivables breakdown:', error);
    }
  }, []);

  const fetchReportData = useCallback(
    async (date: string, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
          setSummaryLoading(true);
          setReportTableLoading(true);
          setDepositsExpensesLoading(true);
        }

        console.log('🔄 Starting progressive loading for daily sales report...');

        // Phase 1: Load summary data first (fastest)
        const reportResponse = await fetch(`/api/reports/daily-sales?date=${date}`, {
          cache: isRefresh ? 'no-cache' : 'default',
          headers: isRefresh
            ? {
                'Cache-Control': 'no-cache',
              }
            : {},
        });

        if (reportResponse.ok) {
          const data = await reportResponse.json();
          setReportData(data);
          setSummaryLoading(false);
          console.log('✅ Phase 1 completed: Summary cards loaded');

          // Small delay for better UX
          await new Promise(resolve => setTimeout(resolve, 200));
          setReportTableLoading(false);
          console.log('✅ Phase 2 completed: Report table loaded');

          // Phase 2: Load cylinder receivables breakdown (slower)
          await fetchCylinderReceivablesBreakdown();
          await new Promise(resolve => setTimeout(resolve, 200));
          setDepositsExpensesLoading(false);
          console.log('✅ Phase 3 completed: Deposits & expenses loaded');
        } else {
          const errorText = await reportResponse.text();
          console.error(
            'Daily sales report API error:',
            reportResponse.status,
            errorText
          );
          toast({
            title: t('error'),
            description: t('failedToLoadDailySalesReport'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to load daily sales report:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadDailySalesReport'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSummaryLoading(false);
        setReportTableLoading(false);
        setDepositsExpensesLoading(false);
      }
    },
    [toast, t, fetchCylinderReceivablesBreakdown]
  );

  useEffect(() => {
    fetchReportData(selectedDate);
  }, [selectedDate, fetchReportData]);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    fetchReportData(selectedDate, true);
  }, [selectedDate, fetchReportData]);

  // Memoize expensive calculations
  const totalManualDeposits = useMemo(() => {
    return reportData?.deposits
      ? reportData.deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
      : 0;
  }, [reportData?.deposits]);

  const totalExpensesCalculated = useMemo(() => {
    return (
      reportData?.expenses?.reduce((sum, expense) => sum + expense.amount, 0) ||
      0
    );
  }, [reportData?.expenses]);

  const finalAvailableCash = useMemo(() => {
    if (!reportData) return 0;
    return (
      reportData.summary.totalDeposited +
      totalManualDeposits -
      totalExpensesCalculated
    );
  }, [
    reportData?.summary.totalDeposited,
    totalManualDeposits,
    totalExpensesCalculated,
  ]);

  // All drivers are retail now, so this function is not needed
  // const getDriverTypeColor = (driverType: 'RETAIL' | 'WHOLESALE') => {
  //   return driverType === 'RETAIL'
  //     ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  //     : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  // };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className="text-muted-foreground">
            {t('loadingDailySalesReport')}
          </span>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground text-center">
          <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="mb-2 text-lg font-medium">
            {t('noReportDataAvailable')}
          </p>
          <p className="text-sm">{t('tryAgainOrSelectDate')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('dailySalesReport')}
          </h1>
          <p className="text-muted-foreground">
            {t('comprehensiveDailySalesReport')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {summaryLoading ? (
          // Skeleton loading for summary cards
          <>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">
                    {t('totalSalesValue')}
                  </p>
                  <p className="text-foreground text-2xl font-bold">
                    {reportData && formatCurrency(reportData.totals.totalSalesValue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">
                    {t('totalDeposited')}
                  </p>
                  <p className="text-foreground text-2xl font-bold">
                    {reportData && formatCurrency(reportData.totals.totalDeposited)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">
                    {t('totalExpenses')}
                  </p>
                  <p className="text-foreground text-2xl font-bold">
                    {reportData && formatCurrency(reportData.summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-muted-foreground text-sm">
                    {t('availableCash')}
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {reportData && formatCurrency(reportData.summary.availableCash)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {!summaryLoading && reportData && (
          <div className="col-span-full flex items-center justify-center mt-4">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Summary loaded</span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Sales Report Table */}
      <div className="bg-card overflow-hidden rounded-lg shadow">
        {reportTableLoading ? (
          <div className="p-6">
            <div className="border-border border-b px-6 py-4 mb-6">
              <Skeleton className="h-6 w-48 mb-2" />
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-10 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-10 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="border-border border-b px-6 py-4">
              <h2 className="text-foreground text-lg font-semibold">
                {t('dailySalesReport')} - {formatDate(selectedDate)}
              </h2>
            </div>

            <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {t('driver')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('packageSalesQty')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('refillSalesQty')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('totalSalesQty')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('totalSalesValue')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('discount')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('totalDeposited')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('totalCylindersReceivables')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('totalCashReceivables')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('changeInReceivablesCashCylinders')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-border divide-y">
              {reportData.driverReports.map((driver) => (
                <tr key={driver.driverId} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-foreground text-sm font-medium">
                          {driver.driverName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {t('retailDriver')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-center text-sm">
                    {driver.packageSales}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-center text-sm">
                    {driver.refillSales}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                    {driver.totalSalesQty}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                    {formatCurrency(driver.totalSalesValue)}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                    {formatCurrency(driver.discount)}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                    {formatCurrency(driver.totalDeposited)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    <div className="mb-1 text-sm font-bold text-orange-600 dark:text-orange-400">
                      {driver.totalCylinderReceivables}
                    </div>
                    {driverReceivablesData[driver.driverId]
                      ?.cylinderSizeBreakdown && (
                      <div className="space-y-1">
                        {Object.entries(
                          driverReceivablesData[driver.driverId]
                            .cylinderSizeBreakdown
                        )
                          .filter(([size, quantity]) => quantity > 0)
                          .map(([size, quantity]) => (
                            <div
                              key={size}
                              className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                            >
                              <span className="font-medium">{size}:</span>
                              <span className="ml-1 font-semibold text-orange-600">
                                {quantity}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </td>
                  <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                    {formatCurrency(driver.totalCashReceivables)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex flex-col text-xs">
                      <span
                        className={`font-medium ${
                          driver.changeInCashReceivables > 0
                            ? 'text-red-600 dark:text-red-400'
                            : driver.changeInCashReceivables < 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-foreground'
                        }`}
                      >
                        {t('cash')}:{' '}
                        {driver.changeInCashReceivables > 0 ? '+' : ''}
                        {formatCurrency(driver.changeInCashReceivables)}
                      </span>
                      <span
                        className={`font-medium ${
                          driver.changeInCylinderReceivables > 0
                            ? 'text-red-600 dark:text-red-400'
                            : driver.changeInCylinderReceivables < 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-foreground'
                        }`}
                      >
                        {t('cylinders')}:{' '}
                        {driver.changeInCylinderReceivables > 0 ? '+' : ''}
                        {driver.changeInCylinderReceivables}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-muted font-bold">
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                  {t('total').toUpperCase()}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-center text-sm">
                  {reportData.totals.packageSales}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-center text-sm">
                  {reportData.totals.refillSales}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-center text-sm">
                  {reportData.totals.totalSalesQty}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                  {formatCurrency(reportData.totals.totalSalesValue)}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                  {formatCurrency(reportData.totals.discount)}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                  {formatCurrency(reportData.totals.totalDeposited)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                  <div className="mb-1 text-sm font-bold text-orange-600 dark:text-orange-400">
                    {reportData.totals.totalCylinderReceivables}
                  </div>
                  {Object.entries(cylinderReceivablesBreakdown).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(cylinderReceivablesBreakdown)
                        .filter(([size, quantity]) => quantity > 0)
                        .map(([size, quantity]) => (
                          <div
                            key={size}
                            className="text-xs leading-tight text-gray-600 dark:text-gray-400"
                          >
                            <span className="font-medium">{size}:</span>
                            <span className="ml-1 font-semibold text-orange-600">
                              {quantity}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </td>
                <td className="text-foreground whitespace-nowrap px-6 py-4 text-right text-sm">
                  {formatCurrency(reportData.totals.totalCashReceivables)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex flex-col text-xs">
                    <span
                      className={`font-medium ${
                        reportData.totals.changeInCashReceivables > 0
                          ? 'text-red-600 dark:text-red-400'
                          : reportData.totals.changeInCashReceivables < 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-foreground'
                      }`}
                    >
                      {t('cash')}:{' '}
                      {reportData.totals.changeInCashReceivables > 0 ? '+' : ''}
                      {formatCurrency(
                        reportData.totals.changeInCashReceivables
                      )}
                    </span>
                    <span
                      className={`font-medium ${
                        reportData.totals.changeInCylinderReceivables > 0
                          ? 'text-red-600 dark:text-red-400'
                          : reportData.totals.changeInCylinderReceivables < 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-foreground'
                      }`}
                    >
                      {t('cylinders')}:{' '}
                      {reportData.totals.changeInCylinderReceivables > 0
                        ? '+'
                        : ''}
                      {reportData.totals.changeInCylinderReceivables}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
            </div>
          </>
        )}
        {!reportTableLoading && reportData && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Report table loaded</span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Deposits & Expenses Tables */}
      <div className="bg-card rounded-lg shadow">
        {depositsExpensesLoading ? (
          <div className="p-6">
            <div className="border-border border-b px-6 py-4 mb-6">
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
              {/* Deposits Skeleton */}
              <div>
                <Skeleton className="h-5 w-20 mb-4" />
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Expenses Skeleton */}
              <div>
                <Skeleton className="h-5 w-20 mb-4" />
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="border-border border-b px-6 py-4">
              <h2 className="text-foreground text-lg font-semibold">
                {t('dailyDepositsExpenses')} - {formatDate(selectedDate)}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('detailedBreakdownDepositsExpenses')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          {/* Deposits Table */}
          <div>
            <h3 className="text-md text-foreground mb-4 font-medium">
              {t('deposits')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium uppercase">
                      {t('particulars')}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium uppercase">
                      {t('description')}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-right text-xs font-medium uppercase">
                      {t('amount')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {reportData.deposits &&
                    reportData.deposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-muted/50">
                        <td className="text-foreground px-3 py-2 text-sm">
                          {translateText(deposit.particulars) ||
                            t('cashDepositsByDriver')}
                        </td>
                        <td className="text-foreground px-3 py-2 text-sm">
                          {deposit.description}
                        </td>
                        <td className="text-foreground px-3 py-2 text-right text-sm">
                          {formatCurrency(deposit.amount)}
                        </td>
                      </tr>
                    ))}
                  {(!reportData.deposits ||
                    reportData.deposits.length === 0) && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-muted-foreground px-3 py-4 text-center text-sm"
                      >
                        {t('noDepositsFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <td
                      colSpan={2}
                      className="text-foreground px-3 py-2 text-sm font-medium"
                    >
                      {t('totalDepositsCalculated')}
                    </td>
                    <td className="text-foreground px-3 py-2 text-right text-sm font-bold">
                      {formatCurrency(totalManualDeposits)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Expenses Table */}
          <div>
            <h3 className="text-md text-foreground mb-4 font-medium">
              {t('expenses')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium uppercase">
                      {t('particulars')}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium uppercase">
                      {t('description')}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-right text-xs font-medium uppercase">
                      {t('amount')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {reportData.expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50">
                      <td className="text-foreground px-3 py-2 text-sm">
                        {translateText(
                          expense.category || expense.particulars
                        ) || t('generalExpense')}
                      </td>
                      <td className="text-foreground px-3 py-2 text-sm">
                        {expense.description}
                      </td>
                      <td className="text-foreground px-3 py-2 text-right text-sm">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                  {reportData.expenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-muted-foreground px-3 py-4 text-center text-sm"
                      >
                        {t('noExpensesFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <td
                      colSpan={2}
                      className="text-foreground px-3 py-2 text-sm font-medium"
                    >
                      {t('totalExpensesCalculated')}
                    </td>
                    <td className="text-foreground px-3 py-2 text-right text-sm font-bold">
                      {formatCurrency(totalExpensesCalculated)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
            </div>
          </>
        )}
        {!depositsExpensesLoading && reportData && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Deposits & expenses loaded</span>
            </div>
          </div>
        )}
      </div>

      {/* Available Cash Summary */}
      <div className="bg-card rounded-lg p-6 shadow">
        <div className="text-center">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            {t('availableCash')} - {formatDate(selectedDate)}
          </h2>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-lg font-semibold">
                {t('totalAvailableCash')}:
              </span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(reportData.summary.availableCash)}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('totalDepositsIncludingSales')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
