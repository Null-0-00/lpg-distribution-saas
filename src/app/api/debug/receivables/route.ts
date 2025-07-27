import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // For debugging purposes, get all tenants - remove this in production
    const allDrivers = await prisma.driver.findMany({
      include: {
        receivableRecords: {
          orderBy: { date: 'desc' },
        },
      },
    });

    const allReceivableRecords = await prisma.receivableRecord.findMany({
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      message: 'Debug data - all tenants',
      driversCount: allDrivers.length,
      drivers: allDrivers.map((d) => ({
        id: d.id,
        name: d.name,
        tenantId: d.tenantId,
        driverType: d.driverType,
        receivableRecordsCount: d.receivableRecords.length,
        receivableRecords: d.receivableRecords,
      })),
      allReceivableRecords,
    });

    /*
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Get all drivers and their receivable records
    const drivers = await prisma.driver.findMany({
      where: { tenantId },
      include: {
        receivableRecords: {
          orderBy: { date: 'desc' },
        },
      },
    });

    // Get all receivable records for this tenant
    const allReceivableRecords = await prisma.receivableRecord.findMany({
      where: { tenantId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      tenantId,
      userId: session.user.id,
      driversCount: drivers.length,
      drivers: drivers.map(d => ({
        id: d.id,
        name: d.name,
        driverType: d.driverType,
        receivableRecordsCount: d.receivableRecords.length,
        receivableRecords: d.receivableRecords,
      })),
      allReceivableRecords,
    });
    */
  } catch (error) {
    console.error('Debug receivables error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
