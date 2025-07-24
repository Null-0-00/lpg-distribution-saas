// Individual Expense Management API
// Handle updating, deleting, and approving specific expenses

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateExpenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required').optional(),
  amount: z
    .union([
      z.number().min(0.01, 'Amount must be greater than 0'),
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
        .transform((val) => {
          const num = parseFloat(val);
          if (num <= 0) {
            throw new Error('Amount must be greater than 0');
          }
          return num;
        }),
    ])
    .optional(),
  description: z.string().optional(),
  expenseDate: z
    .union([
      z
        .string()
        .datetime()
        .transform((val) => new Date(val)),
      z.string().transform((val) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        return date;
      }),
      z.date(),
    ])
    .optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')).or(z.undefined()),
  notes: z.string().optional(),
});

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
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

    const { id: expenseId } = await context.params;
    const tenantId = session.user.tenantId;

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tenantId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            budget: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if current user can view this expense
    const canView =
      session.user.role === UserRole.ADMIN ||
      expense.userId === session.user.id;

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get budget context for this expense
    const monthStart = new Date(
      expense.expenseDate.getFullYear(),
      expense.expenseDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      expense.expenseDate.getFullYear(),
      expense.expenseDate.getMonth() + 1,
      1
    );

    const monthlySpending = await prisma.expense.aggregate({
      where: {
        categoryId: expense.categoryId,
        isApproved: true,
        expenseDate: {
          gte: monthStart,
          lt: monthEnd,
        },
        id: { not: expenseId }, // Exclude this expense from calculation
      },
      _sum: { amount: true },
    });

    const otherMonthlySpending = monthlySpending._sum.amount || 0;
    const totalMonthlySpending =
      otherMonthlySpending + (expense.isApproved ? expense.amount : 0);
    const projectedSpending = otherMonthlySpending + expense.amount;

    return NextResponse.json({
      expense: {
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        expenseDate: expense.expenseDate,
        receiptUrl: expense.receiptUrl,
        notes: expense.notes,
        isApproved: expense.isApproved,
        approvedBy: expense.approvedBy,
        approvedAt: expense.approvedAt,
        category: expense.category,
        user: expense.user,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      },
      budgetContext: expense.category.budget
        ? {
            categoryBudget: expense.category.budget,
            currentMonthSpending: totalMonthlySpending,
            projectedSpending,
            remainingBudget: Math.max(
              0,
              expense.category.budget - projectedSpending
            ),
            isOverBudget: projectedSpending > expense.category.budget,
            budgetUtilization:
              (projectedSpending / expense.category.budget) * 100,
          }
        : null,
    });
  } catch (error) {
    console.error('Expense fetch error:', error);
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
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await context.params;
    const tenantId = session.user.tenantId;
    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    // Get existing expense
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tenantId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions - only admin can edit expenses
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          error: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    // Verify new category if provided
    if (
      validatedData.categoryId &&
      validatedData.categoryId !== existingExpense.categoryId
    ) {
      const category = await prisma.expenseCategory.findFirst({
        where: {
          id: validatedData.categoryId,
          tenantId,
          isActive: true,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found or inactive' },
          { status: 400 }
        );
      }
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(validatedData.categoryId && {
          categoryId: validatedData.categoryId,
        }),
        ...(validatedData.amount !== undefined && {
          amount: validatedData.amount,
        }),
        ...(validatedData.description && {
          description: validatedData.description,
        }),
        ...(validatedData.expenseDate && {
          expenseDate: validatedData.expenseDate,
        }),
        ...(validatedData.receiptUrl !== undefined && {
          receiptUrl: validatedData.receiptUrl,
        }),
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            budget: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      expense: {
        id: updatedExpense.id,
        amount: updatedExpense.amount,
        description: updatedExpense.description,
        expenseDate: updatedExpense.expenseDate,
        receiptUrl: updatedExpense.receiptUrl,
        notes: updatedExpense.notes,
        isApproved: updatedExpense.isApproved,
        category: updatedExpense.category,
        user: updatedExpense.user,
        updatedAt: updatedExpense.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Expense update error:', error);
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
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await context.params;
    const tenantId = session.user.tenantId;

    // Get existing expense
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tenantId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions - only admin can delete expenses
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          error: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Expense deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approval/Rejection endpoint
export async function PATCH(
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

    const { id: expenseId } = await context.params;
    const tenantId = session.user.tenantId;
    const body = await request.json();
    const { action, notes } = approvalSchema.parse(body);

    // Get existing expense
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tenantId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (existingExpense.isApproved) {
      return NextResponse.json(
        { error: 'Expense already approved' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          isApproved: true,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          ...(notes && {
            notes: existingExpense.notes
              ? `${existingExpense.notes}\n\nApproval notes: ${notes}`
              : `Approval notes: ${notes}`,
          }),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Expense approved successfully',
        expense: {
          id: updatedExpense.id,
          amount: updatedExpense.amount,
          description: updatedExpense.description,
          isApproved: updatedExpense.isApproved,
          approvedBy: updatedExpense.approvedBy,
          approvedAt: updatedExpense.approvedAt,
          category: updatedExpense.category,
          user: updatedExpense.user,
        },
      });
    } else {
      // Reject - delete the expense
      await prisma.expense.delete({
        where: { id: expenseId },
      });

      return NextResponse.json({
        success: true,
        message: 'Expense rejected and removed',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Expense approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
