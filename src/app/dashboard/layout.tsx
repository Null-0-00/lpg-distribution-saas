'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Home,
  Menu,
  X,
  Ship,
  Settings,
  BarChart3,
  Calculator,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSettings } from '@/contexts/SettingsContext';
import { Translations } from '@/lib/i18n/translations';
import { hasPagePermission } from '@/lib/types/page-permissions';
import { UserRole } from '@prisma/client';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  pageId: string;
  comingSoon?: boolean;
}

const getNavigation = (
  t: (key: keyof Translations) => string
): NavigationItem[] => [
  { name: t('dashboard'), href: '/dashboard', icon: Home, pageId: 'dashboard' },
  {
    name: t('dailySalesReport'),
    href: '/dashboard/reports/daily-sales',
    icon: BarChart3,
    pageId: 'daily-sales-report',
  },
  {
    name: t('inventory'),
    href: '/dashboard/inventory',
    icon: Package,
    pageId: 'inventory',
  },
  {
    name: t('analytics'),
    href: '/dashboard/analytics',
    icon: Calculator,
    pageId: 'analytics',
  },
  {
    name: t('sales'),
    href: '/dashboard/sales',
    icon: TrendingUp,
    pageId: 'sales',
  },
  {
    name: t('receivables'),
    href: '/dashboard/receivables',
    icon: CreditCard,
    pageId: 'receivables',
  },
  {
    name: t('expenses'),
    href: '/dashboard/expenses',
    icon: Receipt,
    pageId: 'expenses',
  },
  {
    name: t('shipments'),
    href: '/dashboard/shipments',
    icon: Ship,
    pageId: 'shipments',
  },
  {
    name: t('assets'),
    href: '/dashboard/assets',
    icon: Building2,
    pageId: 'assets',
  },
  {
    name: t('drivers'),
    href: '/dashboard/drivers',
    icon: Truck,
    pageId: 'drivers',
  },
  {
    name: t('productManagement'),
    href: '/dashboard/product-management',
    icon: Package,
    pageId: 'product-management',
  },
  {
    name: t('reports'),
    href: '/dashboard/reports',
    icon: FileText,
    pageId: 'reports',
    comingSoon: true,
  },
  { name: t('users'), href: '/dashboard/users', icon: Users, pageId: 'users' },
  {
    name: t('settings'),
    href: '/dashboard/settings',
    icon: Settings,
    pageId: 'settings',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useSettings();
  const allNavigation = getNavigation(t);

  // Debug session structure
  console.log('=== SESSION STRUCTURE DEBUG ===');
  console.log('Session status:', status);
  console.log('Full session:', JSON.stringify(session, null, 2));
  console.log('Session user:', session?.user);
  console.log('Session user role:', session?.user?.role);
  console.log('Session user pagePermissions:', session?.user?.pagePermissions);
  console.log('================================');

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter((item) => {
    console.log('=== LAYOUT NAVIGATION FILTER DEBUG ===');
    console.log('Current item:', item.name, item.pageId);
    console.log('User role:', session?.user?.role);
    console.log('User pagePermissions:', session?.user?.pagePermissions);
    console.log(
      'Has permission:',
      hasPagePermission(session?.user?.pagePermissions || [], item.pageId)
    );

    // Admin users can see all pages
    if (session?.user?.role === UserRole.ADMIN) {
      console.log('Admin user - showing all');
      return true;
    }

    // For managers, check page permissions
    if (session?.user?.role === UserRole.MANAGER) {
      const userPagePermissions = session.user.pagePermissions || [];
      const hasPermission = hasPagePermission(userPagePermissions, item.pageId);
      console.log('Manager check - has permission:', hasPermission);
      console.log('=======================================');
      return hasPermission;
    }

    // Default: show all items for other roles or if no permissions defined
    console.log('Default - showing all');
    console.log('=======================================');
    return true;
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="bg-background min-h-screen transition-colors">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
      >
        <div
          className="bg-background fixed inset-0 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="bg-card fixed inset-y-0 left-0 flex w-64 flex-col shadow-xl">
          <div className="border-border flex items-center justify-between border-b px-4 py-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="LPG Manager"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-card-foreground ml-2 text-lg font-semibold">
                LPG Manager
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-card-foreground hover:bg-muted'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  prefetch={true}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.comingSoon && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {t('comingSoon')}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {/* Mobile logout button */}
          <div className="border-border border-t p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="bg-card border-border flex min-h-0 flex-1 flex-col border-r">
          <div className="border-border flex items-center justify-between border-b px-4 py-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="LPG Manager"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-card-foreground ml-2 text-lg font-semibold">
                LPG Manager
              </span>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-card-foreground hover:bg-muted'
                  }`}
                  prefetch={true}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.comingSoon && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {t('comingSoon')}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {/* Desktop logout button */}
          <div className="border-border border-t p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <div className="bg-card border-border border-b shadow-sm transition-colors">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <p className="text-muted-foreground text-sm">
                    {t('welcomeBack')}, {session?.user?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground text-sm">
                  Role: {session?.user?.role}
                </span>
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="flex items-center rounded-md p-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="bg-background flex-1 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
