#!/usr/bin/env node

/**
 * Check Actual Empty Cylinder Breakdown
 *
 * This script checks what the actual empty cylinder breakdown by size should be
 * by calling the inventory cylinders-summary API or checking the data directly.
 */

const { PrismaClient } = require('@prisma/client');

async function checkActualEmptyCylinderBreakdown() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking Actual Empty Cylinder Breakdown...\n');

    // 1. Check total empty cylinders from inventory record
    const latestInventory = await prisma.inventoryRecord.findFirst({
      orderBy: { date: 'desc' },
      select: {
        date: true,
        emptyCylinders: true,
        fullCylinders: true,
      },
    });

    console.log('📊 Latest Inventory Record:');
    console.log(
      `   Date: ${latestInventory?.date.toISOString().split('T')[0]}`
    );
    console.log(
      `   Total Empty Cylinders: ${latestInventory?.emptyCylinders || 0}`
    );
    console.log(
      `   Total Full Cylinders: ${latestInventory?.fullCylinders || 0}`
    );
    console.log('');

    // 2. Check what the cylinders-summary API would return
    console.log('🔄 Checking Cylinders Summary API Logic...');
    console.log('==========================================');

    // Get cylinder receivables breakdown by size (same logic as cylinders-summary)
    const cylinderReceivablesBySize = new Map();

    const activeDriversWithReceivables = await prisma.driver.findMany({
      where: {
        status: 'ACTIVE',
        driverType: 'RETAIL',
      },
      select: {
        id: true,
        name: true,
        receivableRecords: {
          select: {
            date: true,
            totalCylinderReceivables: true,
          },
          take: 1,
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    console.log('👥 Active Drivers with Receivables:');
    activeDriversWithReceivables.forEach((driver, index) => {
      const receivables =
        driver.receivableRecords[0]?.totalCylinderReceivables || 0;
      console.log(`   ${index + 1}. ${driver.name}: ${receivables} cylinders`);
    });
    console.log('');

    const driverIds = activeDriversWithReceivables
      .filter((d) => d.receivableRecords[0]?.totalCylinderReceivables > 0)
      .map((d) => d.id);

    if (driverIds.length > 0) {
      // Get baseline and sales data
      const [allBaselineBreakdowns, allSalesWithCylinders] = await Promise.all([
        prisma.driverCylinderSizeBaseline.findMany({
          where: {
            driverId: { in: driverIds },
          },
          select: {
            driverId: true,
            baselineQuantity: true,
            cylinderSize: {
              select: {
                size: true,
              },
            },
            driver: {
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.sale.findMany({
          where: {
            driverId: { in: driverIds },
            saleType: 'REFILL',
          },
          select: {
            driverId: true,
            quantity: true,
            cylindersDeposited: true,
            product: {
              select: {
                name: true,
                size: true,
                cylinderSize: {
                  select: {
                    size: true,
                  },
                },
              },
            },
            driver: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      console.log('📋 Driver Baseline Breakdowns:');
      allBaselineBreakdowns.forEach((baseline, index) => {
        console.log(
          `   ${index + 1}. ${baseline.driver.name} - ${baseline.cylinderSize.size}: ${baseline.baselineQuantity} cylinders`
        );
      });
      console.log('');

      // Group data by driver
      const baselinesByDriver = new Map();
      const salesByDriver = new Map();

      allBaselineBreakdowns.forEach((baseline) => {
        if (!baselinesByDriver.has(baseline.driverId)) {
          baselinesByDriver.set(baseline.driverId, []);
        }
        baselinesByDriver.get(baseline.driverId).push(baseline);
      });

      allSalesWithCylinders.forEach((sale) => {
        if (!salesByDriver.has(sale.driverId)) {
          salesByDriver.set(sale.driverId, []);
        }
        salesByDriver.get(sale.driverId).push(sale);
      });

      console.log('🧮 Calculating Size Breakdown per Driver:');
      console.log('==========================================');

      // Calculate receivables by size for each driver
      for (const driver of activeDriversWithReceivables) {
        const latestRecord = driver.receivableRecords[0];
        if (latestRecord?.totalCylinderReceivables > 0) {
          console.log(
            `\n👤 ${driver.name} (${latestRecord.totalCylinderReceivables} total receivables):`
          );

          const baselineBreakdown = baselinesByDriver.get(driver.id) || [];
          const salesWithCylinders = salesByDriver.get(driver.id) || [];

          const sizeBreakdown = {};

          // Initialize with onboarding baseline
          baselineBreakdown.forEach((item) => {
            const size = item.cylinderSize.size;
            sizeBreakdown[size] = item.baselineQuantity;
            console.log(`   📋 Baseline ${size}: ${item.baselineQuantity}`);
          });

          // Add/subtract sales data by specific cylinder sizes
          console.log('   🔄 Sales adjustments:');
          salesWithCylinders.forEach((sale) => {
            const size =
              sale.product?.cylinderSize?.size ||
              sale.product?.size ||
              sale.product?.name ||
              'Unknown';
            const receivablesChange =
              (sale.quantity || 0) - (sale.cylindersDeposited || 0);

            sizeBreakdown[size] =
              (sizeBreakdown[size] || 0) + receivablesChange;
            console.log(
              `      ${size}: ${receivablesChange > 0 ? '+' : ''}${receivablesChange} (sale: ${sale.quantity}, deposited: ${sale.cylindersDeposited})`
            );
          });

          // Use only positive values
          console.log('   📊 Final breakdown:');
          Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
            if (quantity > 0) {
              cylinderReceivablesBySize.set(
                size,
                (cylinderReceivablesBySize.get(size) || 0) + quantity
              );
              console.log(`      ${size}: ${quantity} cylinders`);
            }
          });
        }
      }
    }

    console.log('\n🎯 TOTAL RECEIVABLES BY SIZE:');
    console.log('=============================');
    cylinderReceivablesBySize.forEach((quantity, size) => {
      console.log(`   ${size}: ${quantity} cylinders`);
    });

    const totalReceivables = Array.from(
      cylinderReceivablesBySize.values()
    ).reduce((sum, val) => sum + val, 0);
    console.log(`   Total: ${totalReceivables} cylinders`);

    // 3. Calculate empty cylinder distribution
    console.log('\n📦 EMPTY CYLINDER DISTRIBUTION:');
    console.log('===============================');

    const totalEmptyCylinders = latestInventory?.emptyCylinders || 0;
    console.log(`Total Empty Cylinders to Distribute: ${totalEmptyCylinders}`);
    console.log('');

    const cylinderSizes = await prisma.cylinderSize.findMany({
      where: { isActive: true },
      orderBy: { size: 'asc' },
    });

    cylinderSizes.forEach((cylinderSize) => {
      const size = cylinderSize.size;
      const receivablesForSize = cylinderReceivablesBySize.get(size) || 0;

      let emptyCylindersForSize = 0;
      if (totalReceivables > 0 && receivablesForSize > 0) {
        const proportion = receivablesForSize / totalReceivables;
        emptyCylindersForSize = Math.floor(totalEmptyCylinders * proportion);
        console.log(
          `${size}: ${receivablesForSize}/${totalReceivables} = ${(proportion * 100).toFixed(1)}% → ${emptyCylindersForSize} empty cylinders`
        );
      } else if (cylinderSizes.length > 0) {
        emptyCylindersForSize = Math.floor(
          totalEmptyCylinders / cylinderSizes.length
        );
        console.log(
          `${size}: Equal distribution → ${emptyCylindersForSize} empty cylinders`
        );
      }

      const emptyCylindersInHand = Math.max(
        0,
        emptyCylindersForSize - receivablesForSize
      );
      console.log(
        `   In Hand: ${emptyCylindersInHand}, With Drivers: ${receivablesForSize}`
      );
    });

    console.log('\n💡 EXPECTED VALUES:');
    console.log('===================');
    console.log('You mentioned the correct values should be:');
    console.log('   12L: 215 empty cylinders');
    console.log('   35L: 140 empty cylinders');
    console.log('   Total: 355 empty cylinders');
    console.log('');
    console.log(
      'If this is correct, the calculation logic needs to be updated'
    );
    console.log(
      'to use the actual size-specific data instead of proportional distribution.'
    );
  } catch (error) {
    console.error('❌ Error checking actual empty cylinder breakdown:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkActualEmptyCylinderBreakdown().catch(console.error);
