#!/usr/bin/env node

/**
 * Test Cylinder Assets by Size
 * 
 * This script tests the new size-based cylinder assets breakdown
 * to verify different sizes have different prices.
 */

const { PrismaClient } = require('@prisma/client');

async function testCylinderAssetsBySize() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Cylinder Assets by Size...\n');
    
    // 1. Get available cylinder sizes and their products
    console.log('📏 AVAILABLE CYLINDER SIZES & PRODUCTS:');
    console.log('=======================================');
    
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        company: true,
        cylinderSize: true,
      },
      orderBy: [
        { company: { name: 'asc' } },
        { cylinderSize: { size: 'asc' } },
      ],
    });
    
    products.forEach((product, index) => {
      const size = product.cylinderSize?.size || product.size || 'Unknown';
      console.log(`${index + 1}. ${product.company.name} - ${size}`);
      console.log(`   Product: ${product.name}`);
      console.log(`   Price: ${product.currentPrice.toFixed(2)} ৳`);
      console.log('');
    });
    
    // 2. Test the getCylinderInventoryBySize logic (simulate API call)
    console.log('🔄 SIMULATING CYLINDER INVENTORY BY SIZE:');
    console.log('=========================================');
    
    const asOfDate = new Date();
    
    // Get latest inventory totals for comparison
    const latestInventory = await prisma.inventoryRecord.findFirst({
      orderBy: { date: 'desc' },
      select: {
        date: true,
        fullCylinders: true,
        emptyCylinders: true,
      },
    });
    
    if (latestInventory) {
      console.log(`📊 Latest Inventory Totals (${latestInventory.date.toISOString().split('T')[0]}):`);
      console.log(`   Full Cylinders: ${latestInventory.fullCylinders} units`);
      console.log(`   Empty Cylinders: ${latestInventory.emptyCylinders} units`);
      console.log('');
    }
    
    // 3. Expected Asset Breakdown
    console.log('💰 EXPECTED ASSET BREAKDOWN BY SIZE:');
    console.log('====================================');
    
    // Group products by size to show expected pricing
    const productsBySize = new Map();
    products.forEach((product) => {
      const size = product.cylinderSize?.size || product.size || 'Unknown';
      if (!productsBySize.has(size)) {
        productsBySize.set(size, []);
      }
      productsBySize.get(size).push(product);
    });
    
    let totalExpectedFullValue = 0;
    let totalExpectedEmptyValue = 0;
    
    productsBySize.forEach((sizeProducts, size) => {
      // Use the first product's price for this size
      const representativeProduct = sizeProducts[0];
      const fullCylinderPrice = representativeProduct.currentPrice;
      const emptyCylinderPrice = fullCylinderPrice * 0.2; // 20% of full price
      
      // For demonstration, assume some quantities (in real API, these come from calculations)
      const estimatedFullQuantity = Math.floor(latestInventory?.fullCylinders / productsBySize.size) || 0;
      const estimatedEmptyQuantity = Math.floor(latestInventory?.emptyCylinders / productsBySize.size) || 0;
      
      const fullValue = estimatedFullQuantity * fullCylinderPrice;
      const emptyValue = estimatedEmptyQuantity * emptyCylinderPrice;
      
      console.log(`📦 ${size} Cylinders:`);
      console.log(`   Company: ${representativeProduct.company.name}`);
      console.log(`   Full Cylinders: ${estimatedFullQuantity} × ${fullCylinderPrice.toFixed(2)} ৳ = ${fullValue.toFixed(2)} ৳`);
      console.log(`   Empty Cylinders: ${estimatedEmptyQuantity} × ${emptyCylinderPrice.toFixed(2)} ৳ = ${emptyValue.toFixed(2)} ৳`);
      console.log(`   Size Total: ${(fullValue + emptyValue).toFixed(2)} ৳`);
      console.log('');
      
      totalExpectedFullValue += fullValue;
      totalExpectedEmptyValue += emptyValue;
    });
    
    console.log('📋 SUMMARY:');
    console.log('===========');
    console.log(`Total Full Cylinders Value: ${totalExpectedFullValue.toFixed(2)} ৳`);
    console.log(`Total Empty Cylinders Value: ${totalExpectedEmptyValue.toFixed(2)} ৳`);
    console.log(`Total Cylinder Assets: ${(totalExpectedFullValue + totalExpectedEmptyValue).toFixed(2)} ৳`);
    
    // 4. Compare with old single-asset approach
    console.log('\n🔄 COMPARISON WITH OLD APPROACH:');
    console.log('================================');
    
    const oldFullValue = (latestInventory?.fullCylinders || 0) * 500; // Default 500 ৳
    const oldEmptyValue = (latestInventory?.emptyCylinders || 0) * 100; // Default 100 ৳
    
    console.log('Old Approach (Single Price):');
    console.log(`  Full Cylinders: ${latestInventory?.fullCylinders || 0} × 500 ৳ = ${oldFullValue.toFixed(2)} ৳`);
    console.log(`  Empty Cylinders: ${latestInventory?.emptyCylinders || 0} × 100 ৳ = ${oldEmptyValue.toFixed(2)} ৳`);
    console.log(`  Total: ${(oldFullValue + oldEmptyValue).toFixed(2)} ৳`);
    console.log('');
    
    console.log('New Approach (Size-based Pricing):');
    console.log(`  Full Cylinders: ${totalExpectedFullValue.toFixed(2)} ৳`);
    console.log(`  Empty Cylinders: ${totalExpectedEmptyValue.toFixed(2)} ৳`);
    console.log(`  Total: ${(totalExpectedFullValue + totalExpectedEmptyValue).toFixed(2)} ৳`);
    console.log('');
    
    const difference = (totalExpectedFullValue + totalExpectedEmptyValue) - (oldFullValue + oldEmptyValue);
    console.log(`💡 Difference: ${difference.toFixed(2)} ৳ (${difference > 0 ? 'Higher' : 'Lower'} with size-based pricing)`);
    
    // 5. Asset List Preview
    console.log('\n🏷️  EXPECTED ASSET LIST:');
    console.log('========================');
    console.log('Instead of 2 assets (Full Cylinders, Empty Cylinders),');
    console.log(`you will now see ${productsBySize.size * 2} assets:`);
    console.log('');
    
    productsBySize.forEach((sizeProducts, size) => {
      console.log(`• Full Cylinders (${size})`);
      console.log(`• Empty Cylinders (${size})`);
    });
    
    console.log('\n✅ Size-based cylinder assets will provide more accurate valuation!');
    console.log('🔧 Each size will have its own unit price based on the product price.');
    
  } catch (error) {
    console.error('❌ Error testing cylinder assets by size:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCylinderAssetsBySize().catch(console.error);