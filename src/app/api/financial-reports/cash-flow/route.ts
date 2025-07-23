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

    // OPERATING ACTIVITIES
    const operatingData = await calculateOperatingActivities(
      tenantId,
      periodStart,
      periodEnd,
      comparisonStart,
      comparisonEnd
    );

    // INVESTING ACTIVITIES
    const investingData = await calculateInvestingActivities(
      tenantId,
      periodStart,
      periodEnd,
      comparisonStart,
      comparisonEnd
    );

    // FINANCING ACTIVITIES
    const financingData = await calculateFinancingActivities(
      tenantId,
      periodStart,
      periodEnd,
      comparisonStart,
      comparisonEnd
    );

    // NET CASH FLOW
    const currentNetCashFlow =
      operatingData.current.total +
      investingData.current.total +
      financingData.current.total;
    const comparisonNetCashFlow =
      (operatingData.comparison?.total || 0) +
      (investingData.comparison?.total || 0) +
      (financingData.comparison?.total || 0);

    // BEGINNING AND ENDING CASH BALANCES
    const beginningCash = await getBeginningCashBalance(tenantId, periodStart);
    const endingCash = beginningCash + currentNetCashFlow;

    const comparisonBeginningCash = comparisonStart
      ? await getBeginningCashBalance(tenantId, comparisonStart)
      : null;
    const comparisonEndingCash =
      comparisonBeginningCash !== null
        ? comparisonBeginningCash + comparisonNetCashFlow
        : null;

    const cashFlowStatement = {
      period: {
        startDate,
        endDate,
        compareStartDate,
        compareEndDate,
      },
      operatingActivities: operatingData,
      investingActivities: investingData,
      financingActivities: financingData,
      netCashFlow: {
        current: currentNetCashFlow,
        comparison:
          comparisonStart && comparisonEnd ? comparisonNetCashFlow : null,
      },
      cashBalances: {
        current: {
          beginning: beginningCash,
          ending: endingCash,
          netChange: currentNetCashFlow,
        },
        comparison:
          comparisonStart && comparisonEnd
            ? {
                beginning: comparisonBeginningCash || 0,
                ending: comparisonEndingCash || 0,
                netChange: comparisonNetCashFlow,
              }
            : null,
      },
    };

    return NextResponse.json(cashFlowStatement);
  } catch (error) {
    console.error('Cash flow statement error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cash flow statement' },
      { status: 500 }
    );
  }
}

async function calculateOperatingActivities(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  comparisonStart: Date | null,
  comparisonEnd: Date | null
) {
  // Current period cash flows from operations
  const currentOperating = await getOperatingCashFlows(
    tenantId,
    periodStart,
    periodEnd
  );

  // Comparison period cash flows from operations
  let comparisonOperating = null;
  if (comparisonStart && comparisonEnd) {
    comparisonOperating = await getOperatingCashFlows(
      tenantId,
      comparisonStart,
      comparisonEnd
    );
  }

  return {
    current: currentOperating,
    comparison: comparisonOperating,
  };
}

async function calculateInvestingActivities(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  comparisonStart: Date | null,
  comparisonEnd: Date | null
) {
  // Current period investing activities
  const currentInvesting = await getInvestingCashFlows(
    tenantId,
    periodStart,
    periodEnd
  );

  // Comparison period investing activities
  let comparisonInvesting = null;
  if (comparisonStart && comparisonEnd) {
    comparisonInvesting = await getInvestingCashFlows(
      tenantId,
      comparisonStart,
      comparisonEnd
    );
  }

  return {
    current: currentInvesting,
    comparison: comparisonInvesting,
  };
}

async function calculateFinancingActivities(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date,
  comparisonStart: Date | null,
  comparisonEnd: Date | null
) {
  // Current period financing activities
  const currentFinancing = await getFinancingCashFlows(
    tenantId,
    periodStart,
    periodEnd
  );

  // Comparison period financing activities
  let comparisonFinancing = null;
  if (comparisonStart && comparisonEnd) {
    comparisonFinancing = await getFinancingCashFlows(
      tenantId,
      comparisonStart,
      comparisonEnd
    );
  }

  return {
    current: currentFinancing,
    comparison: comparisonFinancing,
  };
}

async function getOperatingCashFlows(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  // Cash received from sales
  const sales = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: { gte: startDate, lte: endDate },
    },
  });

  const cashFromSales = sales.reduce((sum, sale) => {
    // Only count actual cash received (not credit sales)
    return sum + sale.cashDeposited;
  }, 0);

  // Cash paid for inventory (purchases)
  const purchases = await prisma.purchase.findMany({
    where: {
      tenantId,
      purchaseDate: { gte: startDate, lte: endDate },
    },
  });

  const cashForInventory = purchases.reduce(
    (sum, purchase) => sum + purchase.totalCost,
    0
  );

  // Cash paid for operating expenses
  const expenses = await prisma.expense.findMany({
    where: {
      tenantId,
      expenseDate: { gte: startDate, lte: endDate },
      isApproved: true,
    },
    include: {
      category: true,
    },
  });

  // Exclude owner drawings from operating expenses
  const operatingExpenses = expenses.filter(
    (expense) => expense.category.name !== 'Owner Drawings'
  );
  const cashForExpenses = operatingExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate receivables changes (affects cash flow)
  const receivablesChangeStart = await getReceivablesAtDate(
    tenantId,
    startDate
  );
  const receivablesChangeEnd = await getReceivablesAtDate(tenantId, endDate);
  const receivablesChange =
    receivablesChangeEnd.total - receivablesChangeStart.total;

  // Calculate inventory changes (affects cash flow)
  const inventoryChangeStart = await getInventoryValueAtDate(
    tenantId,
    startDate
  );
  const inventoryChangeEnd = await getInventoryValueAtDate(tenantId, endDate);
  const inventoryChange = inventoryChangeEnd - inventoryChangeStart;

  const netOperatingCashFlow =
    cashFromSales - cashForInventory - cashForExpenses - receivablesChange;

  return {
    cashFromSales,
    cashForInventory: -cashForInventory,
    cashForExpenses: -cashForExpenses,
    receivablesChange: -receivablesChange,
    inventoryChange: -inventoryChange,
    breakdown: {
      salesRevenue: sales.reduce((sum, sale) => sum + sale.netValue, 0),
      actualCashReceived: cashFromSales,
      inventoryPurchases: cashForInventory,
      operatingExpenses: cashForExpenses,
      workingCapitalChanges: receivablesChange + inventoryChange,
    },
    total: netOperatingCashFlow,
  };
}

async function getInvestingCashFlows(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  // Asset purchases (cash outflows)
  const assetPurchases = await prisma.asset.findMany({
    where: {
      tenantId,
      purchaseDate: { gte: startDate, lte: endDate },
    },
  });

  const cashForAssets = assetPurchases.reduce(
    (sum, asset) => sum + asset.value,
    0
  );

  // Asset sales (cash inflows) - if you implement asset disposals
  const assetSales = 0; // Placeholder for future implementation

  const netInvestingCashFlow = assetSales - cashForAssets;

  return {
    assetPurchases: -cashForAssets,
    assetSales,
    breakdown: assetPurchases.reduce(
      (acc, asset) => {
        if (!acc[asset.category]) {
          acc[asset.category] = { amount: 0, count: 0 };
        }
        acc[asset.category].amount += asset.value;
        acc[asset.category].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    ),
    total: netInvestingCashFlow,
  };
}

async function getFinancingCashFlows(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  // Owner drawings (cash outflows)
  const ownerDrawingsCategory = await prisma.expenseCategory.findFirst({
    where: {
      tenantId,
      name: 'Owner Drawings',
    },
  });

  let ownerDrawings = 0;
  if (ownerDrawingsCategory) {
    const drawings = await prisma.expense.findMany({
      where: {
        tenantId,
        categoryId: ownerDrawingsCategory.id,
        expenseDate: { gte: startDate, lte: endDate },
        isApproved: true,
      },
    });
    ownerDrawings = drawings.reduce((sum, drawing) => sum + drawing.amount, 0);
  }

  // Loan proceeds and repayments - using liabilities
  const liabilityChanges = await prisma.liability.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  const loanProceeds = liabilityChanges
    .filter((liability) => liability.amount > 0)
    .reduce((sum, liability) => sum + liability.amount, 0);

  // Capital contributions (cash inflows) - placeholder for future implementation
  const capitalContributions = 0;

  const netFinancingCashFlow =
    capitalContributions + loanProceeds - ownerDrawings;

  return {
    capitalContributions,
    loanProceeds,
    ownerDrawings: -ownerDrawings,
    breakdown: {
      ownerDrawingsCount: ownerDrawingsCategory
        ? await prisma.expense.count({
            where: {
              tenantId,
              categoryId: ownerDrawingsCategory.id,
              expenseDate: { gte: startDate, lte: endDate },
              isApproved: true,
            },
          })
        : 0,
      newLoansCount: liabilityChanges.length,
    },
    total: netFinancingCashFlow,
  };
}

async function getBeginningCashBalance(
  tenantId: string,
  startDate: Date
): Promise<number> {
  // For simplicity, we'll calculate this based on accumulated cash flows
  // In a real implementation, you'd maintain a cash account

  // Get all cash flows before the start date
  const salesBeforeStart = await prisma.sale.findMany({
    where: {
      tenantId,
      saleDate: { lt: startDate },
    },
  });

  const purchasesBeforeStart = await prisma.purchase.findMany({
    where: {
      tenantId,
      purchaseDate: { lt: startDate },
    },
  });

  const expensesBeforeStart = await prisma.expense.findMany({
    where: {
      tenantId,
      expenseDate: { lt: startDate },
      isApproved: true,
    },
  });

  const assetsBeforeStart = await prisma.asset.findMany({
    where: {
      tenantId,
      purchaseDate: { lt: startDate },
    },
  });

  const cashFromSales = salesBeforeStart.reduce(
    (sum, sale) => sum + sale.cashDeposited,
    0
  );
  const cashForPurchases = purchasesBeforeStart.reduce(
    (sum, purchase) => sum + purchase.totalCost,
    0
  );
  const cashForExpenses = expensesBeforeStart.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const cashForAssets = assetsBeforeStart.reduce(
    (sum, asset) => sum + asset.value,
    0
  );

  return cashFromSales - cashForPurchases - cashForExpenses - cashForAssets;
}

async function getReceivablesAtDate(tenantId: string, date: Date) {
  const receivable = await prisma.receivableRecord.findFirst({
    where: {
      tenantId,
      date: { lte: date },
    },
    orderBy: { date: 'desc' },
  });

  return receivable
    ? {
        cash: receivable.totalCashReceivables,
        cylinder: receivable.totalCylinderReceivables,
        total: receivable.totalCashReceivables + receivable.totalCylinderReceivables,
      }
    : { cash: 0, cylinder: 0, total: 0 };
}

async function getInventoryValueAtDate(
  tenantId: string,
  date: Date
): Promise<number> {
  // This is a simplified calculation
  // In practice, you'd need proper inventory valuation
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      tenantId,
      createdAt: { lte: date },
    },
    include: {
      product: true,
    },
  });

  const inventoryByProduct = movements.reduce(
    (acc, movement) => {
      const productId = movement.productId;
      if (!acc[productId]) {
        acc[productId] = { fullCylinders: 0, product: movement.product };
      }
      // Calculate cylinder changes based on movement type
      switch (movement.type) {
        case 'SALE_PACKAGE':
          acc[productId].fullCylinders -= movement.quantity;
          break;
        case 'SALE_REFILL':
          acc[productId].fullCylinders -= movement.quantity;
          break;
        case 'PURCHASE_PACKAGE':
        case 'PURCHASE_REFILL':
          acc[productId].fullCylinders += movement.quantity;
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

  let totalValue = 0;
  for (const productId in inventoryByProduct) {
    const inventory = inventoryByProduct[productId];
    const averageCost = inventory.product.currentCost || 0;
    totalValue += inventory.fullCylinders * averageCost;
  }

  return totalValue;
}
