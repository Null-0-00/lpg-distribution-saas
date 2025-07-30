import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { EmptyCylinderTotalsBySize, EmptyCylinderSummary } from '@/types/empty-cylinder-totals';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Query the view for empty cylinder totals by size
    const emptyCylinderTotals = await prisma.$queryRaw<EmptyCylinderTotalsBySize[]>`
      SELECT * FROM empty_cylinder_totals_by_size 
      WHERE tenant_id = ${tenantId}
      ORDER BY cylinder_size_name
    `;

    // Transform into summary format
    const summary: EmptyCylinderSummary = {};
    
    emptyCylinderTotals.forEach((record) => {
      summary[record.cylinderSizeName] = {
        totalQuantity: record.totalQuantity,
        quantityInHand: record.quantityInHand,
        quantityWithDrivers: record.quantityWithDriversCurrent,
        breakdown: {
          onboardingBaseline: record.onboardingBaseline,
          salesImpact: record.netSalesImpact,
          shipmentImpact: record.netShipmentImpact,
          outstandingShipments: record.outstandingShipments,
        },
      };
    });

    // Calculate grand totals
    const grandTotals = {
      totalQuantity: emptyCylinderTotals.reduce((sum, r) => sum + r.totalQuantity, 0),
      quantityInHand: emptyCylinderTotals.reduce((sum, r) => sum + r.quantityInHand, 0),
      quantityWithDrivers: emptyCylinderTotals.reduce((sum, r) => sum + r.quantityWithDriversCurrent, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        grandTotals,
        detailed: emptyCylinderTotals,
        calculatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching empty cylinders by size:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}