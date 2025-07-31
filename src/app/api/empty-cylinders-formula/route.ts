import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET endpoint to retrieve saved formula values from empty_cylinders table
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const asOfDate = dateParam ? new Date(dateParam) : new Date();
    asOfDate.setHours(0, 0, 0, 0);

    console.log(
      `📖 FORMULA API: Retrieving saved formula values for ${asOfDate.toISOString().split('T')[0]}...`
    );

    const savedValues = await prisma.emptyCylinder.findMany({
      where: {
        tenantId,
        date: asOfDate,
      },
      orderBy: {
        cylinderSizeId: 'asc',
      },
    });

    const formattedData = savedValues.map((record) => ({
      id: record.id,
      size: record.cylinderSizeId, // Use cylinderSizeId instead
      company: 'Unknown', // Placeholder as relation is not loaded
      productName: record.productId || 'Unknown',
      // Use available fields
      quantityInHand: record.quantityInHand,
      quantityWithDrivers: record.quantityWithDrivers,
      totalQuantity: record.quantity,
      // Simple formula using available data
      formula: `In Hand: ${record.quantityInHand} + With Drivers: ${record.quantityWithDrivers} = Total: ${record.quantity}`,
      // Metadata
      date: record.date,
      calculatedAt: record.calculatedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));

    console.log(
      `✅ FORMULA API: Retrieved ${formattedData.length} saved formula records`
    );

    return NextResponse.json({
      success: true,
      date: asOfDate.toISOString().split('T')[0],
      count: formattedData.length,
      data: formattedData,
      summary: {
        totalQuantityInHand: formattedData.reduce(
          (sum, item) => sum + (item.quantityInHand || 0),
          0
        ),
        totalQuantityWithDrivers: formattedData.reduce(
          (sum, item) => sum + (item.quantityWithDrivers || 0),
          0
        ),
        grandTotalQuantity: formattedData.reduce(
          (sum, item) => sum + (item.totalQuantity || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error(
      '❌ FORMULA API: Error retrieving saved formula values:',
      error
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
