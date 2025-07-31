import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get any receivable record to find tenant ID
    const record = await prisma.receivableRecord.findFirst({
      select: {
        tenantId: true,
        driver: {
          select: {
            name: true,
            tenantId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tenantId: record?.tenantId,
      driverTenantId: record?.driver?.tenantId,
      record,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get tenant ID' },
      { status: 500 }
    );
  }
}
