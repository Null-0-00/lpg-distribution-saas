'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface AdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalProducts: number;
  activeProducts: number;
  totalDistributors: number;
  activeDistributors: number;
  totalAssignments: number;
  activeAssignments: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    user: { name: string };
    createdAt: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    lastBackup: string;
    activeUsers: number;
  };
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      const mockStats: AdminStats = {
        totalCompanies: 8,
        activeCompanies: 7,
        totalProducts: 24,
        activeProducts: 22,
        totalDistributors: 15,
        activeDistributors: 13,
        totalAssignments: 45,
        activeAssignments: 38,
        recentActivity: [
          {
            id: '1',
            action: 'CREATE',
            entityType: 'Company',
            user: { name: 'Admin User' },
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            action: 'UPDATE',
            entityType: 'Product',
            user: { name: 'Admin User' },
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: '3',
            action: 'ASSIGN',
            entityType: 'DistributorAssignment',
            user: { name: 'Admin User' },
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        ],
        systemHealth: {
          status: 'healthy',
          uptime: '99.9%',
          lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          activeUsers: 28,
        },
      };

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'ASSIGN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load admin dashboard</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getHealthIcon(stats.systemHealth.status)}
          <span className="text-sm font-medium">
            System {stats.systemHealth.status}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeCompanies} active,{' '}
              {stats.totalCompanies - stats.activeCompanies} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeProducts} active,{' '}
              {stats.totalProducts - stats.activeProducts} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distributors</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistributors}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeDistributors} active,{' '}
              {stats.totalDistributors - stats.activeDistributors} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeAssignments} active,{' '}
              {stats.totalAssignments - stats.activeAssignments} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system changes and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getActionColor(activity.action)}
                      variant="secondary"
                    >
                      {activity.action}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.entityType}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        by {activity.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHealthIcon(stats.systemHealth.status)}
              System Health
            </CardTitle>
            <CardDescription>Platform status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Uptime</span>
                <span className="text-sm font-medium">
                  {stats.systemHealth.uptime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Active Users
                </span>
                <span className="text-sm font-medium">
                  {stats.systemHealth.activeUsers}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Last Backup
                </span>
                <span className="text-sm font-medium">
                  {formatDate(stats.systemHealth.lastBackup)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge
                  variant={
                    stats.systemHealth.status === 'healthy'
                      ? 'default'
                      : 'destructive'
                  }
                  className="capitalize"
                >
                  {stats.systemHealth.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="hover:bg-accent cursor-pointer rounded-lg border p-4 transition-colors">
              <Building2 className="text-primary mb-2 h-8 w-8" />
              <h3 className="font-medium">Add Company</h3>
              <p className="text-muted-foreground text-xs">
                Register a new LPG company
              </p>
            </div>

            <div className="hover:bg-accent cursor-pointer rounded-lg border p-4 transition-colors">
              <Package className="text-primary mb-2 h-8 w-8" />
              <h3 className="font-medium">Add Product</h3>
              <p className="text-muted-foreground text-xs">
                Create a new product variant
              </p>
            </div>

            <div className="hover:bg-accent cursor-pointer rounded-lg border p-4 transition-colors">
              <Users className="text-primary mb-2 h-8 w-8" />
              <h3 className="font-medium">Assign Distributor</h3>
              <p className="text-muted-foreground text-xs">
                Create new distributor assignment
              </p>
            </div>

            <div className="hover:bg-accent cursor-pointer rounded-lg border p-4 transition-colors">
              <FileText className="text-primary mb-2 h-8 w-8" />
              <h3 className="font-medium">View Audit Logs</h3>
              <p className="text-muted-foreground text-xs">
                Review system activity logs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
