// Sales API Endpoints
// Handles all sales operations with real-time inventory updates

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { InventoryCalculator, BusinessValidator } from '@/lib/business';
import { ReceivablesCalculator } from '@/lib/business/receivables';
import { SaleType, PaymentType } from '@prisma/client';
import { z } from 'zod';
import {
  PaginationHelper,
  createPaginatedResponse,
  validatePaginationParams,
  PaginationPerformanceMonitor,
} from '@/lib/pagination';

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

      // Get previous day's receivables for this driver (includes onboarding values)
      const previousReceivables =
        await receivablesCalculator.getPreviousReceivables(
          tenantId,
          validatedData.driverId,
          today
        );

      console.log(
        `📊 Previous receivables for driver ${validatedData.driverId}:`,
        {
          cash: previousReceivables.cashReceivables,
          cylinders: previousReceivables.cylinderReceivables,
        }
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
      console.log(
        `💰 Calculated receivables for driver ${validatedData.driverId}:`,
        {
          previousCash: previousReceivables.cashReceivables,
          previousCylinders: previousReceivables.cylinderReceivables,
          cashChange: receivablesData.cashReceivablesChange,
          cylinderChange: receivablesData.cylinderReceivablesChange,
          totalCash: receivablesData.totalCashReceivables,
          totalCylinders: receivablesData.totalCylinderReceivables,
          salesRevenue: receivablesData.salesRevenue,
        }
      );

      console.log(
        `💾 Saving receivables for driver ${validatedData.driverId} on ${today.toISOString().split('T')[0]}`
      );

      await receivablesCalculator.updateReceivablesRecord(
        tenantId,
        validatedData.driverId,
        today,
        receivablesData
      );

      console.log(
        `✅ Receivables saved successfully for driver ${validatedData.driverId}`
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
  const stopTiming = PaginationPerformanceMonitor.startTiming('/api/sales');

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters with validation
    const paginationParams = PaginationHelper.parseParams(searchParams, {
      defaultLimit: 20,
      maxLimit: 100,
      defaultSortBy: 'saleDate',
      defaultSortOrder: 'desc',
    });

    // Validate pagination parameters
    const validationError = validatePaginationParams(paginationParams);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Parse additional filter parameters
    const driverId = searchParams.get('driverId');
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const saleType = searchParams.get('saleType') as SaleType | null;

    // Build base where clause
    const baseWhere: any = { tenantId };

    // Add specific filters
    if (driverId) baseWhere.driverId = driverId;
    if (productId) baseWhere.productId = productId;
    if (saleType) baseWhere.saleType = saleType;

    // Add search condition
    const searchCondition = PaginationHelper.createSearchCondition(
      paginationParams.search,
      ['notes']
    );

    // Add date range condition
    const dateRangeCondition = PaginationHelper.createDateRangeCondition(
      startDate || undefined,
      endDate || undefined,
      'saleDate'
    );

    // Combine all conditions
    const where = PaginationHelper.combineConditions(
      baseWhere,
      searchCondition,
      dateRangeCondition
    );

    console.log('Sales query conditions:', {
      where,
      pagination: paginationParams,
      filters: { driverId, productId, saleType, startDate, endDate },
    });

    // Use pagination helper for data retrieval
    const result = await PaginationHelper.paginate(
      // Count query
      () => prisma.sale.count({ where }),
      // Data query
      (options) =>
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
          ...options,
        }),
      paginationParams,
      {
        defaultLimit: 20,
        maxLimit: 100,
      }
    );

    // Calculate summary statistics for filtered data
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

    // Transform data
    const transformedData = result.data.map((sale: any) => ({
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
        name: sale.driver?.name || 'Unknown Driver',
        phone: sale.driver?.phone || '',
      },
      product: {
        name:
          sale.product?.company?.name && sale.product?.name
            ? `${sale.product.company.name} ${sale.product.name}`
            : 'Unknown Product',
        size: sale.product?.size || '',
      },
      createdBy: sale.user?.name || 'Unknown User',
    }));

    stopTiming();

    const response = createPaginatedResponse(
      {
        data: transformedData,
        pagination: result.pagination,
      },
      'Sales retrieved successfully'
    );

    return NextResponse.json({
      ...response,
      summary: {
        totalSales: summary._count.id || 0,
        totalQuantity: summary._sum.quantity || 0,
        totalRevenue: summary._sum.netValue || 0,
        totalCashCollected: summary._sum.cashDeposited || 0,
        totalCylindersCollected: summary._sum.cylindersDeposited || 0,
      },
      filters: {
        driverId,
        productId,
        saleType,
        startDate,
        endDate,
        search: paginationParams.search,
      },
    });
  } catch (error) {
    stopTiming();
    console.error('Sales fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
