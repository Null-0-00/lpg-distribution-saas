// Expense Categories Management API
// Handle CRUD operations for expense categories with budget management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().or(z.literal('')).or(z.null()),
  parentId: z.string().optional().or(z.null()),
  budget: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => {
      console.log('Transforming budget value:', val, typeof val);
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      console.log('Parsed number:', num);
      if (isNaN(num) || num < 0) {
        throw new Error('Budget must be a valid non-negative number');
      }
      return num;
    })
    .optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  description: z.string().optional().or(z.literal('')),
  parentId: z.string().optional().or(z.null()),
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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const tenantId = session.user.tenantId;

    // Get month and year from query params, default to current month
    const currentDate = new Date();
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const targetMonth = monthParam
      ? parseInt(monthParam)
      : currentDate.getMonth() + 1; // 1-based month
    const targetYear = yearParam
      ? parseInt(yearParam)
      : currentDate.getFullYear();

    // Calculate month boundaries
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 1);

    // Get categories with expense aggregations
    const categories = await prisma.expenseCategory.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        expenses: {
          where: {
            isApproved: true,
            expenseDate: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
          select: {
            amount: true,
          },
        },
        _count: {
          select: {
            expenses: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      },
      orderBy: [{ name: 'asc' }],
    });

    // Calculate current month spending and budget status
    const categoriesWithBudgetInfo = categories.map((category) => {
      const currentMonthSpending = category.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const budgetUtilization = category.budget
        ? (currentMonthSpending / category.budget) * 100
        : null;
      const isOverBudget = category.budget
        ? currentMonthSpending > category.budget
        : false;
      const remainingBudget = category.budget
        ? Math.max(0, category.budget - currentMonthSpending)
        : null;

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        parent: category.parent,
        budget: category.budget,
        isActive: category.isActive,
        currentMonthSpending,
        budgetUtilization,
        isOverBudget,
        remainingBudget,
        totalExpenses: category._count.expenses,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    });

    // Get monthly budget summary
    const totalBudget = categories.reduce(
      (sum, cat) => sum + (cat.budget || 0),
      0
    );
    const totalSpending = categoriesWithBudgetInfo.reduce(
      (sum, cat) => sum + cat.currentMonthSpending,
      0
    );
    const overBudgetCategories = categoriesWithBudgetInfo.filter(
      (cat) => cat.isOverBudget
    ).length;

    return NextResponse.json({
      categories: categoriesWithBudgetInfo,
      summary: {
        totalBudget,
        totalSpending,
        remainingBudget: Math.max(0, totalBudget - totalSpending),
        budgetUtilization:
          totalBudget > 0 ? (totalSpending / totalBudget) * 100 : null,
        overBudgetCategories,
        isOverTotalBudget: totalSpending > totalBudget,
      },
      metadata: {
        month: `${targetYear}-${targetMonth.toString().padStart(2, '0')}`, // YYYY-MM format
        year: targetYear,
        monthNumber: targetMonth,
        categoriesCount: categories.length,
        activeCategoriesCount: categories.filter((c) => c.isActive).length,
      },
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received body:', body);

    const validatedData = createCategorySchema.parse(body);
    console.log('Validated data:', validatedData);

    const tenantId = session.user.tenantId;

    // Check for duplicate category names
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        tenantId,
        name: validatedData.name,
        isActive: true,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        tenantId,
        name: validatedData.name,
        description: validatedData.description,
        parentId: validatedData.parentId,
        budget: validatedData.budget,
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        budget: category.budget,
        isActive: category.isActive,
        currentMonthSpending: 0,
        budgetUtilization: null,
        isOverBudget: false,
        remainingBudget: category.budget,
        totalExpenses: 0,
        createdAt: category.createdAt,
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
    console.error('Category creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
