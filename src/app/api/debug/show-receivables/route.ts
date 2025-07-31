import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log(`📊 Showing ALL receivables records in database`);

    // Get all receivables records with driver names
    const allRecords = await prisma.receivableRecord.findMany({
      include: {
        driver: {
          select: {
            name: true,
          }
        }
      },
      orderBy: [
        { driverId: 'asc' },
        { date: 'asc' }
      ],
    });

    console.log(`Found ${allRecords.length} receivables records`);

    const formattedRecords = allRecords.map(record => ({
      id: record.id,
      driverName: record.driver.name,
      date: record.date.toISOString().split('T')[0],
      cashReceivablesChange: record.cashReceivablesChange,
      cylinderReceivablesChange: record.cylinderReceivablesChange,
      onboardingCashReceivables: record.onboardingCashReceivables || 0,
      onboardingCylinderReceivables: record.onboardingCylinderReceivables || 0,
      totalCashReceivables: record.totalCashReceivables,
      totalCylinderReceivables: record.totalCylinderReceivables,
      calculatedFormula: `${record.cashReceivablesChange} + ${record.onboardingCashReceivables || 0} + previousTotal`,
    }));

    // Group by driver for easier reading
    const recordsByDriver = {};
    for (const record of formattedRecords) {
      if (!recordsByDriver[record.driverName]) {
        recordsByDriver[record.driverName] = [];
      }
      recordsByDriver[record.driverName].push(record);
    }

    console.log(`📊 Records by driver:`, recordsByDriver);

    return NextResponse.json({
      success: true,
      totalRecords: allRecords.length,
      recordsByDriver,
      allRecords: formattedRecords,
    });

  } catch (error) {
    console.error('❌ Error showing receivables:', error);
    return NextResponse.json(
      { 
        error: 'Failed to show receivables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}