#!/usr/bin/env node

/**
 * Update Product Prices
 *
 * This script updates the product prices to realistic values
 * so the size-based cylinder assets can work properly.
 */

const { PrismaClient } = require('@prisma/client');

async function updateProductPrices() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Updating Product Prices...\n');

    // Get all products
    const products = await prisma.product.findMany({
      include: {
        company: true,
        cylinderSize: true,
      },
    });

    console.log('📦 Current Products:');
    products.forEach((product, index) => {
      const size = product.cylinderSize?.size || product.size || 'Unknown';
      console.log(
        `${index + 1}. ${product.company.name} ${size} - Current Price: ${product.currentPrice.toFixed(2)} ৳`
      );
    });

    // Define realistic prices based on size
    const pricesBySize = {
      '12L': 800, // 12L cylinders - 800 ৳
      '35L': 1200, // 35L cylinders - 1200 ৳
    };

    console.log('\n🔄 Updating prices...');

    // Update each product with realistic prices
    for (const product of products) {
      const size = product.cylinderSize?.size || product.size || 'Unknown';
      const newPrice = pricesBySize[size] || 1000; // Default 1000 ৳

      await prisma.product.update({
        where: { id: product.id },
        data: { currentPrice: newPrice },
      });

      console.log(
        `✅ Updated ${product.company.name} ${size}: ${product.currentPrice.toFixed(2)} ৳ → ${newPrice.toFixed(2)} ৳`
      );
    }

    console.log('\n📊 Updated Product Prices:');
    const updatedProducts = await prisma.product.findMany({
      include: {
        company: true,
        cylinderSize: true,
      },
    });

    updatedProducts.forEach((product, index) => {
      const size = product.cylinderSize?.size || product.size || 'Unknown';
      console.log(
        `${index + 1}. ${product.company.name} ${size} - New Price: ${product.currentPrice.toFixed(2)} ৳`
      );
    });

    console.log('\n✅ Product prices updated successfully!');
    console.log('🔧 Size-based cylinder assets will now use these prices.');
  } catch (error) {
    console.error('❌ Error updating product prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProductPrices().catch(console.error);
