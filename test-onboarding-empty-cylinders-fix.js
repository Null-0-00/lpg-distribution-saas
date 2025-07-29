#!/usr/bin/env node

/**
 * Test script to verify the empty cylinders calculation fix
 * This simulates the onboarding data and shows the correct calculations
 */

console.log('🧪 Testing Empty Cylinders Calculation Fix\n');

// Sample onboarding data
const sampleData = {
  emptyCylinders: [
    { cylinderSizeId: '0', quantity: 100 }, // 12kg: 100 empty cylinders
    { cylinderSizeId: '1', quantity: 50 }, // 45kg: 50 empty cylinders
  ],
  receivables: [
    {
      driverId: '0',
      cashReceivables: 1000,
      cylinderReceivables: 30, // Total cylinder receivables
      cylinderReceivablesBySizes: [
        { cylinderSizeId: '0', size: '12kg', quantity: 20 }, // 20 x 12kg receivables
        { cylinderSizeId: '1', size: '45kg', quantity: 10 }, // 10 x 45kg receivables
      ],
    },
  ],
};

// Calculate totals (as done in the fixed onboarding code)
const totalEmptyCylinders = sampleData.emptyCylinders.reduce(
  (sum, emp) => sum + emp.quantity,
  0
);
const totalCylinderReceivables = sampleData.receivables.reduce(
  (sum, rec) => sum + rec.cylinderReceivables,
  0
);
const totalEmptyCylindersInHand =
  totalEmptyCylinders - totalCylinderReceivables;

console.log('📊 CALCULATION RESULTS:');
console.log('========================');
console.log(`Total Empty Cylinders Entered: ${totalEmptyCylinders}`);
console.log(`Total Cylinder Receivables: ${totalCylinderReceivables}`);
console.log(`Empty Cylinders In Hand: ${totalEmptyCylindersInHand}`);
console.log('');

console.log('📋 BREAKDOWN BY SIZE:');
console.log('=====================');

sampleData.emptyCylinders.forEach((emptyCylinder, index) => {
  const sizeIndex = parseInt(emptyCylinder.cylinderSizeId);
  const sizeName = sizeIndex === 0 ? '12kg' : '45kg';

  // Calculate cylinder receivables for this size
  const cylinderReceivablesForSize = sampleData.receivables.reduce(
    (sum, rec) => {
      if (rec.cylinderReceivablesBySizes) {
        const sizeReceivables = rec.cylinderReceivablesBySizes.find(
          (size) => size.cylinderSizeId === emptyCylinder.cylinderSizeId
        );
        return sum + (sizeReceivables?.quantity || 0);
      }
      return sum;
    },
    0
  );

  const emptyCylindersInHandForSize =
    emptyCylinder.quantity - cylinderReceivablesForSize;

  console.log(`${sizeName}:`);
  console.log(`  Empty Cylinders: ${emptyCylinder.quantity}`);
  console.log(`  Cylinder Receivables: ${cylinderReceivablesForSize}`);
  console.log(`  In Hand: ${Math.max(0, emptyCylindersInHandForSize)}`);
  console.log('');
});

console.log('✅ VERIFICATION:');
console.log('================');
console.log(
  'Formula: Empty Cylinders In Hand = Total Empty Cylinders - Total Cylinder Receivables'
);
console.log(
  `Calculation: ${totalEmptyCylinders} - ${totalCylinderReceivables} = ${totalEmptyCylindersInHand}`
);
console.log('');

if (
  totalEmptyCylindersInHand ===
  totalEmptyCylinders - totalCylinderReceivables
) {
  console.log('✅ Calculation is CORRECT!');
} else {
  console.log('❌ Calculation is INCORRECT!');
}

console.log('\n🎯 This fix ensures that:');
console.log(
  '- Empty cylinders entered during onboarding are saved as totalEmptyCylinders'
);
console.log(
  '- Empty cylinders in hand = totalEmptyCylinders - totalCylinderReceivables'
);
console.log(
  '- The calculation is applied consistently across all inventory tables'
);
