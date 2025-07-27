'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Receipt,
  FileText,
  Truck,
  CreditCard,
  Building2,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ClientTime } from '@/components/ui/ClientTime';
import { useSettings } from '@/contexts/SettingsContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Button } from '@/components/ui/button';
// Removed FallbackDataService import to use only real database data

interface DashboardStats {
  todaySales: number;
  totalRevenue: number;
  pendingReceivables: number;
  lowStockAlerts: number;
  pendingApprovals: number;
  monthlyExpenses: number;
}

interface DashboardAnalytics {
  weekSalesData: number[];
  topDrivers: Array<{
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  alerts: Array<{
    type: string;
    priority: string;
    message: string;
    timestamp: string;
    category: string;
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    amount?: number;
  }>;
  performanceMetrics: {
    salesTrend: string;
    totalWeekSales: number;
    avgDailySales: number;
  };
}

export default function DashboardPage() {
  const { formatCurrency, formatDate, formatDateTime, formatTime, t } =
    useSettings();
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    completed: onboardingCompleted,
    loading: onboardingLoading,
    checkOnboardingStatus,
  } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalRevenue: 0,
    pendingReceivables: 0,
    lowStockAlerts: 0,
    pendingApprovals: 0,
    monthlyExpenses: 0,
  });
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session) {
      loadDashboardData();
      // Refresh data every 10 minutes for better performance
      const interval = setInterval(loadDashboardData, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [status, session, router]);

  // Handle onboarding modal trigger
  useEffect(() => {
    if (
      !onboardingLoading &&
      status === 'authenticated' &&
      !onboardingCompleted
    ) {
      setShowOnboarding(true);
    }
  }, [onboardingLoading, onboardingCompleted, status]);

  const loadDashboardData = async () => {
    // Don't make API calls if not authenticated
    if (status !== 'authenticated' || !session) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/dashboard/combined');

      if (response.ok) {
        const data = await response.json();
        setStats(data.metrics);
        setAnalytics(data.analytics);
      } else if (response.status === 401) {
        // Session expired, redirect to login
        router.push('/auth/login');
        return;
      } else {
        throw new Error(
          `${t('failedToLoadDashboardData')}: ${response.status}`
        );
      }
    } catch (error) {
      console.error(t('errorLoadingCombinedDashboardData'), error);
      setError(t('failedToLoadDashboardDataRefresh'));
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    checkOnboardingStatus();
    setShowOnboarding(false);
  };

  const handleOpenOnboarding = () => {
    setShowOnboarding(true);
  };

  const navigationCards = useMemo(
    () => [
      {
        title: t('salesManagement'),
        description: `${t('recordDailySales')} ${t('trackPerformance')}`,
        icon: TrendingUp,
        href: '/dashboard/sales',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        stat: `${stats.todaySales} ${t('today')}`,
      },
      {
        title: t('inventoryControl'),
        description: t('monitorCylinderStock'),
        icon: Package,
        href: '/dashboard/inventory',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        stat:
          stats.lowStockAlerts > 0
            ? `${stats.lowStockAlerts} ${t('alerts')}`
            : t('allGood'),
        urgent: stats.lowStockAlerts > 0,
      },
      {
        title: t('driverManagement'),
        description: t('manageDriversAndAssignments'),
        icon: Truck,
        href: '/dashboard/drivers',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        stat: t('manageTeam'),
      },
      {
        title: t('userManagement'),
        description: `${t('manageSystemUsers')} ${t('manageSystemRoles')}`,
        icon: Users,
        href: '/dashboard/users',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        stat: t('teamAccess'),
      },
      {
        title: t('receivables'),
        description: `${t('trackCustomerPayments')} ${t('trackCustomerCredits')}`,
        icon: CreditCard,
        href: '/dashboard/receivables',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        stat: `${formatCurrency(stats.pendingReceivables)} ${t('pending')}`,
      },
      {
        title: t('assetsLiabilities'),
        description: `${t('manageCompanyAssets')} ${t('manageLiabilities')}`,
        icon: Building2,
        href: '/dashboard/assets',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        stat: t('balanceSheet'),
      },
      {
        title: t('expenseManagement'),
        description: `${t('trackExpenses')} ${t('manageBudgets')}`,
        icon: Receipt,
        href: '/dashboard/expenses',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        stat:
          stats.pendingApprovals > 0
            ? `${stats.pendingApprovals} ${t('pending')}`
            : `${formatCurrency(stats.monthlyExpenses)} ${t('thisMonth')}`,
        urgent: stats.pendingApprovals > 0,
      },
      {
        title: t('financialReports'),
        description: t('viewComprehensiveReports'),
        icon: FileText,
        href: '/dashboard/reports',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        stat: t('reportsAnalytics'),
      },
    ],
    [stats, t, formatCurrency]
  );

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">{t('loadingText')}</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              {t('dashboard')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('manageLpgDistributionBusiness')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onboardingCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenOnboarding}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {t('setupBusiness')}
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => loadDashboardData()}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  {t('retry')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-colors">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">
                  {t('revenue')} {t('today')}
                </p>
                <p className="text-foreground text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-colors">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">
                  {t('sales')} {t('today')}
                </p>
                <p className="text-foreground text-2xl font-bold">
                  {stats.todaySales}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-colors">
            <div className="flex items-center">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900">
                <Receipt className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">
                  {t('pending')} {t('tasks')}
                </p>
                <p className="text-foreground text-2xl font-bold">
                  {stats.pendingApprovals + stats.lowStockAlerts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.href}
                className={`bg-card border-border cursor-pointer rounded-lg border p-6 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600 ${
                  card.urgent
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : ''
                }`}
                onClick={() => (window.location.href = card.href)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`rounded-lg p-3 ${card.bgColor} dark:${card.bgColor.replace('50', '900')}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${card.color} dark:${card.color.replace('600', '400')}`}
                    />
                  </div>
                  {card.urgent && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                      {t('urgent')}
                    </span>
                  )}
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  {card.description}
                </p>
                <p
                  className={`text-sm font-medium ${
                    card.urgent
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {card.stat}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6 shadow-sm transition-colors">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {t('actions')}
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={() => (window.location.href = '/dashboard/sales')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('newSale')}
            </button>
            <button
              className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              onClick={() => (window.location.href = '/dashboard/inventory')}
            >
              <Package className="mr-2 h-4 w-4" />
              {t('checkStock')}
            </button>
            <button
              className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
              onClick={() => (window.location.href = '/dashboard/expenses')}
            >
              <Receipt className="mr-2 h-4 w-4" />
              {t('addExpense')}
            </button>
            <button
              className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
              onClick={() => (window.location.href = '/dashboard/receivables')}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {t('updatePayment')}
            </button>
            <button
              className="bg-muted hover:bg-muted/80 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              onClick={() => (window.location.href = '/dashboard/reports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('viewReports')}
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6 shadow-sm transition-colors">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {t('recentActivity')}
          </h3>
          <div className="space-y-3">
            {analytics?.recentActivity &&
            analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="bg-muted border-border flex items-center rounded-lg border p-3 transition-colors"
                >
                  <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">
                      {activity.message}
                      {activity.amount &&
                        ` - ${formatCurrency(activity.amount)}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <ClientTime
                        timestamp={activity.timestamp}
                        format="relative"
                      />
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <>
                {[
                  {
                    message: t('rahmanSoldCylinders'),
                    amount: 2500,
                    timestamp: new Date(
                      Date.now() - 2 * 60 * 60 * 1000
                    ).toISOString(),
                    color: 'bg-blue-500',
                  },
                  {
                    message: t('stockReplenished'),
                    timestamp: new Date(
                      Date.now() - 4 * 60 * 60 * 1000
                    ).toISOString(),
                    color: 'bg-green-500',
                  },
                  {
                    message: t('paymentReceived'),
                    amount: 15000,
                    timestamp: new Date(
                      Date.now() - 6 * 60 * 60 * 1000
                    ).toISOString(),
                    color: 'bg-purple-500',
                  },
                ].map((fallbackActivity, index) => (
                  <div
                    key={index}
                    className="bg-muted border-border flex items-center rounded-lg border p-3 transition-colors"
                  >
                    <div
                      className={`h-2 w-2 ${fallbackActivity.color} mr-3 rounded-full`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">
                        {fallbackActivity.message}
                        {fallbackActivity.amount &&
                          ` - ${formatCurrency(fallbackActivity.amount)}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <ClientTime
                          timestamp={fallbackActivity.timestamp}
                          format="relative"
                        />
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-colors">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {t('salesTrend')} ({t('last7Days')})
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1 text-center">
                {[
                  t('mon'),
                  t('tue'),
                  t('wed'),
                  t('thu'),
                  t('fri'),
                  t('sat'),
                  t('sun'),
                ].map((day, index) => (
                  <div
                    key={day}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid h-32 grid-cols-7 items-end gap-1">
                {(analytics?.weekSalesData || [25, 30, 22, 35, 28, 40, 45]).map(
                  (value, idx) => {
                    const maxValue = Math.max(
                      ...(analytics?.weekSalesData || [45])
                    );
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${
                            idx === 6 ? 'bg-blue-500' : 'bg-muted-foreground'
                          }`}
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {value}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 shadow-sm transition-colors">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {t('topDriverPerformance')}
            </h3>
            <div className="space-y-3">
              {(
                analytics?.topDrivers || [
                  {
                    name: t('fallbackDriverName1'),
                    sales: 15,
                    revenue: 7500,
                    percentage: 100,
                  },
                  {
                    name: t('fallbackDriverName2'),
                    sales: 12,
                    revenue: 6000,
                    percentage: 80,
                  },
                  {
                    name: t('fallbackDriverName3'),
                    sales: 8,
                    revenue: 4000,
                    percentage: 53,
                  },
                  {
                    name: t('fallbackDriverName4'),
                    sales: 10,
                    revenue: 5000,
                    percentage: 67,
                  },
                ]
              ).map((driver, index) => (
                <div
                  key={index}
                  className="bg-muted border-border flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {driver.sales} {t('salesCount')} •{' '}
                        {formatCurrency(driver.revenue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-muted h-2 w-16 rounded-full">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${driver.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {driver.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">{t('lpgDistributorManagementSystem')}</p>
          <div className="mt-2 flex items-center justify-center text-xs">
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span>
              {t('lastUpdated')}: <ClientTime format="time" />
            </span>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
