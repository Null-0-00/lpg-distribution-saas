'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/providers/ThemeProvider';
import { AuthTopToggles } from '@/components/ui/AuthTopToggles';
import {
  TrendingUp,
  Package,
  Shield,
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Clock,
  FileText,
} from 'lucide-react';

export function HomePageClient() {
  const { t } = useTranslation({ component: 'HomePage' });
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Override body background for home page
  useEffect(() => {
    const effectiveTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    document.body.style.backgroundColor =
      effectiveTheme === 'dark'
        ? 'rgb(var(--background))'
        : 'rgb(var(--background))';

    return () => {
      // Reset to CSS variable on cleanup
      document.body.style.backgroundColor = '';
    };
  }, [theme]);

  // Prevent hydration mismatch by showing loading state
  if (!mounted) {
    return (
      <div className="bg-background min-h-screen">
        <div className="fixed right-4 top-4 z-50">
          <div className="border-border bg-card text-card-foreground flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>

        <header className="absolute left-4 top-4 z-50">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-6 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </header>

        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 py-20 lg:py-32 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-32 -top-40 h-80 w-80 rounded-full bg-blue-200 opacity-30 blur-3xl dark:bg-blue-900"></div>
            <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-sky-200 opacity-30 blur-3xl dark:bg-sky-900"></div>
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex h-8 w-48 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="mb-6 h-16 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              <div className="mx-auto mb-12 h-8 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              <div className="mb-12 flex justify-center space-x-4">
                <div className="h-12 w-32 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-12 w-24 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <AuthTopToggles />

      {/* Header with Logo and Company Name */}
      <header className="absolute left-4 top-4 z-50">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="relative h-6 w-6">
            <Image
              src="/lpg manager logo 2.png"
              alt="LPG Manager Logo"
              width={20}
              height={20}
              className="rounded-md object-contain"
              priority
            />
          </div>
          {/* Company Name */}
          <span className="text-foreground text-xl font-bold">LPG Manager</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 py-20 lg:py-32 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-40 h-80 w-80 rounded-full bg-blue-200 opacity-30 blur-3xl dark:bg-blue-900"></div>
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-sky-200 opacity-30 blur-3xl dark:bg-sky-900"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Star className="mr-2 h-4 w-4" />
              {t('modernLpgDistributionPlatform')}
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                {t('lpgDistributorManagementSystem')}
              </span>
            </h1>

            <p className="text-muted-foreground mx-auto mb-12 max-w-3xl text-xl leading-relaxed lg:text-2xl">
              {t('manageLpgDistributionBusiness')} -{' '}
              {t('streamlineYourOperations')}
            </p>

            <div className="mb-12 space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link
                href="/auth/register"
                className="group inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl sm:w-auto"
              >
                {t('startFreeTrial')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth/login"
                className="border-border bg-background text-foreground hover:bg-muted inline-flex w-full items-center justify-center rounded-lg border-2 px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 sm:w-auto"
              >
                {t('login')}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 lg:text-3xl">
                  500+
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('activeDistributors')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 lg:text-3xl">
                  99.9%
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('uptime')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 lg:text-3xl">
                  1M+
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('transactions')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 lg:text-3xl">
                  24/7
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('support')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold lg:text-4xl">
              {t('powerfulFeaturesForModernLpg')}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
              {t('everythingYouNeedToManage')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Sales Management */}
            <div className="border-border bg-card group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                {t('salesManagement')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('dailySalesRetailDrivers')}{' '}
                {t('trackPerformanceManageTerritories')}
              </p>
            </div>

            {/* Inventory Control */}
            <div className="border-border bg-card group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                {t('inventoryControl')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('automatedCalculationsExactFormulas')}{' '}
                {t('realTimeStockMonitoring')}
              </p>
            </div>

            {/* Financial Reports */}
            <div className="border-border bg-card group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                {t('financialReports')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('viewComprehensiveReports')}{' '}
                {t('incomeStatementsBalanceSheets')}
              </p>
            </div>

            {/* Driver Management */}
            <div className="border-border bg-card group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                {t('driverManagement')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('manageDriverAssignments')}
              </p>
            </div>

            {/* Real-time Analytics */}
            <div className="border-border bg-card group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                {t('realTimeAnalytics')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('getInstantInsights')}
              </p>
            </div>

            {/* Secure & Compliant */}
            <div className="border-border bg-card group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                {t('secureAndCompliant')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('enterpriseGradeSecurity')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold lg:text-4xl">
              {t('whyChooseOurPlatform')}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
              {t('builtSpecificallyForLpg')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {t('industrySpecificSolutions')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('purposeBuiltForLpg')}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {t('automatedBusinessLogic')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('exactFormulasFor')}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {t('multiTenantArchitecture')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('secureIsolatedData')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {t('saveTimeAndReduceErrors')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('eliminateManualCalculations')}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {t('increaseProfitability')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('optimizeOperations')}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {t('comprehensiveReporting')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('generateDetailedReports')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-blue-600 py-20 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            {t('readyToTransformYourBusiness')}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
            {t('joinHundredsOfDistributors')}
          </p>
          <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            <Link
              href="/auth/register"
              className="group inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:shadow-xl sm:w-auto"
            >
              {t('startFreeTrial')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-blue-600 sm:w-auto"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
