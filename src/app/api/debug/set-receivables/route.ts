import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { driverName, cashReceivables, cylinderReceivables } =
      await request.json();

    // Find the driver by name
    const driver = await prisma.driver.findFirst({
      where: { name: driverName },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create or update receivables record
    const receivableRecord = await prisma.receivableRecord.upsert({
      where: {
        tenantId_driverId_date: {
          tenantId: driver.tenantId,
          driverId: driver.id,
          date: today,
        },
      },
      update: {
        cashReceivablesChange: cashReceivables,
        cylinderReceivablesChange: cylinderReceivables,
        totalCashReceivables: cashReceivables,
        totalCylinderReceivables: cylinderReceivables,
      },
      create: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        date: today,
        cashReceivablesChange: cashReceivables,
        cylinderReceivablesChange: cylinderReceivables,
        totalCashReceivables: cashReceivables,
        totalCylinderReceivables: cylinderReceivables,
      },
    });

    return NextResponse.json({
      success: true,
      driver: {
        id: driver.id,
        name: driver.name,
      },
      receivableRecord,
    });
  } catch (error) {
    console.error('Error setting receivables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
