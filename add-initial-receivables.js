// Script to manually add initial receivables for drivers
// Run this with: node add-initial-receivables.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure initial receivables for each driver
const INITIAL_RECEIVABLES = {
  Bablu: { cash: 5000, cylinders: 3 },
  Nihan: { cash: 2000, cylinders: 1 },
  Sultan: { cash: 0, cylinders: 0 },
};

async function addInitialReceivables() {
  try {
    console.log('💰 Adding initial receivables...');

    // Get all active drivers
    const drivers = await prisma.driver.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, tenantId: true },
    });

    console.log(`👥 Found ${drivers.length} active drivers`);

    // Use the earliest date from existing records or today
    const earliestRecord = await prisma.receivableRecord.findFirst({
      orderBy: { date: 'asc' },
    });

    const onboardingDate = earliestRecord ? earliestRecord.date : new Date();
    onboardingDate.setHours(0, 0, 0, 0);

    console.log(
      `📅 Using onboarding date: ${onboardingDate.toISOString().split('T')[0]}`
    );

    for (const driver of drivers) {
      const initialData = INITIAL_RECEIVABLES[driver.name];

      if (!initialData) {
        console.log(
          `⚠️  No initial receivables configured for ${driver.name}, skipping`
        );
        continue;
      }

      if (initialData.cash === 0 && initialData.cylinders === 0) {
        console.log(
          `ℹ️  ${driver.name}: No initial receivables (0,0), skipping`
        );
        continue;
      }

      console.log(
        `💰 Setting initial receivables for ${driver.name}: Cash=${initialData.cash}, Cylinders=${initialData.cylinders}`
      );

      // Create or update the onboarding receivable record
      const result = await prisma.receivableRecord.upsert({
        where: {
          tenantId_driverId_date: {
            tenantId: driver.tenantId,
            driverId: driver.id,
            date: onboardingDate,
          },
        },
        update: {
          cashReceivablesChange: 0, // Onboarding values are starting balances, not changes
          cylinderReceivablesChange: 0,
          totalCashReceivables: initialData.cash,
          totalCylinderReceivables: initialData.cylinders,
          calculatedAt: new Date(),
        },
        create: {
          tenantId: driver.tenantId,
          driverId: driver.id,
          date: onboardingDate,
          cashReceivablesChange: 0, // Onboarding values are starting balances, not changes
          cylinderReceivablesChange: 0,
          totalCashReceivables: initialData.cash,
          totalCylinderReceivables: initialData.cylinders,
        },
      });

      console.log(`✅ ${driver.name}: Record ${result.id} created/updated`);

      // Now recalculate all subsequent records for this driver
      console.log(`🔄 Recalculating subsequent records for ${driver.name}...`);

      const subsequentRecords = await prisma.receivableRecord.findMany({
        where: {
          tenantId: driver.tenantId,
          driverId: driver.id,
          date: { gt: onboardingDate },
        },
        orderBy: { date: 'asc' },
      });

      let runningCash = initialData.cash;
      let runningCylinders = initialData.cylinders;

      for (const record of subsequentRecords) {
        runningCash += record.cashReceivablesChange;
        runningCylinders += record.cylinderReceivablesChange;

        await prisma.receivableRecord.update({
          where: { id: record.id },
          data: {
            totalCashReceivables: runningCash,
            totalCylinderReceivables: runningCylinders,
            calculatedAt: new Date(),
          },
        });

        console.log(
          `  📈 Updated ${record.date.toISOString().split('T')[0]}: Cash=${runningCash}, Cylinders=${runningCylinders}`
        );
      }
    }

    console.log('\n✅ Initial receivables added successfully!');
    console.log('📊 Summary:');

    // Show updated summary
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
          `  👤 ${driver.name}: Cash=${latestRecord.totalCashReceivables}, Cylinders=${latestRecord.totalCylinderReceivables}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Failed to add initial receivables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addInitialReceivables().catch(console.error);
