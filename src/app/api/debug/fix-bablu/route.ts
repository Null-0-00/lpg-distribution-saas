import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log(`🔧 Fixing Bablu's receivables record specifically`);

    // Find Bablu's latest record (2025-07-30)
    const babluRecord = await prisma.receivableRecord.findFirst({
      where: {
        driver: {
          name: 'BABLU',
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

    if (!babluRecord) {
      return NextResponse.json(
        { error: 'Bablu record not found' },
        { status: 404 }
      );
    }

    console.log('📊 Current Bablu record:', {
      id: babluRecord.id,
      date: babluRecord.date.toISOString().split('T')[0],
      cashReceivablesChange: babluRecord.cashReceivablesChange,
      onboardingCashReceivables: babluRecord.onboardingCashReceivables,
      totalCashReceivables: babluRecord.totalCashReceivables,
    });

    // Apply correct formula: totalCashReceivables = cashReceivablesChange + onboardingCashReceivables + previousTotal
    // For Bablu on 2025-07-30: 5000 + 2000 + 0 = 7000
    const correctTotal =
      babluRecord.cashReceivablesChange +
      (babluRecord.onboardingCashReceivables || 0) +
      0; // previousTotal = 0 for same day

    console.log('💰 Calculating correct total:', {
      cashReceivablesChange: babluRecord.cashReceivablesChange,
      onboardingCashReceivables: babluRecord.onboardingCashReceivables || 0,
      previousTotal: 0,
      correctTotal: correctTotal,
    });

    // Update the record
    const updated = await prisma.receivableRecord.update({
      where: {
        id: babluRecord.id,
      },
      data: {
        totalCashReceivables: correctTotal,
        calculatedAt: new Date(),
      },
    });

    console.log('✅ Updated Bablu record:', {
      id: updated.id,
      oldTotal: babluRecord.totalCashReceivables,
      newTotal: updated.totalCashReceivables,
    });

    return NextResponse.json({
      success: true,
      message: "Fixed Bablu's receivables",
      before: {
        totalCashReceivables: babluRecord.totalCashReceivables,
        formula: `${babluRecord.cashReceivablesChange} + ${babluRecord.onboardingCashReceivables || 0} + 0`,
      },
      after: {
        totalCashReceivables: updated.totalCashReceivables,
        expected: 7000,
        correct: updated.totalCashReceivables === 7000,
      },
    });
  } catch (error) {
    console.error('❌ Error fixing Bablu record:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix Bablu record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
