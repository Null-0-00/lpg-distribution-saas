'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Building2,
  Package,
  Users,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  Home,
  Shield,
  DollarSign,
  FileText,
  UserCog,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface AdminNavigationProps {
  user: User;
}

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useSettings();

  const navigationItems: NavigationItem[] = [
    {
      title: t('adminDashboardTitle') || 'Admin Dashboard',
      href: '/admin',
      icon: Home,
      description: t('adminDashboardDescription') || 'System overview and metrics',
    },
    {
      title: t('companyManagementTitle') || 'Company Management',
      href: '/admin/companies',
      icon: Building2,
      description: t('companyManagementDescription') || 'Manage LPG companies and suppliers',
    },
    {
      title: t('productManagementTitle') || 'Product Management',
      href: '/admin/products',
      icon: Package,
      description: t('productManagementDescription') || 'Manage product variants and pricing',
    },
    {
      title: t('distributorAssignmentsTitle') || 'Distributor Assignments',
      href: '/admin/distributor-assignments',
      icon: MapPin,
      description: t('distributorAssignmentsDescription') || 'Assign companies/products to distributors',
    },
    {
      title: t('pricingManagementTitle') || 'Pricing Management',
      href: '/admin/pricing-assignments',
      icon: DollarSign,
      description: t('pricingManagementDescription') || 'Manage pricing tiers and assignments',
    },
    {
      title: t('userManagementTitle') || 'User Management',
      href: '/admin/users',
      icon: UserCog,
      description: t('userManagementDescription') || 'Manage system users and permissions',
    },
    {
      title: t('systemAnalyticsTitle') || 'System Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      description: t('systemAnalyticsDescription') || 'Platform usage and performance metrics',
    },
    {
      title: t('auditLogsTitle') || 'Audit Logs',
      href: '/admin/audit-logs',
      icon: FileText,
      description: t('auditLogsDescription') || 'View system activity and changes',
    },
    {
      title: t('systemSettingsTitle') || 'System Settings',
      href: '/dashboard/settings',
      icon: Settings,
      description: t('systemSettingsDescription') || 'Configure global system settings',
    },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const NavigationContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Shield className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {t('adminPanel') || 'Admin Panel'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('systemAdministration') || 'System Administration'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-muted/20 border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-primary text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {user.role}
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground/70 mt-0.5 truncate text-xs">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="space-y-2 border-t p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <Link href="/dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t('viewDistributorDashboard') || 'View Distributor Dashboard'}
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('signOut') || 'Sign Out'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Shield className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="font-semibold">
              {t('adminPanel') || 'Admin Panel'}
            </span>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white">
          <NavigationContent />
        </div>
      </div>
    </>
  );
}
