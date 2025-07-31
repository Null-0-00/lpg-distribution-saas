import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log(`🧪 Testing fixed recalculate logic for 2025-07-30 only`);

    // Hardcode tenant ID for testing
    const tenantId = 'cmdqabjh00000ubs0gkdpyyx4';

    // Get drivers for this tenant
    const drivers = await prisma.driver.findMany({
      where: { tenantId, status: 'ACTIVE', driverType: 'RETAIL' },
      select: { id: true, name: true },
    });

    console.log(`Found ${drivers.length} drivers to test`);

    // Test only for 2025-07-30
    const testDate = new Date('2025-07-30T00:00:00.000Z');
    const results = [];

    for (const driver of drivers) {
      console.log(`\n🔄 Testing driver: ${driver.name} (${driver.id})`);

      // Get sales for this driver on 2025-07-30
      const sales = await prisma.sale.findMany({
        where: {
          tenantId,
          driverId: driver.id,
          saleDate: {
            gte: testDate,
            lt: new Date('2025-07-31T00:00:00.000Z'),
          },
        },
        select: {
          saleType: true,
          totalValue: true,
          discount: true,
          cashDeposited: true,
          cylindersDeposited: true,
          quantity: true,
        },
      });

      console.log(`Found ${sales.length} sales records`);

      // Calculate sales aggregates
      let totalValue = 0;
      let discount = 0;
      let cashDeposited = 0;
      let cylindersDeposited = 0;
      let refillQuantity = 0;

      sales.forEach((sale) => {
        totalValue += sale.totalValue || 0;
        discount += sale.discount || 0;
        cashDeposited += sale.cashDeposited || 0;
        cylindersDeposited += sale.cylindersDeposited || 0;

        if (sale.saleType === 'REFILL') {
          refillQuantity += sale.quantity || 0;
        }
      });

      const cashReceivablesChange = totalValue - cashDeposited - discount;
      const cylinderReceivablesChange = refillQuantity - cylindersDeposited;

      console.log(`Sales calculation:`, {
        totalValue,
        discount,
        cashDeposited,
        cashReceivablesChange,
        refillQuantity,
        cylindersDeposited,
        cylinderReceivablesChange,
      });

      // Get current record for 2025-07-30
      const currentRecord = await prisma.receivableRecord.findFirst({
        where: {
          tenantId,
          driverId: driver.id,
          date: testDate,
        },
      });

      if (currentRecord) {
        console.log(`Current record:`, {
          cashReceivablesChange: currentRecord.cashReceivablesChange,
          cylinderReceivablesChange: currentRecord.cylinderReceivablesChange,
          onboardingCashReceivables: currentRecord.onboardingCashReceivables,
          onboardingCylinderReceivables:
            currentRecord.onboardingCylinderReceivables,
          totalCashReceivables: currentRecord.totalCashReceivables,
          totalCylinderReceivables: currentRecord.totalCylinderReceivables,
        });

        // Apply fixed formula
        const onboardingCash = currentRecord.onboardingCashReceivables || 0;
        const onboardingCylinders =
          currentRecord.onboardingCylinderReceivables || 0;

        // Get previous day's total (no previous day for 2025-07-30 in this case)
        const previousRecord = await prisma.receivableRecord.findFirst({
          where: {
            tenantId,
            driverId: driver.id,
            date: { lt: testDate },
          },
          orderBy: { date: 'desc' },
        });

        const previousCashTotal = previousRecord?.totalCashReceivables || 0;
        const previousCylinderTotal =
          previousRecord?.totalCylinderReceivables || 0;

        // CORRECTED FORMULA
        const newTotalCash =
          cashReceivablesChange + onboardingCash + previousCashTotal;
        const newTotalCylinders =
          cylinderReceivablesChange +
          onboardingCylinders +
          previousCylinderTotal;

        console.log(`Fixed formula calculation:`, {
          formula: `${cashReceivablesChange} + ${onboardingCash} + ${previousCashTotal} = ${newTotalCash}`,
          currentTotalCash: currentRecord.totalCashReceivables,
          newTotalCash,
          isCorrect:
            Math.abs(newTotalCash - currentRecord.totalCashReceivables) < 0.01,
        });

        results.push({
          driverName: driver.name,
          driverId: driver.id,
          date: '2025-07-30',
          salesData: {
            cashReceivablesChange,
            cylinderReceivablesChange,
          },
          onboarding: {
            cash: onboardingCash,
            cylinders: onboardingCylinders,
          },
          previousDay: {
            cash: previousCashTotal,
            cylinders: previousCylinderTotal,
          },
          current: {
            totalCash: currentRecord.totalCashReceivables,
            totalCylinders: currentRecord.totalCylinderReceivables,
          },
          corrected: {
            totalCash: newTotalCash,
            totalCylinders: newTotalCylinders,
          },
          formula: `${cashReceivablesChange} + ${onboardingCash} + ${previousCashTotal} = ${newTotalCash}`,
          needsUpdate:
            Math.abs(newTotalCash - currentRecord.totalCashReceivables) > 0.01,
        });
      } else {
        console.log(`No record found for ${driver.name} on 2025-07-30`);
        results.push({
          driverName: driver.name,
          driverId: driver.id,
          date: '2025-07-30',
          error: 'No record found',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tested fixed recalculate logic',
      testDate: '2025-07-30',
      results,
    });
  } catch (error) {
    console.error('❌ Error testing recalculate:', error);
    return NextResponse.json(
      {
        error: 'Failed to test recalculate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
