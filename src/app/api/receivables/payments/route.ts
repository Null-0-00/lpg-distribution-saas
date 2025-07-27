import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Clear receivables cache after updates
const receivablesCache = new Map<string, { data: any; timestamp: number }>();

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
        // Get any product ID to satisfy the foreign key constraint
        const anyProduct = await tx.product.findFirst({
          where: { tenantId },
          select: { id: true },
        });

        // Create a new deposit-only sale record
        await tx.sale.create({
          data: {
            tenantId,
            userId: session.user.id,
            driverId: customerReceivable.driverId,
            productId: anyProduct?.id || '', // Use a real product ID or empty string
            saleDate: today,
            saleType: 'PACKAGE',
            paymentType: 'CASH',
            quantity: 0,
            unitPrice: 0,
            totalValue: 0,
            discount: 0,
            netValue: 0,
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

    // Recalculate receivables for today to update the driver's totals
    const today = new Date();
    await calculateDailyReceivablesForDate(
      tenantId,
      customerReceivable.driverId,
      today
    );

    // Clear cache to force fresh data on next request
    receivablesCache.clear();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate daily receivables for a specific driver and date
async function calculateDailyReceivablesForDate(
  tenantId: string,
  driverId: string,
  date: Date
) {
  const dateStr = date.toISOString().split('T')[0];

  // Get driver's sales for the date
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const salesData = await prisma.sale.aggregate({
    where: {
      tenantId,
      driverId: driverId,
      saleDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: {
      totalValue: true,
      discount: true,
      cashDeposited: true,
      cylindersDeposited: true,
    },
  });

  // Calculate refill sales for cylinder receivables
  const refillSales = await prisma.sale.aggregate({
    where: {
      tenantId,
      driverId: driverId,
      saleDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      saleType: 'REFILL',
    },
    _sum: {
      quantity: true,
    },
  });

  const driverSalesRevenue = salesData._sum.totalValue || 0;
  const cashDeposits = salesData._sum.cashDeposited || 0;
  const discounts = salesData._sum.discount || 0;
  const cylinderDeposits = salesData._sum.cylindersDeposited || 0;
  const refillQuantity = refillSales._sum.quantity || 0;

  // EXACT FORMULAS:
  // Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
  const cashReceivablesChange = driverSalesRevenue - cashDeposits - discounts;

  // Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
  const cylinderReceivablesChange = refillQuantity - cylinderDeposits;

  // Get previous receivables (yesterday's record or onboarding receivables)
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  yesterday.setHours(0, 0, 0, 0);

  // First try to get yesterday's record
  const yesterdayRecord = await prisma.receivableRecord.findFirst({
    where: {
      tenantId,
      driverId: driverId,
      date: {
        gte: yesterday,
        lt: date,
      },
    },
    orderBy: { date: 'desc' },
  });

  let yesterdayCashTotal = 0;
  let yesterdayCylinderTotal = 0;

  if (yesterdayRecord) {
    yesterdayCashTotal = yesterdayRecord.totalCashReceivables;
    yesterdayCylinderTotal = yesterdayRecord.totalCylinderReceivables;
  } else {
    // If no yesterday record, check for onboarding receivables (first record)
    const onboardingRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId: driverId,
      },
      orderBy: { date: 'asc' },
    });

    if (onboardingRecord) {
      yesterdayCashTotal = onboardingRecord.totalCashReceivables;
      yesterdayCylinderTotal = onboardingRecord.totalCylinderReceivables;
    }
  }

  // EXACT FORMULAS:
  // Today's Total = Yesterday's Total + Today's Changes
  const totalCashReceivables = yesterdayCashTotal + cashReceivablesChange;
  const totalCylinderReceivables =
    yesterdayCylinderTotal + cylinderReceivablesChange;

  // Upsert the receivable record
  const recordDate = new Date(dateStr + 'T00:00:00.000Z');

  await prisma.receivableRecord.upsert({
    where: {
      tenantId_driverId_date: {
        tenantId,
        driverId: driverId,
        date: recordDate,
      },
    },
    update: {
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables,
      totalCylinderReceivables,
    },
    create: {
      tenantId,
      driverId: driverId,
      date: recordDate,
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables,
      totalCylinderReceivables,
    },
  });
}
