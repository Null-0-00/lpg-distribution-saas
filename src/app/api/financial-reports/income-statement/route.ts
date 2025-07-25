import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const compareStartDate = searchParams.get('compareStartDate');
    const compareEndDate = searchParams.get('compareEndDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;

    // Parse dates
    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate + 'T23:59:59.999Z');
    const comparisonStart = compareStartDate
      ? new Date(compareStartDate)
      : null;
    const comparisonEnd = compareEndDate
      ? new Date(compareEndDate + 'T23:59:59.999Z')
      : null;

    // REVENUE CALCULATIONS
    const revenueData = await calculateRevenue(
      tenantId,
      periodStart,
      periodEnd,
      comparisonStart,
      comparisonEnd
    );

    // COST OF GOODS SOLD
    const cogsData = await calculateCOGS(
      tenantId,
      periodStart,
      periodEnd,
      comparisonStart,
      comparisonEnd
    );

    // OPERATING EXPENSES
    const expensesData = await calculateOperatingExpenses(
      tenantId,
      periodStart,
      periodEnd,
      comparisonStart,
      comparisonEnd
    );

    // CALCULATE NET INCOME
    const grossProfit = revenueData.current.total - cogsData.current.total;
    const netIncome = grossProfit - expensesData.current.total;

    const compareGrossProfit = revenueData.comparison
      ? revenueData.comparison.total - (cogsData.comparison?.total || 0)
      : null;
    const compareNetIncome =
      compareGrossProfit !== null
        ? compareGrossProfit - (expensesData.comparison?.total || 0)
        : null;

    const incomeStatement = {
      period: {
        startDate,
        endDate,
        compareStartDate,
        compareEndDate,
      },
      revenue: revenueData,
      costOfGoodsSold: cogsData,
      grossProfit: {
        current: grossProfit,
        comparison: compareGrossProfit,
      },
      operatingExpenses: expensesData,
      netIncome: {
        current: netIncome,
        comparison: compareNetIncome,
      },
      margins: {
        grossMargin:
          revenueData.current.total > 0
            ? (grossProfit / revenueData.current.total) * 100
            : 0,
        netMargin:
          revenueData.current.total > 0
            ? (netIncome / revenueData.current.total) * 100
            : 0,
        compareGrossMargin:
          revenueData.comparison && revenueData.comparison.total > 0
            ? ((compareGrossProfit || 0) / revenueData.comparison.total) * 100
            : null,
        compareNetMargin:
          revenueData.comparison && revenueData.comparison.total > 0
            ? ((compareNetIncome || 0) / revenueData.comparison.total) * 100
            : null,
      },
    };

    return NextResponse.json(incomeStatement);
  } catch (error) {
    console.error('Income statement error:', error);
    return NextResponse.json(
      { error: 'Failed to generate income statement' },
      { status: 500 }
    );
  }
}

async function calculateRevenue(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  comparisonStart: Date | null,
  comparisonEnd: Date | null
) {
  // Current period revenue
  const currentSales = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      driver: true,
      product: true,
    },
  });

  // Comparison period revenue
  let comparisonSales = null;
  if (comparisonStart && comparisonEnd) {
    comparisonSales = await prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: {
          gte: comparisonStart,
          lte: comparisonEnd,
        },
      },
      include: {
        driver: true,
        product: true,
      },
    });
  }

  const processRevenue = (sales: any[]) => {
    const byType = sales.reduce(
      (acc, sale) => {
        const type = sale.saleType;
        if (!acc[type]) {
          acc[type] = { amount: 0, quantity: 0, count: 0 };
        }
        acc[type].amount += sale.netValue;
        acc[type].quantity += sale.quantity;
        acc[type].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; quantity: number; count: number }>
    );

    const byDriver = sales.reduce(
      (acc, sale) => {
        const driverName = sale.driver.name;
        if (!acc[driverName]) {
          acc[driverName] = { amount: 0, quantity: 0, count: 0 };
        }
        acc[driverName].amount += sale.netValue;
        acc[driverName].quantity += sale.quantity;
        acc[driverName].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; quantity: number; count: number }>
    );

    const total = sales.reduce((sum, sale) => sum + sale.netValue, 0);

    return {
      byType,
      byDriver,
      total,
      totalQuantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
    };
  };

  return {
    current: processRevenue(currentSales),
    comparison: comparisonSales ? processRevenue(comparisonSales) : null,
  };
}

async function calculateCOGS(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  comparisonStart: Date | null,
  comparisonEnd: Date | null
) {
  // Current period purchases
  const currentPurchases = await prisma.purchase.findMany({
    where: {
      tenantId,
      purchaseDate: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      product: true,
      company: true,
    },
  });

  // Comparison period purchases
  let comparisonPurchases = null;
  if (comparisonStart && comparisonEnd) {
    comparisonPurchases = await prisma.purchase.findMany({
      where: {
        tenantId,
        purchaseDate: {
          gte: comparisonStart,
          lte: comparisonEnd,
        },
      },
      include: {
        product: true,
        company: true,
      },
    });
  }

  const processCOGS = (purchases: any[]) => {
    const byProduct = purchases.reduce(
      (acc, purchase) => {
        const productName = purchase.product.name;
        if (!acc[productName]) {
          acc[productName] = { amount: 0, quantity: 0, count: 0 };
        }
        acc[productName].amount += purchase.totalCost;
        acc[productName].quantity += purchase.quantity;
        acc[productName].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; quantity: number; count: number }>
    );

    const bySupplier = purchases.reduce(
      (acc, purchase) => {
        const supplierName = purchase.company.name;
        if (!acc[supplierName]) {
          acc[supplierName] = { amount: 0, quantity: 0, count: 0 };
        }
        acc[supplierName].amount += purchase.totalCost;
        acc[supplierName].quantity += purchase.quantity;
        acc[supplierName].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; quantity: number; count: number }>
    );

    const total = purchases.reduce(
      (sum, purchase) => sum + purchase.totalCost,
      0
    );

    return {
      byProduct,
      bySupplier,
      total,
      totalQuantity: purchases.reduce(
        (sum, purchase) => sum + purchase.quantity,
        0
      ),
    };
  };

  return {
    current: processCOGS(currentPurchases),
    comparison: comparisonPurchases ? processCOGS(comparisonPurchases) : null,
  };
}

async function calculateOperatingExpenses(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  comparisonStart: Date | null,
  comparisonEnd: Date | null
) {
  // Current period expenses
  const currentExpenses = await prisma.expense.findMany({
    where: {
      tenantId,
      expenseDate: {
        gte: periodStart,
        lte: periodEnd,
      },
      isApproved: true,
    },
    include: {
      category: true,
      user: true,
    },
  });

  // Comparison period expenses
  let comparisonExpenses = null;
  if (comparisonStart && comparisonEnd) {
    comparisonExpenses = await prisma.expense.findMany({
      where: {
        tenantId,
        expenseDate: {
          gte: comparisonStart,
          lte: comparisonEnd,
        },
        isApproved: true,
      },
      include: {
        category: true,
        user: true,
      },
    });
  }

  const processExpenses = (expenses: any[]) => {
    const byCategory = expenses.reduce(
      (acc, expense) => {
        const categoryName = expense.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = { amount: 0, count: 0 };
        }
        acc[categoryName].amount += expense.amount;
        acc[categoryName].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return { byCategory, total, count: expenses.length };
  };

  return {
    current: processExpenses(currentExpenses),
    comparison: comparisonExpenses ? processExpenses(comparisonExpenses) : null,
  };
}
