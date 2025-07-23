'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Edit, Trash2, Eye, X } from 'lucide-react';
import { UserRole } from '@prisma/client';

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
        setError('Please log in to access user management. Go to /auth/login');
        return;
      }

      const response = await fetch('/api/users');

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          setError(
            'Please log in to access user management. Go to /auth/login'
          );
        } else if (response.status === 403) {
          setError('You need admin privileges to access user management.');
        } else {
          setError(
            errorData.message || errorData.error || 'Failed to fetch users'
          );
        }
        return;
      }

      const data = await response.json();
      setUsers(data.users);
      setSummary(data.summary);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    if (!lastLoginAt) return 'Never';

    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

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
        throw new Error(errorData.error || 'Failed to create user');
      }

      await fetchUsers(); // Refresh the user list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.MANAGER,
        permissions: [],
      });
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await fetchUsers(); // Refresh the user list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        throw new Error(errorData.error || 'Failed to update user');
      }

      await fetchUsers(); // Refresh the user list
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
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
            });
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
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
                Login
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
              <p className="text-muted-foreground text-sm">Total Users</p>
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
              <p className="text-muted-foreground text-sm">Active Users</p>
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
              <p className="text-muted-foreground text-sm">Administrators</p>
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
              <p className="text-muted-foreground text-sm">Managers</p>
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
            System Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  User
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Role
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Last Login
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Permissions
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase">
                  Actions
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">
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
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
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
                        title="View Details"
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
                          });
                          setIsEditModalOpen(true);
                        }}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
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
            Role Permissions
          </h3>
          <div className="space-y-3">
            <div className="border-border rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-red-600">ADMIN</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Full Access
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Complete system access and user management
              </p>
            </div>
            <div className="border-border rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-blue-600">MANAGER</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Operations
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Sales, inventory, and driver management
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Recent Activity
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatLastLogin(user.lastLoginAt)}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Add New User
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password (min 8 characters)"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
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
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {permissions.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={submitting}
                className="text-muted-foreground border-border hover:bg-muted/50 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
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
                    Creating...
                  </>
                ) : (
                  'Add User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Edit User
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
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
                  className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {permissions.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                disabled={submitting}
                className="text-muted-foreground border-border hover:bg-muted/50 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={!formData.name || !formData.email || submitting}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </button>
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
                User Details
              </h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <p className="text-foreground">{editingUser.name}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <p className="text-foreground">{editingUser.email}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <p className="text-foreground">{editingUser.role}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <p className="text-foreground">
                  {editingUser.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Login
                </label>
                <p className="text-foreground">
                  {formatLastLogin(editingUser.lastLoginAt)}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
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
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-muted-foreground border-border hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
