import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify super admin access
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.approvalStatus = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get tenants with user count
    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
        users: {
          select: {
            lastLoginAt: true,
          },
          orderBy: {
            lastLoginAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: [
        { approvalStatus: 'asc' }, // Pending first
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform the data
    const tenantsWithStats = tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      businessType: tenant.businessType,
      businessDescription: tenant.businessDescription,
      approvalStatus: tenant.approvalStatus,
      subscriptionStatus: tenant.subscriptionStatus,
      subscriptionPlan: tenant.subscriptionPlan,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt.toISOString(),
      approvedAt: tenant.approvedAt?.toISOString(),
      approvedBy: tenant.approvedBy,
      userCount: tenant._count.users,
      lastActivity: tenant.users[0]?.lastLoginAt?.toISOString(),
    }));

    return NextResponse.json(tenantsWithStats);
  } catch (error) {
    console.error('Super admin tenants list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}
