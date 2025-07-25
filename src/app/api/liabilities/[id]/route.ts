// Individual Liability Management API
// Handle updating and deleting specific liabilities

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, LiabilityCategory } from '@prisma/client';
import { z } from 'zod';

const updateLiabilitySchema = z.object({
  name: z.string().min(1, 'Liability name is required').optional(),
  category: z.nativeEnum(LiabilityCategory).optional(),
  amount: z.number().min(0, 'Liability amount must be non-negative').optional(),
  description: z.string().optional(),
  dueDate: z
    .string()
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: liabilityId } = await context.params;
    const tenantId = session.user.tenantId;

    const liability = await prisma.liability.findFirst({
      where: {
        id: liabilityId,
        tenantId,
      },
    });

    if (!liability) {
      return NextResponse.json(
        { error: 'Liability not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      liability: {
        id: liability.id,
        name: liability.name,
        category: liability.category,
        amount: liability.amount,
        description: liability.description,
        dueDate: liability.dueDate,
        isActive: liability.isActive,
        createdAt: liability.createdAt,
        updatedAt: liability.updatedAt,
      },
    });
  } catch (error) {
    console.error('Liability fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id: liabilityId } = await context.params;
    const tenantId = session.user.tenantId;
    const body = await request.json();
    const validatedData = updateLiabilitySchema.parse(body);

    // Verify liability exists and belongs to tenant
    const existingLiability = await prisma.liability.findFirst({
      where: {
        id: liabilityId,
        tenantId,
      },
    });

    if (!existingLiability) {
      return NextResponse.json(
        { error: 'Liability not found' },
        { status: 404 }
      );
    }

    // Update the liability
    const updatedLiability = await prisma.liability.update({
      where: { id: liabilityId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.amount !== undefined && {
          amount: validatedData.amount,
        }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.dueDate !== undefined && {
          dueDate: validatedData.dueDate,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      liability: {
        id: updatedLiability.id,
        name: updatedLiability.name,
        category: updatedLiability.category,
        amount: updatedLiability.amount,
        description: updatedLiability.description,
        dueDate: updatedLiability.dueDate,
        isActive: updatedLiability.isActive,
        updatedAt: updatedLiability.updatedAt,
      },
    });
  } catch (error) {
    console.error('Liability update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id: liabilityId } = await context.params;
    const tenantId = session.user.tenantId;

    // Verify liability exists and belongs to tenant
    const existingLiability = await prisma.liability.findFirst({
      where: {
        id: liabilityId,
        tenantId,
      },
    });

    if (!existingLiability) {
      return NextResponse.json(
        { error: 'Liability not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.liability.update({
      where: { id: liabilityId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Liability deleted successfully',
    });
  } catch (error) {
    console.error('Liability deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
