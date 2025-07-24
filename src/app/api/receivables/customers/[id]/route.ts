import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCustomerReceivableSchema = z.object({
  customerName: z.string().optional(),
  receivableType: z.enum(['CASH', 'CYLINDER']).optional(),
  amount: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateCustomerReceivableSchema.parse(body);
    const tenantId = session.user.tenantId;

    // Verify customer receivable exists, belongs to tenant, and is for a retail driver
    const existingReceivable = await prisma.customerReceivable.findFirst({
      where: {
        id,
        tenantId,
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            driverType: true,
          },
        },
      },
    });

    if (!existingReceivable) {
      return NextResponse.json(
        { error: 'Customer receivable not found or not for retail driver' },
        { status: 404 }
      );
    }

    // Determine status if due date is being updated
    let status = existingReceivable.status;
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const today = new Date();
      const daysDiff = Math.floor(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff < 0) {
        status = 'OVERDUE';
      } else if (daysDiff <= 3) {
        status = 'DUE_SOON';
      } else {
        status = 'CURRENT';
      }
    }

    const updatedReceivable = await prisma.$transaction(async (tx) => {
      const receivable = await tx.customerReceivable.update({
        where: { id },
        data: {
          ...data,
          amount:
            data.receivableType === 'CASH'
              ? data.amount
              : data.receivableType === 'CYLINDER'
                ? 0
                : data.amount,
          quantity:
            data.receivableType === 'CYLINDER'
              ? data.quantity
              : data.receivableType === 'CASH'
                ? 0
                : data.quantity,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          status: status as any,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: session.user.id,
          action: 'UPDATE',
          entityType: 'CustomerReceivable',
          entityId: receivable.id,
          oldValues: {
            customerName: existingReceivable.customerName,
            receivableType: existingReceivable.receivableType,
            amount: existingReceivable.amount,
            quantity: existingReceivable.quantity,
            dueDate: existingReceivable.dueDate,
            status: existingReceivable.status,
          },
          newValues: {
            customerName: receivable.customerName,
            receivableType: receivable.receivableType,
            amount: receivable.amount,
            quantity: receivable.quantity,
            dueDate: receivable.dueDate,
            status: receivable.status,
          },
          metadata: {
            notes: receivable.notes,
          },
        },
      });

      return receivable;
    });

    return NextResponse.json({
      success: true,
      customerReceivable: {
        id: updatedReceivable.id,
        customerName: updatedReceivable.customerName,
        receivableType: updatedReceivable.receivableType,
        amount: updatedReceivable.amount,
        quantity: updatedReceivable.quantity,
        dueDate: updatedReceivable.dueDate?.toISOString().split('T')[0] || '',
        status: updatedReceivable.status,
        notes: updatedReceivable.notes,
      },
    });
  } catch (error) {
    console.error('Error updating customer receivable:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Verify customer receivable exists, belongs to tenant, and is for a retail driver
    const existingReceivable = await prisma.customerReceivable.findFirst({
      where: {
        id,
        tenantId,
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            driverType: true,
          },
        },
      },
    });

    if (!existingReceivable) {
      return NextResponse.json(
        { error: 'Customer receivable not found or not for retail driver' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.customerReceivable.delete({
        where: { id },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: session.user.id,
          action: 'DELETE',
          entityType: 'CustomerReceivable',
          entityId: id,
          oldValues: {
            customerName: existingReceivable.customerName,
            receivableType: existingReceivable.receivableType,
            amount: existingReceivable.amount,
            quantity: existingReceivable.quantity,
            dueDate: existingReceivable.dueDate,
            status: existingReceivable.status,
          },
          metadata: {
            notes: existingReceivable.notes,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer receivable:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
