// Individual Driver API Endpoints
// Handle single driver operations (view, update, deactivate)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { UserRole, DriverStatus } from '@prisma/client';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const updateDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  route: z.string().optional(),
  driverType: z.enum(['RETAIL', 'SHIPMENT']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  joiningDate: z
    .string()
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  leavingDate: z
    .string()
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { id } = await params;

    const driver = await prisma.driver.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        _count: {
          select: {
            sales: true,
            receivableRecords: true,
            inventoryMovements: true,
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Get performance metrics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentSales, receivables] = await Promise.all([
      prisma.sale.findMany({
        where: {
          tenantId,
          driverId: id,
          saleDate: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          quantity: true,
          netValue: true,
          cashDeposited: true,
          cylindersDeposited: true,
          saleDate: true,
          saleType: true,
        },
      }),
      prisma.receivableRecord.findFirst({
        where: {
          tenantId,
          driverId: id,
        },
        orderBy: {
          date: 'desc',
        },
      }),
    ]);

    // Calculate performance metrics
    const totalSales = recentSales.length;
    const totalRevenue = recentSales.reduce(
      (sum, sale) => sum + sale.netValue,
      0
    );
    const totalCashCollected = recentSales.reduce(
      (sum, sale) => sum + sale.cashDeposited,
      0
    );
    const totalCylindersCollected = recentSales.reduce(
      (sum, sale) => sum + sale.cylindersDeposited,
      0
    );

    const packageSales = recentSales.filter(
      (sale) => sale.saleType === 'PACKAGE'
    ).length;
    const refillSales = recentSales.filter(
      (sale) => sale.saleType === 'REFILL'
    ).length;

    const collectionEfficiency =
      totalRevenue > 0 ? (totalCashCollected / totalRevenue) * 100 : 100;

    return NextResponse.json({
      driver: {
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
        updatedAt: driver.updatedAt,
      },
      metrics: {
        totalSales,
        totalRevenue,
        totalCashCollected,
        totalCylindersCollected,
        packageSales,
        refillSales,
        collectionEfficiency,
        outstandingCash: receivables?.totalCashReceivables || 0,
        outstandingCylinders: receivables?.totalCylinderReceivables || 0,
      },
      counts: {
        totalSalesCount: driver._count.sales,
        receivableRecords: driver._count.receivableRecords,
        inventoryMovements: driver._count.inventoryMovements,
      },
    });
  } catch (error) {
    console.error('Driver fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role } = session.user;
    const { id } = await params;

    // Allow both admins and managers to update drivers
    if (role !== UserRole.ADMIN && role !== UserRole.MANAGER) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateDriverSchema.parse(body);

    // Verify driver exists and belongs to tenant
    const existingDriver = await prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check for unique phone number if being updated
    if (validatedData.phone && validatedData.phone !== existingDriver.phone) {
      const phoneExists = await prisma.driver.findFirst({
        where: {
          tenantId,
          phone: validatedData.phone,
          id: { not: id },
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Update driver - filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Driver updated successfully',
      driver: {
        id: updatedDriver.id,
        name: updatedDriver.name,
        phone: updatedDriver.phone,
        email: updatedDriver.email,
        address: updatedDriver.address,
        licenseNumber: updatedDriver.licenseNumber,
        status: updatedDriver.status,
        driverType: updatedDriver.driverType,
        route: updatedDriver.route,
        joiningDate: updatedDriver.joiningDate,
        leavingDate: updatedDriver.leavingDate,
        updatedAt: updatedDriver.updatedAt,
      },
    });
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

    console.error('Driver update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role } = session.user;
    const { id } = await params;

    // Only admins can delete drivers
    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify driver exists and belongs to tenant
    const existingDriver = await prisma.driver.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            sales: true,
            receivableRecords: true,
          },
        },
      },
    });

    if (!existingDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if driver has associated records
    if (
      existingDriver._count.sales > 0 ||
      existingDriver._count.receivableRecords > 0
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot delete driver with existing sales or receivable records',
          details: `Driver has ${existingDriver._count.sales} sales and ${existingDriver._count.receivableRecords} receivable records`,
        },
        { status: 400 }
      );
    } else {
      // Safe to delete - no associated records
      await prisma.driver.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Driver deleted successfully',
      });
    }
  } catch (error) {
    console.error('Driver deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
