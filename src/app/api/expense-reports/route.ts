// Expense Reporting and Analytics API
// Generate comprehensive expense reports, trends, and budget analysis

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { z } from 'zod';

const reportQuerySchema = z.object({
  type: z.enum(['summary', 'trends', 'budget-analysis', 'cash-flow']).optional().default('summary'),
  period: z.enum(['monthly', 'quarterly', 'yearly']).optional().default('monthly'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  categoryId: z.string().optional(),
  includeProjections: z.string().transform(val => val === 'true').optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { type, period, dateFrom, dateTo, categoryId, includeProjections } = reportQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const tenantId = session.user.tenantId;

    // Set default date range if not provided
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1); // Last 12 months
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    const fromDate = dateFrom ? new Date(dateFrom) : defaultFrom;
    const toDate = dateTo ? new Date(dateTo + 'T23:59:59.999Z') : defaultTo;

    switch (type) {
      case 'summary':
        return NextResponse.json(await generateSummaryReport(tenantId, fromDate, toDate, categoryId));
      
      case 'trends':
        return NextResponse.json(await generateTrendsReport(tenantId, fromDate, toDate, period, categoryId));
      
      case 'budget-analysis':
        return NextResponse.json(await generateBudgetAnalysis(tenantId, fromDate, toDate, includeProjections));
      
      case 'cash-flow':
        return NextResponse.json(await generateCashFlowReport(tenantId, fromDate, toDate, period));
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Expense reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateSummaryReport(tenantId: string, fromDate: Date, toDate: Date, categoryId?: string) {
  const where: Record<string, unknown> = {
    tenantId,
    isApproved: true,
    expenseDate: { gte: fromDate, lte: toDate }
  };

  if (categoryId) where.categoryId = categoryId;

  // Get total expenses
  const totalExpenses = await prisma.expense.aggregate({
    where,
    _sum: { amount: true },
    _count: true,
    _avg: { amount: true }
  });

  // Get expenses by category
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    _count: true,
    _avg: { amount: true }
  });

  // Get category details
  const categories = await prisma.expenseCategory.findMany({
    where: {
      tenantId,
      id: { in: expensesByCategory.map(e => e.categoryId) }
    },
    select: {
      id: true,
      name: true,
      budget: true
    }
  });

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const categoriesWithExpenses = expensesByCategory.map(expense => ({
    category: categoryMap[expense.categoryId],
    totalAmount: expense._sum.amount || 0,
    count: expense._count,
    averageAmount: expense._avg.amount || 0,
    budgetUtilization: categoryMap[expense.categoryId]?.budget 
      ? ((expense._sum.amount || 0) / categoryMap[expense.categoryId].budget) * 100 
      : null
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  // Get monthly breakdown
  const monthlyBreakdown = await prisma.expense.groupBy({
    by: ['expenseDate'],
    where,
    _sum: { amount: true },
    _count: true
  });

  // Group by month
  const monthlyData = monthlyBreakdown.reduce((acc, expense) => {
    const monthKey = expense.expenseDate.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, amount: 0, count: 0 };
    }
    acc[monthKey].amount += expense._sum.amount || 0;
    acc[monthKey].count += expense._count;
    return acc;
  }, {} as Record<string, { month: string; amount: number; count: number }>);

  // Get top expenses
  const topExpenses = await prisma.expense.findMany({
    where,
    include: {
      category: {
        select: { name: true }
      },
      user: {
        select: { name: true }
      }
    },
    orderBy: { amount: 'desc' },
    take: 10
  });

  return {
    summary: {
      totalAmount: totalExpenses._sum.amount || 0,
      totalCount: totalExpenses._count,
      averageAmount: totalExpenses._avg.amount || 0,
      dateRange: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
      }
    },
    categoriesBreakdown: categoriesWithExpenses,
    monthlyBreakdown: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
    topExpenses: topExpenses.map(expense => ({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate,
      category: expense.category.name,
      user: expense.user.name
    }))
  };
}

async function generateTrendsReport(tenantId: string, fromDate: Date, toDate: Date, period: string, categoryId?: string) {
  const where: Record<string, unknown> = {
    tenantId,
    isApproved: true,
    expenseDate: { gte: fromDate, lte: toDate }
  };

  if (categoryId) where.categoryId = categoryId;

  // Get all expenses in the period
  const expenses = await prisma.expense.findMany({
    where,
    select: {
      amount: true,
      expenseDate: true,
      categoryId: true
    }
  });

  // Group by period
  const groupByPeriod = (date: Date) => {
    switch (period) {
      case 'monthly':
        return date.toISOString().slice(0, 7); // YYYY-MM
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toISOString().slice(0, 7);
    }
  };

  const trendsData = expenses.reduce((acc, expense) => {
    const periodKey = groupByPeriod(expense.expenseDate);
    if (!acc[periodKey]) {
      acc[periodKey] = { period: periodKey, amount: 0, count: 0 };
    }
    acc[periodKey].amount += expense.amount;
    acc[periodKey].count += 1;
    return acc;
  }, {} as Record<string, { period: string; amount: number; count: number }>);

  const sortedTrends = Object.values(trendsData).sort((a, b) => a.period.localeCompare(b.period));

  // Calculate growth rates
  const trendsWithGrowth = sortedTrends.map((trend, index) => {
    const previousPeriod = sortedTrends[index - 1];
    const growthRate = previousPeriod 
      ? ((trend.amount - previousPeriod.amount) / previousPeriod.amount) * 100 
      : 0;

    return {
      ...trend,
      growthRate: Number(growthRate.toFixed(2))
    };
  });

  // Calculate moving averages
  const movingAverageWindow = 3;
  const trendsWithMA = trendsWithGrowth.map((trend, index) => {
    const start = Math.max(0, index - movingAverageWindow + 1);
    const window = trendsWithGrowth.slice(start, index + 1);
    const movingAverage = window.reduce((sum, t) => sum + t.amount, 0) / window.length;

    return {
      ...trend,
      movingAverage: Number(movingAverage.toFixed(2))
    };
  });

  return {
    trends: trendsWithMA,
    analysis: {
      totalPeriods: trendsWithMA.length,
      averagePerPeriod: trendsWithMA.reduce((sum, t) => sum + t.amount, 0) / trendsWithMA.length,
      highestPeriod: trendsWithMA.reduce((max, t) => t.amount > max.amount ? t : max, trendsWithMA[0]),
      lowestPeriod: trendsWithMA.reduce((min, t) => t.amount < min.amount ? t : min, trendsWithMA[0]),
      overallGrowthRate: trendsWithMA.length > 1 
        ? ((trendsWithMA[trendsWithMA.length - 1].amount - trendsWithMA[0].amount) / trendsWithMA[0].amount) * 100
        : 0
    }
  };
}

async function generateBudgetAnalysis(tenantId: string, fromDate: Date, toDate: Date, includeProjections: boolean) {
  // Get all categories with budgets
  const categories = await prisma.expenseCategory.findMany({
    where: {
      tenantId,
      isActive: true,
      budget: { not: null }
    },
    include: {
      expenses: {
        where: {
          isApproved: true,
          expenseDate: { gte: fromDate, lte: toDate }
        },
        select: {
          amount: true,
          expenseDate: true
        }
      }
    }
  });

  const budgetAnalysis = categories.map(category => {
    const totalSpent = category.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budget = category.budget || 0;
    const utilization = (totalSpent / budget) * 100;
    const isOverBudget = totalSpent > budget;
    const remainingBudget = Math.max(0, budget - totalSpent);

    // Calculate monthly spending pattern
    const monthlySpending = category.expenses.reduce((acc, expense) => {
      const monthKey = expense.expenseDate.toISOString().slice(0, 7);
      acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyAmounts = Object.values(monthlySpending);
    const averageMonthlySpending = monthlyAmounts.length > 0 
      ? monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length 
      : 0;

    // Projection for next 3 months if requested
    let projection = null;
    if (includeProjections && averageMonthlySpending > 0) {
      const projectedAmount = averageMonthlySpending * 3;
      projection = {
        nextThreeMonths: projectedAmount,
        projectedBudgetUtilization: ((totalSpent + projectedAmount) / budget) * 100,
        willExceedBudget: (totalSpent + projectedAmount) > budget
      };
    }

    return {
      category: {
        id: category.id,
        name: category.name,
        budget
      },
      spending: {
        totalSpent,
        utilization,
        isOverBudget,
        remainingBudget,
        averageMonthlySpending
      },
      projection,
      monthlyBreakdown: Object.entries(monthlySpending).map(([month, amount]) => ({
        month,
        amount
      })).sort((a, b) => a.month.localeCompare(b.month))
    };
  });

  // Overall budget summary
  const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
  const totalSpent = budgetAnalysis.reduce((sum, analysis) => sum + analysis.spending.totalSpent, 0);
  const overBudgetCount = budgetAnalysis.filter(analysis => analysis.spending.isOverBudget).length;

  return {
    budgetAnalysis,
    summary: {
      totalBudget,
      totalSpent,
      overallUtilization: (totalSpent / totalBudget) * 100,
      remainingBudget: Math.max(0, totalBudget - totalSpent),
      categoriesOverBudget: overBudgetCount,
      totalCategories: categories.length
    }
  };
}

async function generateCashFlowReport(tenantId: string, fromDate: Date, toDate: Date, period: string) {
  // Get expense data
  const expenses = await prisma.expense.findMany({
    where: {
      tenantId,
      isApproved: true,
      expenseDate: { gte: fromDate, lte: toDate }
    },
    select: {
      amount: true,
      expenseDate: true
    }
  });

  // Get sales data for comparison
  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: { gte: fromDate, lte: toDate }
    },
    select: {
      totalValue: true,
      cashDeposited: true,
      saleDate: true
    }
  });

  const groupByPeriod = (date: Date) => {
    switch (period) {
      case 'monthly':
        return date.toISOString().slice(0, 7);
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toISOString().slice(0, 7);
    }
  };

  // Group expenses by period
  const expensesByPeriod = expenses.reduce((acc, expense) => {
    const periodKey = groupByPeriod(expense.expenseDate);
    acc[periodKey] = (acc[periodKey] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group sales by period
  const salesByPeriod = sales.reduce((acc, sale) => {
    const periodKey = groupByPeriod(sale.saleDate);
    if (!acc[periodKey]) {
      acc[periodKey] = { revenue: 0, cash: 0 };
    }
    acc[periodKey].revenue += sale.totalValue;
    acc[periodKey].cash += sale.cashDeposited;
    return acc;
  }, {} as Record<string, { revenue: number; cash: number }>);

  // Combine data for cash flow analysis
  const allPeriods = new Set([...Object.keys(expensesByPeriod), ...Object.keys(salesByPeriod)]);
  const cashFlowData = Array.from(allPeriods).sort().map(period => {
    const expenses = expensesByPeriod[period] || 0;
    const revenue = salesByPeriod[period]?.revenue || 0;
    const cashReceived = salesByPeriod[period]?.cash || 0;
    const netCashFlow = cashReceived - expenses;
    const netIncome = revenue - expenses;

    return {
      period,
      revenue,
      expenses,
      netIncome,
      cashReceived,
      netCashFlow,
      profitMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0
    };
  });

  // Calculate running totals
  let runningCashFlow = 0;
  const cashFlowWithRunningTotals = cashFlowData.map(data => {
    runningCashFlow += data.netCashFlow;
    return {
      ...data,
      runningCashFlow
    };
  });

  return {
    cashFlow: cashFlowWithRunningTotals,
    summary: {
      totalRevenue: cashFlowData.reduce((sum, data) => sum + data.revenue, 0),
      totalExpenses: cashFlowData.reduce((sum, data) => sum + data.expenses, 0),
      totalNetIncome: cashFlowData.reduce((sum, data) => sum + data.netIncome, 0),
      totalCashReceived: cashFlowData.reduce((sum, data) => sum + data.cashReceived, 0),
      totalNetCashFlow: cashFlowData.reduce((sum, data) => sum + data.netCashFlow, 0),
      averageProfitMargin: cashFlowData.reduce((sum, data) => sum + data.profitMargin, 0) / cashFlowData.length
    }
  };
}