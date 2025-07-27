// Investigate why receivables are being reset to 0 after sales entry
// Run this with: node investigate-receivables-reset.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function investigateReceivablesReset() {
  try {
    console.log('🔍 Investigating receivables reset issue...\n');

    // 1. Get all receivable records with detailed timeline
    console.log('1. Getting complete receivables timeline...');
    const allRecords = await prisma.receivableRecord.findMany({
      include: {
        driver: { select: { name: true } },
      },
      orderBy: [{ driverId: 'asc' }, { date: 'asc' }],
    });

    console.log(`📊 Total receivable records: ${allRecords.length}\n`);

    // 2. Analyze each driver's receivables progression in detail
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

    console.log('2. Detailed receivables progression analysis:');
    for (const [driverId, data] of Object.entries(driverRecords)) {
      console.log(
        `\n👤 Driver: ${data.driverName} (${driverId.substring(0, 8)}...)`
      );
      console.log('📅 Complete receivables history:');

      data.records.forEach((record, index) => {
        const dateStr = record.date.toISOString().split('T')[0];
        const timeStr = record.createdAt
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19);
        const isFirst = index === 0;
        const isOnboarding =
          record.cashReceivablesChange === 0 &&
          record.cylinderReceivablesChange === 0 &&
          (record.totalCashReceivables > 0 ||
            record.totalCylinderReceivables > 0);

        console.log(`  ${isFirst ? '🏁' : '📈'} ${dateStr} (${timeStr})`);
        console.log(
          `     💰 Cash: ${record.totalCashReceivables} (Change: ${record.cashReceivablesChange})`
        );
        console.log(
          `     🛢️  Cylinders: ${record.totalCylinderReceivables} (Change: ${record.cylinderReceivablesChange})`
        );
        console.log(
          `     🏷️  Type: ${isOnboarding ? 'ONBOARDING' : 'SALES-BASED'}`
        );
        console.log(`     🆔 Record ID: ${record.id}`);

        // Check for suspicious patterns
        if (index > 0) {
          const prevRecord = data.records[index - 1];
          const expectedCash =
            prevRecord.totalCashReceivables + record.cashReceivablesChange;
          const expectedCylinders =
            prevRecord.totalCylinderReceivables +
            record.cylinderReceivablesChange;

          if (Math.abs(record.totalCashReceivables - expectedCash) > 0.01) {
            console.log(
              `     ⚠️  CASH CALCULATION ERROR: Expected ${expectedCash}, Got ${record.totalCashReceivables}`
            );
          }
          if (record.totalCylinderReceivables !== expectedCylinders) {
            console.log(
              `     ⚠️  CYLINDER CALCULATION ERROR: Expected ${expectedCylinders}, Got ${record.totalCylinderReceivables}`
            );
          }
        }
        console.log('');
      });
    }

    // 3. Check for recent sales and their impact
    console.log('\n3. Recent sales analysis...');
    const recentSales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`💰 Recent sales (last 7 days): ${recentSales.length}`);
    recentSales.forEach((sale) => {
      const saleDate = sale.saleDate.toISOString().split('T')[0];
      const createdAt = sale.createdAt
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);
      console.log(
        `  📦 ${sale.driver.name}: ${sale.saleType} ${sale.quantity} units on ${saleDate}`
      );
      console.log(
        `     💵 Value: ${sale.totalValue}, Cash Deposited: ${sale.cashDeposited}, Discount: ${sale.discount}`
      );
      console.log(`     🛢️  Cylinders Deposited: ${sale.cylindersDeposited}`);
      console.log(`     🕐 Created: ${createdAt}`);
      console.log('');
    });

    // 4. Check current receivables display logic
    console.log('4. Current receivables as shown in UI...');
    const drivers = await prisma.driver.findMany({
      where: { status: 'ACTIVE' },
      include: {
        receivableRecords: {
          orderBy: { date: 'desc' },
          take: 1,
          select: {
            totalCashReceivables: true,
            totalCylinderReceivables: true,
            cashReceivablesChange: true,
            cylinderReceivablesChange: true,
            date: true,
            createdAt: true,
          },
        },
      },
    });

    drivers.forEach((driver) => {
      const latestRecord = driver.receivableRecords[0];
      if (latestRecord) {
        console.log(`  👤 ${driver.name}:`);
        console.log(
          `     💰 Current Cash: ${latestRecord.totalCashReceivables}`
        );
        console.log(
          `     🛢️  Current Cylinders: ${latestRecord.totalCylinderReceivables}`
        );
        console.log(
          `     📅 Latest Record Date: ${latestRecord.date.toISOString().split('T')[0]}`
        );
        console.log(
          `     🕐 Record Created: ${latestRecord.createdAt.toISOString().replace('T', ' ').substring(0, 19)}`
        );
      } else {
        console.log(`  👤 ${driver.name}: No receivable records found`);
      }
      console.log('');
    });

    // 5. Check for any data corruption or inconsistencies
    console.log('5. Data integrity checks...');

    // Check for duplicate records on same date
    const duplicateCheck = await prisma.receivableRecord.groupBy({
      by: ['tenantId', 'driverId', 'date'],
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (duplicateCheck.length > 0) {
      console.log(
        `⚠️  Found ${duplicateCheck.length} duplicate records (same driver, same date)`
      );
      duplicateCheck.forEach((dup) => {
        console.log(
          `  - Driver ${dup.driverId.substring(0, 8)}... on ${dup.date.toISOString().split('T')[0]}`
        );
      });
    } else {
      console.log('✅ No duplicate records found');
    }

    // Check for records with invalid calculations
    const invalidRecords = allRecords.filter(
      (record) =>
        isNaN(record.totalCashReceivables) ||
        isNaN(record.totalCylinderReceivables) ||
        record.totalCashReceivables < 0 ||
        record.totalCylinderReceivables < 0
    );

    if (invalidRecords.length > 0) {
      console.log(
        `⚠️  Found ${invalidRecords.length} records with invalid values`
      );
      invalidRecords.forEach((record) => {
        console.log(
          `  - ${record.driver.name} on ${record.date.toISOString().split('T')[0]}: Cash=${record.totalCashReceivables}, Cylinders=${record.totalCylinderReceivables}`
        );
      });
    } else {
      console.log('✅ All records have valid values');
    }

    console.log('\n✅ Investigation complete!');
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateReceivablesReset().catch(console.error);
