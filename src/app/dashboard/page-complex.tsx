'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  todaySales: number;
  totalRevenue: number;
  pendingReceivables: number;
  lowStockAlerts: number;
  pendingApprovals: number;
  monthlyExpenses: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useSettings();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalRevenue: 0,
    pendingReceivables: 0,
    lowStockAlerts: 0,
    pendingApprovals: 0,
    monthlyExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadDashboardStats();
    }
  }, [session]);

  const loadDashboardStats = async () => {
    try {
      // Simulate dashboard stats - implement actual API calls
      setStats({
        todaySales: 45,
        totalRevenue: 125000,
        pendingReceivables: 15000,
        lowStockAlerts: 3,
        pendingApprovals: 5,
        monthlyExpenses: 12500,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Please sign in</h2>
          <p className="text-gray-600">
            You need to be signed in to access this page.
          </p>
        </div>
      </div>
    );
  }

  const navigationCards = [
    {
      title: 'Sales Management',
      description: 'Record daily sales and track performance',
      icon: TrendingUp,
      href: '/dashboard/sales',
      color: 'bg-blue-500',
      stat: `${stats.todaySales} today`,
    },
    {
      title: 'Inventory Control',
      description: 'Monitor cylinder stock levels',
      icon: Package,
      href: '/dashboard/inventory',
      color: 'bg-green-500',
      stat:
        stats.lowStockAlerts > 0
          ? `${stats.lowStockAlerts} alerts`
          : 'All good',
      urgent: stats.lowStockAlerts > 0,
    },
    {
      title: 'Driver Management',
      description: 'Manage drivers and assignments',
      icon: Truck,
      href: '/dashboard/drivers',
      color: 'bg-purple-500',
      stat: 'Active drivers',
    },
    {
      title: 'User Management',
      description: 'Manage system users and roles',
      icon: Users,
      href: '/dashboard/users',
      color: 'bg-indigo-500',
      stat: 'Team access',
      adminOnly: true,
    },
    {
      title: 'Receivables',
      description: 'Track customer payments and credits',
      icon: CreditCard,
      href: '/dashboard/receivables',
      color: 'bg-orange-500',
      stat: `৳${(stats.pendingReceivables / 1000).toFixed(0)}K pending`,
    },
    {
      title: 'Assets & Liabilities',
      description: 'Manage company assets and liabilities',
      icon: Building2,
      href: '/dashboard/assets',
      color: 'bg-teal-500',
      stat: 'Balance sheet',
    },
    {
      title: 'Expense Management',
      description: 'Track expenses and manage budgets',
      icon: Receipt,
      href: '/dashboard/expenses',
      color: 'bg-red-500',
      stat:
        stats.pendingApprovals > 0
          ? `${stats.pendingApprovals} pending`
          : `৳${(stats.monthlyExpenses / 1000).toFixed(0)}K this month`,
      urgent: stats.pendingApprovals > 0,
    },
    {
      title: 'Financial Reports',
      description: 'View comprehensive financial reports',
      icon: FileText,
      href: '/dashboard/reports',
      color: 'bg-gray-500',
      stat: 'Reports & analytics',
    },
  ];

  const filteredCards = navigationCards.filter(
    (card) => !card.adminOnly || session.user.role === 'ADMIN'
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {t('welcomeBack')}, {session.user.name}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your LPG distribution business
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold">
                  ৳{(stats.totalRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sales Today</p>
                <p className="text-2xl font-bold">{stats.todaySales}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold">
                  {stats.pendingApprovals + stats.lowStockAlerts}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card
                className={`h-full cursor-pointer transition-shadow hover:shadow-lg ${
                  card.urgent ? 'bg-red-50 ring-2 ring-red-200' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`rounded-lg p-2 ${card.color} bg-opacity-10`}
                    >
                      <Icon
                        className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`}
                      />
                    </div>
                    {card.urgent && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                        Urgent
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-sm font-medium ${
                      card.urgent ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {card.stat}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/sales">
            <Button variant="outline" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </Link>
          <Link href="/dashboard/expenses">
            <Button variant="outline" size="sm">
              <Receipt className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Check Stock
            </Button>
          </Link>
          <Link href="/dashboard/receivables">
            <Button variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
