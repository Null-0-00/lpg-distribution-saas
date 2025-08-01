'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Edit, Trash2, Eye, X } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { useSettings } from '@/contexts/SettingsContext';
import { PagePermissionsSelector } from '@/components/users/PagePermissionsSelector';
import { AVAILABLE_PAGES } from '@/lib/types/page-permissions';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  permissions: { id: string; name: string }[];
  pagePermissions?: string[];
  recentActivity?: {
    salesLast30Days: number;
    expensesLast30Days: number;
    lastActive: string;
  };
}

interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  managerUsers: number;
  recentLogins: number;
}

export default function UsersPage() {
  const { t } = useSettings();
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UserSummary>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    managerUsers: 0,
    recentLogins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    role: UserRole.MANAGER,
    permissions: [],
    pagePermissions: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/permissions');
        const data = await response.json();
        setPermissions(data);
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      }
    };

    fetchPermissions();
  }, []);

  // Check authentication first
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      console.log('Auth check:', data);
      return data.authenticated;
    } catch (err) {
      console.error('Auth check error:', err);
      return false;
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated first
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setError(t('pleaseLogInToAccessUserManagement'));
        return;
      }

      const response = await fetch('/api/users');

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          setError(t('pleaseLogInToAccessUserManagement'));
        } else if (response.status === 403) {
          setError(t('needAdminPrivileges'));
        } else {
          setError(
            errorData.message || errorData.error || t('failedToFetchUsers')
          );
        }
        return;
      }

      const data = await response.json();
      setUsers(data.users);
      setSummary(data.summary);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err instanceof Error ? err.message : t('anErrorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case UserRole.MANAGER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
  };

  const getRolePermissions = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return ['all'];
      case UserRole.MANAGER:
        return ['sales', 'inventory', 'drivers'];
      default:
        return [];
    }
  };

  const formatLastLogin = (lastLoginAt?: string) => {
    if (!lastLoginAt) return t('never');

    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return t('justNow');
    if (diffInHours < 24)
      return `${diffInHours} ${diffInHours > 1 ? t('hours') : t('hour')} ${t('ago')}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} ${diffInDays > 1 ? t('days') : t('day')} ${t('ago')}`;

    return lastLogin.toLocaleDateString();
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('failedToCreateUser'));
      }

      await fetchUsers(); // Refresh the user list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.MANAGER,
        permissions: [],
        pagePermissions: [],
      });
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('anErrorOccurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('confirmDeleteUser'))) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('failedToDeleteUser'));
      }

      await fetchUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : t('anErrorOccurred'));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('failedToUpdateUser'));
      }

      await fetchUsers(); // Refresh the user list
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('anErrorOccurred'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="bg-muted mb-2 h-8 w-48 animate-pulse rounded"></div>
            <div className="bg-muted h-5 w-64 animate-pulse rounded"></div>
          </div>
          <div className="bg-muted h-10 w-32 animate-pulse rounded-lg"></div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border-border rounded-lg border p-6 shadow transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-muted h-8 w-8 animate-pulse rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="bg-muted mb-2 h-4 w-20 animate-pulse rounded"></div>
                  <div className="bg-muted h-8 w-16 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table Skeleton */}
        <div className="bg-card border-border rounded-lg border shadow transition-colors">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div className="bg-muted h-6 w-32 animate-pulse rounded"></div>
            <div className="flex space-x-2">
              <div className="bg-muted h-8 w-20 animate-pulse rounded"></div>
              <div className="bg-muted h-8 w-20 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="bg-background h-4 w-20 animate-pulse rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(7)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {colIndex === 0 ? (
                          <div className="flex items-center space-x-3">
                            <div className="bg-muted h-8 w-8 animate-pulse rounded-full"></div>
                            <div>
                              <div className="bg-muted mb-1 h-4 w-24 animate-pulse rounded"></div>
                              <div className="bg-muted h-3 w-32 animate-pulse rounded"></div>
                            </div>
                          </div>
                        ) : colIndex === 6 ? (
                          <div className="flex space-x-2">
                            <div className="bg-muted h-8 w-8 animate-pulse rounded"></div>
                            <div className="bg-muted h-8 w-8 animate-pulse rounded"></div>
                            <div className="bg-muted h-8 w-8 animate-pulse rounded"></div>
                          </div>
                        ) : (
                          <div className="bg-muted h-4 w-16 animate-pulse rounded"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
            {t('userManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('manageSystemUsers')} {t('manageSystemRoles')}
          </p>
        </div>
        <button
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: '',
              role: UserRole.MANAGER,
              permissions: [],
              pagePermissions: [],
            });
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t('addUser')}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            {error.includes('log in') && (
              <a
                href="/auth/login"
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                {t('login')}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('totalUsers')}</p>
              <p className="text-foreground text-2xl font-bold">
                {summary.totalUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('activeUsers')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {summary.activeUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">
                {t('administrators')}
              </p>
              <p className="text-foreground text-2xl font-bold">
                {summary.adminUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-muted-foreground text-sm">{t('managers')}</p>
              <p className="text-foreground text-2xl font-bold">
                {summary.managerUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg shadow">
        <div className="border-border border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">
            {t('systemUsers')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('user')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('role')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('status')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('lastLogin')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('permissions')}
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {users.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.name}
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-foreground text-sm font-medium">
                            {user.name}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(user.isActive)}`}
                      >
                        {user.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                      {formatLastLogin(user.lastLoginAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 2).map((perm, index) => (
                          <span
                            key={index}
                            className="bg-muted text-muted-foreground inline-flex rounded-full px-2 py-1 text-xs"
                          >
                            {perm.name}
                          </span>
                        ))}
                        {user.permissions.length > 2 && (
                          <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2 py-1 text-xs">
                            +{user.permissions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        className="mr-3 text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setEditingUser(user);
                          setIsViewModalOpen(true);
                        }}
                        title={t('viewDetails')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="mr-3 text-green-600 hover:text-green-900"
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            password: '',
                            role: user.role,
                            permissions: user.permissions.map((p) => p.name),
                            pagePermissions: user.pagePermissions || [],
                          });
                          setIsEditModalOpen(true);
                        }}
                        title={t('editUser')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteUser(user.id)}
                        title={t('deleteUser')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {t('rolePermissions')}
          </h3>
          <div className="space-y-3">
            <div className="border-border rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-red-600">ADMIN</span>
                <span className="text-muted-foreground text-sm">
                  {t('fullAccess')}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('completeSystemAccessAndUserManagement')}
              </p>
            </div>
            <div className="border-border rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-blue-600">MANAGER</span>
                <span className="text-muted-foreground text-sm">
                  {t('operations')}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('salesInventoryAndDriverManagement')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {t('recentActivity')}
          </h3>
          <div className="space-y-3">
            {users.slice(0, 3).map((user, index) => (
              <div
                key={user.id}
                className="border-border flex items-center justify-between border-b py-2"
              >
                <span className="text-muted-foreground text-sm">
                  {user.name} - {user.role}
                </span>
                <span className="text-muted-foreground text-sm">
                  {formatLastLogin(user.lastLoginAt)}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-muted-foreground py-4 text-center">
                {t('noUsersFound')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg shadow-xl">
            <div className="bg-card border-border sticky top-0 z-10 flex-shrink-0 border-b p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  {t('addNewUser')}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enterFullNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('emailAddress')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enterEmailAddressPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('password')}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enterPasswordPlaceholder')}
                      minLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('role')}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleRoleChange(e.target.value as UserRole)
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={UserRole.MANAGER}>{t('manager')}</option>
                      <option value={UserRole.ADMIN}>
                        {t('administrator')}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    {t('permissions')}
                  </label>
                  <select
                    multiple
                    value={formData.permissions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        ),
                      })
                    }
                    className="border-border bg-input text-foreground h-32 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {permissions.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.role === UserRole.MANAGER && (
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('pageAccessPermissions')}
                    </label>
                    <div className="border-border bg-muted/50 rounded-lg border p-4">
                      <PagePermissionsSelector
                        selectedPermissions={formData.pagePermissions}
                        onPermissionChange={(permissions) =>
                          setFormData({
                            ...formData,
                            pagePermissions: permissions,
                          })
                        }
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border-border sticky bottom-0 flex-shrink-0 border-t p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="text-muted-foreground border-border hover:bg-muted/50 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={
                    !formData.name ||
                    !formData.email ||
                    !formData.password ||
                    submitting
                  }
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      {t('creating')}...
                    </>
                  ) : (
                    t('addUser')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg shadow-xl">
            <div className="bg-card border-border sticky top-0 z-10 flex-shrink-0 border-b p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  {t('editUser')}
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enterFullNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('emailAddress')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enterEmailAddressPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('role')}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleRoleChange(e.target.value as UserRole)
                      }
                      className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={UserRole.MANAGER}>{t('manager')}</option>
                      <option value={UserRole.ADMIN}>
                        {t('administrator')}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    {t('permissions')}
                  </label>
                  <select
                    multiple
                    value={formData.permissions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        ),
                      })
                    }
                    className="border-border bg-input text-foreground h-32 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {permissions.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.role === UserRole.MANAGER && (
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('pageAccessPermissions')}
                    </label>
                    <div className="border-border bg-muted/50 rounded-lg border p-4">
                      <PagePermissionsSelector
                        selectedPermissions={formData.pagePermissions}
                        onPermissionChange={(permissions) =>
                          setFormData({
                            ...formData,
                            pagePermissions: permissions,
                          })
                        }
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border-border sticky bottom-0 flex-shrink-0 border-t p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                  }}
                  disabled={submitting}
                  className="text-muted-foreground border-border hover:bg-muted/50 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={!formData.name || !formData.email || submitting}
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      {t('updating')}...
                    </>
                  ) : (
                    t('updateUser')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {isViewModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {t('userDetails')}
              </h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('fullName')}
                </label>
                <p className="text-foreground">{editingUser.name}</p>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('emailAddress')}
                </label>
                <p className="text-foreground">{editingUser.email}</p>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('role')}
                </label>
                <p className="text-foreground">{editingUser.role}</p>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('status')}
                </label>
                <p className="text-foreground">
                  {editingUser.isActive ? t('active') : t('inactive')}
                </p>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('lastLogin')}
                </label>
                <p className="text-foreground">
                  {formatLastLogin(editingUser.lastLoginAt)}
                </p>
              </div>
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('permissions')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {editingUser.permissions.map((perm, index) => (
                    <span
                      key={index}
                      className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {perm.name}
                    </span>
                  ))}
                </div>
              </div>

              {editingUser.role === UserRole.MANAGER &&
                editingUser.pagePermissions && (
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      {t('pageAccessPermissions')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {editingUser.pagePermissions.map((pageId, index) => {
                        const page = AVAILABLE_PAGES.find(
                          (p) => p.id === pageId
                        );
                        return page ? (
                          <span
                            key={index}
                            className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {page.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {(!editingUser.pagePermissions ||
                      editingUser.pagePermissions.length === 0) && (
                      <p className="text-muted-foreground text-sm">
                        {t('noPageAccessPermissions')}
                      </p>
                    )}
                  </div>
                )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-muted-foreground border-border hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
