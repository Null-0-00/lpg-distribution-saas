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
  size: z.string().nullable().optional(),
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

    // Clear cache completely to ensure fresh data
    receivablesCache.clear();

    // Always fetch fresh data for now to fix stale data issues
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

    // Get cylinder size breakdown from onboarding data (preserved separately from customer entries)
    const cylinderSizeBreakdowns = new Map<string, Record<string, number>>();

    for (const driver of activeDriversWithReceivables) {
      // STEP 1: Start with onboarding baseline breakdown by size
      const sizeBreakdown: Record<string, number> = {};

      // Get the PERMANENT baseline breakdown (onboarding receivables by size)
      const baselineBreakdown =
        await prisma.driverCylinderSizeBaseline.findMany({
          where: {
            tenantId,
            driverId: driver.id,
          },
          select: {
            baselineQuantity: true,
            cylinderSize: {
              select: {
                size: true,
              },
            },
          },
        });

      // Initialize with onboarding baseline
      if (baselineBreakdown.length > 0) {
        baselineBreakdown.forEach((item) => {
          const size = item.cylinderSize.size;
          sizeBreakdown[size] = item.baselineQuantity;
        });
        console.log(
          `📋 Starting with onboarding baseline for ${driver.name}:`,
          sizeBreakdown
        );
      } else {
        console.log(
          `⚠️ No baseline found for ${driver.name}, starting with empty breakdown`
        );
      }

      // STEP 2: Add/subtract sales data by specific cylinder sizes
      const salesWithCylinders = await prisma.sale.findMany({
        where: {
          tenantId,
          driverId: driver.id,
          saleType: 'REFILL',
        },
        select: {
          quantity: true,
          cylindersDeposited: true,
          product: {
            select: {
              name: true,
              size: true,
              cylinderSize: {
                select: {
                  size: true,
                },
              },
            },
          },
        },
      });

      // Apply sales transactions to the baseline
      salesWithCylinders.forEach((sale) => {
        const size =
          sale.product?.cylinderSize?.size ||
          sale.product?.size ||
          sale.product?.name ||
          'Unknown';
        const receivablesChange =
          (sale.quantity || 0) - (sale.cylindersDeposited || 0);

        // Add/subtract from the baseline for this specific size
        sizeBreakdown[size] = (sizeBreakdown[size] || 0) + receivablesChange;
      });

      // STEP 3: Calculate the total from size breakdown for consistency
      const calculatedTotal = Object.values(sizeBreakdown).reduce(
        (sum, qty) => sum + Math.max(0, qty),
        0
      );
      const recordedTotal =
        driver.receivableRecords[0]?.totalCylinderReceivables || 0;

      console.log(`🔍 Driver ${driver.name} calculation comparison:`, {
        baselineCount: baselineBreakdown.length,
        salesCount: salesWithCylinders.length,
        finalSizeBreakdown: sizeBreakdown,
        calculatedTotalFromBreakdown: calculatedTotal,
        recordedTotalFromDB: recordedTotal,
        match: calculatedTotal === recordedTotal,
      });

      // STEP 4: Display only positive values from the cumulative calculation
      const displaySizeBreakdown: Record<string, number> = {};
      Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
        if (quantity > 0) {
          displaySizeBreakdown[size] = quantity;
        }
      });

      console.log(`📋 Final cumulative size breakdown for ${driver.name}:`, {
        allSizes: sizeBreakdown,
        displayPositive: displaySizeBreakdown,
        displayTotal: Object.values(displaySizeBreakdown).reduce(
          (sum, qty) => sum + qty,
          0
        ),
      });
      cylinderSizeBreakdowns.set(driver.id, displaySizeBreakdown);
    }

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

    // Create a simple receivables map using calculated values for consistency
    const salesReceivablesMap = new Map(
      activeDriversWithReceivables.map((driver) => {
        const record = driver.receivableRecords[0];
        const sizeBreakdown = cylinderSizeBreakdowns.get(driver.id) || {};
        const calculatedCylinderTotal = Object.values(sizeBreakdown).reduce(
          (sum, qty) => sum + qty,
          0
        );

        return [
          driver.id,
          {
            cash: record?.totalCashReceivables || 0,
            cylinders: calculatedCylinderTotal, // Use calculated total instead of recorded total
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

      // Calculate customer cylinder breakdown by size for validation
      const customerCylinderSizeBreakdown: Record<string, number> = {};
      driverCustomerReceivables
        .filter(
          (r) => r.receivableType === 'CYLINDER' && r.status === 'CURRENT'
        )
        .forEach((r) => {
          const size = r.size || 'Unknown';
          customerCylinderSizeBreakdown[size] =
            (customerCylinderSizeBreakdown[size] || 0) + r.quantity;
        });

      // Get actual cylinder size breakdown from sales data
      const actualCylinderSizeBreakdown =
        cylinderSizeBreakdowns.get(driver.id) || {};

      // Check for validation errors (customer totals should match sales-calculated totals)
      const cashMismatch =
        Math.abs(customerCashTotal - salesTotals.cash) > 0.01;
      const cylinderMismatch = customerCylinderTotal !== salesTotals.cylinders;

      // Check for size-specific validation errors
      const sizeValidationErrors: Array<{
        size: string;
        customer: number;
        expected: number;
      }> = [];

      // Check if customer breakdown matches expected breakdown by size
      const allSizes = new Set([
        ...Object.keys(actualCylinderSizeBreakdown),
        ...Object.keys(customerCylinderSizeBreakdown),
      ]);

      for (const size of allSizes) {
        const expectedQuantity = actualCylinderSizeBreakdown[size] || 0;
        const customerQuantity = customerCylinderSizeBreakdown[size] || 0;

        if (expectedQuantity !== customerQuantity) {
          sizeValidationErrors.push({
            size,
            customer: customerQuantity,
            expected: expectedQuantity,
          });
        }
      }

      return {
        id: driver.id,
        driverName: driver.name,
        totalCashReceivables: salesTotals.cash, // FROM SALES ONLY - Non-editable
        totalCylinderReceivables: salesTotals.cylinders, // FROM SALES ONLY - Non-editable
        cylinderSizeBreakdown: actualCylinderSizeBreakdown, // FROM SALES DATA - Non-editable
        totalReceivables: salesTotals.cash,
        salesCashReceivables: salesTotals.cash, // For validation
        salesCylinderReceivables: salesTotals.cylinders, // For validation
        customerCashTotal, // For validation (all statuses)
        customerCylinderTotal, // For validation (all statuses)
        currentCustomerCashTotal, // Current status only
        currentCustomerCylinderTotal, // Current status only
        customerCylinderSizeBreakdown, // Customer breakdown by size for validation
        sizeValidationErrors, // Size-specific validation errors
        hasValidationError:
          cashMismatch || cylinderMismatch || sizeValidationErrors.length > 0,
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
        sizeValidationErrors:
          driver.sizeValidationErrors && driver.sizeValidationErrors.length > 0
            ? driver.sizeValidationErrors
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
          size: data.receivableType === 'CYLINDER' ? data.size : null,
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

    // 🔔 TRIGGER CUSTOMER RECEIVABLES CHANGE MESSAGING
    // Find the customer associated with this receivable
    const customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        name: customerReceivable.customerName,
        isActive: true,
      },
    });

    if (customer && customer.phone) {
      // Calculate new receivables totals - get all current receivables for this customer
      const allReceivables = await prisma.customerReceivable.aggregate({
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

      const newCashReceivables = allReceivables._sum.amount || 0;
      const newCylinderReceivables = allReceivables._sum.quantity || 0;

      // Calculate old receivables (subtract the just-added amounts)
      const oldCashReceivables =
        customerReceivable.receivableType === 'CASH'
          ? newCashReceivables - customerReceivable.amount
          : newCashReceivables;
      const oldCylinderReceivables =
        customerReceivable.receivableType === 'CYLINDER'
          ? newCylinderReceivables - customerReceivable.quantity
          : newCylinderReceivables;

      // Get old and new cylinder receivables by size for messaging
      const oldTotalCylinders = oldCylinderReceivables;
      const newTotalCylinders = newCylinderReceivables;

      // Calculate the change in cylinders to determine how to distribute old vs new
      const cylinderChange = newTotalCylinders - oldTotalCylinders;

      // Get current cylinder breakdown by size
      const currentCylindersBySize = await prisma.customerReceivable.findMany({
        where: {
          tenantId,
          customerName: customer.name,
          receivableType: 'CYLINDER',
          status: { not: 'PAID' },
        },
        select: { quantity: true, size: true },
      });

      const newCylinderSizeBreakdown: Record<string, number> = {};
      currentCylindersBySize.forEach((receivable) => {
        const size = receivable.size || '12L';
        newCylinderSizeBreakdown[size] =
          (newCylinderSizeBreakdown[size] || 0) + receivable.quantity;
      });

      // Calculate old cylinder breakdown (subtract the new receivable that was just added)
      const oldCylinderSizeBreakdown: Record<string, number> = {
        ...newCylinderSizeBreakdown,
      };
      if (customerReceivable.receivableType === 'CYLINDER') {
        const size = customerReceivable.size || '12L';
        oldCylinderSizeBreakdown[size] = Math.max(
          0,
          (oldCylinderSizeBreakdown[size] || 0) - customerReceivable.quantity
        );
        // Remove sizes with 0 quantity
        if (oldCylinderSizeBreakdown[size] === 0) {
          delete oldCylinderSizeBreakdown[size];
        }
      }

      const { notifyCustomerReceivablesChangeWithSizeBreakdown } = await import(
        '@/lib/messaging/receivables-messaging'
      );

      await notifyCustomerReceivablesChangeWithSizeBreakdown({
        tenantId,
        customerId: customer.id,
        oldCashReceivables,
        newCashReceivables,
        oldCylinderReceivables,
        newCylinderReceivables,
        oldCylinderSizeBreakdown,
        newCylinderSizeBreakdown,
        changeReason: 'নতুন বকেয়া যোগ করা হয়েছে', // "New receivable added"
      });
    } else {
      console.log(
        `📞 Customer receivables change notification skipped - customer ${customerReceivable.customerName} not found or no phone`
      );
    }

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

    // Get previous receivables (yesterday's record or onboarding receivables)
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    yesterday.setHours(0, 0, 0, 0);

    // First try to get yesterday's record
    const yesterdayRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
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
          driverId: driver.id,
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
