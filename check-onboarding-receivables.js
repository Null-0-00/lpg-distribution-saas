// Check for onboarding receivables in the database
// Run this with: node check-onboarding-receivables.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkOnboardingReceivables() {
  try {
    console.log('🔍 Checking onboarding receivables...\n');

    // 1. Get all receivable records ordered by date
    console.log('1. Getting all receivable records...');
    const allRecords = await prisma.receivableRecord.findMany({
      include: {
        driver: { select: { name: true } },
      },
      orderBy: [{ driverId: 'asc' }, { date: 'asc' }],
    });

    console.log(`📊 Total receivable records: ${allRecords.length}\n`);

    // 2. Group by driver to see the progression
    const driverRecords = {};
    allRecords.forEach((record) => {
      if (!driverRecords[record.driverId]) {
        driverRecords[record.driverId] = {
          driverName: record.driver.name,
          records: [],
        };
      }
      driverRecords[record.driverId].records.push(record);
    });

    // 3. Analyze each driver's receivables progression
    console.log('2. Driver receivables progression:');
    for (const [driverId, data] of Object.entries(driverRecords)) {
      console.log(
        `\n👤 Driver: ${data.driverName} (${driverId.substring(0, 8)}...)`
      );
      console.log('📅 Receivables history:');

      data.records.forEach((record, index) => {
        const dateStr = record.date.toISOString().split('T')[0];
        const isFirst = index === 0;
        const isOnboarding =
          record.cashReceivablesChange === 0 &&
          record.cylinderReceivablesChange === 0 &&
          (record.totalCashReceivables > 0 ||
            record.totalCylinderReceivables > 0);

        console.log(
          `  ${isFirst ? '🏁' : '📈'} ${dateStr}: Cash=${record.totalCashReceivables}, Cylinders=${record.totalCylinderReceivables} ${isOnboarding ? '(ONBOARDING)' : `(Change: Cash=${record.cashReceivablesChange}, Cylinders=${record.cylinderReceivablesChange})`}`
        );
      });
    }

    // 4. Check for potential onboarding records
    console.log(
      '\n3. Potential onboarding records (zero changes but non-zero totals):'
    );
    const onboardingRecords = allRecords.filter(
      (record) =>
        record.cashReceivablesChange === 0 &&
        record.cylinderReceivablesChange === 0 &&
        (record.totalCashReceivables > 0 || record.totalCylinderReceivables > 0)
    );

    if (onboardingRecords.length > 0) {
      console.log(
        `📋 Found ${onboardingRecords.length} potential onboarding records:`
      );
      onboardingRecords.forEach((record) => {
        console.log(
          `  - ${record.driver.name}: Cash=${record.totalCashReceivables}, Cylinders=${record.totalCylinderReceivables}, Date=${record.date.toISOString().split('T')[0]}`
        );
      });
    } else {
      console.log(
        '⚠️  No onboarding records found (records with zero changes but non-zero totals)'
      );
    }

    // 5. Check current receivables for each driver
    console.log('\n4. Current receivables for each driver:');
    const drivers = await prisma.driver.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, tenantId: true },
    });

    for (const driver of drivers) {
      const latestRecord = await prisma.receivableRecord.findFirst({
        where: {
          tenantId: driver.tenantId,
          driverId: driver.id,
        },
        orderBy: { date: 'desc' },
      });

      if (latestRecord) {
        console.log(
          `  👤 ${driver.name}: Cash=${latestRecord.totalCashReceivables}, Cylinders=${latestRecord.totalCylinderReceivables} (Latest: ${latestRecord.date.toISOString().split('T')[0]})`
        );
      } else {
        console.log(`  👤 ${driver.name}: No receivable records found`);
      }
    }

    // 6. Check if onboarding was completed
    console.log('\n5. Checking onboarding completion status:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
      },
    });

    users.forEach((user) => {
      console.log(
        `  👤 ${user.name}: Onboarding ${user.onboardingCompleted ? 'COMPLETED' : 'NOT COMPLETED'} ${user.onboardingCompletedAt ? `on ${user.onboardingCompletedAt.toISOString().split('T')[0]}` : ''}`
      );
    });

    console.log('\n✅ Onboarding receivables check complete!');
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkOnboardingReceivables().catch(console.error);
