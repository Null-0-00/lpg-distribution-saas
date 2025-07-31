import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log(`🔧 Fixing NIHAN's receivables record specifically`);

    // Find NIHAN's latest record (2025-07-30)
    const nihanRecord = await prisma.receivableRecord.findFirst({
      where: {
        driver: {
          name: 'NIHAN',
        },
        date: new Date('2025-07-30T00:00:00.000Z'),
      },
      include: {
        driver: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!nihanRecord) {
      return NextResponse.json(
        { error: 'NIHAN record not found' },
        { status: 404 }
      );
    }

    console.log('📊 Current NIHAN record:', {
      id: nihanRecord.id,
      date: nihanRecord.date.toISOString().split('T')[0],
      cashReceivablesChange: nihanRecord.cashReceivablesChange,
      onboardingCashReceivables: nihanRecord.onboardingCashReceivables,
      totalCashReceivables: nihanRecord.totalCashReceivables,
    });

    // Apply correct formula: totalCashReceivables = cashReceivablesChange + onboardingCashReceivables + previousTotal
    // For NIHAN on 2025-07-30: 0 + 1000 + 0 = 1000
    const correctTotal =
      nihanRecord.cashReceivablesChange +
      (nihanRecord.onboardingCashReceivables || 0) +
      0; // previousTotal = 0 for same day

    console.log('💰 Calculating correct total:', {
      cashReceivablesChange: nihanRecord.cashReceivablesChange,
      onboardingCashReceivables: nihanRecord.onboardingCashReceivables || 0,
      previousTotal: 0,
      correctTotal: correctTotal,
    });

    // Update the record
    const updated = await prisma.receivableRecord.update({
      where: {
        id: nihanRecord.id,
      },
      data: {
        totalCashReceivables: correctTotal,
        totalCylinderReceivables:
          nihanRecord.cylinderReceivablesChange +
          (nihanRecord.onboardingCylinderReceivables || 0) +
          0,
        calculatedAt: new Date(),
      },
    });

    console.log('✅ Updated NIHAN record:', {
      id: updated.id,
      oldTotal: nihanRecord.totalCashReceivables,
      newTotal: updated.totalCashReceivables,
    });

    return NextResponse.json({
      success: true,
      message: "Fixed NIHAN's receivables",
      before: {
        totalCashReceivables: nihanRecord.totalCashReceivables,
        totalCylinderReceivables: nihanRecord.totalCylinderReceivables,
      },
      after: {
        totalCashReceivables: updated.totalCashReceivables,
        totalCylinderReceivables: updated.totalCylinderReceivables,
        expectedCash: 1000,
        expectedCylinders: 15,
        correctCash: updated.totalCashReceivables === 1000,
        correctCylinders: updated.totalCylinderReceivables === 15,
      },
    });
  } catch (error) {
    console.error('❌ Error fixing NIHAN record:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix NIHAN record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
