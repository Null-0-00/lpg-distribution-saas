'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
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
import { useState } from 'react';

const getNavigation = () => [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Sales', href: '/dashboard/sales', icon: TrendingUp },
  { name: 'Analytics', href: '/dashboard/analytics', icon: Calculator },
  {
    name: 'Daily Sales Report',
    href: '/dashboard/reports/daily-sales',
    icon: BarChart3,
  },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Shipments', href: '/dashboard/shipments', icon: Ship },
  { name: 'Drivers', href: '/dashboard/drivers', icon: Truck },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Receivables', href: '/dashboard/receivables', icon: CreditCard },
  { name: 'Assets', href: '/dashboard/assets', icon: Building2 },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  {
    name: 'Product Management',
    href: '/dashboard/product-management',
    icon: Package,
  },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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
  const navigation = getNavigation();

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
            <h1 className="text-card-foreground text-lg font-semibold">
              LPG Distributor
            </h1>
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
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-card-foreground hover:bg-muted'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  prefetch={true}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
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
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="bg-card border-border flex min-h-0 flex-1 flex-col border-r">
          <div className="border-border flex items-center justify-between border-b px-4 py-4">
            <h1 className="text-card-foreground text-lg font-semibold">
              LPG Distributor
            </h1>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-card-foreground hover:bg-muted'
                  }`}
                  prefetch={true}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
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
              Logout
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
                    Welcome back, {session?.user?.name}
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
