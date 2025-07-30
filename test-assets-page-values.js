#!/usr/bin/env node

/**
 * Test Assets Page Values
 * 
 * This script analyzes the current wrong values on the assets page
 * and calculates what the correct values should be.
 */

const { PrismaClient } = require('@prisma/client');

async function testAssetsPageValues() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Assets Page Values...\n');
    
    const asOfDate = new Date();
    
    // 1. CURRENT WRONG CALCULATION (Cash Receivables)
    console.log('💰 CASH RECEIVABLES ANALYSIS:');
    console.log('=====================================');
    
    const wrongCashReceivables = await prisma.receivable_records.aggregate({
      where: {
        date: { lte: asOfDate },
      },
      _sum: {
        totalCashReceivables: true,
      },
    });
    
    console.log(`❌ WRONG (Current Assets API): ${(wrongCashReceivables._sum.totalCashReceivables || 0).toFixed(2)} ৳`);
    console.log('   (This sums ALL historical records - incorrect!)');
    
    // CORRECT CALCULATION (Cash Receivables) - Same as dashboard fix
    const correctCashReceivables = await prisma.$queryRaw`
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
    
    console.log(`✅ CORRECT (Latest per driver): ${Number(correctCashReceivables[0].totalCashReceivables).toFixed(2)} ৳`);
    console.log('   (This gets latest record per driver - correct!)');
    
    // 2. CURRENT WRONG CALCULATION (Cylinder Receivables)
    console.log('\n🛢️  CYLINDER RECEIVABLES ANALYSIS:');
    console.log('=====================================');
    
    const wrongCylinderReceivables = await prisma.receivable_records.aggregate({
      where: {
        date: { lte: asOfDate },
      },
      _sum: {
        totalCylinderReceivables: true,
      },
    });
    
    console.log(`❌ WRONG (Current Assets API): ${wrongCylinderReceivables._sum.totalCylinderReceivables || 0} cylinders`);
    console.log('   (This sums ALL historical records - incorrect!)');
    
    // CORRECT CALCULATION (Cylinder Receivables)
    const correctCylinderReceivables = await prisma.$queryRaw`
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
    
    console.log(`✅ CORRECT (Latest per driver): ${Number(correctCylinderReceivables[0].totalCylinderReceivables)} cylinders`);
    console.log('   (This gets latest record per driver - correct!)');
    
    // 3. EMPTY CYLINDERS ANALYSIS
    console.log('\n📦 EMPTY CYLINDERS ANALYSIS:');
    console.log('=====================================');
    
    // Get the current calculation from assets API logic
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: { lte: asOfDate },
      },
      select: {
        saleType: true,
        quantity: true,
      },
    });

    const shipments = await prisma.shipment.findMany({
      where: {
        status: 'COMPLETED',
        shipmentDate: { lte: asOfDate },
      },
      select: {
        shipmentType: true,
        quantity: true,
        notes: true,
      },
    });

    const refillSales = sales
      .filter((s) => s.saleType === 'REFILL')
      .reduce((sum, s) => sum + s.quantity, 0);

    const emptyBuys = shipments
      .filter((s) => s.shipmentType === 'INCOMING_EMPTY')
      .reduce((sum, s) => sum + s.quantity, 0);

    const emptySells = shipments
      .filter((s) => s.shipmentType === 'OUTGOING_EMPTY')
      .reduce((sum, s) => sum + s.quantity, 0);

    const emptyCylindersBuySell = emptyBuys - emptySells;
    const calculatedEmptyCylinders = Math.max(0, refillSales + emptyCylindersBuySell);
    
    console.log(`🔄 Assets API Calculation: ${calculatedEmptyCylinders} empty cylinders`);
    console.log(`   Formula: max(0, refillSales(${refillSales}) + emptyBuys(${emptyBuys}) - emptySells(${emptySells}))`);
    
    // Compare with latest inventory record
    const latestInventory = await prisma.inventoryRecord.findFirst({
      orderBy: { date: 'desc' },
      select: {
        date: true,
        emptyCylinders: true,
        fullCylinders: true,
      },
    });
    
    if (latestInventory) {
      console.log(`📊 Latest Inventory Record (${latestInventory.date.toISOString().split('T')[0]}): ${latestInventory.emptyCylinders} empty cylinders`);
      console.log(`   Full cylinders: ${latestInventory.fullCylinders}`);
      
      if (calculatedEmptyCylinders !== latestInventory.emptyCylinders) {
        console.log(`⚠️  MISMATCH: Calculated (${calculatedEmptyCylinders}) ≠ Inventory Record (${latestInventory.emptyCylinders})`);
      } else {
        console.log(`✅ MATCH: Calculated value matches inventory record`);
      }
    }
    
    // 4. SUMMARY
    console.log('\n📋 SUMMARY OF ISSUES:');
    console.log('=====================================');
    console.log(`Cash Receivables: ${(wrongCashReceivables._sum.totalCashReceivables || 0).toFixed(2)} ৳ → ${Number(correctCashReceivables[0].totalCashReceivables).toFixed(2)} ৳`);
    console.log(`Cylinder Receivables: ${wrongCylinderReceivables._sum.totalCylinderReceivables || 0} → ${Number(correctCylinderReceivables[0].totalCylinderReceivables)} cylinders`);
    console.log(`Empty Cylinders: ${calculatedEmptyCylinders} (needs verification against inventory)`);
    
  } catch (error) {
    console.error('❌ Error testing assets page values:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAssetsPageValues().catch(console.error);