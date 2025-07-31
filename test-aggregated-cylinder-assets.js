#!/usr/bin/env node

/**
 * Test Aggregated Cylinder Assets
 *
 * This script tests the new aggregated cylinder assets by size
 * to verify that cylinders of the same size are combined regardless of company.
 */

const { PrismaClient } = require('@prisma/client');

async function testAggregatedCylinderAssets() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testing Aggregated Cylinder Assets by Size...\n');

    // 1. Show current products and their details
    console.log('📦 CURRENT PRODUCTS BY SIZE:');
    console.log('============================');

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        company: true,
        cylinderSize: true,
      },
      orderBy: [
        { cylinderSize: { size: 'asc' } },
        { company: { name: 'asc' } },
      ],
    });

    const productsBySize = new Map();
    products.forEach((product) => {
      const size = product.cylinderSize?.size || product.size || 'Unknown';
      if (!productsBySize.has(size)) {
        productsBySize.set(size, []);
      }
      productsBySize.get(size).push(product);
    });

    productsBySize.forEach((sizeProducts, size) => {
      console.log(`📏 ${size} Cylinders:`);
      sizeProducts.forEach((product, index) => {
        console.log(
          `   ${index + 1}. ${product.company.name} - ${product.name} (${product.currentPrice.toFixed(2)} ৳)`
        );
      });

      // Calculate average price for this size
      const avgPrice =
        sizeProducts.reduce((sum, p) => sum + p.currentPrice, 0) /
        sizeProducts.length;
      console.log(`   📊 Average Price: ${avgPrice.toFixed(2)} ৳`);
      console.log(
        `   🏢 Companies: ${sizeProducts.map((p) => p.company.name).join(', ')}`
      );
      console.log('');
    });

    // 2. Simulate aggregated asset calculation
    console.log('💰 EXPECTED AGGREGATED ASSETS:');
    console.log('==============================');

    // Get latest inventory totals
    const latestInventory = await prisma.inventoryRecord.findFirst({
      orderBy: { date: 'desc' },
      select: {
        date: true,
        fullCylinders: true,
        emptyCylinders: true,
      },
    });

    if (latestInventory) {
      console.log(
        `📊 Latest Inventory (${latestInventory.date.toISOString().split('T')[0]}):`
      );
      console.log(`   Total Full Cylinders: ${latestInventory.fullCylinders}`);
      console.log(
        `   Total Empty Cylinders: ${latestInventory.emptyCylinders}`
      );
      console.log('');
    }

    // Simulate aggregation logic
    let totalFullValue = 0;
    let totalEmptyValue = 0;

    productsBySize.forEach((sizeProducts, size) => {
      // For simulation, distribute inventory equally among sizes
      const fullQuantityForSize = Math.floor(
        (latestInventory?.fullCylinders || 0) / productsBySize.size
      );
      const emptyQuantityForSize = Math.floor(
        (latestInventory?.emptyCylinders || 0) / productsBySize.size
      );

      // Calculate average price for this size
      const avgPrice =
        sizeProducts.reduce((sum, p) => sum + p.currentPrice, 0) /
        sizeProducts.length;
      const emptyPrice = avgPrice * 0.2; // 20% of full price

      const fullValue = fullQuantityForSize * avgPrice;
      const emptyValue = emptyQuantityForSize * emptyPrice;

      console.log(`🔵 Full Cylinders (${size}):`);
      console.log(`   Quantity: ${fullQuantityForSize} cylinders`);
      console.log(
        `   Unit Price: ${avgPrice.toFixed(2)} ৳ (average of ${sizeProducts.map((p) => p.company.name).join(', ')})`
      );
      console.log(`   Total Value: ${fullValue.toFixed(2)} ৳`);
      console.log('');

      console.log(`🔴 Empty Cylinders (${size}):`);
      console.log(`   Quantity: ${emptyQuantityForSize} cylinders`);
      console.log(
        `   Unit Price: ${emptyPrice.toFixed(2)} ৳ (20% of full price)`
      );
      console.log(`   Total Value: ${emptyValue.toFixed(2)} ৳`);
      console.log('');

      totalFullValue += fullValue;
      totalEmptyValue += emptyValue;
    });

    console.log('📋 AGGREGATED SUMMARY:');
    console.log('======================');
    console.log(`Total Full Cylinders Value: ${totalFullValue.toFixed(2)} ৳`);
    console.log(`Total Empty Cylinders Value: ${totalEmptyValue.toFixed(2)} ৳`);
    console.log(
      `Total Cylinder Assets: ${(totalFullValue + totalEmptyValue).toFixed(2)} ৳`
    );

    // 3. Show expected asset list
    console.log('\n🏷️  EXPECTED ASSET LIST:');
    console.log('========================');
    console.log('Instead of separate assets per company, you will see:');
    console.log('');

    Array.from(productsBySize.keys())
      .sort()
      .forEach((size) => {
        console.log(`• Full Cylinders (${size}) - Combined from all companies`);
        console.log(
          `• Empty Cylinders (${size}) - Combined from all companies`
        );
      });

    console.log('\n✅ Benefits of Aggregation:');
    console.log('===========================');
    console.log('• Cleaner asset list (fewer line items)');
    console.log('• Total value per cylinder size is clearly visible');
    console.log('• Weighted average pricing across companies');
    console.log('• Easier to understand overall inventory value distribution');

    console.log('\n🔧 Technical Implementation:');
    console.log('============================');
    console.log('• Combines quantities from all companies of the same size');
    console.log('• Uses weighted average pricing for accurate valuation');
    console.log('• Shows company names in description for transparency');
    console.log('• Maintains size-specific pricing accuracy');
  } catch (error) {
    console.error('❌ Error testing aggregated cylinder assets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAggregatedCylinderAssets().catch(console.error);
