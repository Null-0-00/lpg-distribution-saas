// Customer Receivables API
// Track what each customer owes for cash and cylinders

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const receivablesQuerySchema = z.object({
  customerId: z.string().cuid().optional(),
  driverId: z.string().cuid().optional(),
  areaId: z.string().cuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasBalance: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 50, 100))
    .optional(),
});

const updateReceivablesSchema = z.object({
  customerId: z.string().cuid(),
  cashReceivables: z.number().min(0),
  cylinderReceivables: z.number().min(0),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = receivablesQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const tenantId = session.user.tenantId;

    // Build where clause
    const where: any = {
      tenantId: tenantId,
    };

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.driverId) {
      where.driverId = query.driverId;
    }

    if (query.areaId) {
      where.customer = {
        areaId: query.areaId,
      };
    }

    if (query.startDate && query.endDate) {
      where.date = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    if (query.hasBalance) {
      where.OR = [
        { cashReceivables: { gt: 0 } },
        { cylinderReceivables: { gt: 0 } },
      ];
    }

    // Get receivables with customer and area info
    const receivables = await prisma.customerReceivableRecord.findMany({
      where,
      include: {
        customer: {
          include: {
            area: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { customer: { area: { name: 'asc' } } },
        { customer: { name: 'asc' } },
      ],
      take: query.limit || 50,
      skip: ((query.page || 1) - 1) * (query.limit || 50),
    });

    // Get summary statistics
    const summary = await prisma.customerReceivableRecord.aggregate({
      where,
      _sum: {
        cashReceivables: true,
        cylinderReceivables: true,
        totalReceivables: true,
      },
      _count: {
        id: true,
      },
    });

    // Build dynamic WHERE conditions
    let whereConditions = `c."tenantId" = '${tenantId}' AND c."isActive" = true`;
    if (query.areaId) {
      whereConditions += ` AND c."areaId" = '${query.areaId}'`;
    }
    if (query.driverId) {
      whereConditions += ` AND c."driverId" = '${query.driverId}'`;
    }

    let havingCondition = '';
    if (query.hasBalance) {
      havingCondition =
        'HAVING SUM(CASE WHEN cr."receivableType" = \'CASH\' THEN COALESCE(cr.amount, 0) WHEN cr."receivableType" = \'CYLINDER\' THEN COALESCE(cr.quantity, 0) ELSE 0 END) > 0';
    }

    // Get aggregated customer receivables data using Prisma's queryRawUnsafe for dynamic SQL
    // NOTE: Using CustomerReceivable (not CustomerReceivableRecord) as that's where the receivables page data is stored
    const customerAggregations = await prisma.$queryRawUnsafe(`
      SELECT 
        c.id,
        c.name,
        c."customerCode",
        a.name as "areaName",
        a.code as "areaCode", 
        d.name as "driverName",
        COALESCE(SUM(CASE WHEN cr."receivableType" = 'CASH' THEN cr.amount ELSE 0 END), 0) as "totalCash",
        COALESCE(SUM(CASE WHEN cr."receivableType" = 'CYLINDER' THEN cr.quantity ELSE 0 END), 0) as "totalCylinder",
        COALESCE(SUM(CASE WHEN cr."receivableType" = 'CASH' THEN cr.amount WHEN cr."receivableType" = 'CYLINDER' THEN cr.quantity ELSE 0 END), 0) as "totalOutstanding",
        COUNT(cr.id) as "recordCount",
        MAX(cr."updatedAt") as "lastUpdated"
      FROM customers c
      JOIN areas a ON c."areaId" = a.id
      LEFT JOIN drivers d ON c."driverId" = d.id
      LEFT JOIN customer_receivables cr ON c.name = cr."customerName" AND cr."tenantId" = c."tenantId"
      WHERE ${whereConditions}
      GROUP BY c.id, c.name, c."customerCode", a.name, a.code, d.name
      ${havingCondition}
      ORDER BY COALESCE(SUM(cr.amount), 0) DESC, c.name ASC
    `);

    // Convert BigInt values to numbers for JSON serialization
    const serializedCustomerAggregations = (customerAggregations as any[]).map(
      (customer: any) => ({
        ...customer,
        totalCash: Number(customer.totalCash),
        totalCylinder: Number(customer.totalCylinder),
        totalOutstanding: Number(customer.totalOutstanding),
        recordCount: Number(customer.recordCount),
      })
    );

    return NextResponse.json({
      receivables,
      customerAggregations: serializedCustomerAggregations,
      summary: {
        totalCash: summary._sum.cashReceivables || 0,
        totalCylinder: summary._sum.cylinderReceivables || 0,
        totalOutstanding: summary._sum.totalReceivables || 0,
        recordCount: summary._count.id,
      },
    });
  } catch (error) {
    console.error('Error fetching customer receivables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receivables' },
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

    const body = await request.json();
    const data = updateReceivablesSchema.parse(body);

    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        tenantId: session.user.tenantId,
      },
      include: {
        area: { select: { name: true } },
        driver: { select: { id: true, name: true } },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate total receivables
    const totalReceivables = data.cashReceivables + data.cylinderReceivables;

    // Get previous receivables for change detection
    const previousRecord = await prisma.customerReceivableRecord.findUnique({
      where: {
        tenantId_customerId_date: {
          tenantId: session.user.tenantId,
          customerId: data.customerId,
          date: today,
        },
      },
    });

    // Upsert receivables record
    const receivableRecord = await prisma.customerReceivableRecord.upsert({
      where: {
        tenantId_customerId_date: {
          tenantId: session.user.tenantId,
          customerId: data.customerId,
          date: today,
        },
      },
      update: {
        cashReceivables: data.cashReceivables,
        cylinderReceivables: data.cylinderReceivables,
        totalReceivables,
        notes: data.notes,
        updatedAt: new Date(),
      },
      create: {
        tenantId: session.user.tenantId,
        customerId: data.customerId,
        driverId: customer.driverId,
        date: today,
        cashReceivables: data.cashReceivables,
        cylinderReceivables: data.cylinderReceivables,
        totalReceivables,
        notes: data.notes,
      },
      include: {
        customer: {
          include: {
            area: { select: { name: true } },
            driver: { select: { name: true } },
          },
        },
      },
    });

    // 🔔 TRIGGER CUSTOMER MESSAGING
    // Import and use the customer messaging service
    const { notifyCustomerReceivablesChange } = await import(
      '@/lib/messaging/customer-messaging'
    );

    await notifyCustomerReceivablesChange({
      tenantId: session.user.tenantId,
      customerId: data.customerId,
      oldCashReceivables: previousRecord?.cashReceivables || 0,
      newCashReceivables: data.cashReceivables,
      oldCylinderReceivables: previousRecord?.cylinderReceivables || 0,
      newCylinderReceivables: data.cylinderReceivables,
      changeReason: 'Manual receivables update',
      updatedBy: session.user.name || 'Admin',
    });

    return NextResponse.json(receivableRecord, {
      status: previousRecord ? 200 : 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating customer receivables:', error);
    return NextResponse.json(
      { error: 'Failed to update receivables' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete receivables records' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const date = searchParams.get('date');

    if (!customerId || !date) {
      return NextResponse.json(
        { error: 'Customer ID and date are required' },
        { status: 400 }
      );
    }

    await prisma.customerReceivableRecord.delete({
      where: {
        tenantId_customerId_date: {
          tenantId: session.user.tenantId,
          customerId,
          date: new Date(date),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting receivables record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}
