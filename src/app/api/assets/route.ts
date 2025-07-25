// Assets Management API
// Handle both manual assets and auto-calculated current assets

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, AssetCategory } from '@prisma/client';
import { z } from 'zod';

interface AssetResponse {
  id: string;
  name: string;
  category: AssetCategory;
  subCategory?: string | null;
  originalValue?: number;
  currentValue: number;
  description?: string | null;
  purchaseDate?: Date | string | null;
  depreciationRate?: number | null;
  isAutoCalculated: boolean;
  details?: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

const assetQuerySchema = z.object({
  category: z.nativeEnum(AssetCategory).optional(),
  includeAutoCalculated: z
    .string()
    .transform((val) => val === 'true')
    .default(false),
  asOfDate: z.string().optional(),
});

const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  category: z.nativeEnum(AssetCategory),
  subCategory: z.string().optional(),
  value: z.number().min(0, 'Asset value must be non-negative'),
  description: z.string().optional(),
  purchaseDate: z
    .string()
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { category, includeAutoCalculated, asOfDate } =
      assetQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const tenantId = session.user.tenantId;
    const reportDate = asOfDate ? new Date(asOfDate) : new Date();

    // Get manual assets from database
    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (category) where.category = category;

    const manualAssets = await prisma.asset.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Calculate current values with depreciation
    const assetsWithCurrentValue = manualAssets.map((asset) => {
      let currentValue = asset.value;

      // Apply depreciation if applicable
      if (asset.depreciationRate && asset.purchaseDate) {
        const yearsOwned =
          (reportDate.getTime() - asset.purchaseDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365);
        const depreciationAmount =
          asset.value * (asset.depreciationRate / 100) * yearsOwned;
        currentValue = Math.max(0, asset.value - depreciationAmount);
      }

      return {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        subCategory: asset.subCategory,
        originalValue: asset.value,
        currentValue,
        description: asset.description,
        purchaseDate: asset.purchaseDate,
        depreciationRate: asset.depreciationRate,
        isAutoCalculated: false,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      };
    });

    let autoCalculatedAssets: AssetResponse[] = [];

    // Add auto-calculated current assets if requested
    if (
      includeAutoCalculated ||
      !category ||
      category === AssetCategory.CURRENT_ASSET
    ) {
      autoCalculatedAssets = await calculateCurrentAssets(tenantId, reportDate);
    }

    // Combine and categorize assets
    const allAssets: AssetResponse[] = [
      ...assetsWithCurrentValue,
      ...autoCalculatedAssets,
    ];

    const categorizedAssets = {
      FIXED: allAssets.filter((a) => a.category === AssetCategory.FIXED_ASSET),
      CURRENT: allAssets.filter(
        (a) => a.category === AssetCategory.CURRENT_ASSET
      ),
    };

    // Calculate totals
    const totals = {
      FIXED: categorizedAssets.FIXED.reduce(
        (sum, a) => sum + a.currentValue,
        0
      ),
      CURRENT: categorizedAssets.CURRENT.reduce(
        (sum, a) => sum + a.currentValue,
        0
      ),
      TOTAL: allAssets.reduce((sum, a) => sum + a.currentValue, 0),
    };

    return NextResponse.json({
      assets: allAssets,
      categorized: categorizedAssets,
      totals,
      asOfDate: reportDate.toISOString().split('T')[0],
      summary: {
        totalAssets: allAssets.length,
        manualAssets: assetsWithCurrentValue.length,
        autoCalculatedAssets: autoCalculatedAssets.length,
      },
    });
  } catch (error) {
    console.error('Assets fetch error:', error);
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
    const validatedData = createAssetSchema.parse(body);
    const tenantId = session.user.tenantId;

    const asset = await prisma.asset.create({
      data: {
        tenantId,
        name: validatedData.name,
        category: validatedData.category,
        subCategory: validatedData.subCategory ?? null,
        value: validatedData.value,
        description: validatedData.description ?? null,
        purchaseDate: validatedData.purchaseDate ?? null,
        depreciationRate: validatedData.depreciationRate ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        subCategory: asset.subCategory,
        value: asset.value,
        description: asset.description,
        purchaseDate: asset.purchaseDate,
        depreciationRate: asset.depreciationRate,
        isAutoCalculated: false,
        createdAt: asset.createdAt,
      },
    });
  } catch (error) {
    console.error('Asset creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// AUTO-CALCULATED CURRENT ASSETS
async function calculateCurrentAssets(
  tenantId: string,
  asOfDate: Date
): Promise<AssetResponse[]> {
  const assets: AssetResponse[] = [];

  try {
    // 1. Get latest inventory and product information
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
        const fullCylindersValue =
          latestInventory.fullCylinders * product.currentPrice;
        assets.push({
          id: 'auto-full-cylinders',
          name: `Full Cylinders (${product.name})`,
          category: AssetCategory.CURRENT_ASSET,
          subCategory: 'Inventory',
          originalValue: fullCylindersValue,
          currentValue: fullCylindersValue,
          description: `${latestInventory.fullCylinders} cylinders @ ${product.currentPrice} each`,
          isAutoCalculated: true,
          details: {
            quantity: latestInventory.fullCylinders,
            unitPrice: product.currentPrice,
            date: latestInventory.date,
          },
          createdAt: latestInventory.date,
          updatedAt: latestInventory.date,
        });

        // 2. Empty Cylinders (auto from inventory) - Assuming 20% of full cylinder value
        const emptyCylindersValue =
          latestInventory.emptyCylinders * (product.currentPrice * 0.2);
        assets.push({
          id: 'auto-empty-cylinders',
          name: `Empty Cylinders (${product.name})`,
          category: AssetCategory.CURRENT_ASSET,
          subCategory: 'Inventory',
          originalValue: emptyCylindersValue,
          currentValue: emptyCylindersValue,
          description: `${latestInventory.emptyCylinders} empty cylinders @ 20% of full price`,
          isAutoCalculated: true,
          details: {
            quantity: latestInventory.emptyCylinders,
            unitPrice: product.currentPrice * 0.2,
            date: latestInventory.date,
          },
          createdAt: latestInventory.date,
          updatedAt: latestInventory.date,
        });
      }
    }

    // 3. Cash Receivables (auto from receivables)
    const cashReceivables = await prisma.receivableRecord.aggregate({
      where: {
        tenantId,
        date: { lte: asOfDate },
      },
      _sum: {
        totalCashReceivables: true,
      },
    });

    const totalCashReceivables = cashReceivables._sum.totalCashReceivables || 0;
    if (totalCashReceivables > 0) {
      assets.push({
        id: 'auto-cash-receivables',
        name: 'Cash Receivables',
        category: AssetCategory.CURRENT_ASSET,
        subCategory: 'Receivables',
        originalValue: totalCashReceivables,
        currentValue: totalCashReceivables,
        description: 'Outstanding cash receivables from drivers',
        isAutoCalculated: true,
        details: {
          totalAmount: totalCashReceivables,
          date: asOfDate,
        },
        createdAt: asOfDate,
        updatedAt: asOfDate,
      });
    }

    // 4. Cylinder Receivables (auto from receivables) - Convert to cash value
    const cylinderReceivables = await prisma.receivableRecord.aggregate({
      where: {
        tenantId,
        date: { lte: asOfDate },
      },
      _sum: {
        totalCylinderReceivables: true,
      },
    });

    const totalCylinderReceivables =
      cylinderReceivables._sum.totalCylinderReceivables || 0;
    if (totalCylinderReceivables > 0) {
      // Get the most recent product for pricing cylinder receivables
      const recentProduct = await prisma.product.findFirst({
        where: { tenantId, isActive: true },
        select: { currentPrice: true, name: true },
        orderBy: { updatedAt: 'desc' },
      });

      if (recentProduct) {
        // Assume cylinder receivables are valued at current product price
        const cylinderReceivablesValue =
          totalCylinderReceivables * recentProduct.currentPrice;
        assets.push({
          id: 'auto-cylinder-receivables',
          name: 'Cylinder Receivables',
          category: AssetCategory.CURRENT_ASSET,
          subCategory: 'Receivables',
          originalValue: cylinderReceivablesValue,
          currentValue: cylinderReceivablesValue,
          description: `${totalCylinderReceivables} cylinders receivable @ current price`,
          isAutoCalculated: true,
          details: {
            quantity: totalCylinderReceivables,
            unitPrice: recentProduct.currentPrice,
            date: asOfDate,
          },
          createdAt: asOfDate,
          updatedAt: asOfDate,
        });
      }
    }

    // 5. Cash in Hand (auto calculated from sales - expenses - deposits)
    const [totalSales, totalExpenses] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: { lte: asOfDate },
        },
        _sum: {
          cashDeposited: true,
          totalValue: true,
        },
      }),
      prisma.expense.aggregate({
        where: {
          tenantId,
          expenseDate: { lte: asOfDate },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalCashDeposited = totalSales._sum.cashDeposited || 0;
    const totalExpenseAmount = totalExpenses._sum.amount || 0;

    // Simple cash in hand calculation: deposits - expenses
    const cashInHand = Math.max(0, totalCashDeposited - totalExpenseAmount);

    if (cashInHand > 0) {
      assets.push({
        id: 'auto-cash-in-hand',
        name: 'Cash in Hand',
        category: AssetCategory.CURRENT_ASSET,
        subCategory: 'Cash',
        originalValue: cashInHand,
        currentValue: cashInHand,
        description: 'Available cash calculated from deposits minus expenses',
        isAutoCalculated: true,
        details: {
          totalDeposits: totalCashDeposited,
          totalExpenses: totalExpenseAmount,
          date: asOfDate,
        },
        createdAt: asOfDate,
        updatedAt: asOfDate,
      });
    }
  } catch (error) {
    console.error('Auto-calculation error:', error);
  }

  return assets;
}
