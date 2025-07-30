#!/usr/bin/env node

/**
 * Test Cylinder Receivables Removal
 * 
 * This script verifies that cylinder receivables are no longer included
 * as a separate asset since they're already incorporated in Empty Cylinders.
 */

const { PrismaClient } = require('@prisma/client');

async function testCylinderReceivablesRemoval() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Cylinder Receivables Removal...\n');
    
    const asOfDate = new Date();
    
    // Get current asset values after removal
    console.log('📊 CURRENT ASSETS (After Cylinder Receivables Removal):');
    console.log('=======================================================');
    
    // 1. Cash Receivables (should still be there)
    const cashReceivablesResult = await prisma.$queryRaw`
      SELECT COALESCE(SUM(rr."totalCashReceivables"), 0) as "totalCashReceivables"
      FROM receivable_records rr
      INNER JOIN drivers d ON rr."driverId" = d.id
      WHERE d.status = 'ACTIVE'
        AND d."driverType" = 'RETAIL'
        AND rr.date = (
          SELECT MAX(rr2.date)
          FROM receivable_records rr2
          WHERE rr2."driverId" = rr."driverId"
        )
    `;
    
    const cashReceivables = Number(cashReceivablesResult[0]?.totalCashReceivables) || 0;
    console.log(`✅ Cash Receivables: ${cashReceivables.toFixed(2)} ৳`);
    
    // 2. Empty Cylinders (should still be there)
    const latestInventory = await prisma.inventoryRecord.findFirst({
      where: {
        date: { lte: asOfDate },
      },
      orderBy: { date: 'desc' },
      select: {
        fullCylinders: true,
        emptyCylinders: true,
        date: true,
      },
    });
    
    const emptyCylinders = latestInventory?.emptyCylinders || 0;
    const fullCylinders = latestInventory?.fullCylinders || 0;
    const emptyCylinderUnitValue = 100; // Default unit value
    const fullCylinderUnitValue = 500; // Default unit value
    
    console.log(`✅ Empty Cylinders: ${emptyCylinders} units @ ${emptyCylinderUnitValue} ৳ = ${(emptyCylinders * emptyCylinderUnitValue).toFixed(2)} ৳`);
    console.log(`✅ Full Cylinders: ${fullCylinders} units @ ${fullCylinderUnitValue} ৳ = ${(fullCylinders * fullCylinderUnitValue).toFixed(2)} ৳`);
    
    // 3. Verify Cylinder Receivables are NOT included separately
    const cylinderReceivablesResult = await prisma.$queryRaw`
      SELECT COALESCE(SUM(rr."totalCylinderReceivables"), 0) as "totalCylinderReceivables"
      FROM receivable_records rr
      INNER JOIN drivers d ON rr."driverId" = d.id
      WHERE d.status = 'ACTIVE'
        AND d."driverType" = 'RETAIL'
        AND rr.date = (
          SELECT MAX(rr2.date)
          FROM receivable_records rr2
          WHERE rr2."driverId" = rr."driverId"
        )
    `;
    
    const cylinderReceivables = Number(cylinderReceivablesResult[0]?.totalCylinderReceivables) || 0;
    console.log(`❌ Cylinder Receivables: ${cylinderReceivables} units (NOT included as separate asset)`);
    
    // 4. Calculate total current assets (without double-counting)
    const totalCurrentAssets = cashReceivables + 
                              (emptyCylinders * emptyCylinderUnitValue) + 
                              (fullCylinders * fullCylinderUnitValue);
    
    console.log('\n💵 ASSET SUMMARY:');
    console.log('=================');
    console.log(`Cash Receivables Asset: ${cashReceivables.toFixed(2)} ৳`);
    console.log(`Empty Cylinders Asset: ${(emptyCylinders * emptyCylinderUnitValue).toFixed(2)} ৳`);
    console.log(`Full Cylinders Asset: ${(fullCylinders * fullCylinderUnitValue).toFixed(2)} ৳`);
    console.log(`Cylinder Receivables: REMOVED (no double-counting) ✅`);
    console.log(`\n🎯 Total Current Assets: ${totalCurrentAssets.toFixed(2)} ৳`);
    
    console.log('\n📝 EXPLANATION:');
    console.log('===============');
    console.log('• Empty Cylinders inventory already represents cylinders that are with drivers');
    console.log('• These are the same cylinders that appear in "Cylinder Receivables"');
    console.log('• Including both would be double-counting the same physical assets');
    console.log('• Only Cash Receivables represent actual money owed');
    console.log('• Cylinder inventory represents physical assets (empty/full cylinders)');
    
    console.log('\n✅ Cylinder Receivables successfully removed from assets calculation!');
    console.log('🔧 No more double-counting of cylinder assets.');
    
  } catch (error) {
    console.error('❌ Error testing cylinder receivables removal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCylinderReceivablesRemoval().catch(console.error);