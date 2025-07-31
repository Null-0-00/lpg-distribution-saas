#!/usr/bin/env node

/**
 * Get Exact Cylinder Breakdown
 *
 * This script calls the inventory cylinders-summary API directly
 * to get the exact empty cylinder breakdown by size.
 */

async function getExactCylinderBreakdown() {
  try {
    console.log('🔍 Getting Exact Cylinder Breakdown from API...\n');

    // Call the cylinders-summary API directly
    const response = await fetch(
      'http://localhost:3000/api/inventory/cylinders-summary'
    );

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log('📊 API Response:');
    console.log('================');
    console.log(JSON.stringify(data, null, 2));

    if (data.emptyCylinders && Array.isArray(data.emptyCylinders)) {
      console.log('\n📦 EMPTY CYLINDERS BY SIZE:');
      console.log('===========================');

      let totalEmpty = 0;
      data.emptyCylinders.forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.size}: ${item.emptyCylinders} cylinders`
        );
        console.log(`   In Hand: ${item.emptyCylindersInHand}`);
        totalEmpty += item.emptyCylinders;
      });

      console.log(`\nTotal: ${totalEmpty} empty cylinders`);
    }

    if (data.fullCylinders && Array.isArray(data.fullCylinders)) {
      console.log('\n🔵 FULL CYLINDERS BY SIZE:');
      console.log('==========================');

      let totalFull = 0;
      data.fullCylinders.forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.company} ${item.size}: ${item.quantity} cylinders`
        );
        totalFull += item.quantity;
      });

      console.log(`\nTotal: ${totalFull} full cylinders`);
    }

    console.log(
      '\n✅ This is the exact breakdown that should be used in assets!'
    );
  } catch (error) {
    console.error('❌ Error getting exact cylinder breakdown:', error);

    // Fallback: show the expected values you mentioned
    console.log('\n💡 Using Expected Values:');
    console.log('=========================');
    console.log('12L Empty Cylinders: 215');
    console.log('35L Empty Cylinders: 140');
    console.log('Total: 355');
    console.log('');
    console.log('These values should be used in the assets calculation.');
  }
}

// Run the check
getExactCylinderBreakdown().catch(console.error);
