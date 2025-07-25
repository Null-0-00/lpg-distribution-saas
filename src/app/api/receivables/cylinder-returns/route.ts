import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Clear receivables cache after updates
const receivablesCache = new Map<string, { data: any; timestamp: number }>();

const cylinderReturnSchema = z.object({
  customerReceivableId: z.string(),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = cylinderReturnSchema.parse(body);
    const tenantId = session.user.tenantId;

    // Verify customer receivable exists, belongs to tenant, and is for a retail driver
    const customerReceivable = await prisma.customerReceivable.findFirst({
      where: {
        id: data.customerReceivableId,
        tenantId,
        receivableType: 'CYLINDER',
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

    if (data.quantity > customerReceivable.quantity) {
      return NextResponse.json(
        { error: 'Return quantity exceeds outstanding cylinders' },
        { status: 400 }
      );
    }

    // Use a transaction to update the receivable and add to daily deposits
    await prisma.$transaction(async (tx) => {
      const newQuantity = customerReceivable.quantity - data.quantity;
      const newStatus = newQuantity <= 0 ? 'PAID' : customerReceivable.status;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Update customer receivable
      await tx.customerReceivable.update({
        where: { id: data.customerReceivableId },
        data: {
          quantity: newQuantity,
          status: newStatus as any,
        },
      });

      // Add cylinder return to daily deposits - find today's sales record for this driver
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
        // Update the sales record to add the cylinder return to deposits
        await tx.sale.update({
          where: { id: todaySales.id },
          data: {
            cylindersDeposited: { increment: data.quantity },
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
            saleType: 'REFILL',
            paymentType: 'CASH',
            quantity: 0,
            unitPrice: 0,
            totalValue: 0,
            discount: 0,
            netValue: 0,
            cashDeposited: 0,
            cylindersDeposited: data.quantity,
            customerName: customerReceivable.customerName,
            notes: `Receivable cylinder return: ${data.quantity} cylinders${data.notes ? ` - ${data.notes}` : ''}`,
          },
        });
      }

      // Create return record by updating notes
      await tx.customerReceivable.update({
        where: { id: data.customerReceivableId },
        data: {
          notes: `${customerReceivable.notes || ''}\nReturn: ${data.quantity} cylinders returned on ${new Date().toLocaleDateString()}${data.notes ? ` - ${data.notes}` : ''}`,
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
            quantity: customerReceivable.quantity,
            status: customerReceivable.status,
          },
          newValues: { quantity: newQuantity, status: newStatus },
          metadata: {
            returnQuantity: data.quantity,
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
    console.error('Error recording cylinder return:', error);
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

  // Get yesterday's totals
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayRecord = await prisma.receivableRecord.findFirst({
    where: {
      tenantId,
      driverId: driverId,
      date: new Date(yesterdayStr + 'T00:00:00.000Z'),
    },
  });

  const yesterdayCashTotal = yesterdayRecord?.totalCashReceivables || 0;
  const yesterdayCylinderTotal = yesterdayRecord?.totalCylinderReceivables || 0;

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
