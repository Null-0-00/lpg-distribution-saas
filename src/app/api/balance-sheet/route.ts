// Balance Sheet API
// Generate comprehensive balance sheet with real-time calculations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AssetCategory, LiabilityCategory } from '@prisma/client';
import { z } from 'zod';

const balanceSheetQuerySchema = z.object({
  asOfDate: z.string().optional(),
  includeComparison: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default(false),
  comparisonDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { asOfDate, includeComparison, comparisonDate } =
      balanceSheetQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const tenantId = session.user.tenantId;
    const reportDate = asOfDate ? new Date(asOfDate) : new Date();

    // Generate current balance sheet
    const currentBalanceSheet = await generateBalanceSheet(
      tenantId,
      reportDate
    );

    let comparisonBalanceSheet = null;
    let changes = null;

    // Generate comparison if requested
    if (includeComparison && comparisonDate) {
      const compDate = new Date(comparisonDate);
      comparisonBalanceSheet = await generateBalanceSheet(tenantId, compDate);

      // Calculate changes
      changes = {
        assets: {
          fixed:
            currentBalanceSheet.assets.fixed.total -
            comparisonBalanceSheet.assets.fixed.total,
          current:
            currentBalanceSheet.assets.current.total -
            comparisonBalanceSheet.assets.current.total,
          total:
            currentBalanceSheet.assets.total -
            comparisonBalanceSheet.assets.total,
        },
        liabilities: {
          current:
            currentBalanceSheet.liabilities.current.total -
            comparisonBalanceSheet.liabilities.current.total,
          longTerm:
            currentBalanceSheet.liabilities.longTerm.total -
            comparisonBalanceSheet.liabilities.longTerm.total,
          total:
            currentBalanceSheet.liabilities.total -
            comparisonBalanceSheet.liabilities.total,
        },
        equity: {
          total:
            currentBalanceSheet.equity.total -
            comparisonBalanceSheet.equity.total,
          netIncome:
            currentBalanceSheet.equity.netIncome -
            comparisonBalanceSheet.equity.netIncome,
        },
      };
    }

    // Validate balance sheet equation: Assets = Liabilities + Equity
    const balanceCheck = {
      assetsTotal: currentBalanceSheet.assets.total,
      liabilitiesAndEquityTotal:
        currentBalanceSheet.liabilities.total +
        currentBalanceSheet.equity.total,
      isBalanced:
        Math.abs(
          currentBalanceSheet.assets.total -
            (currentBalanceSheet.liabilities.total +
              currentBalanceSheet.equity.total)
        ) < 0.01,
    };

    return NextResponse.json({
      balanceSheet: currentBalanceSheet,
      ...(comparisonBalanceSheet && { comparison: comparisonBalanceSheet }),
      ...(changes && { changes }),
      balanceCheck,
      metadata: {
        reportDate: reportDate.toISOString().split('T')[0],
        ...(comparisonDate && { comparisonDate }),
        generatedAt: new Date().toISOString(),
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Balance sheet generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateBalanceSheet(tenantId: string, asOfDate: Date) {
  // 1. ASSETS

  // Fixed Assets (manual entries with depreciation)
  const fixedAssets = await prisma.asset.findMany({
    where: {
      tenantId,
      category: AssetCategory.FIXED_ASSET,
      isActive: true,
    },
  });

  const fixedAssetsWithDepreciation = fixedAssets.map((asset) => {
    let currentValue = asset.value;

    // Apply depreciation
    if (asset.depreciationRate && asset.purchaseDate) {
      const yearsOwned =
        (asOfDate.getTime() - asset.purchaseDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      const depreciationAmount =
        asset.value * (asset.depreciationRate / 100) * yearsOwned;
      currentValue = Math.max(0, asset.value - depreciationAmount);
    }

    return {
      id: asset.id,
      name: asset.name,
      originalValue: asset.value,
      currentValue,
      depreciationRate: asset.depreciationRate,
    };
  });

  // Current Assets (auto-calculated)
  const currentAssets = await calculateCurrentAssets(tenantId, asOfDate);

  // Manual current assets
  const manualCurrentAssets = await prisma.asset.findMany({
    where: {
      tenantId,
      category: AssetCategory.CURRENT_ASSET,
      isActive: true,
    },
  });

  const allCurrentAssets = [
    ...currentAssets,
    ...manualCurrentAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      currentValue: asset.value,
      isAutoCalculated: false,
    })),
  ];

  // 2. LIABILITIES
  const [currentLiabilities, longTermLiabilities] = await Promise.all([
    prisma.liability.findMany({
      where: {
        tenantId,
        category: LiabilityCategory.CURRENT_LIABILITY,
        isActive: true,
      },
    }),
    prisma.liability.findMany({
      where: {
        tenantId,
        category: LiabilityCategory.LONG_TERM_LIABILITY,
        isActive: true,
      },
    }),
  ]);

  // 3. EQUITY CALCULATIONS
  const equity = await calculateEquity(tenantId, asOfDate);

  // Calculate totals
  const fixedAssetsTotal = fixedAssetsWithDepreciation.reduce(
    (sum, asset) => sum + asset.currentValue,
    0
  );
  const currentAssetsTotal = allCurrentAssets.reduce(
    (sum, asset) => sum + asset.currentValue,
    0
  );
  const totalAssets = fixedAssetsTotal + currentAssetsTotal;

  const currentLiabilitiesTotal = currentLiabilities.reduce(
    (sum, liability) => sum + liability.amount,
    0
  );
  const longTermLiabilitiesTotal = longTermLiabilities.reduce(
    (sum, liability) => sum + liability.amount,
    0
  );
  const totalLiabilities = currentLiabilitiesTotal + longTermLiabilitiesTotal;

  return {
    assets: {
      fixed: {
        items: fixedAssetsWithDepreciation,
        total: fixedAssetsTotal,
      },
      current: {
        items: allCurrentAssets,
        total: currentAssetsTotal,
      },
      total: totalAssets,
    },
    liabilities: {
      current: {
        items: currentLiabilities.map((l) => ({
          id: l.id,
          name: l.name,
          amount: l.amount,
          dueDate: l.dueDate,
        })),
        total: currentLiabilitiesTotal,
      },
      longTerm: {
        items: longTermLiabilities.map((l) => ({
          id: l.id,
          name: l.name,
          amount: l.amount,
          dueDate: l.dueDate,
        })),
        total: longTermLiabilitiesTotal,
      },
      total: totalLiabilities,
    },
    equity: {
      ...equity,
      total: equity.ownerEquity,
    },
  };
}

async function calculateCurrentAssets(tenantId: string, asOfDate: Date) {
  const assets = [];

  try {
    // Get latest inventory
    const latestInventory = await prisma.inventoryRecord.findFirst({
      where: {
        tenantId,
        date: { lte: asOfDate },
      },
      orderBy: { date: 'desc' },
    });

    if (latestInventory && latestInventory.productId) {
      const product = await prisma.product.findUnique({
        where: { id: latestInventory.productId },
        select: { currentPrice: true, name: true },
      });

      if (product) {
        // Full Cylinders
        const fullCylindersValue =
          latestInventory.fullCylinders * product.currentPrice;
        assets.push({
          id: 'auto-full-cylinders',
          name: `Full Cylinders (${product.name})`,
          currentValue: fullCylindersValue,
          isAutoCalculated: true,
          details: {
            quantity: latestInventory.fullCylinders,
            unitPrice: product.currentPrice,
          },
        });

        // Empty Cylinders (20% of full price)
        const emptyCylindersValue =
          latestInventory.emptyCylinders * (product.currentPrice * 0.2);
        assets.push({
          id: 'auto-empty-cylinders',
          name: `Empty Cylinders (${product.name})`,
          currentValue: emptyCylindersValue,
          isAutoCalculated: true,
          details: {
            quantity: latestInventory.emptyCylinders,
            unitPrice: product.currentPrice * 0.2,
          },
        });
      }

      // Receivables
      const [cashReceivables, cylinderReceivables] = await Promise.all([
        prisma.receivableRecord.aggregate({
          where: {
            tenantId,
            date: { lte: asOfDate },
          },
          _sum: { totalCashReceivables: true },
        }),
        prisma.receivableRecord.aggregate({
          where: {
            tenantId,
            date: { lte: asOfDate },
          },
          _sum: { totalCylinderReceivables: true },
        }),
      ]);

      // Cash Receivables
      const totalCashReceivables =
        cashReceivables._sum.totalCashReceivables || 0;
      if (totalCashReceivables > 0) {
        assets.push({
          id: 'auto-cash-receivables',
          name: 'Cash Receivables',
          currentValue: totalCashReceivables,
          isAutoCalculated: true,
          details: {
            totalAmount: totalCashReceivables,
          },
        });
      }

      // Cylinder Receivables (valued at current price)
      const totalCylinderReceivables =
        cylinderReceivables._sum.totalCylinderReceivables || 0;
      if (totalCylinderReceivables > 0 && product) {
        const cylinderReceivablesValue =
          totalCylinderReceivables * product.currentPrice;
        assets.push({
          id: 'auto-cylinder-receivables',
          name: 'Cylinder Receivables',
          currentValue: cylinderReceivablesValue,
          isAutoCalculated: true,
          details: {
            quantity: totalCylinderReceivables,
            unitPrice: product.currentPrice,
          },
        });
      }
    }

    // Cash in Hand
    const [totalDeposits, totalExpenses] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: { lte: asOfDate },
        },
        _sum: { cashDeposited: true },
      }),
      prisma.expense.aggregate({
        where: {
          tenantId,
          expenseDate: { lte: asOfDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const cashInHand = Math.max(
      0,
      (totalDeposits._sum.cashDeposited || 0) - (totalExpenses._sum.amount || 0)
    );
    if (cashInHand > 0) {
      assets.push({
        id: 'auto-cash-in-hand',
        name: 'Cash in Hand',
        currentValue: cashInHand,
        isAutoCalculated: true,
        details: {
          totalDeposits: totalDeposits._sum.cashDeposited || 0,
          totalExpenses: totalExpenses._sum.amount || 0,
        },
      });
    }
  } catch (error) {
    console.error('Current assets calculation error:', error);
  }

  return assets;
}

async function calculateEquity(tenantId: string, asOfDate: Date) {
  // Get financial performance data
  const [revenue, expenses, ownerDrawings] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        tenantId,
        saleDate: { lte: asOfDate },
      },
      _sum: { totalValue: true },
    }),
    prisma.expense.aggregate({
      where: {
        tenantId,
        expenseDate: { lte: asOfDate },
      },
      _sum: { amount: true },
    }),
    // Owner drawings - expenses categorized as owner drawings
    prisma.expense.aggregate({
      where: {
        tenantId,
        expenseDate: { lte: asOfDate },
        category: {
          name: 'Owner Drawings', // Assuming this category exists
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = revenue._sum.totalValue || 0;
  const totalExpenses = expenses._sum.amount || 0;
  const totalDrawings = ownerDrawings._sum.amount || 0;

  const netIncome = totalRevenue - totalExpenses;
  const retainedEarnings = netIncome - totalDrawings;

  // For simplicity, assuming no initial capital investment tracked separately
  // In a real system, you'd track initial capital and additional investments
  const ownerCapital = 0; // This would be tracked separately
  const ownerEquity = ownerCapital + retainedEarnings;

  return {
    ownerCapital,
    retainedEarnings,
    netIncome,
    totalDrawings,
    ownerEquity,
    breakdown: {
      totalRevenue,
      totalExpenses,
      grossProfit: totalRevenue, // Simplified - in reality, would subtract cost of goods sold
      operatingExpenses: totalExpenses,
    },
  };
}
