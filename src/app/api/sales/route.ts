// Sales API Endpoints
// Handles all sales operations with real-time inventory updates

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InventoryCalculator, BusinessValidator } from '@/lib/business';
import { ReceivablesCalculator } from '@/lib/business/receivables';
import { SaleType, PaymentType } from '@prisma/client';
import { z } from 'zod';

const createSaleSchema = z.object({
  driverId: z.string().cuid(),
  productId: z.string().cuid(),
  saleType: z.nativeEnum(SaleType),
  quantity: z.number().int().min(1).max(1000),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  paymentType: z.nativeEnum(PaymentType),
  cashDeposited: z.number().min(0).default(0),
  cylindersDeposited: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role, id: userId } = session.user;

    // Validate user permissions
    const permissionCheck = BusinessValidator.validateUserPermission(
      role,
      'CREATE_SALE'
    );
    if (!permissionCheck.isValid) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createSaleSchema.parse(body);

    // Additional business validation
    const businessValidation = BusinessValidator.validateSale({
      quantity: validatedData.quantity,
      paymentType: validatedData.paymentType,
      saleType: validatedData.saleType,
      cashDeposited: validatedData.cashDeposited,
      netValue:
        validatedData.quantity * validatedData.unitPrice -
        validatedData.discount,
      cylindersDeposited: validatedData.cylindersDeposited,
      isOnCredit: validatedData.paymentType === PaymentType.CREDIT,
    });

    if (!businessValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Business validation failed',
          details: businessValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check inventory availability before sale
    const inventoryCalculator = new InventoryCalculator(prisma);
    const receivablesCalculator = new ReceivablesCalculator(prisma);

    const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
      tenantId,
      validatedData.productId
    );

    if (currentLevels.fullCylinders < validatedData.quantity) {
      return NextResponse.json(
        {
          error: 'Insufficient inventory',
          available: currentLevels.fullCylinders,
          requested: validatedData.quantity,
        },
        { status: 400 }
      );
    }

    // Verify driver and product belong to tenant
    const [driver, product] = await Promise.all([
      prisma.driver.findFirst({
        where: { id: validatedData.driverId, tenantId, status: 'ACTIVE' },
      }),
      prisma.product.findFirst({
        where: { id: validatedData.productId, tenantId, isActive: true },
      }),
    ]);

    if (!driver || !product) {
      return NextResponse.json(
        { error: 'Invalid driver or product' },
        { status: 400 }
      );
    }

    // Calculate values
    const totalValue = validatedData.quantity * validatedData.unitPrice;
    const netValue = totalValue - validatedData.discount;
    const isOnCredit = validatedData.cashDeposited < netValue;
    const isCylinderCredit =
      validatedData.saleType === SaleType.REFILL &&
      validatedData.cylindersDeposited < validatedData.quantity;

    // Create sale transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale record
      const newSale = await tx.sale.create({
        data: {
          tenantId,
          driverId: validatedData.driverId,
          productId: validatedData.productId,
          userId,
          saleType: validatedData.saleType,
          quantity: validatedData.quantity,
          unitPrice: validatedData.unitPrice,
          totalValue,
          discount: validatedData.discount,
          netValue,
          paymentType: validatedData.paymentType,
          cashDeposited: validatedData.cashDeposited,
          cylindersDeposited: validatedData.cylindersDeposited,
          isOnCredit,
          isCylinderCredit,
          notes: validatedData.notes,
        },
        include: {
          driver: { select: { name: true } },
          product: {
            select: {
              name: true,
              size: true,
              company: { select: { name: true } },
            },
          },
          user: { select: { name: true } },
        },
      });

      // Record inventory movement for audit trail
      await inventoryCalculator.recordInventoryMovement(
        tenantId,
        validatedData.productId,
        validatedData.saleType === SaleType.PACKAGE
          ? 'SALE_PACKAGE'
          : 'SALE_REFILL',
        validatedData.quantity,
        `Sale to driver ${driver.name} - ${validatedData.saleType}`,
        newSale.id,
        validatedData.driverId
      );

      // Update receivables using exact formulas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get previous receivables for this driver
      const previousReceivables =
        await receivablesCalculator.getCurrentReceivablesBalances(
          tenantId,
          validatedData.driverId
        );

      // Calculate receivables using exact formulas
      const receivablesData =
        await receivablesCalculator.calculateReceivablesForDate({
          date: today,
          tenantId,
          driverId: validatedData.driverId,
          previousCashReceivables: previousReceivables.cashReceivables,
          previousCylinderReceivables: previousReceivables.cylinderReceivables,
        });

      // Store the calculated receivables in the database
      await receivablesCalculator.updateReceivablesRecord(
        tenantId,
        validatedData.driverId,
        today,
        receivablesData
      );

      return newSale;
    });

    // Trigger inventory recalculation (async)
    setImmediate(async () => {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const previousLevels =
          await inventoryCalculator.getCurrentInventoryLevels(
            tenantId,
            validatedData.productId
          );

        const inventoryResult =
          await inventoryCalculator.calculateInventoryForDate({
            date: today,
            tenantId,
            productId: validatedData.productId,
            previousFullCylinders: previousLevels.fullCylinders,
            previousEmptyCylinders: previousLevels.emptyCylinders,
          });

        await inventoryCalculator.updateInventoryRecord(
          tenantId,
          today,
          validatedData.productId,
          inventoryResult
        );
      } catch (error) {}
    });

    return NextResponse.json(
      {
        success: true,
        sale: {
          id: sale.id,
          saleType: sale.saleType,
          quantity: sale.quantity,
          netValue: sale.netValue,
          driver: sale.driver.name,
          product: `${sale.product.company.name} ${sale.product.name} (${sale.product.size}L)`,
          createdBy: sale.user.name,
          saleDate: sale.saleDate,
          isOnCredit: sale.isOnCredit,
          isCylinderCredit: sale.isCylinderCredit,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const driverId = searchParams.get('driverId');
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const saleType = searchParams.get('saleType') as SaleType | null;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (driverId) where.driverId = driverId;
    if (productId) where.productId = productId;
    if (saleType) where.saleType = saleType;

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        dateFilter.gte = startDateTime;
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.lte = endDateTime;
      }
      where.saleDate = dateFilter;
    }

    // Get all sales for this tenant to see their dates
    const allSales = await prisma.sale.findMany({
      where: { tenantId },
      select: {
        id: true,
        saleDate: true,
        driver: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
      take: 10,
    });
    console.log(
      'Recent sales with dates:',
      allSales.map((s) => ({
        id: s.id,
        saleDate: s.saleDate,
        driver: s.driver.name,
        product: s.product.name,
      }))
    );

    // Execute queries
    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          driver: { select: { name: true, phone: true } },
          product: {
            select: {
              name: true,
              size: true,
              company: { select: { name: true } },
            },
          },
          user: { select: { name: true } },
        },
        orderBy: { saleDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    // Debug logging
    console.log('Sales found:', sales.length);
    console.log(
      'Sales details:',
      sales.map((s) => ({
        id: s.id,
        saleDate: s.saleDate,
        driverName: s.driver.name,
        productName: s.product.name,
        saleType: s.saleType,
        quantity: s.quantity,
      }))
    );

    // Calculate summary statistics
    const summary = await prisma.sale.aggregate({
      where,
      _sum: {
        quantity: true,
        totalValue: true,
        netValue: true,
        cashDeposited: true,
        cylindersDeposited: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      sales: sales.map((sale) => ({
        id: sale.id,
        saleType: sale.saleType,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        totalValue: sale.totalValue,
        discount: sale.discount,
        netValue: sale.netValue,
        paymentType: sale.paymentType,
        cashDeposited: sale.cashDeposited,
        cylindersDeposited: sale.cylindersDeposited,
        isOnCredit: sale.isOnCredit,
        isCylinderCredit: sale.isCylinderCredit,
        saleDate: sale.saleDate,
        notes: sale.notes,
        driver: {
          name: sale.driver.name,
          phone: sale.driver.phone,
        },
        product: {
          name: `${sale.product.company.name} ${sale.product.name}`,
          size: sale.product.size,
        },
        createdBy: sale.user.name,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalSales: summary._count.id || 0,
        totalQuantity: summary._sum.quantity || 0,
        totalRevenue: summary._sum.netValue || 0,
        totalCashCollected: summary._sum.cashDeposited || 0,
        totalCylindersCollected: summary._sum.cylindersDeposited || 0,
      },
    });
  } catch (error) {
    console.error('Sales fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
