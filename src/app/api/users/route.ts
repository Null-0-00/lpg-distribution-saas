// Users Management API
// Handle user operations with role-based access control

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()).optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log('Session:', session);

    const tenantId = validateTenantAccess(session);
    const { role } = session!.user;
    const { searchParams } = new URL(request.url);

    console.log('User:', { tenantId, role });

    // Only admins can view all users
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: `Role ${role} cannot access user management. Admin role required.`,
        },
        { status: 403 }
      );
    }

    // Parse query parameters with simple defaults (no complex validation)
    const roleParam = searchParams.get('role');
    const activeParam = searchParams.get('active');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Simple validation and defaults
    const filterRole =
      roleParam && Object.values(UserRole).includes(roleParam as UserRole)
        ? (roleParam as UserRole)
        : undefined;
    const active =
      activeParam === 'true'
        ? true
        : activeParam === 'false'
          ? false
          : undefined;
    const page = parseInt(pageParam || '1') || 1;
    const limit = Math.min(parseInt(limitParam || '20') || 20, 100);

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (filterRole) where.role = filterRole;
    if (active !== undefined) where.isActive = active;

    // Execute queries
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          permissions: true,
          _count: {
            select: {
              sales: true,
              expenses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get activity summary for each user
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [recentSales, recentExpenses] = await Promise.all([
          prisma.sale.count({
            where: {
              tenantId,
              userId: user.id,
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
          prisma.expense.count({
            where: {
              tenantId,
              userId: user.id,
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
        ]);

        return {
          ...user,
          recentActivity: {
            salesLast30Days: recentSales,
            expensesLast30Days: recentExpenses,
            lastActive: user.lastLoginAt || user.updatedAt,
          },
        };
      })
    );

    // Calculate summary statistics
    const summary = {
      totalUsers: totalCount,
      activeUsers: users.filter((u) => u.isActive).length,
      inactiveUsers: users.filter((u) => !u.isActive).length,
      adminUsers: users.filter((u) => u.role === UserRole.ADMIN).length,
      managerUsers: users.filter((u) => u.role === UserRole.MANAGER).length,
      recentLogins: users.filter((u) => {
        if (!u.lastLoginAt) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(u.lastLoginAt) > sevenDaysAgo;
      }).length,
    };

    return NextResponse.json({
      users: usersWithActivity,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary,
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log('POST Session:', session);

    const tenantId = validateTenantAccess(session);
    const { role } = session!.user;

    // Only admins can create users
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: `Role ${role} cannot create users. Admin role required.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // 🚫 SECURITY: Prevent SUPER_ADMIN role creation through API
    if (validatedData.role === 'SUPER_ADMIN') {
      console.error(
        '🚫 SECURITY ALERT: Attempt to create SUPER_ADMIN user via API blocked'
      );
      return NextResponse.json(
        {
          error: 'Forbidden',
          message:
            'Super admin users cannot be created through API for security reasons',
          code: 'SUPER_ADMIN_CREATION_BLOCKED',
        },
        { status: 403 }
      );
    }

    // Check if email already exists in this tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId,
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user with permissions
    const newUser = await prisma.user.create({
      data: {
        tenantId,
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
        avatar: validatedData.avatar,
        isActive: true,
        permissions: validatedData.permissions
          ? {
              connect: validatedData.permissions.map((name) => ({ name })),
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        permissions: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
