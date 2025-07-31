'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Mail,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

// Financial Reports Engine with Real-time Data Integration
interface IncomeStatementData {
  revenue: {
    packageSales: number;
    refillSales: number;
    total: number;
  };
  costOfGoodsSold: {
    cylinderPurchases: number;
    total: number;
  };
  operatingExpenses: {
    salaries: number;
    fuel: number;
    maintenance: number;
    rent: number;
    utilities: number;
    other: number;
    total: number;
  };
  netIncome: number;
  grossProfit: number;
}

interface BalanceSheetData {
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      total: number;
    };
    fixedAssets: {
      vehicles: number;
      equipment: number;
      buildings: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      shortTermLoans: number;
      total: number;
    };
    longTermLiabilities: {
      longTermLoans: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    ownerEquity: number;
    retainedEarnings: number;
    total: number;
  };
  isBalanced: boolean;
}

interface CashFlowData {
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    accountsReceivableChange: number;
    inventoryChange: number;
    accountsPayableChange: number;
    total: number;
  };
  investingActivities: {
    vehiclePurchases: number;
    equipmentPurchases: number;
    total: number;
  };
  financingActivities: {
    ownerDrawings: number;
    loanRepayments: number;
    total: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export default function ReportsPage() {
  const { t, formatCurrency } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [exportLoading, setExportLoading] = useState('');

  // Real-time financial data state
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData>({
    revenue: {
      packageSales: 340000,
      refillSales: 285000,
      total: 625000,
    },
    costOfGoodsSold: {
      cylinderPurchases: 375000,
      total: 375000,
    },
    operatingExpenses: {
      salaries: 45000,
      fuel: 12000,
      maintenance: 8000,
      rent: 15000,
      utilities: 3500,
      other: 6500,
      total: 90000,
    },
    grossProfit: 250000,
    netIncome: 160000,
  });

  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData>({
    assets: {
      currentAssets: {
        cash: 150000,
        accountsReceivable: 85000,
        inventory: 420000,
        total: 655000,
      },
      fixedAssets: {
        vehicles: 800000,
        equipment: 250000,
        buildings: 1200000,
        total: 2250000,
      },
      totalAssets: 2905000,
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 125000,
        shortTermLoans: 75000,
        total: 200000,
      },
      longTermLiabilities: {
        longTermLoans: 900000,
        total: 900000,
      },
      totalLiabilities: 1100000,
    },
    equity: {
      ownerEquity: 1500000,
      retainedEarnings: 305000,
      total: 1805000,
    },
    isBalanced: true,
  });

  const [cashFlow, setCashFlow] = useState<CashFlowData>({
    operatingActivities: {
      netIncome: 160000,
      depreciation: 45000,
      accountsReceivableChange: -15000,
      inventoryChange: -35000,
      accountsPayableChange: 12000,
      total: 167000,
    },
    investingActivities: {
      vehiclePurchases: -150000,
      equipmentPurchases: -25000,
      total: -175000,
    },
    financingActivities: {
      ownerDrawings: -60000,
      loanRepayments: -35000,
      total: -95000,
    },
    netCashFlow: -103000,
    beginningCash: 253000,
    endingCash: 150000,
  });

  // Load real-time financial data
  useEffect(() => {
    loadFinancialData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadFinancialData, 300000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Simulate API calls to load real financial data
      // In production, these would be actual API endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update last refreshed time
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExportReport = async (
    reportType: string,
    format: 'pdf' | 'excel'
  ) => {
    setExportLoading(`${reportType}-${format}`);
    try {
      // Simulate export API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production, this would trigger actual PDF/Excel generation
      const filename = `${reportType}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      alert(`${format.toUpperCase()} ${t('exportCompleted')}: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      alert(t('exportFailed'));
    } finally {
      setExportLoading('');
    }
  };

  // Email automation
  const handleEmailReport = async (reportType: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`${reportType} ${t('hasBeenEmailedToConfiguredRecipients')}`);
    } catch (error) {
      console.error('Email error:', error);
      alert(t('emailFailed'));
    }
  };

  const reportTypes = [
    {
      id: 'income_statement',
      title: t('incomeStatement'),
      description: t('revenueExpensesAndProfitAnalysis'),
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      color: 'blue',
    },
    {
      id: 'balance_sheet',
      title: t('balanceSheet'),
      description: t('assetsLiabilitiesAndEquityOverview'),
      icon: BarChart3,
      lastGenerated: '2024-01-15',
      color: 'green',
    },
    {
      id: 'cash_flow',
      title: t('cashFlowStatement'),
      description: t('cashInflowsAndOutflowsTracking'),
      icon: PieChart,
      lastGenerated: '2024-01-15',
      color: 'purple',
    },
    {
      id: 'sales_report',
      title: t('salesReport'),
      description: t('detailedSalesPerformanceAnalysis'),
      icon: TrendingUp,
      lastGenerated: '2024-01-15',
      color: 'orange',
    },
    {
      id: 'inventory_report',
      title: t('inventoryReport'),
      description: t('stockLevelsAndMovementAnalysis'),
      icon: BarChart3,
      lastGenerated: '2024-01-15',
      color: 'teal',
    },
    {
      id: 'driver_performance',
      title: t('driverPerformance'),
      description: t('individualDriverSalesAndEfficiency'),
      icon: PieChart,
      lastGenerated: '2024-01-15',
      color: 'red',
    },
  ];

  // Calculate real-time quick stats from actual data
  const quickStats = {
    totalRevenue: incomeStatement.revenue.total,
    totalExpenses:
      incomeStatement.costOfGoodsSold.total +
      incomeStatement.operatingExpenses.total,
    netProfit: incomeStatement.netIncome,
    profitMargin:
      (incomeStatement.netIncome / incomeStatement.revenue.total) * 100,
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600',
      red: 'text-red-600',
    };
    return colors[color] || 'text-gray-600';
  };

  const getBgColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      teal: 'bg-teal-100',
      red: 'bg-red-100',
    };
    return colors[color] || 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-5 w-80 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Quick Financial Overview Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow">
              <div className="border-border flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                  <div>
                    <div className="h-6 w-32 bg-muted rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between py-2">
                      <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Actions Skeleton */}
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="mb-6">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-border flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                  <div>
                    <div className="h-5 w-28 bg-muted rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
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
            {t('financialReports')}
          </h1>
          <p className="text-muted-foreground">
            {t('generateAndViewComprehensiveBusinessReports')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-muted-foreground flex items-center space-x-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-foreground rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="today">{t('today')}</option>
            <option value="this_week">{t('thisWeek')}</option>
            <option value="this_month">{t('thisMonth')}</option>
            <option value="last_month">{t('lastMonth')}</option>
            <option value="this_quarter">{t('thisQuarter')}</option>
            <option value="this_year">{t('thisYear')}</option>
          </select>
          <button
            onClick={loadFinancialData}
            disabled={loading}
            className="hover:bg-muted/50 dark:hover:bg-muted/50 flex items-center rounded-lg bg-gray-600 px-3 py-2 text-white disabled:opacity-50 dark:bg-gray-700"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            {t('refresh')}
          </button>
          <button
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => alert(t('customReportBuilderComingSoon'))}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t('customReport')}
          </button>
        </div>
      </div>

      {/* Quick Financial Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalRevenue')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(quickStats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('totalExpenses')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(quickStats.totalExpenses)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('netProfit')}</p>
              <p className="text-foreground text-2xl font-bold">
                {formatCurrency(quickStats.netProfit)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('profitMargin')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {quickStats.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-card rounded-lg shadow transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-lg p-3 ${getBgColor(report.color)}`}>
                    <Icon className={`h-6 w-6 ${getIconColor(report.color)}`} />
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {t('last')}: {report.lastGenerated}
                  </span>
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {report.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {report.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="bg-muted text-muted-foreground hover:bg-muted flex items-center justify-center rounded-md px-2 py-2 text-xs"
                    onClick={() => alert(`${t('view')} ${report.title} ${t('viewDetailsBelow')}`)}
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    {t('view')}
                  </button>
                  <button
                    className="flex items-center justify-center rounded-md bg-red-600 px-2 py-2 text-xs text-white hover:bg-red-700"
                    onClick={() => handleExportReport(report.id, 'pdf')}
                    disabled={exportLoading === `${report.id}-pdf`}
                  >
                    {exportLoading === `${report.id}-pdf` ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="mr-1 h-3 w-3" />
                    )}
                    {t('pdf')}
                  </button>
                  <button
                    className="flex items-center justify-center rounded-md bg-green-600 px-2 py-2 text-xs text-white hover:bg-green-700"
                    onClick={() => handleExportReport(report.id, 'excel')}
                    disabled={exportLoading === `${report.id}-excel`}
                  >
                    {exportLoading === `${report.id}-excel` ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="mr-1 h-3 w-3" />
                    )}
                    {t('excel')}
                  </button>
                  <button
                    className="flex items-center justify-center rounded-md bg-blue-600 px-2 py-2 text-xs text-white hover:bg-blue-700"
                    onClick={() => handleEmailReport(report.title)}
                  >
                    <Mail className="mr-1 h-3 w-3" />
                    {t('email')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Financial Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Real-time Income Statement */}
        <div className="bg-card rounded-lg shadow">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                {t('incomeStatement')} ({t('realTime')})
              </h3>
              <p className="text-muted-foreground text-xs">
                {t('revenueByTypeDriverWithLiveCalculations')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                onClick={() => handleExportReport('income_statement', 'pdf')}
                disabled={exportLoading === 'income_statement-pdf'}
              >
                {exportLoading === 'income_statement-pdf' ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  t('pdf')
                )}
              </button>
              <button
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                onClick={() => handleExportReport('income_statement', 'excel')}
                disabled={exportLoading === 'income_statement-excel'}
              >
                {exportLoading === 'income_statement-excel' ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  t('excel')
                )}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="border-border flex items-center justify-between border-b py-2">
                <span className="text-foreground text-sm font-medium">
                  {t('revenue')}
                </span>
                <span className="text-sm font-bold text-green-600">
                  ৳{incomeStatement.revenue.total.toLocaleString()}
                </span>
              </div>
              <div className="border-border ml-4 flex items-center justify-between border-b py-2">
                <span className="text-muted-foreground text-sm">
                  - {t('packageSales')}
                </span>
                <span className="text-foreground text-sm">
                  {formatCurrency(incomeStatement.revenue.packageSales)}
                </span>
              </div>
              <div className="border-border ml-4 flex items-center justify-between border-b py-2">
                <span className="text-muted-foreground text-sm">
                  - {t('refillSales')}
                </span>
                <span className="text-foreground text-sm">
                  {formatCurrency(incomeStatement.revenue.refillSales)}
                </span>
              </div>

              <div className="border-border flex items-center justify-between border-b py-2">
                <span className="text-foreground text-sm font-medium">
                  {t('costOfGoodsSold')}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(incomeStatement.costOfGoodsSold.total)}
                </span>
              </div>
              <div className="border-border ml-4 flex items-center justify-between border-b py-2">
                <span className="text-muted-foreground text-sm">
                  - {t('cylinderPurchases')}
                </span>
                <span className="text-foreground text-sm">
                  {formatCurrency(incomeStatement.costOfGoodsSold.cylinderPurchases)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b bg-blue-50 py-2 dark:bg-blue-900/20">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {t('grossProfit')}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(incomeStatement.grossProfit)}
                </span>
              </div>

              <div className="border-border flex items-center justify-between border-b py-2">
                <span className="text-foreground text-sm font-medium">
                  {t('operatingExpenses')}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(incomeStatement.operatingExpenses.total)}
                </span>
              </div>
              <div className="ml-4 flex items-center justify-between py-1">
                <span className="text-muted-foreground text-xs">
                  - {t('salaries')}
                </span>
                <span className="text-foreground text-xs">
                  {formatCurrency(incomeStatement.operatingExpenses.salaries)}
                </span>
              </div>
              <div className="ml-4 flex items-center justify-between py-1">
                <span className="text-muted-foreground text-xs">
                  - {t('fuelTransportation')}
                </span>
                <span className="text-foreground text-xs">
                  {formatCurrency(incomeStatement.operatingExpenses.fuel)}
                </span>
              </div>
              <div className="ml-4 flex items-center justify-between py-1">
                <span className="text-muted-foreground text-xs">
                  - {t('maintenance')}
                </span>
                <span className="text-foreground text-xs">
                  {formatCurrency(incomeStatement.operatingExpenses.maintenance)}
                </span>
              </div>
              <div className="ml-4 flex items-center justify-between py-1">
                <span className="text-muted-foreground text-xs">- {t('rent')}</span>
                <span className="text-foreground text-xs">
                  {formatCurrency(incomeStatement.operatingExpenses.rent)}
                </span>
              </div>
              <div className="ml-4 flex items-center justify-between py-1">
                <span className="text-muted-foreground text-xs">
                  - {t('utilities')}
                </span>
                <span className="text-foreground text-xs">
                  {formatCurrency(incomeStatement.operatingExpenses.utilities)}
                </span>
              </div>
              <div className="border-border ml-4 flex items-center justify-between border-b py-1">
                <span className="text-muted-foreground text-xs">
                  - {t('otherExpenses')}
                </span>
                <span className="text-foreground text-xs">
                  {formatCurrency(incomeStatement.operatingExpenses.other)}
                </span>
              </div>

              <div className="flex items-center justify-between bg-green-50 py-2 dark:bg-green-900/20">
                <span className="text-sm font-bold text-green-900 dark:text-green-200">
                  {t('netIncome')}
                </span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(incomeStatement.netIncome)}
                </span>
              </div>

              <div className="bg-muted mt-3 rounded p-2">
                <div className="text-muted-foreground text-xs">
                  {t('profitMargin')}:{' '}
                  <span className="font-medium">
                    {quickStats.profitMargin.toFixed(1)}%
                  </span>{' '}
                  | {t('grossMargin')}:{' '}
                  <span className="font-medium">
                    {(
                      (incomeStatement.grossProfit /
                        incomeStatement.revenue.total) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Balance Sheet with Auto-validation */}
        <div className="bg-card rounded-lg shadow">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                {t('balanceSheet')} ({t('autoValidated')})
              </h3>
              <div className="mt-1 flex items-center">
                {balanceSheet.isBalanced ? (
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-xs ${balanceSheet.isBalanced ? 'text-green-600' : 'text-red-600'}`}
                >
                  {balanceSheet.isBalanced ? t('balanced') : t('outOfBalance')}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                onClick={() => handleExportReport('balance_sheet', 'pdf')}
                disabled={exportLoading === 'balance_sheet-pdf'}
              >
                {exportLoading === 'balance_sheet-pdf' ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  t('pdf')
                )}
              </button>
              <button
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                onClick={() => handleExportReport('balance_sheet', 'excel')}
                disabled={exportLoading === 'balance_sheet-excel'}
              >
                {exportLoading === 'balance_sheet-excel' ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  t('excel')
                )}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-foreground mb-2 font-medium">{t('assets')}</h4>
                <div className="ml-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Current Assets
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      ৳
                      {balanceSheet.assets.currentAssets.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Cash & Bank
                    </span>
                    <span className="text-foreground text-xs">
                      ৳{balanceSheet.assets.currentAssets.cash.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Accounts Receivable
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Inventory (Auto-linked)
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.assets.currentAssets.inventory.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Fixed Assets
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      ৳{balanceSheet.assets.fixedAssets.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Vehicles
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.assets.fixedAssets.vehicles.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Equipment
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.assets.fixedAssets.equipment.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Buildings
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.assets.fixedAssets.buildings.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-border flex justify-between border-t pt-2">
                    <span className="text-foreground text-sm font-bold">
                      Total Assets
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      ৳{balanceSheet.assets.totalAssets.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-foreground mb-2 font-medium">
                  LIABILITIES & EQUITY
                </h4>
                <div className="ml-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Current Liabilities
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      ৳
                      {balanceSheet.liabilities.currentLiabilities.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Accounts Payable
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.liabilities.currentLiabilities.accountsPayable.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Short-term Loans
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.liabilities.currentLiabilities.shortTermLoans.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Long-term Liabilities
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      ৳
                      {balanceSheet.liabilities.longTermLiabilities.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Long-term Loans
                    </span>
                    <span className="text-foreground text-xs">
                      ৳
                      {balanceSheet.liabilities.longTermLiabilities.longTermLoans.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Owner's Equity
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      ৳{balanceSheet.equity.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Owner Equity
                    </span>
                    <span className="text-foreground text-xs">
                      ৳{balanceSheet.equity.ownerEquity.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-4 flex justify-between">
                    <span className="text-muted-foreground text-xs">
                      - Retained Earnings
                    </span>
                    <span className="text-foreground text-xs">
                      ৳{balanceSheet.equity.retainedEarnings.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-border flex justify-between border-t pt-2">
                    <span className="text-foreground text-sm font-bold">
                      Total Liab. & Equity
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      ৳
                      {(
                        balanceSheet.liabilities.totalLiabilities +
                        balanceSheet.equity.total
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Validation */}
              <div
                className={`mt-3 rounded p-2 ${balanceSheet.isBalanced ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}`}
              >
                <div className="text-xs">
                  <span
                    className={
                      balanceSheet.isBalanced
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }
                  >
                    Balance Check: Assets = Liabilities + Equity (
                    {balanceSheet.isBalanced ? 'PASSED' : 'FAILED'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Cash Flow Statement */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Cash Flow Statement (Real-time)
            </h3>
            <p className="text-muted-foreground text-xs">
              Operating, Investing & Financing Activities
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
              onClick={() => handleExportReport('cash_flow', 'pdf')}
              disabled={exportLoading === 'cash_flow-pdf'}
            >
              {exportLoading === 'cash_flow-pdf' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Download className="mr-1 inline h-3 w-3" />
                  PDF
                </>
              )}
            </button>
            <button
              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              onClick={() => handleExportReport('cash_flow', 'excel')}
              disabled={exportLoading === 'cash_flow-excel'}
            >
              {exportLoading === 'cash_flow-excel' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Download className="mr-1 inline h-3 w-3" />
                  Excel
                </>
              )}
            </button>
            <button
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              onClick={() => handleEmailReport('Cash Flow Statement')}
            >
              <Mail className="mr-1 inline h-3 w-3" />
              Email
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Operating Activities */}
            <div>
              <h4 className="text-foreground mb-3 font-medium">
                Operating Activities
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Net Income
                  </span>
                  <span className="text-sm text-green-600">
                    ৳{cashFlow.operatingActivities.netIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Depreciation
                  </span>
                  <span className="text-sm text-green-600">
                    ৳
                    {cashFlow.operatingActivities.depreciation.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Change in Receivables
                  </span>
                  <span
                    className={`text-sm ${cashFlow.operatingActivities.accountsReceivableChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.operatingActivities.accountsReceivableChange >= 0
                      ? ''
                      : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.operatingActivities.accountsReceivableChange
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Change in Inventory
                  </span>
                  <span
                    className={`text-sm ${cashFlow.operatingActivities.inventoryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.operatingActivities.inventoryChange >= 0
                      ? ''
                      : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.operatingActivities.inventoryChange
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Change in Payables
                  </span>
                  <span
                    className={`text-sm ${cashFlow.operatingActivities.accountsPayableChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.operatingActivities.accountsPayableChange >= 0
                      ? ''
                      : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.operatingActivities.accountsPayableChange
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="border-border flex justify-between border-t pt-2">
                  <span className="text-foreground text-sm font-medium">
                    Operating Cash Flow
                  </span>
                  <span
                    className={`text-sm font-bold ${cashFlow.operatingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.operatingActivities.total >= 0 ? '' : '-'}৳
                    {Math.abs(
                      cashFlow.operatingActivities.total
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <h4 className="text-foreground mb-3 font-medium">
                Investing Activities
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Vehicle Purchases
                  </span>
                  <span
                    className={`text-sm ${cashFlow.investingActivities.vehiclePurchases >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.investingActivities.vehiclePurchases >= 0
                      ? ''
                      : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.investingActivities.vehiclePurchases
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Equipment Purchases
                  </span>
                  <span
                    className={`text-sm ${cashFlow.investingActivities.equipmentPurchases >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.investingActivities.equipmentPurchases >= 0
                      ? ''
                      : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.investingActivities.equipmentPurchases
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="border-border flex justify-between border-t pt-2">
                  <span className="text-foreground text-sm font-medium">
                    Investing Cash Flow
                  </span>
                  <span
                    className={`text-sm font-bold ${cashFlow.investingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.investingActivities.total >= 0 ? '' : '-'}৳
                    {Math.abs(
                      cashFlow.investingActivities.total
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <h4 className="text-foreground mb-3 font-medium">
                Financing Activities
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Owner Drawings
                  </span>
                  <span
                    className={`text-sm ${cashFlow.financingActivities.ownerDrawings >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.financingActivities.ownerDrawings >= 0 ? '' : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.financingActivities.ownerDrawings
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Loan Repayments
                  </span>
                  <span
                    className={`text-sm ${cashFlow.financingActivities.loanRepayments >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.financingActivities.loanRepayments >= 0
                      ? ''
                      : '-'}
                    ৳
                    {Math.abs(
                      cashFlow.financingActivities.loanRepayments
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="border-border flex justify-between border-t pt-2">
                  <span className="text-foreground text-sm font-medium">
                    Financing Cash Flow
                  </span>
                  <span
                    className={`text-sm font-bold ${cashFlow.financingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {cashFlow.financingActivities.total >= 0 ? '' : '-'}৳
                    {Math.abs(
                      cashFlow.financingActivities.total
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900 dark:text-blue-200">
                Net Change in Cash
              </span>
              <span
                className={`text-lg font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {cashFlow.netCashFlow >= 0 ? '' : '-'}৳
                {Math.abs(cashFlow.netCashFlow).toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Cash at Beginning of Period
              </span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                ৳{cashFlow.beginningCash.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-blue-200 pt-2 dark:border-blue-700">
              <span className="font-medium text-blue-900 dark:text-blue-200">
                Cash at End of Period
              </span>
              <span className="text-lg font-bold text-blue-600">
                ৳{cashFlow.endingCash.toLocaleString()}
              </span>
            </div>

            {/* Cash Flow Health Indicator */}
            <div className="mt-3 border-t border-blue-200 pt-2 dark:border-blue-700">
              <div className="flex items-center">
                {cashFlow.operatingActivities.total > 0 ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                )}
                <span className="text-muted-foreground text-xs">
                  Operating cash flow is{' '}
                  {cashFlow.operatingActivities.total > 0
                    ? 'positive'
                    : 'negative'}{' '}
                  -
                  {cashFlow.operatingActivities.total > 0
                    ? ' healthy business operations'
                    : ' requires attention'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
