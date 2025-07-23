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
  TrendingUp
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

const navigationItems: NavigationItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: Home,
    description: 'System overview and metrics'
  },
  {
    title: 'Company Management',
    href: '/admin/companies',
    icon: Building2,
    description: 'Manage LPG companies and suppliers'
  },
  {
    title: 'Product Management',
    href: '/admin/products',
    icon: Package,
    description: 'Manage product variants and pricing'
  },
  {
    title: 'Distributor Assignments',
    href: '/admin/distributor-assignments',
    icon: MapPin,
    description: 'Assign companies/products to distributors'
  },
  {
    title: 'Pricing Management',
    href: '/admin/pricing-assignments',
    icon: DollarSign,
    description: 'Manage pricing tiers and assignments'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: UserCog,
    description: 'Manage system users and permissions'
  },
  {
    title: 'System Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Platform usage and performance metrics'
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
    description: 'View system activity and changes'
  },
  {
    title: 'System Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configure global system settings'
  }
];

interface AdminNavigationProps {
  user: User;
}

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useSettings();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{t('adminPanel') || 'Admin Panel'}</h2>
            <p className="text-sm text-muted-foreground">{t('systemAdministration') || 'System Administration'}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {user.role}
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
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
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start" 
          asChild
        >
          <Link href="/dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('viewDistributorDashboard') || 'View Distributor Dashboard'}
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('signOut') || 'Sign Out'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">{t('adminPanel') || 'Admin Panel'}</span>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r">
          <NavigationContent />
        </div>
      </div>
    </>
  );
}