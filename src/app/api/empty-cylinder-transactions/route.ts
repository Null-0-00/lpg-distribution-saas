import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';
import { CylinderInventoryValidator } from '@/lib/services/cylinder-inventory-validator';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');
    const productId = searchParams.get('productId');
    const transactionType = searchParams.get('transactionType'); // 'BUY' or 'SELL'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {
      tenantId,
      shipmentType: {
        in: ['INCOMING_EMPTY', 'OUTGOING_EMPTY'],
      },
    };

    if (startDate && endDate) {
      whereClause.shipmentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    if (companyId) whereClause.companyId = companyId;
    if (productId) whereClause.productId = productId;

    if (transactionType === 'BUY') {
      whereClause.shipmentType = 'INCOMING_EMPTY';
    } else if (transactionType === 'SELL') {
      whereClause.shipmentType = 'OUTGOING_EMPTY';
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.shipment.findMany({
        where: whereClause,
        include: {
          company: true,
          product: true,
        },
        orderBy: { shipmentDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.shipment.count({ where: whereClause }),
    ]);

    // Calculate summary statistics
    const summary = {
      totalTransactions: totalCount,
      totalQuantity: transactions.reduce(
        (sum, transaction) => sum + transaction.quantity,
        0
      ),
      totalValue: transactions.reduce(
        (sum, transaction) => sum + (transaction.totalCost || 0),
        0
      ),
      purchases: {
        count: transactions.filter((t) => t.shipmentType === 'INCOMING_EMPTY')
          .length,
        quantity: transactions
          .filter((t) => t.shipmentType === 'INCOMING_EMPTY')
          .reduce((sum, t) => sum + t.quantity, 0),
        value: transactions
          .filter((t) => t.shipmentType === 'INCOMING_EMPTY')
          .reduce((sum, t) => sum + (t.totalCost || 0), 0),
      },
      sales: {
        count: transactions.filter((t) => t.shipmentType === 'OUTGOING_EMPTY')
          .length,
        quantity: transactions
          .filter((t) => t.shipmentType === 'OUTGOING_EMPTY')
          .reduce((sum, t) => sum + t.quantity, 0),
        value: transactions
          .filter((t) => t.shipmentType === 'OUTGOING_EMPTY')
          .reduce((sum, t) => sum + (t.totalCost || 0), 0),
      },
      netProfit:
        transactions
          .filter((t) => t.shipmentType === 'OUTGOING_EMPTY')
          .reduce((sum, t) => sum + (t.totalCost || 0), 0) -
        transactions
          .filter((t) => t.shipmentType === 'INCOMING_EMPTY')
          .reduce((sum, t) => sum + (t.totalCost || 0), 0),
      byCompany: transactions.reduce(
        (acc, transaction) => {
          const companyName = transaction.company?.name;
          if (!companyName) return acc;

          const type =
            transaction.shipmentType === 'INCOMING_EMPTY'
              ? 'purchases'
              : 'sales';

          if (!acc[companyName]) {
            acc[companyName] = {
              purchases: { count: 0, quantity: 0, value: 0 },
              sales: { count: 0, quantity: 0, value: 0 },
            };
          }

          acc[companyName][type].count += 1;
          acc[companyName][type].quantity += transaction.quantity;
          acc[companyName][type].value += transaction.totalCost || 0;

          return acc;
        },
        {} as Record<string, any>
      ),
    };

    return NextResponse.json({
      transactions,
      summary,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get empty cylinder transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch empty cylinder transactions' },
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
      productId,
      transactionType, // 'BUY' or 'SELL'
      quantity,
      unitPrice,
      transactionDate,
      invoiceNumber,
      vehicleNumber,
      notes,
    } = data;

    // Validation
    if (
      !companyId ||
      !productId ||
      !transactionType ||
      !quantity ||
      !unitPrice
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: companyId, productId, transactionType, quantity, unitPrice',
        },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(transactionType)) {
      return NextResponse.json(
        { error: 'Transaction type must be BUY or SELL' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || unitPrice < 0) {
      return NextResponse.json(
        {
          error:
            'Quantity must be greater than 0 and price must be non-negative',
        },
        { status: 400 }
      );
    }

    // Verify company and product belong to tenant
    const [company, product] = await Promise.all([
      prisma.company.findFirst({
        where: { id: companyId, tenantId },
      }),
      prisma.product.findFirst({
        where: { id: productId, tenantId },
      }),
    ]);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // For SELL transactions, validate cylinder inventory using comprehensive validator
    if (transactionType === 'SELL') {
      const cylinderValidator = new CylinderInventoryValidator(prisma);

      // Get product cylinder size for validation
      const productWithSize = await prisma.product.findFirst({
        where: { id: productId, tenantId },
        include: { cylinderSize: true },
      });

      if (!productWithSize || !productWithSize.cylinderSize) {
        return NextResponse.json(
          { error: 'Product not found or missing cylinder size information' },
          { status: 404 }
        );
      }

      const validation = await cylinderValidator.validateShipmentInventory({
        tenantId,
        shipmentType: 'OUTGOING_EMPTY',
        lineItems: [
          {
            productId,
            cylinderSize: productWithSize.cylinderSize.size,
            quantity,
          },
        ],
        shipmentDate: transactionDate ? new Date(transactionDate) : new Date(),
      });

      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: 'Insufficient empty cylinder inventory for sale',
            details: validation.errors,
            warnings: validation.warnings,
            inventoryDetails: validation.inventoryDetails,
          },
          { status: 400 }
        );
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Empty cylinder sale warnings:', validation.warnings);
      }
    }

    const totalValue = unitPrice * quantity;
    const shipmentType =
      transactionType === 'BUY' ? 'INCOMING_EMPTY' : 'OUTGOING_EMPTY';

    // Create shipment record for the empty cylinder transaction
    const transaction = await prisma.shipment.create({
      data: {
        tenantId,
        companyId,
        productId,
        shipmentType,
        quantity,
        unitCost: unitPrice,
        totalCost: totalValue,
        shipmentDate: transactionDate ? new Date(transactionDate) : new Date(),
        invoiceNumber,
        vehicleNumber,
        notes: notes
          ? `Empty Cylinder ${transactionType}: ${notes}`
          : `Empty Cylinder ${transactionType}`,
      },
      include: {
        company: true,
        product: true,
      },
    });

    // Update inventory
    const emptyCylinderChange =
      transactionType === 'BUY' ? quantity : -quantity;

    await prisma.inventoryMovement.create({
      data: {
        tenantId,
        productId,
        type:
          transactionType === 'BUY'
            ? 'EMPTY_CYLINDER_BUY'
            : 'EMPTY_CYLINDER_SELL',
        quantity: Math.abs(emptyCylinderChange),
        description: `Empty cylinder ${transactionType.toLowerCase()}: ${Math.abs(emptyCylinderChange)} cylinders`,
        reference: `Empty Cylinder Transaction: ${transaction.invoiceNumber || transaction.id}`,
      },
    });

    // Calculate profit/loss for this transaction
    let profitLoss = 0;
    if (transactionType === 'SELL') {
      // For sales, profit is positive (selling price)
      profitLoss = totalValue;
    } else {
      // For purchases, profit is negative (cost)
      profitLoss = -totalValue;
    }

    return NextResponse.json({
      transaction,
      profitLoss,
      message: `Empty cylinder ${transactionType.toLowerCase()} transaction created successfully`,
    });
  } catch (error) {
    console.error('Create empty cylinder transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create empty cylinder transaction' },
      { status: 500 }
    );
  }
}
