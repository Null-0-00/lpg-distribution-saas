import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { id: tenantId } = await params;

    // Get all users for the tenant
    const users = await prisma.user.findMany({
      where: {
        tenantId: tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
        _count: {
          select: {
            sales: true,
            expenses: true,
            auditLogs: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // ADMIN first, then MANAGER
        { createdAt: 'asc' },
      ],
    });

    // Transform the data for frontend
    const usersWithStats = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      onboardingCompleted: user.onboardingCompleted,
      onboardingCompletedAt: user.onboardingCompletedAt?.toISOString(),
      stats: {
        salesCount: user._count.sales,
        expensesCount: user._count.expenses,
        auditLogsCount: user._count.auditLogs,
      },
    }));

    return NextResponse.json({
      users: usersWithStats,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      adminUsers: users.filter((u) => u.role === 'ADMIN').length,
      managerUsers: users.filter((u) => u.role === 'MANAGER').length,
    });
  } catch (error) {
    console.error('Get tenant users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant users' },
      { status: 500 }
    );
  }
}

// Toggle user active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { id: tenantId } = await params;
    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and isActive are required' },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
        tenantId: tenantId, // Ensure user belongs to this tenant
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        entityType: 'User',
        entityId: userId,
        newValues: {
          isActive,
          modifiedBy: session.user.id,
        },
        metadata: {
          reason: `Super admin ${isActive ? 'activated' : 'deactivated'} user`,
          tenantId,
        },
      },
    });

    return NextResponse.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
