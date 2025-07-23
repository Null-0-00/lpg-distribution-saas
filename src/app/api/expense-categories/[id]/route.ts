// Individual Expense Category Management API
// Handle updating and deleting specific expense categories

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  description: z.string().optional().or(z.literal('')).or(z.null()),
  budget: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'number' ? val : parseFloat(val);
      if (isNaN(num) || num < 0) {
        throw new Error('Budget must be a valid non-negative number');
      }
      return num;
    })
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

    const { id: categoryId } = await context.params;
    const tenantId = session.user.tenantId;

    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        tenantId,
      },
      include: {
        expenses: {
          where: { isApproved: true },
          select: {
            amount: true,
            expenseDate: true,
          },
        },
        _count: {
          select: {
            expenses: {
              where: { isApproved: true },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Calculate spending statistics
    const currentMonth = new Date();
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    const currentMonthExpenses = category.expenses.filter(
      (expense) =>
        expense.expenseDate >= monthStart && expense.expenseDate < monthEnd
    );
    const currentMonthSpending = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate last 6 months spending trend
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const periodStart = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - i,
        1
      );
      const periodEnd = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - i + 1,
        1
      );

      const periodExpenses = category.expenses.filter(
        (expense) =>
          expense.expenseDate >= periodStart && expense.expenseDate < periodEnd
      );
      const periodTotal = periodExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      monthlySpending.push({
        month: periodStart.toISOString().slice(0, 7), // YYYY-MM
        amount: periodTotal,
        expenseCount: periodExpenses.length,
      });
    }

    const budgetUtilization = category.budget
      ? (currentMonthSpending / category.budget) * 100
      : null;
    const isOverBudget = category.budget
      ? currentMonthSpending > category.budget
      : false;
    const remainingBudget = category.budget
      ? Math.max(0, category.budget - currentMonthSpending)
      : null;

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        budget: category.budget,
        isActive: category.isActive,
        currentMonthSpending,
        budgetUtilization,
        isOverBudget,
        remainingBudget,
        totalExpenses: category._count.expenses,
        monthlySpending,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error('Category fetch error:', error);
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

    const { id: categoryId } = await context.params;
    const tenantId = session.user.tenantId;
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Verify category exists and belongs to tenant
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        tenantId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names if name is being updated
    if (
      validatedData.name !== undefined &&
      validatedData.name !== existingCategory.name
    ) {
      const duplicateCategory = await prisma.expenseCategory.findFirst({
        where: {
          tenantId,
          name: validatedData.name,
          isActive: true,
          id: { not: categoryId },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.budget !== undefined && {
          budget: validatedData.budget,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description,
        budget: updatedCategory.budget,
        isActive: updatedCategory.isActive,
        updatedAt: updatedCategory.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
          message:
            error.issues
              ?.map((e: any) => `${e.path.join('.')}: ${e.message}`)
              .join(', ') || 'Validation failed',
        },
        { status: 400 }
      );
    }
    console.error('Category update error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
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

    const { id: categoryId } = await context.params;
    const tenantId = session.user.tenantId;

    // Verify category exists and belongs to tenant
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        tenantId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has expenses
    if (existingCategory._count.expenses > 0) {
      // Soft delete - just set as inactive
      await prisma.expenseCategory.update({
        where: { id: categoryId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Category deactivated successfully (has existing expenses)',
      });
    } else {
      // Hard delete - no expenses associated
      await prisma.expenseCategory.delete({
        where: { id: categoryId },
      });

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully',
      });
    }
  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
