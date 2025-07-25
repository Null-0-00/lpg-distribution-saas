import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverName = searchParams.get('driver');
    const tenantId = session.user.tenantId;

    if (!driverName) {
      return NextResponse.json(
        { error: 'Driver name required' },
        { status: 400 }
      );
    }

    // Find the driver
    const driver = await prisma.driver.findFirst({
      where: {
        tenantId,
        name: {
          contains: driverName,
          mode: 'insensitive',
        },
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
      select: {
        id: true,
        name: true,
        status: true,
        driverType: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    console.log(
      `Debugging receivables for driver: ${driver.name} (${driver.id})`
    );

    // Get customer receivables
    const customerReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId,
        driverId: driver.id,
      },
      select: {
        id: true,
        customerName: true,
        receivableType: true,
        amount: true,
        quantity: true,
        size: true,
        status: true,
        dueDate: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get receivable records (sales-based calculations)
    const receivableRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
        driverId: driver.id,
      },
      select: {
        id: true,
        date: true,
        cashReceivablesChange: true,
        cylinderReceivablesChange: true,
        totalCashReceivables: true,
        totalCylinderReceivables: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });

    // Get recent sales data
    const recentSales = await prisma.sale.findMany({
      where: {
        tenantId,
        driverId: driver.id,
        saleDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        id: true,
        saleDate: true,
        saleType: true,
        quantity: true,
        totalValue: true,
        discount: true,
        cashDeposited: true,
        cylindersDeposited: true,
        customerName: true,
        product: {
          select: {
            name: true,
            size: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    // Calculate customer totals
    const customerCashTotal = customerReceivables
      .filter((r) => r.receivableType === 'CASH' && r.status === 'CURRENT')
      .reduce((sum, r) => sum + r.amount, 0);

    const customerCylinderTotal = customerReceivables
      .filter((r) => r.receivableType === 'CYLINDER' && r.status === 'CURRENT')
      .reduce((sum, r) => sum + r.quantity, 0);

    // Get latest receivable record totals
    const latestRecord = receivableRecords[0];
    const salesCashTotal = latestRecord?.totalCashReceivables || 0;
    const salesCylinderTotal = latestRecord?.totalCylinderReceivables || 0;

    // Calculate totals from recent sales for verification
    const salesTotals = recentSales.reduce(
      (acc, sale) => {
        const cashReceivable =
          sale.totalValue - sale.discount - sale.cashDeposited;
        const cylinderReceivable =
          sale.saleType === 'REFILL'
            ? sale.quantity - sale.cylindersDeposited
            : 0;

        return {
          totalSalesValue: acc.totalSalesValue + sale.totalValue,
          totalCashDeposited: acc.totalCashDeposited + sale.cashDeposited,
          totalDiscounts: acc.totalDiscounts + sale.discount,
          totalCylinderDeposited:
            acc.totalCylinderDeposited + sale.cylindersDeposited,
          calculatedCashReceivables:
            acc.calculatedCashReceivables + Math.max(0, cashReceivable),
          calculatedCylinderReceivables:
            acc.calculatedCylinderReceivables + Math.max(0, cylinderReceivable),
          refillSalesQty:
            acc.refillSalesQty +
            (sale.saleType === 'REFILL' ? sale.quantity : 0),
        };
      },
      {
        totalSalesValue: 0,
        totalCashDeposited: 0,
        totalDiscounts: 0,
        totalCylinderDeposited: 0,
        calculatedCashReceivables: 0,
        calculatedCylinderReceivables: 0,
        refillSalesQty: 0,
      }
    );

    return NextResponse.json({
      driver,
      summary: {
        customerReceivables: {
          cash: customerCashTotal,
          cylinders: customerCylinderTotal,
          count: customerReceivables.length,
        },
        salesCalculated: {
          cash: salesCashTotal,
          cylinders: salesCylinderTotal,
          latestRecordDate: latestRecord?.date,
        },
        discrepancy: {
          cash: Math.abs(customerCashTotal - salesCashTotal),
          cylinders: Math.abs(customerCylinderTotal - salesCylinderTotal),
          hasCashMismatch: Math.abs(customerCashTotal - salesCashTotal) > 0.01,
          hasCylinderMismatch: customerCylinderTotal !== salesCylinderTotal,
        },
      },
      details: {
        customerReceivables,
        receivableRecords,
        recentSales,
        salesTotals,
      },
    });
  } catch (error) {
    console.error('Error debugging receivables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
