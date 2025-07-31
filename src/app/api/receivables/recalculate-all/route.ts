import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    console.log(
      `🔄 Starting receivables recalculation for tenant: ${tenantId}`
    );

    // Get all receivables records ordered by driver and date
    const allRecords = await prisma.receivableRecord.findMany({
      where: { tenantId },
      orderBy: [{ driverId: 'asc' }, { date: 'asc' }],
    });

    console.log(
      `📊 Found ${allRecords.length} receivables records to recalculate`
    );

    // Group records by driver
    const recordsByDriver = new Map<string, typeof allRecords>();
    for (const record of allRecords) {
      if (!recordsByDriver.has(record.driverId)) {
        recordsByDriver.set(record.driverId, []);
      }
      recordsByDriver.get(record.driverId)!.push(record);
    }

    let updatedCount = 0;
    let errors = [];

    // Process each driver's records in chronological order
    for (const [driverId, driverRecords] of recordsByDriver.entries()) {
      console.log(
        `👤 Processing driver ${driverId} with ${driverRecords.length} records`
      );

      // Sort by date to ensure chronological order
      driverRecords.sort((a, b) => a.date.getTime() - b.date.getTime());

      let previousCashTotal = 0;
      let previousCylinderTotal = 0;
      let previousDate: Date | null = null;

      for (const record of driverRecords) {
        try {
          // Check if this is the same date as previous record
          const isSameDate =
            previousDate &&
            record.date.toDateString() === previousDate.toDateString();

          // Apply the correct formula:
          // For same date: totalCashReceivables = cashReceivablesChange + onboardingCashReceivables (no previous total)
          // For different date: totalCashReceivables = cashReceivablesChange + onboardingCashReceivables + PREVIOUS DAY'S totalCashReceivables
          const previousCashToAdd = isSameDate ? 0 : previousCashTotal;
          const previousCylinderToAdd = isSameDate ? 0 : previousCylinderTotal;

          const newTotalCash =
            record.cashReceivablesChange +
            (record.onboardingCashReceivables || 0) +
            previousCashToAdd;

          const newTotalCylinders =
            record.cylinderReceivablesChange +
            (record.onboardingCylinderReceivables || 0) +
            previousCylinderToAdd;

          // Only update if values have changed
          if (
            newTotalCash !== record.totalCashReceivables ||
            newTotalCylinders !== record.totalCylinderReceivables
          ) {
            console.log(
              `📝 Updating record ${record.id} for date ${record.date.toISOString().split('T')[0]}:`,
              {
                oldCash: record.totalCashReceivables,
                newCash: newTotalCash,
                oldCylinders: record.totalCylinderReceivables,
                newCylinders: newTotalCylinders,
                formula: `${record.cashReceivablesChange} + ${record.onboardingCashReceivables || 0} + ${previousCashToAdd}`,
                sameDate: isSameDate,
              }
            );

            await prisma.receivableRecord.update({
              where: { id: record.id },
              data: {
                totalCashReceivables: newTotalCash,
                totalCylinderReceivables: newTotalCylinders,
                calculatedAt: new Date(),
              },
            });

            updatedCount++;
          }

          // Update previous totals and date for next iteration
          // Only update previous totals if this is a different date
          if (!isSameDate) {
            previousCashTotal = newTotalCash;
            previousCylinderTotal = newTotalCylinders;
          }
          previousDate = record.date;
        } catch (error) {
          console.error(`❌ Error updating record ${record.id}:`, error);
          errors.push({
            recordId: record.id,
            driverId,
            date: record.date.toISOString().split('T')[0],
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    console.log(
      `✅ Receivables recalculation completed. Updated ${updatedCount} records.`
    );

    return NextResponse.json({
      success: true,
      message: `Recalculated receivables for tenant ${tenantId}`,
      stats: {
        totalRecords: allRecords.length,
        updatedRecords: updatedCount,
        driversProcessed: recordsByDriver.size,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Receivables recalculation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to recalculate receivables',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
