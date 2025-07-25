import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId,
      },
      include: {
        company: true,
        items: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        approvedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    console.error('Get purchase order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
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
      status,
      expectedDeliveryDate,
      actualDeliveryDate,
      notes,
      priority,
      items,
    } = data;

    const tenantId = session.user.tenantId;
    const userId = session.user.id;

    // Get existing purchase order
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id: id,
        tenantId,
      },
      include: {
        items: true,
      },
    });

    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;

      // If approving, set approval info
      if (status === 'APPROVED' && existingPO.status === 'PENDING') {
        updateData.approvedBy = userId;
        updateData.approvedAt = new Date();
      }
    }

    if (expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = expectedDeliveryDate
        ? new Date(expectedDeliveryDate)
        : null;
    }

    if (actualDeliveryDate !== undefined) {
      updateData.actualDeliveryDate = actualDeliveryDate
        ? new Date(actualDeliveryDate)
        : null;
    }

    if (notes !== undefined) updateData.notes = notes;
    if (priority !== undefined) updateData.priority = priority;

    // If items are provided, update them
    if (items && Array.isArray(items)) {
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

      // Calculate new total amount
      const newTotalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      updateData.totalAmount = newTotalAmount;

      // Update purchase order and replace items
      const updatedPO = await prisma.purchaseOrder.update({
        where: { id: id },
        data: {
          ...updateData,
          items: {
            deleteMany: {},
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              receivedQuantity: item.receivedQuantity || 0,
              notes: item.notes,
            })),
          },
        },
        include: {
          company: true,
          items: {
            include: {
              product: true,
            },
          },
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          approvedByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        purchaseOrder: updatedPO,
        message: 'Purchase order updated successfully',
      });
    } else {
      // Update without changing items
      const updatedPO = await prisma.purchaseOrder.update({
        where: { id: id },
        data: updateData,
        include: {
          company: true,
          items: {
            include: {
              product: true,
            },
          },
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          approvedByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        purchaseOrder: updatedPO,
        message: 'Purchase order updated successfully',
      });
    }
  } catch (error) {
    console.error('Update purchase order error:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
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

    // Check if purchase order exists
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: id,
        tenantId,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check if purchase order can be deleted (only PENDING or CANCELED orders)
    if (!['PENDING', 'CANCELED'].includes(purchaseOrder.status)) {
      return NextResponse.json(
        {
          error:
            'Cannot delete purchase order that has been approved or received',
        },
        { status: 400 }
      );
    }

    // Delete the purchase order (items will be deleted automatically due to cascade)
    await prisma.purchaseOrder.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: 'Purchase order deleted successfully',
    });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    );
  }
}
