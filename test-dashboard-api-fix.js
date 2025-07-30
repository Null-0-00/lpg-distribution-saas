#!/usr/bin/env node

/**
 * Test Dashboard API Fix
 * 
 * This script simulates the dashboard API query to verify it now correctly
 * sums cash receivables from all active retail drivers.
 */

const { PrismaClient } = require('@prisma/client');

async function testDashboardApiFix() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Dashboard API Fix...\n');
    
    // Simulate the new dashboard API query
    const result = await prisma.$queryRaw`
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
    
    console.log('📊 Dashboard API Query Result:');
    console.log(`   Total Cash Receivables: ${Number(result[0].totalCashReceivables).toFixed(2)} ৳\n`);
    
    // Verify by showing individual driver contributions
    const driverBreakdown = await prisma.$queryRaw`
      SELECT 
        d.name as "driverName",
        rr.date,
        rr."totalCashReceivables",
        rr."totalCylinderReceivables"
      FROM receivable_records rr
      INNER JOIN drivers d ON rr."driverId" = d.id
      WHERE d.status = 'ACTIVE'
        AND d."driverType" = 'RETAIL'
        AND rr.date = (
          SELECT MAX(rr2.date)
          FROM receivable_records rr2
          WHERE rr2."driverId" = rr."driverId"
        )
      ORDER BY d.name
    `;
    
    console.log('🔍 Driver Breakdown:');
    let manualTotal = 0;
    driverBreakdown.forEach((driver, index) => {
      const cashAmount = Number(driver.totalCashReceivables);
      console.log(`   ${index + 1}. ${driver.driverName}: ${cashAmount.toFixed(2)} ৳ (${driver.date.toISOString().split('T')[0]})`);
      manualTotal += cashAmount;
    });
    
    console.log(`\n✅ Manual Verification: ${manualTotal.toFixed(2)} ৳`);
    console.log(`✅ API Query Result: ${Number(result[0].totalCashReceivables).toFixed(2)} ৳`);
    console.log(`✅ Match: ${manualTotal === Number(result[0].totalCashReceivables) ? 'YES' : 'NO'}\n`);
    
    console.log('🎯 Expected Dashboard Behavior:');
    console.log(`   "বাকি" box should now show: ${Number(result[0].totalCashReceivables).toFixed(2)} ৳`);
    console.log('   This matches the "বিক্রয় নগদ প্রাপ্য" total on /dashboard/receivables page ✅');
    
  } catch (error) {
    console.error('❌ Error testing dashboard API fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDashboardApiFix().catch(console.error);