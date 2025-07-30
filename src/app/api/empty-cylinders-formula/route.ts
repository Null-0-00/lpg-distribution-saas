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

    console.log(`📖 FORMULA API: Retrieving saved formula values for ${asOfDate.toISOString().split('T')[0]}...`);

    const savedValues = await prisma.emptyCylinder.findMany({
      where: {
        tenantId,
        date: asOfDate,
        formulaCalculatedAt: { not: null }, // Only get records with formula calculations
      },
      include: {
        cylinderSize: true,
        product: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        cylinderSize: { size: 'asc' },
      },
    });

    const formattedData = savedValues.map(record => ({
      id: record.id,
      size: record.cylinderSize.size,
      company: record.product.company.name,
      productName: record.product.name,
      // Formula breakdown
      emptyCylindersInStock: record.emptyCylindersInStock,
      cylindersReceivable: record.cylindersReceivable,
      ongoingShipments: record.ongoingShipments,
      totalEmptyCylinders: record.totalEmptyCylinders,
      // Formula: Total = Empty cylinders in stock + cylinders receivable + ongoing shipments
      formula: `${record.emptyCylindersInStock || 0} + ${record.cylindersReceivable || 0} + ${record.ongoingShipments || 0} = ${record.totalEmptyCylinders || 0}`,
      // Metadata
      date: record.date,
      formulaCalculatedAt: record.formulaCalculatedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));

    console.log(`✅ FORMULA API: Retrieved ${formattedData.length} saved formula records`);

    return NextResponse.json({
      success: true,
      date: asOfDate.toISOString().split('T')[0],
      count: formattedData.length,
      data: formattedData,
      summary: {
        totalEmptyCylindersInStock: formattedData.reduce((sum, item) => sum + (item.emptyCylindersInStock || 0), 0),
        totalCylindersReceivable: formattedData.reduce((sum, item) => sum + (item.cylindersReceivable || 0), 0),
        totalOngoingShipments: formattedData.reduce((sum, item) => sum + (item.ongoingShipments || 0), 0),
        grandTotalEmptyCylinders: formattedData.reduce((sum, item) => sum + (item.totalEmptyCylinders || 0), 0),
      },
    });
  } catch (error) {
    console.error('❌ FORMULA API: Error retrieving saved formula values:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}