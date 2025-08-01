import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = { tenantId };

    if (status) whereClause.status = status;
    if (companyId) whereClause.companyId = companyId;

    if (startDate && endDate) {
      whereClause.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    const [purchaseOrders, totalCount] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: whereClause,
        include: {
          company: true,
          driver: true,
          items: {
            include: {
              product: true,
            },
          },
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { orderDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.purchaseOrder.count({ where: whereClause }),
    ]);

    // Calculate summary statistics
    const summary = {
      totalOrders: totalCount,
      totalValue: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
      byStatus: purchaseOrders.reduce(
        (acc, po) => {
          if (!acc[po.status]) {
            acc[po.status] = { count: 0, value: 0 };
          }
          acc[po.status].count += 1;
          acc[po.status].value += po.totalAmount;
          return acc;
        },
        {} as Record<string, { count: number; value: number }>
      ),
      byCompany: purchaseOrders.reduce(
        (acc, po) => {
          const companyName = po.company.name;
          if (!acc[companyName]) {
            acc[companyName] = { count: 0, value: 0 };
          }
          acc[companyName].count += 1;
          acc[companyName].value += po.totalAmount;
          return acc;
        },
        {} as Record<string, { count: number; value: number }>
      ),
    };

    return NextResponse.json({
      purchaseOrders,
      summary,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);
    const userId = session!.user.id;

    const data = await request.json();
    const {
      companyId,
      driverId,
      orderDate,
      expectedDeliveryDate,
      items, // Array of { productId, quantity, unitPrice }
      notes,
      priority,
    } = data;

    // Validation
    if (
      !companyId ||
      !driverId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Company, driver, and items are required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { error: 'Each item must have productId, quantity, and unitPrice' },
          { status: 400 }
        );
      }
      if (item.quantity <= 0 || item.unitPrice < 0) {
        return NextResponse.json(
          {
            error:
              'Quantity must be greater than 0 and unit price must be non-negative',
          },
          { status: 400 }
        );
      }
    }

    // Verify company belongs to tenant
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Verify driver belongs to tenant
    const driver = await prisma.driver.findFirst({
      where: { id: driverId, tenantId },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Verify all products belong to tenant
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 404 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Generate PO number
    const orderCount = await prisma.purchaseOrder.count({
      where: { tenantId },
    });
    const poNumber = `PO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        tenantId,
        companyId,
        driverId,
        poNumber,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate)
          : null,
        status: 'PENDING',
        totalAmount,
        notes,
        priority: priority || 'NORMAL',
        createdBy: userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        company: true,
        driver: true,
        items: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      purchaseOrder,
      message: 'Purchase order created successfully',
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}
