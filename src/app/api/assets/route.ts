// Assets Management API
// Handle both manual assets and auto-calculated current assets

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, AssetCategory } from '@prisma/client';
import { z } from 'zod';
import { InventoryCalculator } from '@/lib/business';

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
    .default('false'),
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
    .transform((val) => (val && val.trim() !== '' ? new Date(val) : undefined))
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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, unitValue, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;

    // Handle inventory asset unit value updates
    if (id.startsWith('auto-') && unitValue !== undefined) {
      // For auto-calculated assets, we store unit values in a separate table
      await prisma.inventoryAssetValue.upsert({
        where: {
          tenantId_assetType: {
            tenantId,
            assetType: id,
          },
        },
        update: {
          unitValue,
          updatedAt: new Date(),
        },
        create: {
          tenantId,
          assetType: id,
          unitValue,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Unit value updated successfully',
      });
    }

    // Handle regular asset updates
    const validatedData = createAssetSchema.parse(updateData);

    const asset = await prisma.asset.update({
      where: {
        id,
        tenantId,
      },
      data: {
        name: validatedData.name,
        category: validatedData.category,
        subCategory: validatedData.subCategory ?? null,
        value: validatedData.value,
        description: validatedData.description ?? null,
        purchaseDate: validatedData.purchaseDate ?? null,
        depreciationRate: validatedData.depreciationRate ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error('Asset update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;

    // Cannot delete auto-calculated assets
    if (id.startsWith('auto-')) {
      return NextResponse.json(
        { error: 'Cannot delete auto-calculated assets' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.asset.update({
      where: {
        id,
        tenantId,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Asset deletion error:', error);
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
    // Get custom unit values for inventory assets
    const customUnitValues = await prisma.inventoryAssetValue.findMany({
      where: { tenantId },
    });

    const getCustomUnitValue = (assetType: string, defaultValue: number) => {
      const custom = customUnitValues.find((v) => v.assetType === assetType);
      return custom ? custom.unitValue : defaultValue;
    };

    // 1. Get real-time inventory quantities from daily inventory API
    const currentInventory = await calculateRealTimeInventory(
      tenantId,
      asOfDate
    );

    // 1. Full Cylinders removed - now using detailed breakdown by company/size in UI

    // 2. Empty Cylinders removed - now using detailed breakdown by size in UI

    // 3. Cash Receivables (using same formula as receivables page)
    // Get latest receivable record for each ACTIVE driver
    const driversWithReceivables = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        receivableRecords: {
          where: {
            date: { lte: asOfDate },
          },
          orderBy: { date: 'desc' },
          take: 1,
          select: {
            totalCashReceivables: true,
          },
        },
      },
    });

    // Sum cash receivables from latest record of each active driver
    const totalCashReceivables = driversWithReceivables.reduce((sum, driver) => {
      const latestRecord = driver.receivableRecords[0];
      return sum + (latestRecord?.totalCashReceivables || 0);
    }, 0);
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

    // 4. REMOVED: Cylinder Receivables - as requested by user

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

// Calculate real-time inventory using business logic
async function calculateRealTimeInventory(tenantId: string, asOfDate: Date) {
  try {
    // Get all sales up to the date
    const sales = await prisma.sale.findMany({
      where: {
        tenantId,
        saleDate: { lte: asOfDate },
      },
      select: {
        saleType: true,
        quantity: true,
      },
    });

    // Get all completed shipments up to the date
    const shipments = await prisma.shipment.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        shipmentDate: { lte: asOfDate },
      },
      select: {
        shipmentType: true,
        quantity: true,
        notes: true,
      },
    });

    // Calculate package and refill sales
    const packageSales = sales
      .filter((s) => s.saleType === 'PACKAGE')
      .reduce((sum, s) => sum + s.quantity, 0);

    const refillSales = sales
      .filter((s) => s.saleType === 'REFILL')
      .reduce((sum, s) => sum + s.quantity, 0);

    // Calculate purchases
    const packagePurchases = shipments
      .filter(
        (s) =>
          s.shipmentType === 'INCOMING_FULL' &&
          (!s.notes || !s.notes.includes('REFILL:'))
      )
      .reduce((sum, s) => sum + s.quantity, 0);

    const refillPurchases = shipments
      .filter(
        (s) =>
          s.shipmentType === 'INCOMING_FULL' &&
          s.notes &&
          s.notes.includes('REFILL:')
      )
      .reduce((sum, s) => sum + s.quantity, 0);

    // Calculate empty cylinder transactions
    const emptyBuys = shipments
      .filter((s) => s.shipmentType === 'INCOMING_EMPTY')
      .reduce((sum, s) => sum + s.quantity, 0);

    const emptySells = shipments
      .filter((s) => s.shipmentType === 'OUTGOING_EMPTY')
      .reduce((sum, s) => sum + s.quantity, 0);

    // Apply business formulas
    const totalSales = packageSales + refillSales;
    const totalPurchases = packagePurchases + refillPurchases;
    const emptyCylindersBuySell = emptyBuys - emptySells;

    // Full Cylinders = Total Purchases - Total Sales
    const fullCylinders = Math.max(0, totalPurchases - totalSales);

    // Empty Cylinders = Refill Sales + Empty Cylinders Buy/Sell
    const emptyCylinders = Math.max(0, refillSales + emptyCylindersBuySell);

    return {
      fullCylinders,
      emptyCylinders,
      totalCylinders: fullCylinders + emptyCylinders,
    };
  } catch (error) {
    console.error('Real-time inventory calculation error:', error);
    return {
      fullCylinders: 0,
      emptyCylinders: 0,
      totalCylinders: 0,
    };
  }
}
