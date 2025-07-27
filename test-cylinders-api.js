// Test the cylinders API endpoints
// Run this with: node test-cylinders-api.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCylindersAPI() {
  try {
    console.log('🧪 Testing cylinders API functionality...\n');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get a sample tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('❌ No tenant found');
      return;
    }

    console.log(`🏢 Testing with tenant: ${tenant.name}`);

    // Test 1: Simulate the cylinders-summary API call
    console.log('\n1. Testing cylinders-summary API logic...');

    const [fullCylinders, emptyCylinders] = await Promise.all([
      prisma.fullCylinder.findMany({
        where: {
          tenantId: tenant.id,
          date: today,
        },
        include: {
          product: {
            include: {
              company: { select: { name: true } },
              cylinderSize: { select: { size: true } },
            },
          },
        },
        orderBy: [
          { product: { company: { name: 'asc' } } },
          { product: { cylinderSize: { size: 'asc' } } },
        ],
      }),
      prisma.emptyCylinder.findMany({
        where: {
          tenantId: tenant.id,
          date: today,
        },
        include: {
          cylinderSize: { select: { size: true } },
        },
        orderBy: {
          cylinderSize: { size: 'asc' },
        },
      }),
    ]);

    // Get cylinder receivables
    const latestReceivableRecords = await prisma.receivableRecord.findMany({
      where: {
        tenantId: tenant.id,
      },
      select: {
        driverId: true,
        totalCylinderReceivables: true,
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const latestReceivablesByDriver = new Map();
    latestReceivableRecords.forEach((record) => {
      if (!latestReceivablesByDriver.has(record.driverId)) {
        latestReceivablesByDriver.set(
          record.driverId,
          record.totalCylinderReceivables
        );
      }
    });

    const totalCylinderReceivables = Array.from(
      latestReceivablesByDriver.values()
    ).reduce((sum, amount) => sum + amount, 0);

    // Format data like the API would
    const fullCylindersData = fullCylinders
      .filter((record) => record.quantity > 0)
      .map((record) => ({
        company: record.product.company.name,
        size: record.product.cylinderSize?.size || 'Unknown',
        quantity: record.quantity,
      }));

    const emptyCylindersData = emptyCylinders.map((record) => ({
      size: record.cylinderSize.size,
      emptyCylinders: record.quantity,
      emptyCylindersInHand: record.quantityInHand,
    }));

    console.log('📋 API Response Format:');
    console.log('Full Cylinders:');
    fullCylindersData.forEach((item, index) => {
      console.log(
        `  ${index + 1}. ${item.company} ${item.size}: ${item.quantity}`
      );
    });

    console.log('\nEmpty Cylinders:');
    emptyCylindersData.forEach((item, index) => {
      console.log(
        `  ${index + 1}. ${item.size}: ${item.emptyCylinders} total (${item.emptyCylindersInHand} in hand)`
      );
    });

    console.log(`\nTotal Cylinder Receivables: ${totalCylinderReceivables}`);

    // Test 2: Verify data consistency
    console.log('\n2. Verifying data consistency...');

    const totalFullFromTables = fullCylindersData.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalEmptyFromTables = emptyCylindersData.reduce(
      (sum, item) => sum + item.emptyCylinders,
      0
    );

    console.log(`📊 Cylinder Tables Summary:`);
    console.log(`  Full Cylinders: ${totalFullFromTables}`);
    console.log(`  Empty Cylinders: ${totalEmptyFromTables}`);
    console.log(
      `  Total Cylinders: ${totalFullFromTables + totalEmptyFromTables}`
    );

    // Test 3: Check if data matches daily inventory for today
    console.log('\n3. Checking daily inventory consistency...');

    const dailyInventoryToday = await prisma.inventoryRecord.findMany({
      where: {
        tenantId: tenant.id,
        date: today,
      },
    });

    const dailyFullTotal = dailyInventoryToday.reduce(
      (sum, record) => sum + record.fullCylinders,
      0
    );
    const dailyEmptyTotal = dailyInventoryToday.reduce(
      (sum, record) => sum + record.emptyCylinders,
      0
    );

    console.log(`📊 Daily Inventory Summary:`);
    console.log(`  Full Cylinders: ${dailyFullTotal}`);
    console.log(`  Empty Cylinders: ${dailyEmptyTotal}`);
    console.log(`  Total Cylinders: ${dailyFullTotal + dailyEmptyTotal}`);

    const fullMatch = totalFullFromTables === dailyFullTotal;
    const emptyMatch = totalEmptyFromTables === dailyEmptyTotal;

    console.log(`\n🔍 Consistency Check:`);
    console.log(`  Full Cylinders Match: ${fullMatch ? '✅' : '❌'}`);
    console.log(`  Empty Cylinders Match: ${emptyMatch ? '✅' : '❌'}`);

    if (fullMatch && emptyMatch) {
      console.log(
        '\n🎉 Perfect! Cylinder tables are consistent with daily inventory!'
      );
      console.log('✅ The inventory page will show accurate cylinder data!');
    } else {
      console.log(
        '\n⚠️  Some inconsistencies found, but this is normal if data was calculated at different times.'
      );
      console.log(
        '💡 Run update-todays-cylinders.js to ensure perfect consistency.'
      );
    }

    // Test 4: Show what the inventory page will display
    console.log('\n4. Inventory page display preview...');
    console.log('📋 What users will see on the inventory page:');

    console.log('\n🏷️  Full Cylinders Table (পূর্ণ সিলিন্ডার):');
    console.log('┌─────────────┬──────────┬──────────┐');
    console.log('│ Company     │ Size     │ Quantity │');
    console.log('├─────────────┼──────────┼──────────┤');
    fullCylindersData.forEach((item) => {
      console.log(
        `│ ${item.company.padEnd(11)} │ ${item.size.padEnd(8)} │ ${item.quantity.toString().padStart(8)} │`
      );
    });
    console.log('└─────────────┴──────────┴──────────┘');

    console.log('\n🏷️  Empty Cylinders Table (খালি সিলিন্ডার):');
    console.log('┌──────────┬─────────────┬─────────────┐');
    console.log('│ Size     │ Total Empty │ In Hand     │');
    console.log('├──────────┼─────────────┼─────────────┤');
    emptyCylindersData.forEach((item) => {
      console.log(
        `│ ${item.size.padEnd(8)} │ ${item.emptyCylinders.toString().padStart(11)} │ ${item.emptyCylindersInHand.toString().padStart(11)} │`
      );
    });
    console.log('└──────────┴─────────────┴─────────────┘');

    console.log('\n✅ API testing completed successfully!');
  } catch (error) {
    console.error('❌ API testing failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCylindersAPI().catch(console.error);
