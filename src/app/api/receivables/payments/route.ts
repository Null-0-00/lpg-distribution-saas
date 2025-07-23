import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paymentSchema = z.object({
  customerReceivableId: z.string(),
  amount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'digital_payment']),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = paymentSchema.parse(body);
    const tenantId = session.user.tenantId;

    // Verify customer receivable exists, belongs to tenant, and is for a retail driver
    const customerReceivable = await prisma.customerReceivable.findFirst({
      where: {
        id: data.customerReceivableId,
        tenantId,
        receivableType: 'CASH',
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            driverType: true,
          },
        },
      },
    });

    if (!customerReceivable) {
      return NextResponse.json(
        { error: 'Customer receivable not found' },
        { status: 404 }
      );
    }

    if (data.amount > customerReceivable.amount) {
      return NextResponse.json(
        { error: 'Payment amount exceeds outstanding balance' },
        { status: 400 }
      );
    }

    // Use a transaction to update the receivable and add to daily deposits
    await prisma.$transaction(async (tx) => {
      const newAmount = customerReceivable.amount - data.amount;
      const newStatus = newAmount <= 0 ? 'PAID' : customerReceivable.status;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Update customer receivable
      await tx.customerReceivable.update({
        where: { id: data.customerReceivableId },
        data: {
          amount: newAmount,
          status: newStatus as any,
        },
      });

      // Add payment to daily deposits - find today's sales record for this driver
      const todaySales = await tx.sale.findFirst({
        where: {
          tenantId,
          driverId: customerReceivable.driverId,
          saleDate: {
            gte: new Date(todayStr + 'T00:00:00.000Z'),
            lt: new Date(
              new Date(today.getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0] + 'T00:00:00.000Z'
            ),
          },
        },
      });

      if (todaySales) {
        // Update the sales record to add the payment to deposits
        await tx.sale.update({
          where: { id: todaySales.id },
          data: {
            cashDeposited: { increment: data.amount },
          },
        });
      } else {
        // Create a new deposit-only sale record
        await tx.sale.create({
          data: {
            tenantId,
            driverId: customerReceivable.driverId,
            productId: 'receivable-payment', // Special identifier for receivable payments
            saleDate: today,
            saleType: 'PACKAGE',
            paymentType: 'CASH',
            quantity: 0,
            unitPrice: 0,
            totalValue: 0,
            discount: 0,
            finalPrice: 0,
            cashDeposited: data.amount,
            cylindersDeposited: 0,
            customerName: customerReceivable.customerName,
            notes: `Receivable payment: ৳${data.amount} via ${data.paymentMethod}${data.notes ? ` - ${data.notes}` : ''}`,
          },
        });
      }

      // Create payment record in notes
      await tx.customerReceivable.update({
        where: { id: data.customerReceivableId },
        data: {
          notes: `${customerReceivable.notes || ''}\nPayment: ৳${data.amount} via ${data.paymentMethod} on ${new Date().toLocaleDateString()}${data.notes ? ` - ${data.notes}` : ''}`,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: session.user.id,
          action: 'UPDATE',
          entityType: 'CustomerReceivable',
          entityId: customerReceivable.id,
          oldValues: {
            amount: customerReceivable.amount,
            status: customerReceivable.status,
          },
          newValues: { amount: newAmount, status: newStatus },
          metadata: {
            paymentAmount: data.amount,
            paymentMethod: data.paymentMethod,
            customerName: customerReceivable.customerName,
            driverName: customerReceivable.driver.name,
            notes: data.notes,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
