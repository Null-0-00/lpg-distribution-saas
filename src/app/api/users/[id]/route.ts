import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.nativeEnum(UserRole).optional(),
  permissions: z.array(z.string()).optional(),
  pagePermissions: z.array(z.string()).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { tenantId, role } = session.user;
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // 🚫 SECURITY: Prevent SUPER_ADMIN role assignment through API
    if (validatedData.role === 'SUPER_ADMIN') {
      console.error(
        '🚫 SECURITY ALERT: Attempt to assign SUPER_ADMIN role via API blocked'
      );
      return NextResponse.json(
        {
          error: 'Forbidden',
          message:
            'Super admin role cannot be assigned through API for security reasons',
          code: 'SUPER_ADMIN_ASSIGNMENT_BLOCKED',
        },
        { status: 403 }
      );
    }

    // 🚫 SECURITY: Prevent modification of existing SUPER_ADMIN users
    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId },
      select: { role: true },
    });

    if (existingUser?.role === 'SUPER_ADMIN') {
      console.error(
        '🚫 SECURITY ALERT: Attempt to modify SUPER_ADMIN user via API blocked'
      );
      return NextResponse.json(
        {
          error: 'Forbidden',
          message:
            'Super admin users cannot be modified through API for security reasons',
          code: 'SUPER_ADMIN_MODIFICATION_BLOCKED',
        },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
        tenantId,
      },
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        pagePermissions:
          validatedData.pagePermissions !== undefined
            ? validatedData.pagePermissions
            : undefined,
        permissions: {
          set: validatedData.permissions
            ? validatedData.permissions.map((name) => ({ name }))
            : [],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      },
      { status: 200 }
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

    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { tenantId, role } = session.user;
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 🚫 SECURITY: Prevent deletion of SUPER_ADMIN users
    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId },
      select: { role: true },
    });

    if (existingUser?.role === 'SUPER_ADMIN') {
      console.error(
        '🚫 SECURITY ALERT: Attempt to delete SUPER_ADMIN user via API blocked'
      );
      return NextResponse.json(
        {
          error: 'Forbidden',
          message:
            'Super admin users cannot be deleted through API for security reasons',
          code: 'SUPER_ADMIN_DELETION_BLOCKED',
        },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: {
        id: id,
        tenantId,
      },
    });

    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
