#!/usr/bin/env node

/**
 * Debug: Onboarding Baseline Creation Issue
 * This script helps identify why driver_cylinder_size_baselines records aren't being saved
 */

console.log('🔍 DEBUGGING ONBOARDING BASELINE CREATION\n');
console.log('=========================================\n');

console.log('🎯 ISSUE REPORTED:');
console.log('==================');
console.log('• Cylinder receivables still showing 0 on dashboard');
console.log('• driver_cylinder_size_baselines table is empty');
console.log('• Onboarding completion should create these records');

console.log('\n📋 DEBUGGING CHECKLIST:');
console.log('=======================');

console.log('\n1. VERIFY ONBOARDING DATA STRUCTURE:');
console.log('------------------------------------');
console.log('Expected onboarding data format:');
console.log(`
{
  "receivables": [
    {
      "driverId": "0",
      "cashReceivables": 1500.50,
      "cylinderReceivables": 15,
      "cylinderReceivablesBySizes": [
        {
          "cylinderSizeId": "0",
          "size": "12L",
          "quantity": 10
        },
        {
          "cylinderSizeId": "1", 
          "size": "35L",
          "quantity": 5
        }
      ]
    }
  ]
}
`);

console.log('\n2. CHECK DATABASE SCHEMA:');
console.log('-------------------------');
console.log('Verify driver_cylinder_size_baselines table exists:');
console.log(`
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'driver_cylinder_size_baselines';

-- Check table structure
\\d driver_cylinder_size_baselines;
`);

console.log('\n3. VERIFY ONBOARDING TRANSACTION:');
console.log('---------------------------------');
console.log('Check if onboarding transaction is completing successfully:');
console.log('• Look for any error logs during onboarding');
console.log('• Check if tenant.onboardingCompleted is set to true');
console.log('• Verify all other onboarding data is saved correctly');

console.log('\n4. DEBUG THE BASELINE CREATION LOGIC:');
console.log('-------------------------------------');
console.log('Add debug logging to onboarding completion:');
console.log(`
// Add this debug logging in onboarding/complete/route.ts
console.log('DEBUG: Starting baseline creation');
console.log('DEBUG: receivables data:', JSON.stringify(data.receivables, null, 2));

await Promise.all(
  data.receivables.map(async (receivable, receivableIndex) => {
    const driverIndex = parseInt(receivable.driverId);
    const driver = createdDrivers[driverIndex];
    
    console.log(\`DEBUG: Processing receivable \${receivableIndex}\`, {
      driverIndex,
      driverId: driver?.id,
      driverName: driver?.name,
      hasCylinderSizes: !!receivable.cylinderReceivablesBySizes,
      cylinderSizesCount: receivable.cylinderReceivablesBySizes?.length || 0
    });

    if (!driver || !receivable.cylinderReceivablesBySizes) {
      console.log('DEBUG: Skipping - no driver or no cylinder sizes');
      return;
    }

    await Promise.all(
      receivable.cylinderReceivablesBySizes.map(async (sizeReceivable, sizeIndex) => {
        console.log(\`DEBUG: Processing size \${sizeIndex}\`, {
          cylinderSizeId: sizeReceivable.cylinderSizeId,
          size: sizeReceivable.size,
          quantity: sizeReceivable.quantity
        });
        
        if (sizeReceivable.quantity > 0) {
          const sizeIndex = parseInt(sizeReceivable.cylinderSizeId);
          const cylinderSize = createdCylinderSizes[sizeIndex];
          
          console.log('DEBUG: Creating baseline record', {
            tenantId,
            driverId: driver.id,
            cylinderSizeId: cylinderSize?.id,
            baselineQuantity: sizeReceivable.quantity
          });

          if (cylinderSize) {
            const result = await tx.driverCylinderSizeBaseline.create({
              data: {
                tenantId,
                driverId: driver.id,
                cylinderSizeId: cylinderSize.id,
                baselineQuantity: sizeReceivable.quantity,
                source: 'ONBOARDING',
                notes: 'Initial onboarding cylinder receivables baseline',
              },
            });
            
            console.log('DEBUG: Baseline record created:', result.id);
          } else {
            console.log('DEBUG: No cylinder size found for index:', sizeIndex);
          }
        } else {
          console.log('DEBUG: Skipping - quantity is 0');
        }
      })
    );
  })
);

console.log('DEBUG: Baseline creation completed');
`);

console.log('\n5. MANUAL DATABASE VERIFICATION:');
console.log('--------------------------------');
console.log('After onboarding, check these queries:');
console.log(`
-- Check if any baseline records were created
SELECT COUNT(*) FROM driver_cylinder_size_baselines;

-- Check specific records
SELECT 
  dcsb.*,
  d.name as driver_name,
  cs.size as cylinder_size
FROM driver_cylinder_size_baselines dcsb
JOIN drivers d ON dcsb.driverId = d.id
JOIN cylinder_sizes cs ON dcsb.cylinderSizeId = cs.id
ORDER BY d.name, cs.size;

-- Check if onboarding completed
SELECT 
  name,
  onboardingCompleted,
  onboardingCompletedAt,
  onboardingCompletedBy
FROM tenants;

-- Check if other onboarding data was saved
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM cylinder_sizes;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM drivers;
SELECT COUNT(*) FROM customer_receivables;
`);

console.log('\n6. COMMON ISSUES TO CHECK:');
console.log('--------------------------');
console.log('❌ Transaction rollback due to error');
console.log('❌ Missing cylinderReceivablesBySizes in onboarding data');
console.log('❌ Invalid cylinderSizeId references');
console.log('❌ Database constraint violations');
console.log('❌ Prisma model mismatch with database schema');
console.log('❌ Transaction timeout (15 seconds)');

console.log('\n7. STEP-BY-STEP DEBUGGING:');
console.log('==========================');
console.log('1. Check browser network tab during onboarding');
console.log('2. Look for any 500 errors or failed requests');
console.log('3. Check server logs for error messages');
console.log('4. Verify onboarding data structure in request payload');
console.log('5. Add console.log statements to track execution');
console.log('6. Check database state after onboarding attempt');

console.log('\n8. ALTERNATIVE APPROACH:');
console.log('========================');
console.log('If baseline creation is still failing, try this manual fix:');
console.log(`
-- Manual baseline creation query (replace with actual IDs)
INSERT INTO driver_cylinder_size_baselines (
  id, tenantId, driverId, cylinderSizeId, 
  baselineQuantity, source, notes, createdAt, updatedAt
) VALUES 
  (
    'manual-baseline-1', 
    'your-tenant-id', 
    'your-driver-id', 
    'your-cylinder-size-id',
    10, 
    'MANUAL_FIX', 
    'Manual fix for missing onboarding baseline',
    NOW(), 
    NOW()
  );
`);

console.log('\n9. VERIFICATION AFTER FIX:');
console.log('==========================');
console.log('After fixing the baseline creation:');
console.log('1. Check driver_cylinder_size_baselines table has records');
console.log('2. Test API: GET /api/receivables/customers');
console.log('3. Verify API response includes cylinderSizeBreakdown');
console.log('4. Check dashboard shows cylinder receivables with breakdown');
console.log('5. Should see: সিলিন্ডার প্রাপ্য: 15 (12L: 10, 35L: 5)');

console.log('\n🚨 IMMEDIATE ACTION ITEMS:');
console.log('==========================');
console.log('1. Add debug logging to onboarding completion');
console.log('2. Run onboarding with debug logs enabled');
console.log('3. Check server console for debug output');
console.log('4. Verify database state after onboarding');
console.log('5. If still failing, create baseline records manually');

console.log('\n📞 NEXT STEPS:');
console.log('==============');
console.log('1. Enable debug logging in onboarding');
console.log('2. Attempt onboarding with cylinder receivables');
console.log('3. Share debug logs and database query results');
console.log('4. We can then identify the exact failure point');
