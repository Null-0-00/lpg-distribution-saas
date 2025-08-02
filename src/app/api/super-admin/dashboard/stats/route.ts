import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify super admin access
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    // Get dashboard statistics
    const [
      totalTenants,
      pendingApprovals,
      activeTenants,
      suspendedTenants,
      totalUsers,
      newTenantsThisMonth,
    ] = await Promise.all([
      // Total tenants
      prisma.tenant.count(),

      // Pending approvals
      prisma.tenant.count({
        where: { approvalStatus: 'PENDING' },
      }),

      // Active tenants (approved and active)
      prisma.tenant.count({
        where: {
          approvalStatus: 'APPROVED',
          isActive: true,
        },
      }),

      // Suspended tenants
      prisma.tenant.count({
        where: { approvalStatus: 'SUSPENDED' },
      }),

      // Total users across all tenants
      prisma.user.count({
        where: {
          role: { not: 'SUPER_ADMIN' },
        },
      }),

      // New tenants this month
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const stats = {
      totalTenants,
      pendingApprovals,
      activeTenants,
      suspendedTenants,
      totalUsers,
      newTenantsThisMonth,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Super admin dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
