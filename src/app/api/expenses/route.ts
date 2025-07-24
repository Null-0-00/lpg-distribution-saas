// Expense Management API
// Handle expense entry, approval workflows, and owner drawings tracking

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const expenseQuerySchema = z.object({
  categoryId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'all']).optional().default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'number' ? val : parseInt(val);
      return isNaN(num) ? 1 : num;
    })
    .optional()
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'number' ? val : parseInt(val);
      return isNaN(num) ? 20 : Math.min(num, 100);
    })
    .optional()
    .default(20),
});

const createExpenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.union([
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
  ]),
  description: z.string().optional().default(''),
  particulars: z.string().optional(),
  expenseDate: z.union([
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
  ]),
  receiptUrl: z.string().url().optional().or(z.literal('')).or(z.undefined()),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Create query object with defaults
    const queryParams = {
      categoryId: searchParams.get('categoryId') || undefined,
      status: searchParams.get('status') || 'all',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      userId: searchParams.get('userId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    // Remove null/undefined values
    const cleanedParams = Object.fromEntries(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );

    const {
      categoryId,
      status,
      dateFrom,
      dateTo,
      userId,
      search,
      page,
      limit,
    } = expenseQuerySchema.parse(cleanedParams);

    const tenantId = session.user.tenantId;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (categoryId) where.categoryId = categoryId;
    if (status === 'pending') where.isApproved = false;
    if (status === 'approved') where.isApproved = true;
    if (userId) where.userId = userId;

    if (dateFrom || dateTo) {
      where.expenseDate = {};
      if (dateFrom)
        (where.expenseDate as any).gte = new Date(dateFrom as string);
      if (dateTo)
        (where.expenseDate as any).lte = new Date(
          (dateTo as string) + 'T23:59:59.999Z'
        );
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get expenses with pagination
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              budget: true,
              parent: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
        orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.expense.count({ where }),
    ]);

    // Get approval statistics using the same where clause to ensure month-specific data
    const approvalStats = await prisma.expense.groupBy({
      by: ['isApproved'],
      where,
      _count: true,
      _sum: { amount: true },
    });

    const pending = approvalStats.find((stat) => !stat.isApproved);
    const approved = approvalStats.find((stat) => stat.isApproved);

    return NextResponse.json({
      expenses: expenses.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        particulars: expense.particulars,
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
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary: {
        total: {
          count: approvalStats.reduce((sum, stat) => sum + stat._count, 0),
          amount: approvalStats.reduce(
            (sum, stat) => sum + (stat._sum.amount || 0),
            0
          ),
        },
        pending: {
          count: pending?._count || 0,
          amount: pending?._sum.amount || 0,
        },
        approved: {
          count: approved?._count || 0,
          amount: approved?._sum.amount || 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
          message: error.issues.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }
    console.error('Expenses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/expenses - Received body:', body);

    const validatedData = createExpenseSchema.parse(body);
    console.log('POST /api/expenses - Validated data:', validatedData);

    const tenantId = session.user.tenantId;
    const userId = session.user.id;

    // Verify category exists and belongs to tenant
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

    // Check if expense would exceed monthly budget
    const monthStart = new Date(
      validatedData.expenseDate.getFullYear(),
      validatedData.expenseDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      validatedData.expenseDate.getFullYear(),
      validatedData.expenseDate.getMonth() + 1,
      1
    );

    const currentMonthSpending = await prisma.expense.aggregate({
      where: {
        categoryId: validatedData.categoryId,
        isApproved: true,
        expenseDate: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: { amount: true },
    });

    const projectedSpending =
      (currentMonthSpending._sum.amount || 0) + validatedData.amount;
    const isBudgetExceeded =
      category.budget && projectedSpending > category.budget;

    // Auto-approve for managers and admins
    const isApproved =
      session.user.role === UserRole.ADMIN ||
      session.user.role === UserRole.MANAGER;

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        categoryId: validatedData.categoryId,
        userId,
        amount: validatedData.amount,
        description: validatedData.description,
        particulars: validatedData.particulars,
        expenseDate: validatedData.expenseDate,
        receiptUrl: validatedData.receiptUrl,
        notes: validatedData.notes,
        isApproved,
        ...(isApproved &&
          (session.user.role === UserRole.ADMIN ||
            session.user.role === UserRole.MANAGER) && {
            approvedBy: userId,
            approvedAt: new Date(),
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
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        particulars: expense.particulars,
        expenseDate: expense.expenseDate,
        receiptUrl: expense.receiptUrl,
        notes: expense.notes,
        isApproved: expense.isApproved,
        approvedBy: expense.approvedBy,
        approvedAt: expense.approvedAt,
        category: expense.category,
        user: expense.user,
        createdAt: expense.createdAt,
      },
      budgetWarning: isBudgetExceeded
        ? {
            message:
              'This expense exceeds the monthly budget for this category',
            budgetAmount: category.budget,
            currentSpending: currentMonthSpending._sum.amount || 0,
            projectedSpending,
            autoApproved: isApproved,
          }
        : null,
    });
  } catch (error) {
    console.error(
      'Expense creation error type:',
      (error as Error).constructor.name
    );
    console.error('Expense creation error:', error);

    if (error instanceof z.ZodError) {
      console.error(
        'Zod validation errors:',
        JSON.stringify(error.issues, null, 2)
      );
      const errorDetails = error.issues || [];
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errorDetails,
          message:
            errorDetails
              .map((e: any) => `${e.path.join('.')}: ${e.message}`)
              .join(', ') || 'Validation failed',
        },
        { status: 400 }
      );
    }

    // Check if it's a custom error that might contain validation info
    if (error instanceof Error) {
      console.error('Generic error message:', error.message);
      console.error('Generic error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Bulk approval endpoint for admins
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('PATCH request body:', body);

    const { expenseIds, action } = z
      .object({
        expenseIds: z.array(z.string()),
        action: z.enum(['approve', 'reject']),
      })
      .parse(body);

    console.log('Parsed data:', { expenseIds, action });

    const tenantId = session.user.tenantId;
    const userId = session.user.id;

    if (action === 'approve') {
      const result = await prisma.expense.updateMany({
        where: {
          id: { in: expenseIds },
          tenantId,
          isApproved: false,
        },
        data: {
          isApproved: true,
          approvedBy: userId,
          approvedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} expenses approved successfully`,
        approvedCount: result.count,
      });
    } else {
      // For rejection, we might want to add a rejection reason field
      // For now, we'll just delete pending expenses
      const result = await prisma.expense.deleteMany({
        where: {
          id: { in: expenseIds },
          tenantId,
          isApproved: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} expenses rejected and removed`,
        rejectedCount: result.count,
      });
    }
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
    console.error('Bulk approval error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
