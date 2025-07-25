import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Simple in-memory cache for receivables data (expires after 30 seconds)
const receivablesCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

const customerReceivableSchema = z.object({
  driverId: z.string(),
  customerName: z.string(),
  receivableType: z.enum(['CASH', 'CYLINDER']),
  amount: z.number().min(0),
  quantity: z.number().min(0),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const tenantId = session.user.tenantId;

    // Set cache headers for better performance
    const headers = new Headers({
      'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      'Content-Type': 'application/json',
    });

    // Check in-memory cache first
    const cacheKey = `receivables:${tenantId}:${driverId || 'all'}`;
    const cachedData = receivablesCache.get(cacheKey);

    // Disable cache for immediate data refresh during debugging
    if (
      false &&
      cachedData &&
      Date.now() - cachedData!.timestamp < CACHE_DURATION
    ) {
      return NextResponse.json(cachedData!.data, { headers });
    }

    const where: any = { tenantId };
    if (driverId) {
      where.driverId = driverId;
    }

    // Get customer receivables with retail driver info only (optimized query)
    const customerReceivables = await prisma.customerReceivable.findMany({
      where: {
        ...where,
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL',
        },
      },
      select: {
        id: true,
        driverId: true,
        customerName: true,
        receivableType: true,
        amount: true,
        quantity: true,
        size: true,
        dueDate: true,
        status: true,
        notes: true,
        driver: {
          select: {
            id: true,
            name: true,
            status: true,
            driverType: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    // Get all active retail drivers with their latest receivables records
    const activeDriversWithReceivables = await prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
      select: {
        id: true,
        name: true,
        receivableRecords: {
          select: {
            date: true,
            totalCashReceivables: true,
            totalCylinderReceivables: true,
          },
          take: 1,
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate current date and check for missing records
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Find drivers that either have no records or their latest record is not from today
    const driversNeedingUpdate = activeDriversWithReceivables.filter((d) => {
      if (d.receivableRecords.length === 0) return true;
      const latestRecord = d.receivableRecords[0];
      const latestRecordDate = latestRecord.date.toISOString().split('T')[0];
      return latestRecordDate !== todayStr;
    });

    // Trigger background calculation for missing dates (non-blocking)
    if (driversNeedingUpdate.length > 0) {
      setImmediate(async () => {
        try {
          // Calculate receivables for the past 7 days to ensure we have up-to-date data
          for (let i = 6; i >= 0; i--) {
            const calcDate = new Date(
              today.getTime() - i * 24 * 60 * 60 * 1000
            );
            await calculateDailyReceivablesForDate(tenantId, calcDate);
          }
        } catch (error) {
          console.error('Background receivables calculation failed:', error);
        }
      });
    }

    // Create a simple receivables map
    const salesReceivablesMap = new Map(
      activeDriversWithReceivables.map((driver) => {
        const record = driver.receivableRecords[0];
        return [
          driver.id,
          {
            cash: record?.totalCashReceivables || 0,
            cylinders: record?.totalCylinderReceivables || 0,
          },
        ];
      })
    );

    // Create a map of customer receivables by driver for efficient lookup
    const customerReceivablesMap = new Map<
      string,
      typeof customerReceivables
    >();
    customerReceivables.forEach((receivable) => {
      if (!customerReceivablesMap.has(receivable.driverId)) {
        customerReceivablesMap.set(receivable.driverId, []);
      }
      customerReceivablesMap.get(receivable.driverId)!.push(receivable);
    });

    // Create driver entries for all active drivers, including those without customer receivables
    const driverReceivables = activeDriversWithReceivables.map((driver) => {
      const salesTotals = salesReceivablesMap.get(driver.id) || {
        cash: 0,
        cylinders: 0,
      };

      // Get customer receivables for this driver (optimized lookup)
      const driverCustomerReceivables =
        customerReceivablesMap.get(driver.id) || [];

      // Calculate customer totals for validation and display
      const customerCashTotal = driverCustomerReceivables
        .filter((r) => r.receivableType === 'CASH')
        .reduce((sum, r) => sum + r.amount, 0);

      const customerCylinderTotal = driverCustomerReceivables
        .filter((r) => r.receivableType === 'CYLINDER')
        .reduce((sum, r) => sum + r.quantity, 0);

      // Calculate CURRENT customer totals (what's actually displayed in tables)
      const currentCustomerCashTotal = driverCustomerReceivables
        .filter((r) => r.receivableType === 'CASH' && r.status === 'CURRENT')
        .reduce((sum, r) => sum + r.amount, 0);

      const currentCustomerCylinderTotal = driverCustomerReceivables
        .filter(
          (r) => r.receivableType === 'CYLINDER' && r.status === 'CURRENT'
        )
        .reduce((sum, r) => sum + r.quantity, 0);

      // Check for validation errors (customer totals should match sales-calculated totals)
      const cashMismatch =
        Math.abs(customerCashTotal - salesTotals.cash) > 0.01;
      const cylinderMismatch = customerCylinderTotal !== salesTotals.cylinders;

      return {
        id: driver.id,
        driverName: driver.name,
        totalCashReceivables: salesTotals.cash, // FROM SALES ONLY - Non-editable
        totalCylinderReceivables: salesTotals.cylinders, // FROM SALES ONLY - Non-editable
        totalReceivables: salesTotals.cash,
        salesCashReceivables: salesTotals.cash, // For validation
        salesCylinderReceivables: salesTotals.cylinders, // For validation
        customerCashTotal, // For validation (all statuses)
        customerCylinderTotal, // For validation (all statuses)
        currentCustomerCashTotal, // Current status only
        currentCustomerCylinderTotal, // Current status only
        hasValidationError: cashMismatch || cylinderMismatch,
        customerBreakdown: driverCustomerReceivables.map((receivable) => ({
          id: receivable.id,
          customerName: receivable.customerName,
          receivableType: receivable.receivableType,
          amount: receivable.amount,
          quantity: receivable.quantity,
          size: receivable.size,
          dueDate: receivable.dueDate
            ? receivable.dueDate.toISOString().split('T')[0]
            : '',
          status: receivable.status,
          notes: receivable.notes,
        })),
      };
    });

    // Create validation errors for drivers with mismatched totals
    const validationErrors = driverReceivables
      .filter((driver) => driver.hasValidationError)
      .map((driver) => ({
        driverId: driver.id,
        driverName: driver.driverName,
        cashMismatch:
          Math.abs(driver.customerCashTotal - driver.salesCashReceivables) >
          0.01
            ? {
                customer: driver.customerCashTotal,
                sales: driver.salesCashReceivables,
                difference:
                  driver.customerCashTotal - driver.salesCashReceivables,
              }
            : null,
        cylinderMismatch:
          driver.customerCylinderTotal !== driver.salesCylinderReceivables
            ? {
                customer: driver.customerCylinderTotal,
                sales: driver.salesCylinderReceivables,
                difference:
                  driver.customerCylinderTotal -
                  driver.salesCylinderReceivables,
              }
            : null,
      }));

    const responseData = {
      driverReceivables,
      validationErrors: validationErrors.length > 0 ? validationErrors : null,
    };

    // Cache the response
    receivablesCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Error fetching customer receivables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const data = customerReceivableSchema.parse(body);
    const tenantId = session.user.tenantId;

    // Verify driver exists, belongs to tenant, and is a retail driver
    const driver = await prisma.driver.findFirst({
      where: {
        id: data.driverId,
        tenantId,
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Determine due date status
    let status = 'CURRENT';
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
      }
    }

    const customerReceivable = await prisma.$transaction(async (tx) => {
      const receivable = await tx.customerReceivable.create({
        data: {
          tenantId,
          driverId: data.driverId,
          customerName: data.customerName,
          receivableType: data.receivableType,
          amount: data.receivableType === 'CASH' ? data.amount : 0,
          quantity: data.receivableType === 'CYLINDER' ? data.quantity : 0,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          status: status as any,
          notes: data.notes,
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: session.user.id,
          action: 'CREATE',
          entityType: 'CustomerReceivable',
          entityId: receivable.id,
          newValues: {
            customerName: receivable.customerName,
            receivableType: receivable.receivableType,
            amount: receivable.amount,
            quantity: receivable.quantity,
            dueDate: receivable.dueDate,
            status: receivable.status,
          },
          metadata: {
            driverName: receivable.driver.name,
            notes: receivable.notes,
          },
        },
      });

      return receivable;
    });

    return NextResponse.json({
      success: true,
      customerReceivable: {
        id: customerReceivable.id,
        customerName: customerReceivable.customerName,
        receivableType: customerReceivable.receivableType,
        amount: customerReceivable.amount,
        quantity: customerReceivable.quantity,
        dueDate: customerReceivable.dueDate?.toISOString().split('T')[0] || '',
        status: customerReceivable.status,
        notes: customerReceivable.notes,
      },
    });
  } catch (error) {
    console.error('Error creating customer receivable:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate daily receivables for a specific date
async function calculateDailyReceivablesForDate(tenantId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];

  // Get all active retail drivers
  const drivers = await prisma.driver.findMany({
    where: { tenantId, status: 'ACTIVE', driverType: 'RETAIL' },
    select: { id: true },
  });

  for (const driver of drivers) {
    // Get driver's sales for the date
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    const salesData = await prisma.sale.aggregate({
      where: {
        tenantId,
        driverId: driver.id,
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
        driverId: driver.id,
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
        driverId: driver.id,
        date: new Date(yesterdayStr + 'T00:00:00.000Z'),
      },
    });

    const yesterdayCashTotal = yesterdayRecord?.totalCashReceivables || 0;
    const yesterdayCylinderTotal =
      yesterdayRecord?.totalCylinderReceivables || 0;

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
          driverId: driver.id,
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
        driverId: driver.id,
        date: recordDate,
        cashReceivablesChange,
        cylinderReceivablesChange,
        totalCashReceivables,
        totalCylinderReceivables,
      },
    });
  }
}
