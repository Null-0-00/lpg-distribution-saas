import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { ShipmentType, ShipmentStatus, MovementType } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId,
      },
      include: {
        company: true,
        product: true,
        tenant: true,
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error('Get shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      companyId,
      productId,
      shipmentType,
      quantity,
      unitCost,
      shipmentDate,
      invoiceNumber,
      vehicleNumber,
      notes,
      status,
    } = data;

    const tenantId = session.user.tenantId;

    // Get existing shipment
    const existingShipment = await prisma.shipment.findFirst({
      where: {
        id: id,
        tenantId,
      },
    });

    if (!existingShipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Validation
    if (quantity && quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify company and product if provided
    if (companyId || productId) {
      const [company, product] = await Promise.all([
        companyId
          ? prisma.company.findFirst({
              where: { id: companyId, tenantId },
            })
          : Promise.resolve(null),
        productId
          ? prisma.product.findFirst({
              where: { id: productId, tenantId },
            })
          : Promise.resolve(null),
      ]);

      if (companyId && !company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      if (productId && !product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }

    const totalCost =
      unitCost && quantity
        ? unitCost * quantity
        : unitCost && existingShipment.quantity
          ? unitCost * existingShipment.quantity
          : existingShipment.unitCost && quantity
            ? existingShipment.unitCost * quantity
            : existingShipment.totalCost;

    // Update shipment
    const updateData: any = {};

    if (companyId !== undefined) updateData.companyId = companyId;
    if (productId) updateData.productId = productId;
    if (shipmentType) updateData.shipmentType = shipmentType as ShipmentType;
    if (quantity) updateData.quantity = quantity;
    if (unitCost !== undefined) updateData.unitCost = unitCost;
    if (totalCost !== undefined) updateData.totalCost = totalCost;
    if (shipmentDate) updateData.shipmentDate = new Date(shipmentDate);
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (vehicleNumber !== undefined) updateData.vehicleNumber = vehicleNumber;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const updatedShipment = await prisma.shipment.update({
      where: { id: id },
      data: updateData,
      include: {
        company: true,
        product: true,
      },
    });

    // Handle inventory updates when shipment status changes
    if (status !== undefined && status !== existingShipment.status) {
      console.log('Status changed from', existingShipment.status, 'to', status);
      await handleShipmentStatusChange(
        existingShipment,
        status,
        tenantId,
        session.user.id
      );
    }

    return NextResponse.json({
      shipment: updatedShipment,
      message: 'Shipment updated successfully',
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
    });
    return NextResponse.json(
      {
        error: 'Failed to update shipment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Check if shipment exists
    const shipment = await prisma.shipment.findFirst({
      where: {
        id: id,
        tenantId,
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of PENDING orders
    if (shipment.status !== ShipmentStatus.PENDING) {
      return NextResponse.json(
        {
          error:
            'Only pending orders can be deleted. Completed orders cannot be deleted to maintain data integrity.',
        },
        { status: 400 }
      );
    }

    // For PENDING orders, we can safely delete and clean up related records
    // First, find and delete related inventory movements
    const relatedMovements = await prisma.inventoryMovement.findMany({
      where: {
        tenantId,
        reference: {
          contains: shipment.id,
        },
      },
    });

    // Delete related inventory movements in a transaction along with the shipment
    await prisma.$transaction(async (prisma) => {
      // Delete related inventory movements
      if (relatedMovements.length > 0) {
        await prisma.inventoryMovement.deleteMany({
          where: {
            tenantId,
            reference: {
              contains: shipment.id,
            },
          },
        });
      }

      // Delete related purchase records
      await prisma.purchase.deleteMany({
        where: {
          tenantId,
          notes: {
            contains: shipment.id,
          },
        },
      });

      // Finally delete the shipment
      await prisma.shipment.delete({
        where: { id: id },
      });
    });

    return NextResponse.json({
      message: 'Shipment deleted successfully',
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}

async function handleShipmentStatusChange(
  shipment: any,
  newStatus: ShipmentStatus,
  tenantId: string,
  userId: string
) {
  try {
    console.log('handleShipmentStatusChange called:', {
      shipmentId: shipment.id,
      currentStatus: shipment.status,
      newStatus,
      tenantId,
      userId,
    });

    // Only handle inventory updates when shipment moves to COMPLETED status
    if (
      newStatus === ShipmentStatus.COMPLETED &&
      shipment.status === ShipmentStatus.PENDING
    ) {
      console.log('Updating inventory for completed shipment:', shipment.id);
      // When a shipment is completed, we need to update the inventory
      // For purchase orders (INCOMING_FULL), this means adding to inventory
      await updateInventoryFromCompletedShipment(shipment, tenantId, userId);
      console.log('Successfully updated inventory for shipment:', shipment.id);
    } else {
      console.log('No inventory update needed:', {
        newStatus,
        currentStatus: shipment.status,
        condition:
          newStatus === ShipmentStatus.COMPLETED &&
          shipment.status === ShipmentStatus.PENDING,
      });
    }
  } catch (error) {
    console.error('Error handling shipment status change:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      shipmentId: shipment.id,
    });
    throw error;
  }
}

async function updateInventoryFromCompletedShipment(
  shipment: any,
  tenantId: string,
  userId: string
) {
  try {
    console.log(
      'Processing inventory update for shipment:',
      shipment.id,
      'type:',
      shipment.shipmentType
    );
    let fullCylinderChange = 0;
    let emptyCylinderChange = 0;
    let movementType: MovementType = MovementType.ADJUSTMENT_POSITIVE;

    // Calculate inventory changes based on shipment type
    switch (shipment.shipmentType) {
      case 'INCOMING_FULL':
        // Completed purchase order - add to full cylinder inventory
        fullCylinderChange = shipment.quantity;

        // Determine movement type based on purchase type from notes
        if (shipment.notes?.includes('REFILL:')) {
          movementType = MovementType.PURCHASE_REFILL;
        } else if (shipment.notes?.includes('PACKAGE:')) {
          movementType = MovementType.PURCHASE_PACKAGE;
        } else {
          movementType = MovementType.PURCHASE_PACKAGE; // Default for incoming full
        }
        break;

      case 'INCOMING_EMPTY':
        // Completed empty cylinder purchase - add to empty cylinder inventory
        emptyCylinderChange = shipment.quantity;
        movementType = MovementType.EMPTY_CYLINDER_BUY;
        break;

      case 'OUTGOING_FULL':
        // Completed outgoing shipment - remove from full cylinder inventory
        fullCylinderChange = -shipment.quantity;
        movementType = MovementType.TRANSFER_OUT;
        break;

      case 'OUTGOING_EMPTY':
        // Completed empty cylinder sale - remove from empty cylinder inventory
        emptyCylinderChange = -shipment.quantity;
        movementType = MovementType.EMPTY_CYLINDER_SELL;
        break;
    }

    // Create inventory movement records for the completed shipment
    if (fullCylinderChange !== 0) {
      console.log('Creating inventory movement with data:', {
        tenantId,
        productId: shipment.productId,
        type: movementType,
        quantity: Math.abs(fullCylinderChange),
        description: `Completed Shipment: ${shipment.shipmentType} - ${fullCylinderChange > 0 ? 'Added' : 'Removed'} ${Math.abs(fullCylinderChange)} full cylinders`,
        reference: `Completed Shipment: ${shipment.invoiceNumber || shipment.id}`,
        driverId: null, // Set to null since shipment completions are system-level, not driver-specific
      });

      await prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: shipment.productId,
          type: movementType,
          quantity: Math.abs(fullCylinderChange),
          description: `Completed Shipment: ${shipment.shipmentType} - ${fullCylinderChange > 0 ? 'Added' : 'Removed'} ${Math.abs(fullCylinderChange)} full cylinders`,
          reference: `Completed Shipment: ${shipment.invoiceNumber || shipment.id}`,
          driverId: null, // Set to null since shipment completions are system-level, not driver-specific
        },
      });
    }

    if (emptyCylinderChange !== 0) {
      const emptyMovementType =
        emptyCylinderChange > 0 ? 'EMPTY_CYLINDER_BUY' : 'EMPTY_CYLINDER_SELL';
      console.log('Creating empty cylinder movement with data:', {
        tenantId,
        productId: shipment.productId,
        type: emptyMovementType,
        quantity: Math.abs(emptyCylinderChange),
        description: `Completed Shipment: ${shipment.shipmentType} - ${emptyCylinderChange > 0 ? 'Added' : 'Removed'} ${Math.abs(emptyCylinderChange)} empty cylinders`,
        reference: `Completed Shipment: ${shipment.invoiceNumber || shipment.id}`,
        driverId: null, // Set to null since shipment completions are system-level, not driver-specific
      });

      await prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: shipment.productId,
          type: emptyMovementType,
          quantity: Math.abs(emptyCylinderChange),
          description: `Completed Shipment: ${shipment.shipmentType} - ${emptyCylinderChange > 0 ? 'Added' : 'Removed'} ${Math.abs(emptyCylinderChange)} empty cylinders`,
          reference: `Completed Shipment: ${shipment.invoiceNumber || shipment.id}`,
          driverId: null, // Set to null since shipment completions are system-level, not driver-specific
        },
      });
    }

    // For purchase orders (INCOMING_FULL), create a purchase record if it doesn't exist
    if (shipment.shipmentType === 'INCOMING_FULL' && shipment.unitCost) {
      // Check if purchase record already exists
      const existingPurchase = await prisma.purchase.findFirst({
        where: {
          tenantId,
          notes: {
            contains: shipment.id,
          },
        },
      });

      if (!existingPurchase) {
        // Extract purchase type from notes
        let purchaseType = 'PACKAGE'; // Default
        if (shipment.notes?.includes('REFILL:')) {
          purchaseType = 'REFILL';
        } else if (shipment.notes?.includes('PACKAGE:')) {
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
            notes: `Auto-generated from completed shipment: ${shipment.id}`,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error updating inventory from completed shipment:', error);
    console.error('Inventory update error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      shipmentId: shipment.id,
      shipmentType: shipment.shipmentType,
    });
    throw error;
  }
}
