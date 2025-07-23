// Liabilities Management API
// Handle manual liabilities entry and Owner's Equity calculations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, LiabilityCategory } from '@prisma/client';
import { z } from 'zod';

const liabilityQuerySchema = z.object({
  category: z.nativeEnum(LiabilityCategory).optional(),
  asOfDate: z.string().optional(),
});

const createLiabilitySchema = z.object({
  name: z.string().min(1, 'Liability name is required'),
  category: z.nativeEnum(LiabilityCategory),
  amount: z.number().min(0, 'Liability amount must be non-negative'),
  description: z.string().optional(),
  dueDate: z.string().transform(val => val ? new Date(val) : undefined).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { category, asOfDate } = liabilityQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const tenantId = session.user.tenantId;
    const reportDate = asOfDate ? new Date(asOfDate) : new Date();

    // Get liabilities from database
    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (category) where.category = category;

    const liabilities = await prisma.liability.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    // Categorize liabilities
    const categorizedLiabilities = {
      CURRENT: liabilities.filter(l => l.category === LiabilityCategory.CURRENT_LIABILITY),
      LONG_TERM: liabilities.filter(l => l.category === LiabilityCategory.LONG_TERM_LIABILITY)
    };

    // Calculate totals
    const totals = {
      CURRENT: categorizedLiabilities.CURRENT.reduce((sum, l) => sum + l.amount, 0),
      LONG_TERM: categorizedLiabilities.LONG_TERM.reduce((sum, l) => sum + l.amount, 0),
      TOTAL: liabilities.reduce((sum, l) => sum + l.amount, 0)
    };

    // Calculate Owner's Equity (Assets - Liabilities)
    const ownerEquity = await calculateOwnerEquity(tenantId, reportDate);

    return NextResponse.json({
      liabilities: liabilities.map(liability => ({
        id: liability.id,
        name: liability.name,
        category: liability.category,
        amount: liability.amount,
        description: liability.description,
        dueDate: liability.dueDate,
        createdAt: liability.createdAt,
        updatedAt: liability.updatedAt
      })),
      categorized: categorizedLiabilities,
      totals,
      ownerEquity,
      asOfDate: reportDate.toISOString().split('T')[0],
      summary: {
        totalLiabilities: liabilities.length,
        currentLiabilities: categorizedLiabilities.CURRENT.length,
        longTermLiabilities: categorizedLiabilities.LONG_TERM.length
      }
    });

  } catch (error) {
    console.error('Liabilities fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createLiabilitySchema.parse(body);
    const tenantId = session.user.tenantId;

    const liability = await prisma.liability.create({
      data: {
        tenantId,
        name: validatedData.name,
        category: validatedData.category,
        amount: validatedData.amount,
        description: validatedData.description,
        dueDate: validatedData.dueDate,
      }
    });

    return NextResponse.json({
      success: true,
      liability: {
        id: liability.id,
        name: liability.name,
        category: liability.category,
        amount: liability.amount,
        description: liability.description,
        dueDate: liability.dueDate,
        createdAt: liability.createdAt
      }
    });

  } catch (error) {
    console.error('Liability creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// OWNER'S EQUITY CALCULATION
async function calculateOwnerEquity(tenantId: string, asOfDate: Date) {
  try {
    // Get total assets (both manual and auto-calculated)
    const [manualAssets, totalLiabilities] = await Promise.all([
      prisma.asset.aggregate({
        where: {
          tenantId,
          isActive: true
        },
        _sum: { value: true }
      }),
      prisma.liability.aggregate({
        where: {
          tenantId,
          isActive: true
        },
        _sum: { amount: true }
      })
    ]);

    // Calculate auto-calculated current assets
    const autoAssets = await calculateAutoAssets(tenantId, asOfDate);
    const totalAutoAssets = autoAssets.reduce((sum, asset) => sum + asset.currentValue, 0);

    const totalAssets = (manualAssets._sum.value || 0) + totalAutoAssets;
    const totalLiabilitiesAmount = totalLiabilities._sum.amount || 0;

    // Owner's Equity = Total Assets - Total Liabilities
    const ownerEquity = totalAssets - totalLiabilitiesAmount;

    // Get retained earnings (simplified as net income to date)
    const [totalRevenue, totalExpenses] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: { lte: asOfDate }
        },
        _sum: { totalValue: true }
      }),
      prisma.expense.aggregate({
        where: {
          tenantId,
          expenseDate: { lte: asOfDate }
        },
        _sum: { amount: true }
      })
    ]);

    const netIncome = (totalRevenue._sum.totalValue || 0) - (totalExpenses._sum.amount || 0);

    return {
      totalAssets,
      totalLiabilities: totalLiabilitiesAmount,
      ownerEquity,
      breakdown: {
        manualAssets: manualAssets._sum.value || 0,
        autoCalculatedAssets: totalAutoAssets,
        netIncome,
        retainedEarnings: netIncome // Simplified - in real scenario, this would track accumulated earnings
      }
    };

  } catch (error) {
    console.error('Owner equity calculation error:', error);
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      ownerEquity: 0,
      breakdown: {
        manualAssets: 0,
        autoCalculatedAssets: 0,
        netIncome: 0,
        retainedEarnings: 0
      }
    };
  }
}

// Helper function to calculate auto assets (simplified version)
async function calculateAutoAssets(tenantId: string, asOfDate: Date) {
  const assets = [];

  try {
    // Get latest inventory
    const latestInventory = await prisma.inventoryRecord.findFirst({
      where: {
        tenantId,
        date: { lte: asOfDate }
      },
      orderBy: { date: 'desc' }
    });

    if (latestInventory && latestInventory.productId) {
      const product = await prisma.product.findUnique({
        where: { id: latestInventory.productId },
        select: { currentPrice: true }
      });

      if (product) {
        // Full cylinders value
        const fullCylindersValue = latestInventory.fullCylinders * product.currentPrice;
      assets.push({
        name: 'Full Cylinders',
        currentValue: fullCylindersValue
      });

        // Empty cylinders value (20% of full)
        const emptyCylindersValue = latestInventory.emptyCylinders * (product.currentPrice * 0.2);
        assets.push({
          name: 'Empty Cylinders',
          currentValue: emptyCylindersValue
        });
      }
    }

    // Receivables
    const [cashReceivables, cylinderReceivables] = await Promise.all([
      prisma.receivableRecord.aggregate({
        where: {
          tenantId,
          date: { lte: asOfDate }
        },
        _sum: { totalCashReceivables: true }
      }),
      prisma.receivableRecord.aggregate({
        where: {
          tenantId,
          date: { lte: asOfDate }
        },
        _sum: { totalCylinderReceivables: true }
      })
    ]);

    if (cashReceivables._sum.totalCashReceivables) {
      assets.push({
        name: 'Cash Receivables',
        currentValue: cashReceivables._sum.totalCashReceivables
      });
    }

    if (cylinderReceivables._sum.totalCylinderReceivables) {
      // Get the most recent product for pricing cylinder receivables
      const recentProduct = await prisma.product.findFirst({
        where: { tenantId, isActive: true },
        select: { currentPrice: true },
        orderBy: { updatedAt: 'desc' }
      });

      if (recentProduct) {
        assets.push({
          name: 'Cylinder Receivables',
          currentValue: cylinderReceivables._sum.totalCylinderReceivables * recentProduct.currentPrice
        });
      }
    }

    // Cash in hand (simplified)
    const [totalDeposits, totalExpenses] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: { lte: asOfDate }
        },
        _sum: { cashDeposited: true }
      }),
      prisma.expense.aggregate({
        where: {
          tenantId,
          expenseDate: { lte: asOfDate }
        },
        _sum: { amount: true }
      })
    ]);

    const cashInHand = Math.max(0, (totalDeposits._sum.cashDeposited || 0) - (totalExpenses._sum.amount || 0));
    if (cashInHand > 0) {
      assets.push({
        name: 'Cash in Hand',
        currentValue: cashInHand
      });
    }

  } catch (error) {
    console.error('Auto assets calculation error:', error);
  }

  return assets;
}