// Check what onboarding data was actually saved
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOnboardingData() {
  try {
    console.log('=== CHECKING ONBOARDING DATA ===\n');

    // Check receivables baseline records
    const receivablesBaseline = await prisma.receivablesBaseline.findMany({
      include: {
        driver: { select: { name: true } },
        tenant: { select: { name: true } },
      },
    });

    console.log('Receivables Baseline Records:');
    receivablesBaseline.forEach((record, index) => {
      console.log(
        `${index + 1}. Driver: ${record.driver.name}, Type: ${record.receivableType}`
      );
      if (record.receivableType === 'CASH') {
        console.log(`   Cash Amount: ${record.cashAmount}`);
      } else {
        console.log(
          `   Cylinder Size: ${record.cylinderSize}, Quantity: ${record.cylinderQuantity}`
        );
      }
      console.log(`   Source: ${record.source}\n`);
    });

    // Check receivables snapshots
    const snapshots = await prisma.receivablesSnapshot.findMany({
      select: {
        snapshotType: true,
        driverReceivables: true,
        totalCashReceivables: true,
        totalCylinderReceivables: true,
        createdAt: true,
      },
    });

    console.log('\nReceivables Snapshots:');
    snapshots.forEach((snapshot, index) => {
      console.log(
        `${index + 1}. Type: ${snapshot.snapshotType}, Created: ${snapshot.createdAt}`
      );
      console.log(
        `   Total Cash: ${snapshot.totalCashReceivables}, Total Cylinders: ${snapshot.totalCylinderReceivables}`
      );
      console.log(
        `   Driver Data:`,
        JSON.stringify(snapshot.driverReceivables, null, 2)
      );
      console.log('');
    });
  } catch (error) {
    console.error('Error checking onboarding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOnboardingData();
