#!/usr/bin/env node

/**
 * Analyze Cylinder Inventory by Size
 * 
 * This script analyzes how cylinder inventory is tracked by size
 * to understand how to break down assets by cylinder sizes.
 */

const { PrismaClient } = require('@prisma/client');

async function analyzeCylinderInventoryBySize() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Analyzing Cylinder Inventory by Size...\n');
    
    // 1. Get available cylinder sizes
    console.log('📏 AVAILABLE CYLINDER SIZES:');
    console.log('============================');
    
    const cylinderSizes = await prisma.cylinderSize.findMany({
      select: {
        id: true,
        size: true,
        createdAt: true,
      },
      orderBy: { size: 'asc' },
    });
    
    cylinderSizes.forEach((size, index) => {
      console.log(`${index + 1}. ${size.size} (ID: ${size.id})`);
    });
    
    // 2. Check Full Cylinders by Size
    console.log('\n🟢 FULL CYLINDERS BY SIZE:');
    console.log('==========================');
    
    const fullCylindersBySize = await prisma.fullCylinder.findMany({
      select: {
        quantity: true,
        quantityWithDrivers: true,
        cylinderSize: {
          select: {
            size: true,
          },
        },
        product: {
          select: {
            name: true,
            currentPrice: true,
          },
        },
      },
      orderBy: {
        cylinderSize: {
          size: 'asc',
        },
      },
    });
    
    let totalFullCylinders = 0;
    let totalFullCylindersValue = 0;
    
    fullCylindersBySize.forEach((item, index) => {
      const totalQuantity = item.quantity + item.quantityWithDrivers;
      const unitPrice = item.product?.currentPrice || 500; // Default price
      const totalValue = totalQuantity * unitPrice;
      
      console.log(`${index + 1}. ${item.cylinderSize.size}:`);
      console.log(`   Quantity: ${totalQuantity} (${item.quantity} in hand + ${item.quantityWithDrivers} with drivers)`);
      console.log(`   Unit Price: ${unitPrice.toFixed(2)} ৳`);
      console.log(`   Total Value: ${totalValue.toFixed(2)} ৳`);
      console.log('');
      
      totalFullCylinders += totalQuantity;
      totalFullCylindersValue += totalValue;
    });
    
    console.log(`📊 Total Full Cylinders: ${totalFullCylinders} units = ${totalFullCylindersValue.toFixed(2)} ৳`);
    
    // 3. Check Empty Cylinders by Size
    console.log('\n🔴 EMPTY CYLINDERS BY SIZE:');
    console.log('===========================');
    
    const emptyCylindersBySize = await prisma.emptyCylinder.findMany({
      select: {
        quantity: true,
        quantityInHand: true,
        quantityWithDrivers: true,
        cylinderSize: {
          select: {
            size: true,
          },
        },
        product: {
          select: {
            name: true,
            currentPrice: true,
          },
        },
      },
      orderBy: {
        cylinderSize: {
          size: 'asc',
        },
      },
    });
    
    let totalEmptyCylinders = 0;
    let totalEmptyCylindersValue = 0;
    
    emptyCylindersBySize.forEach((item, index) => {
      const totalQuantity = item.quantity;
      // Empty cylinders are worth less than full ones - use 20% of product price
      const unitPrice = (item.product?.currentPrice || 500) * 0.2;
      const totalValue = totalQuantity * unitPrice;
      
      console.log(`${index + 1}. ${item.cylinderSize.size}:`);
      console.log(`   Quantity: ${totalQuantity} (${item.quantityInHand} in hand + ${item.quantityWithDrivers} with drivers)`);
      console.log(`   Unit Price: ${unitPrice.toFixed(2)} ৳ (20% of full cylinder price)`);
      console.log(`   Total Value: ${totalValue.toFixed(2)} ৳`);
      console.log('');
      
      totalEmptyCylinders += totalQuantity;
      totalEmptyCylindersValue += totalValue;
    });
    
    console.log(`📊 Total Empty Cylinders: ${totalEmptyCylinders} units = ${totalEmptyCylindersValue.toFixed(2)} ৳`);
    
    // 4. Compare with current inventory record totals
    console.log('\n📋 COMPARISON WITH INVENTORY RECORDS:');
    console.log('=====================================');
    
    const latestInventory = await prisma.inventoryRecord.findFirst({
      orderBy: { date: 'desc' },
      select: {
        date: true,
        fullCylinders: true,
        emptyCylinders: true,
      },
    });
    
    if (latestInventory) {
      console.log(`Latest Inventory Record (${latestInventory.date.toISOString().split('T')[0]}):`);
      console.log(`  Full Cylinders: ${latestInventory.fullCylinders} units`);
      console.log(`  Empty Cylinders: ${latestInventory.emptyCylinders} units`);
      console.log('');
      console.log('Size-based calculation:');
      console.log(`  Full Cylinders: ${totalFullCylinders} units`);
      console.log(`  Empty Cylinders: ${totalEmptyCylinders} units`);
      console.log('');
      
      if (totalFullCylinders !== latestInventory.fullCylinders) {
        console.log(`⚠️  Full Cylinders MISMATCH: Size-based (${totalFullCylinders}) ≠ Inventory Record (${latestInventory.fullCylinders})`);
      } else {
        console.log(`✅ Full Cylinders MATCH`);
      }
      
      if (totalEmptyCylinders !== latestInventory.emptyCylinders) {
        console.log(`⚠️  Empty Cylinders MISMATCH: Size-based (${totalEmptyCylinders}) ≠ Inventory Record (${latestInventory.emptyCylinders})`);
      } else {
        console.log(`✅ Empty Cylinders MATCH`);
      }
    }
    
    // 5. Summary for Assets API
    console.log('\n🎯 ASSETS API BREAKDOWN RECOMMENDATION:');
    console.log('=======================================');
    console.log('Instead of single "Full Cylinders" and "Empty Cylinders" assets,');
    console.log('create separate assets for each size:');
    console.log('');
    
    fullCylindersBySize.forEach((item) => {
      const totalQuantity = item.quantity + item.quantityWithDrivers;
      const unitPrice = item.product?.currentPrice || 500;
      const totalValue = totalQuantity * unitPrice;
      
      if (totalQuantity > 0) {
        console.log(`• Full Cylinders (${item.cylinderSize.size}): ${totalQuantity} × ${unitPrice.toFixed(2)} ৳ = ${totalValue.toFixed(2)} ৳`);
      }
    });
    
    emptyCylindersBySize.forEach((item) => {
      const totalQuantity = item.quantity;
      const unitPrice = (item.product?.currentPrice || 500) * 0.2;
      const totalValue = totalQuantity * unitPrice;
      
      if (totalQuantity > 0) {
        console.log(`• Empty Cylinders (${item.cylinderSize.size}): ${totalQuantity} × ${unitPrice.toFixed(2)} ৳ = ${totalValue.toFixed(2)} ৳`);
      }
    });
    
    console.log(`\n💰 Total Cylinder Assets Value: ${(totalFullCylindersValue + totalEmptyCylindersValue).toFixed(2)} ৳`);
    
  } catch (error) {
    console.error('❌ Error analyzing cylinder inventory by size:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeCylinderInventoryBySize().catch(console.error);