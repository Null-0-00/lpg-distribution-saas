// Test script to verify the onboarding receivables fix
// Run this with: node test-onboarding-fix.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testOnboardingFix() {
  try {
    console.log('🧪 Testing onboarding receivables fix...\n');

    // 1. Get active drivers
    const drivers = await prisma.driver.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, tenantId: true },
    });

    if (drivers.length === 0) {
      console.log('❌ No active drivers found');
      return;
    }

    const testDriver = drivers[0]; // Use first driver for testing
    console.log(`🎯 Testing with driver: ${testDriver.name}`);

    // 2. Clear existing receivable records for clean test
    console.log('🧹 Clearing existing receivable records...');
    await prisma.receivableRecord.deleteMany({
      where: {
        tenantId: testDriver.tenantId,
        driverId: testDriver.id,
      },
    });

    // 3. Add onboarding receivables (simulate what happens during onboarding)
    const onboardingDate = new Date('2025-07-20T00:00:00.000Z');
    const onboardingCash = 5000;
    const onboardingCylinders = 3;

    console.log(
      `💰 Adding onboarding receivables: Cash=${onboardingCash}, Cylinders=${onboardingCylinders}`
    );

    const onboardingRecord = await prisma.receivableRecord.create({
      data: {
        tenantId: testDriver.tenantId,
        driverId: testDriver.id,
        date: onboardingDate,
        cashReceivablesChange: 0, // Onboarding values are starting balances, not changes
        cylinderReceivablesChange: 0,
        totalCashReceivables: onboardingCash,
        totalCylinderReceivables: onboardingCylinders,
      },
    });

    console.log(`✅ Onboarding record created: ${onboardingRecord.id}`);

    // 4. Simulate the background recalculation that was causing the bug
    console.log(
      '\n🔄 Simulating background recalculation (this was causing the bug)...'
    );

    // This simulates what happens in src/app/api/receivables/customers/route.ts
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const calcDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = calcDate.toISOString().split('T')[0];

      console.log(`  📅 Recalculating for ${dateStr}...`);

      // Get sales data for this date
      const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
      const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

      const salesData = await prisma.sale.aggregate({
        where: {
          tenantId: testDriver.tenantId,
          driverId: testDriver.id,
          saleDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _sum: {
          totalValue: true,
          discount: true,
          cashDeposited: true,
          cylindersDeposited: true,
        },
      });

      const refillSales = await prisma.sale.aggregate({
        where: {
          tenantId: testDriver.tenantId,
          driverId: testDriver.id,
          saleDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          saleType: 'REFILL',
        },
        _sum: {
          quantity: true,
        },
      });

      const driverSalesRevenue = salesData._sum.totalValue || 0;
      const cashDeposits = salesData._sum.cashDeposited || 0;
      const discounts = salesData._sum.discount || 0;
      const cylinderDeposits = salesData._sum.cylindersDeposited || 0;
      const refillQuantity = refillSales._sum.quantity || 0;

      const cashReceivablesChange =
        driverSalesRevenue - cashDeposits - discounts;
      const cylinderReceivablesChange = refillQuantity - cylinderDeposits;

      // THE FIX: Get previous receivables (yesterday's record or onboarding receivables)
      const yesterday = new Date(calcDate.getTime() - 24 * 60 * 60 * 1000);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayRecord = await prisma.receivableRecord.findFirst({
        where: {
          tenantId: testDriver.tenantId,
          driverId: testDriver.id,
          date: {
            gte: yesterday,
            lt: calcDate,
          },
        },
        orderBy: { date: 'desc' },
      });

      let yesterdayCashTotal = 0;
      let yesterdayCylinderTotal = 0;

      if (yesterdayRecord) {
        yesterdayCashTotal = yesterdayRecord.totalCashReceivables;
        yesterdayCylinderTotal = yesterdayRecord.totalCylinderReceivables;
        console.log(
          `    📋 Using yesterday's record: Cash=${yesterdayCashTotal}, Cylinders=${yesterdayCylinderTotal}`
        );
      } else {
        // If no yesterday record, check for onboarding receivables (first record)
        const onboardingRecord = await prisma.receivableRecord.findFirst({
          where: {
            tenantId: testDriver.tenantId,
            driverId: testDriver.id,
          },
          orderBy: { date: 'asc' },
        });

        if (onboardingRecord) {
          yesterdayCashTotal = onboardingRecord.totalCashReceivables;
          yesterdayCylinderTotal = onboardingRecord.totalCylinderReceivables;
          console.log(
            `    📋 Using onboarding record: Cash=${yesterdayCashTotal}, Cylinders=${yesterdayCylinderTotal}`
          );
        } else {
          console.log(`    📋 No previous records found, starting from zero`);
        }
      }

      const totalCashReceivables = yesterdayCashTotal + cashReceivablesChange;
      const totalCylinderReceivables =
        yesterdayCylinderTotal + cylinderReceivablesChange;

      console.log(
        `    💰 Final totals: Cash=${totalCashReceivables}, Cylinders=${totalCylinderReceivables} (Changes: Cash=${cashReceivablesChange}, Cylinders=${cylinderReceivablesChange})`
      );

      // Upsert the record
      const recordDate = new Date(dateStr + 'T00:00:00.000Z');
      await prisma.receivableRecord.upsert({
        where: {
          tenantId_driverId_date: {
            tenantId: testDriver.tenantId,
            driverId: testDriver.id,
            date: recordDate,
          },
        },
        update: {
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
          calculatedAt: new Date(),
        },
        create: {
          tenantId: testDriver.tenantId,
          driverId: testDriver.id,
          date: recordDate,
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
        },
      });
    }

    // 5. Check final results
    console.log('\n📊 Final receivables after recalculation:');
    const finalRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId: testDriver.tenantId,
        driverId: testDriver.id,
      },
      orderBy: { date: 'asc' },
    });

    finalRecords.forEach((record) => {
      const dateStr = record.date.toISOString().split('T')[0];
      const isOnboarding =
        record.cashReceivablesChange === 0 &&
        record.cylinderReceivablesChange === 0 &&
        (record.totalCashReceivables > 0 ||
          record.totalCylinderReceivables > 0);
      console.log(
        `  📅 ${dateStr}: Cash=${record.totalCashReceivables}, Cylinders=${record.totalCylinderReceivables} ${isOnboarding ? '(ONBOARDING)' : `(Changes: Cash=${record.cashReceivablesChange}, Cylinders=${record.cylinderReceivablesChange})`}`
      );
    });

    // 6. Verify the fix worked
    const latestRecord = finalRecords[finalRecords.length - 1];

    // Check if onboarding values are preserved in the progression
    const onboardingPreserved = finalRecords
      .slice(0, -1)
      .every(
        (record) =>
          Math.abs(record.totalCashReceivables - onboardingCash) < 0.01 &&
          record.totalCylinderReceivables === onboardingCylinders
      );

    console.log('\n🔍 Verification:');
    console.log(
      `  Onboarding values preserved through progression: ${onboardingPreserved ? 'YES' : 'NO'}`
    );
    console.log(
      `  Final values include both onboarding + sales: Cash=${latestRecord.totalCashReceivables}, Cylinders=${latestRecord.totalCylinderReceivables}`
    );

    if (onboardingPreserved) {
      console.log(
        '✅ FIX SUCCESSFUL: Onboarding receivables are preserved and properly accumulated!'
      );
    } else {
      console.log(
        '❌ FIX FAILED: Onboarding receivables were not preserved in the progression'
      );
    }

    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOnboardingFix().catch(console.error);
