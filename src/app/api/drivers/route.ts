// Drivers Management API
// Handle driver CRUD operations, status management, and bulk operations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Type for driver with optional metrics
type DriverWithMetrics = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  licenseNumber?: string | null;
  route?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  driverType: 'RETAIL' | 'SHIPMENT';
  joiningDate?: Date | null;
  leavingDate?: Date | null;
  createdAt: Date;
  _count: {
    sales: number;
    receivableRecords: number;
    inventoryMovements: number;
  };
  metrics?: {
    totalRevenue: number;
    avgSaleValue: number;
    collectionEfficiency: number;
  };
};

const createDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  route: z.string().optional(),
  driverType: z.enum(['RETAIL', 'SHIPMENT']).optional(),
  joiningDate: z
    .string()
    .transform((val) => (val ? new Date(val) : new Date()))
    .optional(),
});

const driverQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  active: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  driverType: z.enum(['RETAIL', 'SHIPMENT']).optional(),
  route: z.string().optional(),
  page: z.string().transform((val) => parseInt(val) || 1),
  limit: z.string().transform((val) => Math.min(parseInt(val) || 20, 100)),
  includeMetrics: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Parse query parameters and filter out null values
    const rawQueryParams = {
      status: searchParams.get('status'),
      active: searchParams.get('active'),
      driverType: searchParams.get('driverType'),
      route: searchParams.get('route'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      includeMetrics: searchParams.get('includeMetrics'),
    };

    // Filter out null values and keep only truthy values, but ensure page and limit have defaults
    const queryParams = Object.fromEntries(
      Object.entries(rawQueryParams).filter(([_, value]) => value !== null)
    );

    // Add default values for page and limit if not provided
    if (!queryParams.page) queryParams.page = '1';
    if (!queryParams.limit) queryParams.limit = '20';

    const queryResult = driverQuerySchema.safeParse(queryParams);

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { status, active, driverType, route, page, limit, includeMetrics } =
      queryResult.data;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (status) where.status = status;
    if (active !== undefined) where.status = active ? 'ACTIVE' : 'INACTIVE';
    if (driverType) where.driverType = driverType;
    if (route) where.route = { contains: route, mode: 'insensitive' };

    // Execute queries
    const [drivers, totalCount] = await Promise.all([
      prisma.driver.findMany({
        where,
        include: {
          _count: {
            select: {
              sales: true,
              receivableRecords: true,
              inventoryMovements: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.driver.count({ where }),
    ]);

    // Add performance metrics if requested
    let driversWithMetrics = drivers;
    if (includeMetrics) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      driversWithMetrics = await Promise.all(
        drivers.map(async (driver) => {
          // Get performance metrics for last 30 days
          const [recentSales, latestReceivables] = await Promise.all([
            prisma.sale.findMany({
              where: {
                tenantId,
                driverId: driver.id,
                saleDate: {
                  gte: thirtyDaysAgo,
                },
              },
              select: {
                netValue: true,
                cashDeposited: true,
                cylindersDeposited: true,
              },
            }),
            prisma.receivableRecord.findFirst({
              where: {
                tenantId,
                driverId: driver.id,
              },
              orderBy: {
                date: 'desc',
              },
            }),
          ]);

          const totalRevenue = recentSales.reduce(
            (sum, sale) => sum + sale.netValue,
            0
          );
          const totalCashCollected = recentSales.reduce(
            (sum, sale) => sum + sale.cashDeposited,
            0
          );
          const collectionEfficiency =
            totalRevenue > 0 ? (totalCashCollected / totalRevenue) * 100 : 100;

          return {
            ...driver,
            metrics: {
              recentSalesCount: recentSales.length,
              recentRevenue: totalRevenue,
              collectionEfficiency,
              outstandingCash: latestReceivables?.totalCashReceivables || 0,
              outstandingCylinders:
                latestReceivables?.totalCylinderReceivables || 0,
            },
          };
        })
      );
    }

    // Calculate summary statistics
    const summary = {
      totalDrivers: totalCount,
      activeDrivers: drivers.filter((d) => d.status === 'ACTIVE').length,
      inactiveDrivers: drivers.filter((d) => d.status === 'INACTIVE').length,
      totalSales: drivers.reduce((sum, d) => sum + d._count.sales, 0),
      averageSalesPerDriver:
        drivers.length > 0
          ? Math.round(
              drivers.reduce((sum, d) => sum + d._count.sales, 0) /
                drivers.length
            )
          : 0,
    };

    return NextResponse.json({
      drivers: driversWithMetrics.map((driver) => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        address: driver.address,
        licenseNumber: driver.licenseNumber,
        status: driver.status,
        driverType: driver.driverType,
        route: driver.route,
        joiningDate: driver.joiningDate,
        leavingDate: driver.leavingDate,
        createdAt: driver.createdAt,
        counts: {
          totalSales: driver._count.sales,
          receivableRecords: driver._count.receivableRecords,
          inventoryMovements: driver._count.inventoryMovements,
        },
        ...(includeMetrics && {
          metrics: (driver as DriverWithMetrics).metrics,
        }),
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary,
    });
  } catch (error) {
    console.error('Drivers fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role } = session.user;

    // Only admins can create drivers
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createDriverSchema.parse(body);

    // Check if phone number already exists (if provided)
    if (validatedData.phone) {
      const existingDriver = await prisma.driver.findFirst({
        where: {
          tenantId,
          phone: validatedData.phone,
        },
      });

      if (existingDriver) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Create driver - handle null values properly
    const newDriver = await prisma.driver.create({
      data: {
        tenantId,
        name: validatedData.name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
        licenseNumber: validatedData.licenseNumber || null,
        route: validatedData.route || null,
        driverType: validatedData.driverType || 'RETAIL',
        joiningDate: validatedData.joiningDate || null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        licenseNumber: true,
        status: true,
        driverType: true,
        route: true,
        joiningDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Driver created successfully',
        driver: newDriver,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Driver creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role } = session.user;

    // Only admins can delete drivers
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('id');

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    // Check if driver exists and belongs to the tenant
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        tenantId,
      },
      include: {
        _count: {
          select: {
            sales: true,
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if driver has any sales
    if (driver._count.sales > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete driver with existing sales records',
          details: `Driver has ${driver._count.sales} sales record(s)`,
        },
        { status: 400 }
      );
    }

    // Delete the driver
    await prisma.driver.delete({
      where: {
        id: driverId,
        tenantId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    console.error('Driver deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
