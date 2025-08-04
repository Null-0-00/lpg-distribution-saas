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

      // We need to find a product that matches the cylinder size for proper tracking
      const matchingProduct = await tx.product.findFirst({
        where: {
          tenantId,
          cylinderSize: {
            size: customerReceivable.size || '12L', // Default to 12L if no size specified
          },
        },
        select: { id: true, name: true, size: true },
      });

      if (todaySales && matchingProduct) {
        // Check if the existing sale is for the same product/size
        const existingSaleProduct = await tx.product.findFirst({
          where: { id: todaySales.productId },
          include: { cylinderSize: true },
        });

        if (
          existingSaleProduct?.cylinderSize?.size === customerReceivable.size
        ) {
          // Update the sales record to add the cylinder return to deposits (same size)
          await tx.sale.update({
            where: { id: todaySales.id },
            data: {
              cylindersDeposited: { increment: data.quantity },
            },
          });
        } else {
          // Create a size-specific deposit record for the exact cylinder size
          await tx.sale.create({
            data: {
              tenantId,
              userId: session.user.id,
              driverId: customerReceivable.driverId,
              productId: matchingProduct.id,
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
              notes: `Receivable cylinder return: ${data.quantity} cylinders of ${customerReceivable.size}${data.notes ? ` - ${data.notes}` : ''}`,
            },
          });
        }
      } else {
        // Fallback: Get any product ID but prefer one that matches the size
        const fallbackProduct =
          matchingProduct ||
          (await tx.product.findFirst({
            where: { tenantId },
            select: { id: true },
          }));

        // Create a size-specific deposit-only sale record
        await tx.sale.create({
          data: {
            tenantId,
            userId: session.user.id,
            driverId: customerReceivable.driverId,
            productId: fallbackProduct?.id || '',
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
            notes: `Receivable cylinder return: ${data.quantity} cylinders of ${customerReceivable.size || 'Unknown size'}${data.notes ? ` - ${data.notes}` : ''}`,
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

    // CRITICAL FIX: Sync receivables record with actual customer receivables
    await syncReceivablesWithCustomerReceivables(
      tenantId,
      customerReceivable.driverId
    );

    // 🔔 TRIGGER CUSTOMER CYLINDER RETURN MESSAGING
    // Find the customer associated with this receivable
    const customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        name: customerReceivable.customerName,
        isActive: true,
      },
    });

    if (customer && customer.phone) {
      // Calculate updated receivables after cylinder return by summing all remaining customer receivables
      const remainingReceivables = await prisma.customerReceivable.aggregate({
        where: {
          tenantId,
          customerName: customer.name,
          status: { not: 'PAID' },
        },
        _sum: {
          amount: true,
          quantity: true,
        },
      });

      const updatedCashReceivables = remainingReceivables._sum.amount || 0;
      const updatedCylinderReceivables =
        remainingReceivables._sum.quantity || 0;

      // Get current user for "receivedBy"
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      const { notifyCustomerCylinderReturn } = await import(
        '@/lib/messaging/receivables-messaging'
      );

      await notifyCustomerCylinderReturn({
        tenantId,
        customerId: customer.id,
        customerName: customer.name,
        quantity: data.quantity,
        size: customerReceivable.size || '12L',
        updatedCashReceivables,
        updatedCylinderReceivables,
        receivedBy: currentUser?.name || 'অ্যাডমিন',
      });
    } else {
      console.log(
        `📞 Customer cylinder return notification skipped - customer ${customerReceivable.customerName} not found or no phone`
      );
    }

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

// CRITICAL FIX: Sync receivables record with actual customer receivables
async function syncReceivablesWithCustomerReceivables(
  tenantId: string,
  driverId: string
) {
  console.log(
    `🔄 Syncing receivables record with customer receivables for driver ${driverId}`
  );

  // Get actual outstanding customer receivables
  const customerReceivables = await prisma.customerReceivable.groupBy({
    by: ['receivableType'],
    where: {
      tenantId,
      driverId,
      status: { not: 'PAID' },
    },
    _sum: {
      amount: true,
      quantity: true,
    },
  });

  let actualCashReceivables = 0;
  let actualCylinderReceivables = 0;

  customerReceivables.forEach((group) => {
    if (group.receivableType === 'CASH') {
      actualCashReceivables = group._sum.amount || 0;
    } else if (group.receivableType === 'CYLINDER') {
      actualCylinderReceivables = group._sum.quantity || 0;
    }
  });

  console.log(
    `📊 Actual customer receivables: Cash=${actualCashReceivables}, Cylinders=${actualCylinderReceivables}`
  );

  // Get the latest receivables record
  const latestRecord = await prisma.receivableRecord.findFirst({
    where: { tenantId, driverId },
    orderBy: { date: 'desc' },
  });

  if (latestRecord) {
    console.log(
      `📊 Current record: Cash=${latestRecord.totalCashReceivables}, Cylinders=${latestRecord.totalCylinderReceivables}`
    );

    // Only update if there's a mismatch
    if (
      latestRecord.totalCashReceivables !== actualCashReceivables ||
      latestRecord.totalCylinderReceivables !== actualCylinderReceivables
    ) {
      console.log(`🔧 Fixing mismatch - updating receivables record`);

      await prisma.receivableRecord.update({
        where: { id: latestRecord.id },
        data: {
          totalCashReceivables: actualCashReceivables,
          totalCylinderReceivables: actualCylinderReceivables,
          calculatedAt: new Date(),
        },
      });

      console.log(`✅ Receivables record synced successfully`);
    } else {
      console.log(`✅ Receivables already in sync`);
    }
  }
}
