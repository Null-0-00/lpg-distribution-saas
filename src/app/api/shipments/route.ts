import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { ShipmentType, ShipmentStatus, MovementType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');
    const productId = searchParams.get('productId');
    const shipmentType = searchParams.get('shipmentType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const tenantId = session.user.tenantId;

    const whereClause: any = { tenantId };

    if (startDate && endDate) {
      whereClause.shipmentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    if (companyId) whereClause.companyId = companyId;
    if (productId) whereClause.productId = productId;
    if (shipmentType) whereClause.shipmentType = shipmentType as ShipmentType;

    const [shipments, totalCount] = await Promise.all([
      prisma.shipment.findMany({
        where: whereClause,
        include: {
          company: true,
          product: true,
          tenant: true,
        },
        orderBy: { shipmentDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.shipment.count({ where: whereClause }),
    ]);

    // Calculate summary statistics
    const summary = {
      totalShipments: totalCount,
      totalQuantity: shipments.reduce(
        (sum, shipment) => sum + shipment.quantity,
        0
      ),
      totalValue: shipments.reduce(
        (sum, shipment) => sum + (shipment.totalCost || 0),
        0
      ),
      byType: shipments.reduce(
        (acc, shipment) => {
          if (!acc[shipment.shipmentType]) {
            acc[shipment.shipmentType] = { count: 0, quantity: 0, value: 0 };
          }
          acc[shipment.shipmentType].count += 1;
          acc[shipment.shipmentType].quantity += shipment.quantity;
          acc[shipment.shipmentType].value += shipment.totalCost || 0;
          return acc;
        },
        {} as Record<string, { count: number; quantity: number; value: number }>
      ),
      byCompany: shipments.reduce(
        (acc, shipment) => {
          const companyName = shipment.company?.name || 'Direct Transaction';
          if (!acc[companyName]) {
            acc[companyName] = { count: 0, quantity: 0, value: 0 };
          }
          acc[companyName].count += 1;
          acc[companyName].quantity += shipment.quantity;
          acc[companyName].value += shipment.totalCost || 0;
          return acc;
        },
        {} as Record<string, { count: number; quantity: number; value: number }>
      ),
    };

    return NextResponse.json({
      shipments,
      summary,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Handle both old format and new line items format
    if (data.lineItems && Array.isArray(data.lineItems)) {
      // New format with line items
      const {
        companyId,
        driverId,
        shipmentDate,
        invoiceNumber,
        vehicleNumber,
        notes,
        lineItems,
      } = data;

      if (!lineItems || lineItems.length === 0) {
        return NextResponse.json(
          { error: 'No line items provided' },
          { status: 400 }
        );
      }

      const tenantId = session.user.tenantId;
      const userId = session.user.id;

      // Verify company belongs to tenant
      if (companyId) {
        const company = await prisma.company.findFirst({
          where: { id: companyId, tenantId },
        });

        if (!company) {
          return NextResponse.json(
            { error: 'Company not found' },
            { status: 404 }
          );
        }
      }

      // Verify driver belongs to tenant and is active
      let driverName = '';
      if (driverId) {
        const driver = await prisma.driver.findFirst({
          where: { id: driverId, tenantId, status: 'ACTIVE' },
        });

        if (!driver) {
          return NextResponse.json(
            { error: 'Driver not found or inactive' },
            { status: 404 }
          );
        }
        driverName = driver.name;
      }

      // Create shipments for each line item
      const createdShipments = [];

      for (const lineItem of lineItems) {
        const {
          productId,
          purchaseType,
          quantity,
          gasPrice,
          cylinderPrice,
          totalLineCost,
        } = lineItem;

        // Verify product belongs to tenant
        const product = await prisma.product.findFirst({
          where: { id: productId, tenantId },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${productId}` },
            { status: 404 }
          );
        }

        // Both package and refill purchases are incoming full cylinders
        const shipmentType = 'INCOMING_FULL';

        const shipmentData: any = {
          tenantId,
          productId,
          shipmentType,
          quantity,
          unitCost: totalLineCost / quantity, // Average cost per unit
          totalCost: totalLineCost,
          shipmentDate: new Date(shipmentDate),
          invoiceNumber: invoiceNumber || null,
          vehicleNumber: vehicleNumber || null,
          notes:
            `${purchaseType}: Gas: ৳${gasPrice}/unit${cylinderPrice ? `, Cylinder: ৳${cylinderPrice}/unit` : ''} | Driver: ${driverName} | ${notes || ''}`.trim(),
          status: ShipmentStatus.PENDING, // New purchase orders start as pending (outstanding)
        };

        // Only include companyId if it's not null
        if (companyId) {
          shipmentData.companyId = companyId;
        }

        const shipment = await prisma.shipment.create({
          data: shipmentData,
          include: {
            company: true,
            product: true,
            tenant: true,
          },
        });

        createdShipments.push(shipment);

        // Update inventory based on shipment type (only if shipment is immediately completed)
        if (shipment.status === ShipmentStatus.COMPLETED) {
          await updateInventoryFromShipment(shipment, tenantId, userId);
        }
      }

      return NextResponse.json(
        {
          shipments: createdShipments,
          message: `Created ${createdShipments.length} shipments successfully`,
        },
        { status: 201 }
      );
    }

    // Original format handling
    const {
      companyId,
      productId,
      cylinderSizeId,
      shipmentType,
      quantity,
      unitCost,
      shipmentDate,
      invoiceNumber,
      vehicleNumber,
      notes,
    } = data;

    // Validation - companyId is optional for empty cylinder transactions
    const emptyTransactionTypes = ['INCOMING_EMPTY', 'OUTGOING_EMPTY'];
    const requiresCompany = !emptyTransactionTypes.includes(shipmentType);
    const isEmptyTransaction = emptyTransactionTypes.includes(shipmentType);

    // For empty transactions, either productId or cylinderSizeId is required
    // For other transactions, productId is required
    const hasValidIdentifier = isEmptyTransaction
      ? productId || cylinderSizeId
      : productId;

    if (
      (requiresCompany && !companyId) ||
      !hasValidIdentifier ||
      !shipmentType ||
      !quantity
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: ' +
            (isEmptyTransaction ? 'productId or cylinderSizeId' : 'productId') +
            ', shipmentType, quantity' +
            (requiresCompany ? ', companyId' : ''),
        },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;
    const userId = session.user.id;

    // Verify company and product/cylinderSize belong to tenant
    const verificationPromises = [];

    // For empty transactions, we might use cylinderSizeId instead of productId
    let actualProductId = productId;

    if (isEmptyTransaction && cylinderSizeId) {
      // For empty cylinder transactions, verify cylinder size and get/create a generic product
      verificationPromises.push(
        prisma.cylinderSize.findFirst({
          where: { id: cylinderSizeId, tenantId },
        })
      );
    } else if (productId) {
      // For regular transactions or when productId is provided
      verificationPromises.push(
        prisma.product.findFirst({
          where: { id: productId, tenantId },
        })
      );
    }

    // Only verify company if it's required for this transaction type
    if (companyId) {
      verificationPromises.push(
        prisma.company.findFirst({
          where: { id: companyId, tenantId },
        })
      );
    }

    const results = await Promise.all(verificationPromises);
    let product, company, cylinderSize;

    if (isEmptyTransaction && cylinderSizeId) {
      cylinderSize = results[0];
      company = companyId ? results[1] : null;

      if (!cylinderSize) {
        return NextResponse.json(
          { error: 'Cylinder size not found' },
          { status: 404 }
        );
      }

      // For empty cylinder transactions, we need to create a generic product record
      // or use the first product with this cylinder size
      const existingProduct = await prisma.product.findFirst({
        where: {
          tenantId,
          cylinderSizeId: cylinderSizeId,
        },
      });

      if (existingProduct) {
        product = existingProduct;
        actualProductId = existingProduct.id;
      } else {
        return NextResponse.json(
          { error: 'No product found for this cylinder size' },
          { status: 404 }
        );
      }
    } else {
      product = results[0];
      company = companyId ? results[1] : null;

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }

    if (companyId && !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const totalCost = unitCost ? unitCost * quantity : null;

    // Create shipment
    const shipmentData: any = {
      tenantId,
      productId: actualProductId,
      shipmentType: shipmentType as ShipmentType,
      quantity,
      unitCost,
      totalCost,
      shipmentDate: shipmentDate ? new Date(shipmentDate) : new Date(),
      invoiceNumber,
      vehicleNumber,
      notes:
        isEmptyTransaction && cylinderSizeId && cylinderSize
          ? `Empty Cylinder Transaction - Size: ${(cylinderSize as any).size}. ${notes || ''}`
          : notes,
    };

    // Only include companyId if it's not null
    if (companyId) {
      shipmentData.companyId = companyId;
    }

    const shipment = await prisma.shipment.create({
      data: shipmentData,
      include: {
        company: true,
        product: true,
      },
    });

    // Update inventory based on shipment type (only if shipment is immediately completed)
    if (shipment.status === ShipmentStatus.COMPLETED) {
      await updateInventoryFromShipment(shipment, tenantId, userId);
    }

    return NextResponse.json({
      shipment,
      message: 'Shipment created successfully',
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

async function updateInventoryFromShipment(
  shipment: any,
  tenantId: string,
  userId: string
) {
  let fullCylinderChange = 0;
  let emptyCylinderChange = 0;

  switch (shipment.shipmentType) {
    case 'INCOMING_FULL':
      // Receiving full cylinders increases full cylinder stock
      fullCylinderChange = shipment.quantity;
      break;
    case 'INCOMING_EMPTY':
      // Receiving empty cylinders increases empty cylinder stock
      emptyCylinderChange = shipment.quantity;
      break;
    case 'OUTGOING_FULL':
      // Sending out full cylinders decreases full cylinder stock
      fullCylinderChange = -shipment.quantity;
      break;
    case 'OUTGOING_EMPTY':
      // Sending out empty cylinders decreases empty cylinder stock
      emptyCylinderChange = -shipment.quantity;
      break;
  }

  if (fullCylinderChange !== 0 || emptyCylinderChange !== 0) {
    // Determine movement type based on shipment type and purchase type from notes
    let movementType: MovementType;
    switch (shipment.shipmentType) {
      case 'INCOMING_FULL':
        // Check if it's a refill or package purchase from notes
        if (shipment.notes?.startsWith('REFILL:')) {
          movementType = MovementType.PURCHASE_REFILL;
        } else {
          movementType = MovementType.PURCHASE_PACKAGE;
        }
        break;
      case 'OUTGOING_EMPTY':
        movementType = MovementType.EMPTY_CYLINDER_SELL;
        break;
      case 'INCOMING_EMPTY':
        movementType = MovementType.EMPTY_CYLINDER_BUY;
        break;
      default:
        movementType = MovementType.ADJUSTMENT_POSITIVE;
    }

    // Create inventory movement record
    if (fullCylinderChange !== 0) {
      await prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: shipment.productId,
          type: movementType,
          quantity: Math.abs(fullCylinderChange),
          description: `Shipment ${shipment.shipmentType}: ${fullCylinderChange > 0 ? 'Received' : 'Sent'} ${Math.abs(fullCylinderChange)} full cylinders`,
          reference: `Shipment: ${shipment.invoiceNumber || shipment.id}`,
        },
      });
    }

    // For empty cylinder movements, use appropriate type
    if (emptyCylinderChange !== 0) {
      const emptyMovementType =
        emptyCylinderChange > 0 ? 'EMPTY_CYLINDER_BUY' : 'EMPTY_CYLINDER_SELL';
      await prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: shipment.productId,
          type: emptyMovementType,
          quantity: Math.abs(emptyCylinderChange),
          description: `Shipment ${shipment.shipmentType}: ${emptyCylinderChange > 0 ? 'Received' : 'Sent'} ${Math.abs(emptyCylinderChange)} empty cylinders`,
          reference: `Shipment: ${shipment.invoiceNumber || shipment.id}`,
        },
      });
    }
  }

  // If this is a purchase shipment (INCOMING_FULL), also create a purchase record
  if (shipment.shipmentType === 'INCOMING_FULL' && shipment.unitCost) {
    // Extract purchase type from notes (notes start with "PACKAGE:" or "REFILL:")
    let purchaseType = 'PACKAGE'; // Default
    if (shipment.notes?.startsWith('REFILL:')) {
      purchaseType = 'REFILL';
    } else if (shipment.notes?.startsWith('PACKAGE:')) {
      purchaseType = 'PACKAGE';
    }

    await prisma.purchase.create({
      data: {
        tenantId,
        companyId: shipment.companyId,
        productId: shipment.productId,
        purchaseType: purchaseType as any,
        quantity: shipment.quantity,
        unitCost: shipment.unitCost,
        totalCost: shipment.totalCost || 0,
        purchaseDate: shipment.shipmentDate,
        invoiceNumber: shipment.invoiceNumber,
        notes: `Auto-generated from shipment: ${shipment.id}`,
      },
    });
  }
}
