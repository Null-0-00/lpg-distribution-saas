// Test script for cylinder tables functionality
// Run this with: node test-cylinder-tables.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCylinderTables() {
  try {
    console.log('🧪 Testing cylinder tables functionality...\n');

    // Test 1: Check if tables exist and have data
    console.log('1. Checking table existence and data...');

    const [fullCylindersCount, emptyCylindersCount] = await Promise.all([
      prisma.fullCylinder.count(),
      prisma.emptyCylinder.count(),
    ]);

    console.log(`📦 Full cylinders records: ${fullCylindersCount}`);
    console.log(`🛢️  Empty cylinders records: ${emptyCylindersCount}`);

    if (fullCylindersCount === 0 && emptyCylindersCount === 0) {
      console.log(
        '⚠️  No data found. Run populate-cylinder-tables.js first.\n'
      );
      return;
    }

    // Test 2: Get sample data
    console.log('\n2. Sample data from tables...');

    const sampleFullCylinders = await prisma.fullCylinder.findMany({
      take: 3,
      include: {
        product: {
          include: {
            company: { select: { name: true } },
            cylinderSize: { select: { size: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sampleEmptyCylinders = await prisma.emptyCylinder.findMany({
      take: 3,
      include: {
        cylinderSize: { select: { size: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('📦 Sample Full Cylinders:');
    sampleFullCylinders.forEach((record, index) => {
      console.log(
        `  ${index + 1}. ${record.product.company.name} ${record.product.cylinderSize?.size}: ${record.quantity} units (${record.date.toISOString().split('T')[0]})`
      );
    });

    console.log('\n🛢️  Sample Empty Cylinders:');
    sampleEmptyCylinders.forEach((record, index) => {
      console.log(
        `  ${index + 1}. ${record.cylinderSize.size}: ${record.quantity} total, ${record.quantityInHand} in hand, ${record.quantityWithDrivers} with drivers (${record.date.toISOString().split('T')[0]})`
      );
    });

    // Test 3: Test API endpoint simulation
    console.log('\n3. Testing API endpoint logic...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get a sample tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('❌ No tenant found');
      return;
    }

    console.log(`🏢 Testing with tenant: ${tenant.name}`);

    // Simulate the cylinders-summary API call
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

    console.log(`📊 Today's data for ${tenant.name}:`);
    console.log(`  📦 Full cylinders: ${fullCylinders.length} product types`);
    console.log(`  🛢️  Empty cylinders: ${emptyCylinders.length} sizes`);

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

    console.log('\n📋 Formatted API Response:');
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

    // Test 4: Verify consistency with daily inventory
    console.log('\n4. Checking consistency with daily inventory...');

    const dailyInventory = await prisma.inventoryRecord.findMany({
      where: {
        tenantId: tenant.id,
        date: today,
      },
    });

    const inventoryFullTotal = dailyInventory.reduce(
      (sum, record) => sum + record.fullCylinders,
      0
    );
    const inventoryEmptyTotal = dailyInventory.reduce(
      (sum, record) => sum + record.emptyCylinders,
      0
    );

    const cylinderFullTotal = fullCylinders.reduce(
      (sum, record) => sum + record.quantity,
      0
    );
    const cylinderEmptyTotal = emptyCylinders.reduce(
      (sum, record) => sum + record.quantity,
      0
    );

    console.log(`📊 Consistency Check:`);
    console.log(
      `  Daily Inventory - Full: ${inventoryFullTotal}, Empty: ${inventoryEmptyTotal}`
    );
    console.log(
      `  Cylinder Tables - Full: ${cylinderFullTotal}, Empty: ${cylinderEmptyTotal}`
    );

    const fullMatch = inventoryFullTotal === cylinderFullTotal;
    const emptyMatch = inventoryEmptyTotal === cylinderEmptyTotal;

    console.log(`  Full Cylinders Match: ${fullMatch ? '✅' : '❌'}`);
    console.log(`  Empty Cylinders Match: ${emptyMatch ? '✅' : '❌'}`);

    if (fullMatch && emptyMatch) {
      console.log(
        '\n🎉 All tests passed! Cylinder tables are working correctly!'
      );
    } else {
      console.log(
        '\n⚠️  Some inconsistencies found. You may need to recalculate the data.'
      );
    }

    console.log('\n✅ Testing completed!');
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCylinderTables().catch(console.error);
