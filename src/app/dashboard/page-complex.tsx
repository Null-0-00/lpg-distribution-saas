'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingDown
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to access this page.</p>
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
      stat: stats.lowStockAlerts > 0 ? `${stats.lowStockAlerts} alerts` : 'All good',
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
      stat: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} pending` : `৳${(stats.monthlyExpenses / 1000).toFixed(0)}K this month`,
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

  const filteredCards = navigationCards.filter(card => 
    !card.adminOnly || session.user.role === 'ADMIN'
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your LPG distribution business
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold">৳{(stats.totalRevenue / 1000).toFixed(0)}K</p>
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
                <p className="text-2xl font-bold">{stats.pendingApprovals + stats.lowStockAlerts}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${
                card.urgent ? 'ring-2 ring-red-200 bg-red-50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                    {card.urgent && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
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
                  <p className={`text-sm font-medium ${
                    card.urgent ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.stat}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/sales">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
          <Link href="/dashboard/expenses">
            <Button variant="outline" size="sm">
              <Receipt className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Check Stock
            </Button>
          </Link>
          <Link href="/dashboard/receivables">
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}