import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { calculateEmptyCylindersBySize, summarizeEmptyCylindersBySize } from '@/lib/business/empty-cylinders-by-size-calculator';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const asOfDate = searchParams.get('date') 
      ? new Date(searchParams.get('date')!) 
      : new Date();

    const tenantId = session.user.tenantId;

    // Calculate empty cylinders by size using exact business formula
    const calculations = await calculateEmptyCylindersBySize(tenantId, asOfDate);
    const summary = summarizeEmptyCylindersBySize(calculations);

    return NextResponse.json({
      success: true,
      data: {
        asOfDate: asOfDate.toISOString().split('T')[0],
        formula: "Today's Empty Cylinders (Size) = Yesterday's Empty (Size) + Refill Sales (Size) + Empty Buy/Sell (Size)",
        calculations,
        summary,
      },
    });

  } catch (error) {
    console.error('Error calculating empty cylinders by size:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}