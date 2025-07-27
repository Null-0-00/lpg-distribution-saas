'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/providers/ThemeProvider';
import { AuthTopToggles } from '@/components/ui/AuthTopToggles';

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

    const lightBg = 'rgb(249 250 251)'; // bg-gray-50
    const darkBg = 'rgb(17 24 39)'; // bg-gray-900

    document.body.style.backgroundColor =
      effectiveTheme === 'dark' ? darkBg : lightBg;

    return () => {
      // Reset to CSS variable on cleanup
      document.body.style.backgroundColor = '';
    };
  }, [theme]);

  // Render static content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
        <div className="fixed right-4 top-4 z-50 flex items-center space-x-3">
          <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-18 0m18 0a9 9 0 00-18 0m18 0H3m6 0l3-3m-3 3l3 3m6-6l3-3m-3 3l3 3"
              />
            </svg>
            <span>বাংলা (Bengali)</span>
          </div>
          <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
            <button className="rounded-md p-2 text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
            <button className="rounded-md p-2 text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
            <button className="rounded-md bg-blue-600 p-2 text-white">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
              LPG Distributor Management System
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
              Manage LPG distribution business
            </p>
            <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link
                href="/auth/login"
                className="block w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="block w-full rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50 sm:w-auto dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-600 dark:bg-gray-700">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Sales Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track daily sales, manage drivers, and monitor performance with
                real-time updates.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-600 dark:bg-gray-700">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Inventory Control
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automated inventory calculations for full and empty cylinders
                with exact formulas.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-600 dark:bg-gray-700">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Financial Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive financial reporting with income statements and
                balance sheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <AuthTopToggles />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
            {t('lpgDistributorManagementSystem')}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            {t('manageLpgDistributionBusiness')}
          </p>
          <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            <Link
              href="/auth/login"
              className="block w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {t('login')}
            </Link>
            <Link
              href="/auth/register"
              className="block w-full rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50 sm:w-auto dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {t('createYourAccount')}
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-600 dark:bg-gray-700">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {t('salesManagement')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dailySalesRetailDrivers')}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-600 dark:bg-gray-700">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {t('inventoryControl')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('automatedCalculationsExactFormulas')}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-gray-600 dark:bg-gray-700">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {t('financialReports')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('viewComprehensiveReports')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
