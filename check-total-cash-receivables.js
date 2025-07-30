#!/usr/bin/env node

/**
 * Check Total Cash Receivables
 * 
 * This script checks the total cash receivables across all drivers
 * to match what should be displayed on the dashboard.
 */

const { PrismaClient } = require('@prisma/client');

async function checkTotalCashReceivables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Total Cash Receivables...\n');
    
    // Get the latest receivable record for each driver
    const latestRecords = await prisma.receivableRecord.findMany({
      where: {
        driver: {
          status: 'ACTIVE',
          driverType: 'RETAIL'
        }
      },
      orderBy: { date: 'desc' },
      distinct: ['driverId'],
      select: {
        date: true,
        totalCashReceivables: true,
        totalCylinderReceivables: true,
        driver: {
          select: {
            name: true,
            status: true,
            driverType: true
          }
        }
      }
    });
    
    console.log('📊 Latest Receivable Records by Driver:');
    let totalCashReceivables = 0;
    let totalCylinderReceivables = 0;
    
    latestRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.driver.name} (${record.date.toISOString().split('T')[0]})`);
      console.log(`      Cash: ${record.totalCashReceivables.toFixed(2)} ৳`);
      console.log(`      Cylinders: ${record.totalCylinderReceivables} units`);
      console.log(`      Status: ${record.driver.status}, Type: ${record.driver.driverType}`);
      console.log('');
      
      totalCashReceivables += record.totalCashReceivables;
      totalCylinderReceivables += record.totalCylinderReceivables;
    });
    
    console.log('🎯 Dashboard Totals:');
    console.log(`   Total Cash Receivables: ${totalCashReceivables.toFixed(2)} ৳`);
    console.log(`   Total Cylinder Receivables: ${totalCylinderReceivables} units`);
    console.log(`   Combined Total (OLD): ${(totalCashReceivables + totalCylinderReceivables).toFixed(2)} ৳`);
    console.log(`   Dashboard Should Show (NEW): ${totalCashReceivables.toFixed(2)} ৳ (cash only) ✅\n`);
    
    // Check what the dashboard API query actually returns
    const dashboardQuery = await prisma.receivableRecord.findFirst({
      orderBy: { date: 'desc' },
      select: {
        totalCashReceivables: true,
        totalCylinderReceivables: true,
      },
    });
    
    if (dashboardQuery) {
      console.log('⚠️  Current Dashboard API Logic:');
      console.log(`   Uses single latest record: ${dashboardQuery.totalCashReceivables.toFixed(2)} ৳ cash`);
      console.log(`   This might not include all drivers!`);
      console.log('');
      console.log('💡 Recommendation:');
      console.log('   Dashboard should sum cash receivables from all active retail drivers');
      console.log(`   Expected total: ${totalCashReceivables.toFixed(2)} ৳`);
    }
    
  } catch (error) {
    console.error('❌ Error checking total cash receivables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkTotalCashReceivables().catch(console.error);