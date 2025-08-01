export interface PagePermission {
  id: string;
  name: string;
  path: string;
  description: string;
  category: string;
}

export const AVAILABLE_PAGES: PagePermission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    description: 'Main dashboard overview',
    category: 'Overview',
  },
  {
    id: 'daily-sales-report',
    name: 'Daily Sales Report',
    path: '/dashboard/reports/daily-sales',
    description: 'View daily sales reports',
    category: 'Reports',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    path: '/dashboard/inventory',
    description: 'Manage inventory and stock levels',
    category: 'Operations',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    path: '/dashboard/analytics',
    description: 'Business analytics and insights',
    category: 'Analytics',
  },
  {
    id: 'sales',
    name: 'Sales',
    path: '/dashboard/sales',
    description: 'Manage sales transactions',
    category: 'Operations',
  },
  {
    id: 'receivables',
    name: 'Receivables',
    path: '/dashboard/receivables',
    description: 'Track customer receivables',
    category: 'Finance',
  },
  {
    id: 'expenses',
    name: 'Expenses',
    path: '/dashboard/expenses',
    description: 'Manage business expenses',
    category: 'Finance',
  },
  {
    id: 'shipments',
    name: 'Shipments',
    path: '/dashboard/shipments',
    description: 'Track shipments and deliveries',
    category: 'Operations',
  },
  {
    id: 'assets',
    name: 'Assets',
    path: '/dashboard/assets',
    description: 'Manage company assets',
    category: 'Finance',
  },
  {
    id: 'drivers',
    name: 'Drivers',
    path: '/dashboard/drivers',
    description: 'Manage drivers and assignments',
    category: 'Operations',
  },
  {
    id: 'product-management',
    name: 'Product Management',
    path: '/dashboard/product-management',
    description: 'Manage products and pricing',
    category: 'Operations',
  },
  {
    id: 'reports',
    name: 'Reports',
    path: '/dashboard/reports',
    description: 'Generate business reports',
    category: 'Reports',
  },
  {
    id: 'users',
    name: 'User Management',
    path: '/dashboard/users',
    description: 'Manage system users',
    category: 'Administration',
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/dashboard/settings',
    description: 'System settings and configuration',
    category: 'Administration',
  },
];

export const PAGE_CATEGORIES = [
  'Overview',
  'Operations',
  'Finance',
  'Reports',
  'Analytics',
  'Administration',
];

export function getPageById(pageId: string): PagePermission | undefined {
  return AVAILABLE_PAGES.find((page) => page.id === pageId);
}

export function getPagesByCategory(category: string): PagePermission[] {
  return AVAILABLE_PAGES.filter((page) => page.category === category);
}

export function hasPagePermission(
  userPermissions: string[],
  pageId: string
): boolean {
  return userPermissions.includes(pageId);
}
