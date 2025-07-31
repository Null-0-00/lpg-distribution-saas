import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log(
      `🔄 Starting receivables recalculation for ALL tenants (DEBUG MODE)`
    );

    // Get all receivables records ordered by tenant, driver and date
    const allRecords = await prisma.receivableRecord.findMany({
      orderBy: [{ tenantId: 'asc' }, { driverId: 'asc' }, { date: 'asc' }],
    });

    console.log(
      `📊 Found ${allRecords.length} receivables records to recalculate`
    );

    // Group records by tenant and driver
    const recordsByTenantAndDriver = new Map<
      string,
      Map<string, typeof allRecords>
    >();

    for (const record of allRecords) {
      const tenantKey = record.tenantId;
      const driverKey = record.driverId;

      if (!recordsByTenantAndDriver.has(tenantKey)) {
        recordsByTenantAndDriver.set(tenantKey, new Map());
      }

      const tenantRecords = recordsByTenantAndDriver.get(tenantKey)!;
      if (!tenantRecords.has(driverKey)) {
        tenantRecords.set(driverKey, []);
      }

      tenantRecords.get(driverKey)!.push(record);
    }

    let updatedCount = 0;
    let errors = [];

    // Process each tenant's drivers
    for (const [
      tenantId,
      driverRecords,
    ] of recordsByTenantAndDriver.entries()) {
      console.log(
        `🏢 Processing tenant ${tenantId} with ${driverRecords.size} drivers`
      );

      // Process each driver's records in chronological order
      for (const [driverId, records] of driverRecords.entries()) {
        console.log(
          `👤 Processing driver ${driverId} with ${records.length} records`
        );

        // Sort by date to ensure chronological order
        records.sort((a, b) => a.date.getTime() - b.date.getTime());

        let previousCashTotal = 0;
        let previousCylinderTotal = 0;
        let previousDate: Date | null = null;

        for (const record of records) {
          try {
            // Check if this is the same date as previous record
            const isSameDate =
              previousDate &&
              record.date.toDateString() === previousDate.toDateString();

            // Apply the correct formula:
            // For same date: totalCashReceivables = cashReceivablesChange + onboardingCashReceivables (no previous total)
            // For different date: totalCashReceivables = cashReceivablesChange + onboardingCashReceivables + PREVIOUS DAY'S totalCashReceivables
            const previousCashToAdd = isSameDate ? 0 : previousCashTotal;
            const previousCylinderToAdd = isSameDate
              ? 0
              : previousCylinderTotal;

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
              Math.abs(newTotalCash - record.totalCashReceivables) > 0.01 ||
              newTotalCylinders !== record.totalCylinderReceivables
            ) {
              console.log(
                `📝 Updating record ${record.id} for date ${record.date.toISOString().split('T')[0]}:`,
                {
                  oldCash: record.totalCashReceivables,
                  newCash: newTotalCash,
                  oldCylinders: record.totalCylinderReceivables,
                  newCylinders: newTotalCylinders,
                  formula: `${record.cashReceivablesChange} + ${record.onboardingCashReceivables || 0} + ${previousCashToAdd} = ${newTotalCash}`,
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
              tenantId,
              driverId,
              date: record.date.toISOString().split('T')[0],
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    }

    console.log(
      `✅ Receivables recalculation completed. Updated ${updatedCount} records.`
    );

    return NextResponse.json({
      success: true,
      message: `Fixed receivables for all tenants`,
      stats: {
        totalRecords: allRecords.length,
        updatedRecords: updatedCount,
        tenantsProcessed: recordsByTenantAndDriver.size,
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
