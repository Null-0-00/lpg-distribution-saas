import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const asOfDate =
      searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];
    const compareDate = searchParams.get('compareDate');

    const tenantId = session.user.tenantId;

    // Parse dates
    const reportDate = new Date(asOfDate + 'T23:59:59.999Z');
    const comparisonDate = compareDate
      ? new Date(compareDate + 'T23:59:59.999Z')
      : null;

    // ASSETS CALCULATIONS
    const assetsData = await calculateAssets(
      tenantId,
      reportDate,
      comparisonDate
    );

    // LIABILITIES CALCULATIONS
    const liabilitiesData = await calculateLiabilities(
      tenantId,
      reportDate,
      comparisonDate
    );

    // EQUITY CALCULATIONS
    const equityData = await calculateEquity(
      tenantId,
      reportDate,
      comparisonDate
    );

    // BALANCE VALIDATION
    const currentTotalAssets = assetsData.current.total;
    const currentTotalLiabilitiesAndEquity =
      liabilitiesData.current.total + equityData.current.total;
    const balanceCheck =
      Math.abs(currentTotalAssets - currentTotalLiabilitiesAndEquity) < 0.01;

    const comparisonTotalAssets = assetsData.comparison?.total || 0;
    const comparisonTotalLiabilitiesAndEquity =
      (liabilitiesData.comparison?.total || 0) +
      (equityData.comparison?.total || 0);
    const comparisonBalanceCheck = comparisonDate
      ? Math.abs(comparisonTotalAssets - comparisonTotalLiabilitiesAndEquity) <
        0.01
      : null;

    const balanceSheet = {
      asOfDate,
      compareDate,
      assets: assetsData,
      liabilities: liabilitiesData,
      equity: equityData,
      totals: {
        current: {
          totalAssets: currentTotalAssets,
          totalLiabilitiesAndEquity: currentTotalLiabilitiesAndEquity,
          isBalanced: balanceCheck,
          difference: currentTotalAssets - currentTotalLiabilitiesAndEquity,
        },
        comparison: comparisonDate
          ? {
              totalAssets: comparisonTotalAssets,
              totalLiabilitiesAndEquity: comparisonTotalLiabilitiesAndEquity,
              isBalanced: comparisonBalanceCheck,
              difference:
                comparisonTotalAssets - comparisonTotalLiabilitiesAndEquity,
            }
          : null,
      },
    };

    return NextResponse.json(balanceSheet);
  } catch (error) {
    console.error('Balance sheet error:', error);
    return NextResponse.json(
      { error: 'Failed to generate balance sheet' },
      { status: 500 }
    );
  }
}

async function calculateAssets(
  tenantId: string,
  reportDate: Date,
  comparisonDate: Date | null
) {
  // Current assets
  const currentAssets = await prisma.asset.findMany({
    where: {
      tenantId,
      createdAt: { lte: reportDate },
    },
  });

  // Comparison assets
  let comparisonAssets = null;
  if (comparisonDate) {
    comparisonAssets = await prisma.asset.findMany({
      where: {
        tenantId,
        createdAt: { lte: comparisonDate },
      },
    });
  }

  // Current inventory value (simplified - using purchase costs)
  const currentInventory = await calculateInventoryValue(tenantId, reportDate);
  const comparisonInventory = comparisonDate
    ? await calculateInventoryValue(tenantId, comparisonDate)
    : null;

  // Current receivables
  const currentReceivables = await calculateReceivables(tenantId, reportDate);
  const comparisonReceivables = comparisonDate
    ? await calculateReceivables(tenantId, comparisonDate)
    : null;

  const processAssets = (
    assets: any[],
    inventory: number,
    receivables: any
  ) => {
    // Fixed assets
    const fixedAssets = assets.reduce(
      (acc, asset) => {
        if (!acc[asset.category]) {
          acc[asset.category] = { value: 0, count: 0 };
        }
        acc[asset.category].value += asset.currentValue;
        acc[asset.category].count += 1;
        return acc;
      },
      {} as Record<string, { value: number; count: number }>
    );

    const totalFixedAssets = assets.reduce(
      (sum, asset) => sum + asset.currentValue,
      0
    );

    // Current assets
    const currentAssetsBreakdown = {
      inventory: inventory,
      cashReceivables: receivables.cash,
      cylinderReceivables: receivables.cylinder,
      totalReceivables: receivables.total,
    };

    const totalCurrentAssets = inventory + receivables.total;

    return {
      currentAssets: currentAssetsBreakdown,
      fixedAssets,
      totalCurrentAssets,
      totalFixedAssets,
      total: totalCurrentAssets + totalFixedAssets,
    };
  };

  return {
    current: processAssets(currentAssets, currentInventory, currentReceivables),
    comparison:
      comparisonAssets && comparisonDate
        ? processAssets(
            comparisonAssets,
            comparisonInventory || 0,
            comparisonReceivables || { cash: 0, cylinder: 0, total: 0 }
          )
        : null,
  };
}

async function calculateLiabilities(
  tenantId: string,
  reportDate: Date,
  comparisonDate: Date | null
) {
  // Current liabilities
  const currentLiabilities = await prisma.liability.findMany({
    where: {
      tenantId,
      createdAt: { lte: reportDate },
    },
  });

  // Comparison liabilities
  let comparisonLiabilities = null;
  if (comparisonDate) {
    comparisonLiabilities = await prisma.liability.findMany({
      where: {
        tenantId,
        createdAt: { lte: comparisonDate },
      },
    });
  }

  const processLiabilities = (liabilities: any[]) => {
    const byCategory = liabilities.reduce(
      (acc, liability) => {
        if (!acc[liability.category]) {
          acc[liability.category] = { amount: 0, count: 0 };
        }
        acc[liability.category].amount += liability.currentAmount;
        acc[liability.category].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    const total = liabilities.reduce(
      (sum, liability) => sum + liability.currentAmount,
      0
    );

    return { byCategory, total, count: liabilities.length };
  };

  return {
    current: processLiabilities(currentLiabilities),
    comparison: comparisonLiabilities
      ? processLiabilities(comparisonLiabilities)
      : null,
  };
}

async function calculateEquity(
  tenantId: string,
  reportDate: Date,
  comparisonDate: Date | null
) {
  // Calculate retained earnings from the beginning of business
  const currentRetainedEarnings = await calculateRetainedEarnings(
    tenantId,
    reportDate
  );
  const comparisonRetainedEarnings = comparisonDate
    ? await calculateRetainedEarnings(tenantId, comparisonDate)
    : null;

  // Owner drawings (negative equity)
  const currentOwnerDrawings = await calculateOwnerDrawings(
    tenantId,
    reportDate
  );
  const comparisonOwnerDrawings = comparisonDate
    ? await calculateOwnerDrawings(tenantId, comparisonDate)
    : null;

  // Initial capital investment (you may want to add this as a separate field)
  const initialCapital = 0; // This should be set based on business setup

  const processEquity = (retainedEarnings: number, ownerDrawings: number) => {
    const totalEquity = initialCapital + retainedEarnings - ownerDrawings;

    return {
      initialCapital,
      retainedEarnings,
      ownerDrawings,
      total: totalEquity,
    };
  };

  return {
    current: processEquity(currentRetainedEarnings, currentOwnerDrawings),
    comparison:
      comparisonDate &&
      comparisonRetainedEarnings !== null &&
      comparisonOwnerDrawings !== null
        ? processEquity(comparisonRetainedEarnings, comparisonOwnerDrawings)
        : null,
  };
}

async function calculateInventoryValue(
  tenantId: string,
  asOfDate: Date
): Promise<number> {
  // Get inventory movements up to the date
  const inventoryMovements = await prisma.inventoryMovement.findMany({
    where: {
      tenantId,
      createdAt: { lte: asOfDate },
    },
    include: {
      product: true,
    },
  });

  // Calculate current inventory levels and values
  const inventoryByProduct = inventoryMovements.reduce(
    (acc, movement) => {
      const productId = movement.productId;
      if (!acc[productId]) {
        acc[productId] = {
          fullCylinders: 0,
          emptyCylinders: 0,
          product: movement.product,
        };
      }
      // Calculate cylinder changes based on movement type
      switch (movement.type) {
        case 'SALE_PACKAGE':
          acc[productId].fullCylinders -= movement.quantity;
          break;
        case 'SALE_REFILL':
          acc[productId].fullCylinders -= movement.quantity;
          acc[productId].emptyCylinders += movement.quantity;
          break;
        case 'PURCHASE_PACKAGE':
        case 'PURCHASE_REFILL':
          acc[productId].fullCylinders += movement.quantity;
          break;
        case 'EMPTY_CYLINDER_BUY':
          acc[productId].emptyCylinders += movement.quantity;
          break;
        case 'EMPTY_CYLINDER_SELL':
          acc[productId].emptyCylinders -= movement.quantity;
          break;
        case 'ADJUSTMENT_POSITIVE':
          acc[productId].fullCylinders += movement.quantity;
          break;
        case 'ADJUSTMENT_NEGATIVE':
          acc[productId].fullCylinders -= movement.quantity;
          break;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  // For simplified calculation, assume average cost per cylinder
  // In a real implementation, you'd use FIFO, LIFO, or weighted average
  let totalValue = 0;
  for (const productId in inventoryByProduct) {
    const inventory = inventoryByProduct[productId];
    const averageCost = inventory.product.currentCost || 0;
    totalValue += inventory.fullCylinders * averageCost;
  }

  return totalValue;
}

async function calculateReceivables(tenantId: string, asOfDate: Date) {
  // Get the most recent receivables record on or before the date
  const receivablesRecord = await prisma.receivableRecord.findFirst({
    where: {
      tenantId,
      date: { lte: asOfDate },
    },
    orderBy: { date: 'desc' },
  });

  if (!receivablesRecord) {
    return { cash: 0, cylinder: 0, total: 0 };
  }

  return {
    cash: receivablesRecord.totalCashReceivables,
    cylinder: receivablesRecord.totalCylinderReceivables,
    total: receivablesRecord.totalCashReceivables + receivablesRecord.totalCylinderReceivables,
  };
}

async function calculateRetainedEarnings(
  tenantId: string,
  asOfDate: Date
): Promise<number> {
  // Calculate total revenue
  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: { lte: asOfDate },
    },
  });
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.netValue, 0);

  // Calculate total expenses
  const expenses = await prisma.expense.findMany({
    where: {
      tenantId,
      expenseDate: { lte: asOfDate },
      isApproved: true,
    },
  });
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate COGS
  const purchases = await prisma.purchase.findMany({
    where: {
      tenantId,
      purchaseDate: { lte: asOfDate },
    },
  });
  const totalCOGS = purchases.reduce(
    (sum, purchase) => sum + purchase.totalCost,
    0
  );

  return totalRevenue - totalExpenses - totalCOGS;
}

async function calculateOwnerDrawings(
  tenantId: string,
  asOfDate: Date
): Promise<number> {
  // Find owner drawings category
  const ownerDrawingsCategory = await prisma.expenseCategory.findFirst({
    where: {
      tenantId,
      name: 'Owner Drawings',
    },
  });

  if (!ownerDrawingsCategory) {
    return 0;
  }

  // Get all owner drawings
  const ownerDrawings = await prisma.expense.findMany({
    where: {
      tenantId,
      categoryId: ownerDrawingsCategory.id,
      expenseDate: { lte: asOfDate },
      isApproved: true,
    },
  });

  return ownerDrawings.reduce((sum, drawing) => sum + drawing.amount, 0);
}
