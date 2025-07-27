// Cylinder Tables API
// Handles Full Cylinders (পূর্ণ সিলিন্ডার) and Empty Cylinders (খালি সিলিন্ডার) data

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CylinderCalculator } from '@/lib/business';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const tenantId = session.user.tenantId;

    const targetDate = date ? new Date(date) : new Date();
    const dateOnly = new Date(targetDate);
    dateOnly.setHours(0, 0, 0, 0);

    const cylinderCalculator = new CylinderCalculator(prisma);

    // Get full cylinders data
    const fullCylinders = await prisma.fullCylinder.findMany({
      where: {
        tenantId,
        date: dateOnly,
      },
      include: {
        product: {
          include: {
            company: {
              select: { name: true },
            },
            cylinderSize: {
              select: { size: true },
            },
          },
        },
      },
      orderBy: [
        { product: { company: { name: 'asc' } } },
        { product: { cylinderSize: { size: 'asc' } } },
      ],
    });

    // Get empty cylinders data
    const emptyCylinders = await prisma.emptyCylinder.findMany({
      where: {
        tenantId,
        date: dateOnly,
      },
      include: {
        cylinderSize: {
          select: { size: true },
        },
      },
      orderBy: {
        cylinderSize: { size: 'asc' },
      },
    });

    // Get cylinder receivables from the latest receivable records
    const latestReceivableRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
      },
      select: {
        driverId: true,
        totalCylinderReceivables: true,
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get the latest record per driver
    const latestReceivablesByDriver = new Map<string, number>();
    latestReceivableRecords.forEach((record) => {
      if (!latestReceivablesByDriver.has(record.driverId)) {
        latestReceivablesByDriver.set(
          record.driverId,
          record.totalCylinderReceivables
        );
      }
    });

    const totalCylinderReceivables = Array.from(
      latestReceivablesByDriver.values()
    ).reduce((sum, amount) => sum + amount, 0);

    // Format full cylinders data
    const fullCylindersData = fullCylinders.map((record) => ({
      id: record.id,
      company: record.product.company.name,
      size: record.product.cylinderSize?.size || 'Unknown',
      quantity: record.quantity,
      date: record.date.toISOString().split('T')[0],
      lastUpdated: record.calculatedAt.toISOString(),
    }));

    // Format empty cylinders data
    const emptyCylindersData = emptyCylinders.map((record) => ({
      id: record.id,
      size: record.cylinderSize.size,
      emptyCylinders: record.quantity,
      emptyCylindersInHand: record.quantityInHand,
      emptyCylindersWithDrivers: record.quantityWithDrivers,
      date: record.date.toISOString().split('T')[0],
      lastUpdated: record.calculatedAt.toISOString(),
    }));

    // Calculate totals
    const totalFullCylinders = fullCylindersData.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalEmptyCylinders = emptyCylindersData.reduce(
      (sum, item) => sum + item.emptyCylinders,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        fullCylinders: fullCylindersData,
        emptyCylinders: emptyCylindersData,
        summary: {
          totalFullCylinders,
          totalEmptyCylinders,
          totalCylinders: totalFullCylinders + totalEmptyCylinders,
          totalCylinderReceivables,
          date: dateOnly.toISOString().split('T')[0],
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cylinders API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
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
    const { date, action } = body;
    const tenantId = session.user.tenantId;

    const targetDate = date ? new Date(date) : new Date();
    const cylinderCalculator = new CylinderCalculator(prisma);

    if (action === 'calculate' || action === 'recalculate') {
      // Calculate cylinder data for the specified date
      await cylinderCalculator.calculateAllCylinders({
        date: targetDate,
        tenantId,
      });

      return NextResponse.json({
        success: true,
        message: 'Cylinder data calculated successfully',
        date: targetDate.toISOString().split('T')[0],
        action,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "calculate" or "recalculate"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Cylinders calculation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
