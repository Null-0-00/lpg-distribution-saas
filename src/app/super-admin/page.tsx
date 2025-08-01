'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Pause,
  CreditCard,
  Shield,
  ShieldCheck,
  ShieldX,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';

interface TenantSummary {
  id: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  contactPhone?: string;
  businessType?: string;
  businessDescription?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  subscriptionStatus: string;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  userCount: number;
  lastActivity?: string;
}

interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  onboardingCompleted: boolean;
  stats: {
    salesCount: number;
    expensesCount: number;
    auditLogsCount: number;
  };
}

interface TenantUserData {
  users: TenantUser[];
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  managerUsers: number;
}

interface DashboardStats {
  totalTenants: number;
  pendingApprovals: number;
  activeTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  newTenantsThisMonth: number;
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    pendingApprovals: 0,
    activeTenants: 0,
    suspendedTenants: 0,
    totalUsers: 0,
    newTenantsThisMonth: 0,
  });
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<TenantSummary | null>(
    null
  );
  const [tenantUsers, setTenantUsers] = useState<TenantUserData | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'details' | 'users' | 'subscription'
  >('details');
  const [subscriptionForm, setSubscriptionForm] = useState({
    subscriptionPlan: '',
    subscriptionStatus: '',
  });

  // Check super admin access
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      loadDashboardData();
    }
  }, [status, session, router]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statsResponse, tenantsResponse] = await Promise.all([
        fetch('/api/super-admin/dashboard/stats'),
        fetch('/api/super-admin/tenants'),
      ]);

      if (statsResponse.ok && tenantsResponse.ok) {
        const statsData = await statsResponse.json();
        const tenantsData = await tenantsResponse.json();
        setStats(statsData);
        setTenants(tenantsData);
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading super admin dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTenantUsers = async (tenantId: string) => {
    try {
      setUsersLoading(true);
      const response = await fetch(
        `/api/super-admin/tenants/${tenantId}/users`
      );
      if (response.ok) {
        const userData = await response.json();
        setTenantUsers(userData);
      } else {
        throw new Error('Failed to load tenant users');
      }
    } catch (error) {
      console.error('Error loading tenant users:', error);
      setError('Failed to load tenant users');
    } finally {
      setUsersLoading(false);
    }
  };

  const toggleUserStatus = async (
    tenantId: string,
    userId: string,
    isActive: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/super-admin/tenants/${tenantId}/users`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, isActive }),
        }
      );

      if (response.ok) {
        await loadTenantUsers(tenantId);
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const updateSubscription = async (tenantId: string) => {
    try {
      const response = await fetch(
        `/api/super-admin/tenants/${tenantId}/subscription`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionForm),
        }
      );

      if (response.ok) {
        await loadDashboardData();
        const updatedTenant = tenants.find((t) => t.id === tenantId);
        if (updatedTenant) {
          setSelectedTenant({ ...updatedTenant, ...subscriptionForm });
        }
      } else {
        throw new Error('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
    }
  };

  const handleTenantAction = async (
    tenantId: string,
    action: 'approve' | 'reject' | 'suspend' | 'activate'
  ) => {
    try {
      const response = await fetch(
        `/api/super-admin/tenants/${tenantId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason:
              action === 'reject' || action === 'suspend'
                ? 'Administrative action'
                : undefined,
          }),
        }
      );

      if (response.ok) {
        await loadDashboardData();
        setSelectedTenant(null);
      } else {
        throw new Error(`Failed to ${action} tenant`);
      }
    } catch (error) {
      console.error(`Error ${action}ing tenant:`, error);
      setError(`Failed to ${action} tenant. Please try again.`);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || tenant.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'APPROVED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'SUSPENDED':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'SUSPENDED':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">
            Loading Super Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage tenants and system-wide settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              Welcome, {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900">
            <div className="flex items-center">
              <AlertTriangle className="mr-3 h-5 w-5 text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={() => loadDashboardData()}
                className="ml-auto text-sm text-red-600 hover:underline dark:text-red-400"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">Total Tenants</p>
                <p className="text-foreground text-2xl font-bold">
                  {stats.totalTenants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">
                  Pending Approvals
                </p>
                <p className="text-foreground text-2xl font-bold">
                  {stats.pendingApprovals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">Active Tenants</p>
                <p className="text-foreground text-2xl font-bold">
                  {stats.activeTenants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-foreground text-2xl font-bold">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 md:w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-input bg-background ring-offset-background focus:ring-ring rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
          <div className="text-muted-foreground text-sm">
            Showing {filteredTenants.length} of {tenants.length} tenants
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-card border-border rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-border border-b">
                <tr>
                  <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                    Tenant
                  </th>
                  <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                    Contact
                  </th>
                  <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                    Plan
                  </th>
                  <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                    Users
                  </th>
                  <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                    Created
                  </th>
                  <th className="text-muted-foreground p-4 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="border-border hover:bg-muted/50 border-b"
                  >
                    <td className="p-4">
                      <div>
                        <div className="text-foreground font-medium">
                          {tenant.name}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {tenant.subdomain}.lpg-saas.com
                        </div>
                        {tenant.businessType && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {tenant.businessType}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-foreground text-sm">
                          {tenant.contactEmail}
                        </div>
                        {tenant.contactPhone && (
                          <div className="text-muted-foreground text-sm">
                            {tenant.contactPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(tenant.approvalStatus)}`}
                      >
                        {getStatusIcon(tenant.approvalStatus)}
                        {tenant.approvalStatus}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground text-sm">
                        {tenant.subscriptionPlan}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {tenant.subscriptionStatus}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground text-sm">
                        {tenant.userCount}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-muted-foreground text-sm">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setActiveTab('details');
                            setTenantUsers(null);
                            setSubscriptionForm({
                              subscriptionPlan: tenant.subscriptionPlan,
                              subscriptionStatus: tenant.subscriptionStatus,
                            });
                          }}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {tenant.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() =>
                                handleTenantAction(tenant.id, 'approve')
                              }
                              className="p-1 text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleTenantAction(tenant.id, 'reject')
                              }
                              className="p-1 text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {tenant.approvalStatus === 'APPROVED' &&
                          tenant.isActive && (
                            <button
                              onClick={() =>
                                handleTenantAction(tenant.id, 'suspend')
                              }
                              className="p-1 text-yellow-600 hover:text-yellow-700"
                              title="Suspend"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          )}
                        {tenant.approvalStatus === 'SUSPENDED' && (
                          <button
                            onClick={() =>
                              handleTenantAction(tenant.id, 'activate')
                            }
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Activate"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-muted-foreground text-sm">
                {searchTerm || statusFilter !== 'all'
                  ? 'No tenants match your search criteria.'
                  : 'No tenants found.'}
              </div>
            </div>
          )}
        </div>

        {/* Tenant Details Modal */}
        {selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-card border-border max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border shadow-lg">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-semibold">
                    Tenant Management: {selectedTenant.name}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedTenant(null);
                      setTenantUsers(null);
                      setActiveTab('details');
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-border mb-6 flex border-b">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600'
                        : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                  >
                    <Settings className="mr-2 inline h-4 w-4" />
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      if (!tenantUsers) {
                        loadTenantUsers(selectedTenant.id);
                      }
                    }}
                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                  >
                    <Users className="mr-2 inline h-4 w-4" />
                    Users ({selectedTenant.userCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'subscription'
                        ? 'border-blue-500 text-blue-600'
                        : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                  >
                    <CreditCard className="mr-2 inline h-4 w-4" />
                    Subscription
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Name
                        </label>
                        <p className="text-foreground">{selectedTenant.name}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Subdomain
                        </label>
                        <p className="text-foreground">
                          {selectedTenant.subdomain}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Contact Email
                        </label>
                        <p className="text-foreground">
                          {selectedTenant.contactEmail}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Contact Phone
                        </label>
                        <p className="text-foreground">
                          {selectedTenant.contactPhone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Business Type
                        </label>
                        <p className="text-foreground">
                          {selectedTenant.businessType || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Status
                        </label>
                        <div
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(selectedTenant.approvalStatus)}`}
                        >
                          {getStatusIcon(selectedTenant.approvalStatus)}
                          {selectedTenant.approvalStatus}
                        </div>
                      </div>
                    </div>

                    {selectedTenant.businessDescription && (
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Business Description
                        </label>
                        <p className="text-foreground mt-1">
                          {selectedTenant.businessDescription}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      {selectedTenant.approvalStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() =>
                              handleTenantAction(selectedTenant.id, 'approve')
                            }
                            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                          >
                            Approve Tenant
                          </button>
                          <button
                            onClick={() =>
                              handleTenantAction(selectedTenant.id, 'reject')
                            }
                            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                          >
                            Reject Tenant
                          </button>
                        </>
                      )}
                      {selectedTenant.approvalStatus === 'APPROVED' &&
                        selectedTenant.isActive && (
                          <button
                            onClick={() =>
                              handleTenantAction(selectedTenant.id, 'suspend')
                            }
                            className="rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                          >
                            Suspend Tenant
                          </button>
                        )}
                      {selectedTenant.approvalStatus === 'SUSPENDED' && (
                        <button
                          onClick={() =>
                            handleTenantAction(selectedTenant.id, 'activate')
                          }
                          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                        >
                          Activate Tenant
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-4">
                    {usersLoading ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
                        <p className="text-muted-foreground">
                          Loading users...
                        </p>
                      </div>
                    ) : tenantUsers ? (
                      <>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="text-sm font-medium text-blue-600">
                              Total Users
                            </div>
                            <div className="text-2xl font-bold text-blue-700">
                              {tenantUsers.totalUsers}
                            </div>
                          </div>
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="text-sm font-medium text-green-600">
                              Active Users
                            </div>
                            <div className="text-2xl font-bold text-green-700">
                              {tenantUsers.activeUsers}
                            </div>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                            <div className="text-sm font-medium text-purple-600">
                              Admins
                            </div>
                            <div className="text-2xl font-bold text-purple-700">
                              {tenantUsers.adminUsers}
                            </div>
                          </div>
                          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <div className="text-sm font-medium text-orange-600">
                              Managers
                            </div>
                            <div className="text-2xl font-bold text-orange-700">
                              {tenantUsers.managerUsers}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border">
                          <table className="w-full">
                            <thead className="bg-muted/20 border-b">
                              <tr>
                                <th className="p-3 text-left text-sm font-medium">
                                  User
                                </th>
                                <th className="p-3 text-left text-sm font-medium">
                                  Role
                                </th>
                                <th className="p-3 text-left text-sm font-medium">
                                  Status
                                </th>
                                <th className="p-3 text-left text-sm font-medium">
                                  Activity
                                </th>
                                <th className="p-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {tenantUsers.users.map((user) => (
                                <tr
                                  key={user.id}
                                  className="hover:bg-muted/30 border-b"
                                >
                                  <td className="p-3">
                                    <div>
                                      <div className="font-medium">
                                        {user.name}
                                      </div>
                                      <div className="text-muted-foreground text-sm">
                                        {user.email}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        user.role === 'ADMIN'
                                          ? 'bg-purple-100 text-purple-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      {user.isActive ? (
                                        <>
                                          <ShieldCheck className="h-4 w-4 text-green-500" />{' '}
                                          Active
                                        </>
                                      ) : (
                                        <>
                                          <ShieldX className="h-4 w-4 text-red-500" />{' '}
                                          Inactive
                                        </>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="text-sm">
                                      <div>Sales: {user.stats.salesCount}</div>
                                      <div className="text-muted-foreground">
                                        Last:{' '}
                                        {user.lastLoginAt
                                          ? new Date(
                                              user.lastLoginAt
                                            ).toLocaleDateString()
                                          : 'Never'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <button
                                      onClick={() =>
                                        toggleUserStatus(
                                          selectedTenant.id,
                                          user.id,
                                          !user.isActive
                                        )
                                      }
                                      className={`rounded px-3 py-1 text-xs font-medium ${
                                        user.isActive
                                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`}
                                    >
                                      {user.isActive
                                        ? 'Deactivate'
                                        : 'Activate'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground py-8 text-center">
                        Failed to load users. Please try again.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-muted-foreground mb-2 block text-sm font-medium">
                          Subscription Plan
                        </label>
                        <select
                          value={subscriptionForm.subscriptionPlan}
                          onChange={(e) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              subscriptionPlan: e.target.value,
                            }))
                          }
                          className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                          <option value="BASIC">Basic Plan</option>
                          <option value="STANDARD">Standard Plan</option>
                          <option value="PREMIUM">Premium Plan</option>
                          <option value="ENTERPRISE">Enterprise Plan</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-muted-foreground mb-2 block text-sm font-medium">
                          Subscription Status
                        </label>
                        <select
                          value={subscriptionForm.subscriptionStatus}
                          onChange={(e) =>
                            setSubscriptionForm((prev) => ({
                              ...prev,
                              subscriptionStatus: e.target.value,
                            }))
                          }
                          className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="text-foreground mb-2 font-medium">
                        Current Subscription
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">Plan:</span>
                          <div className="font-medium">
                            {selectedTenant.subscriptionPlan}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="font-medium">
                            {selectedTenant.subscriptionStatus}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => updateSubscription(selectedTenant.id)}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Update Subscription
                      </button>
                      <button
                        onClick={() =>
                          setSubscriptionForm({
                            subscriptionPlan: selectedTenant.subscriptionPlan,
                            subscriptionStatus:
                              selectedTenant.subscriptionStatus,
                          })
                        }
                        className="border-input bg-background hover:bg-muted rounded-md border px-4 py-2 text-sm"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
