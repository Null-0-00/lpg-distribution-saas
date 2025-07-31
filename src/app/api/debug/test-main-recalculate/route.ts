import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Test the main recalculate endpoint logic without auth
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Use actual tenant ID
    const tenantId = 'cmdqabjh00000ubs0gkdpyyx4';
    const days = 1; // Only test for today

    console.log(`🔄 TESTING: Recalculating receivables for ${days} days...`);

    // OPTIMIZED: Calculate all receivables in one efficient operation
    const results = await calculateReceivablesOptimized(tenantId, days);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`✅ TESTING: Completed receivables recalculation in ${duration.toFixed(2)}ms`);

    return NextResponse.json({
      success: true,
      message: `Receivables recalculated for ${days} days`,
      results,
      performance: {
        duration: `${duration.toFixed(2)}ms`,
        daysProcessed: days,
        optimization: 'Batch queries with exact calculations + onboarding support'
      }
    });
  } catch (error) {
    console.error('Error recalculating receivables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIMIZED: Batch calculate receivables for all drivers and dates efficiently
async function calculateReceivablesOptimized(tenantId: string, days: number) {
  console.log('🚀 Starting optimized batch calculation...');
  
  // Step 1: Get all active drivers once
  const drivers = await prisma.driver.findMany({
    where: { tenantId, status: 'ACTIVE', driverType: 'RETAIL' },
    select: { id: true, name: true },
  });
  
  console.log(`📊 Processing ${drivers.length} drivers for ${days} days`);
  
  if (drivers.length === 0) {
    return [];
  }
  
  const driverIds = drivers.map(d => d.id);
  const results = [];
  
  // Step 2: Create date range (just today for testing)
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const calcDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dates.push(calcDate);
  }
  
  // Step 3: BATCH FETCH ALL SALES DATA AT ONCE
  const earliestDate = dates[0];
  const latestDate = dates[dates.length - 1];
  
  const startOfPeriod = new Date(earliestDate);
  startOfPeriod.setHours(0, 0, 0, 0);
  
  const endOfPeriod = new Date(latestDate);
  endOfPeriod.setHours(23, 59, 59, 999);
  
  console.log('📈 Batch fetching all sales data...');
  
  // Single query to get ALL sales data for ALL drivers for ALL dates
  const allSales = await prisma.sale.findMany({
    where: {
      tenantId,
      driverId: { in: driverIds },
      saleDate: {
        gte: startOfPeriod,
        lte: endOfPeriod,
      },
    },
    select: {
      driverId: true,
      saleDate: true,
      saleType: true,
      totalValue: true,
      discount: true,
      cashDeposited: true,
      cylindersDeposited: true,
      quantity: true,
    },
  });
  
  console.log(`✅ Fetched ${allSales.length} sales records in single query`);
  
  // Step 4: BATCH FETCH ALL EXISTING RECEIVABLE RECORDS
  const allReceivableRecords = await prisma.receivableRecord.findMany({
    where: {
      tenantId,
      driverId: { in: driverIds },
    },
    select: {
      driverId: true,
      date: true,
      totalCashReceivables: true,
      totalCylinderReceivables: true,
      onboardingCashReceivables: true,
      onboardingCylinderReceivables: true,
    },
    orderBy: [
      { driverId: 'asc' },
      { date: 'asc' }
    ],
  });
  
  console.log(`✅ Fetched ${allReceivableRecords.length} existing receivable records`);
  
  // Step 5: GROUP DATA BY DRIVER AND DATE FOR EFFICIENT PROCESSING
  const salesByDriverDate = new Map<string, Map<string, typeof allSales>>();
  const receivablesByDriver = new Map<string, typeof allReceivableRecords>();
  
  // Group sales by driver and date
  allSales.forEach(sale => {
    const dateKey = sale.saleDate.toISOString().split('T')[0];
    
    if (!salesByDriverDate.has(sale.driverId)) {
      salesByDriverDate.set(sale.driverId, new Map());
    }
    
    const driverSales = salesByDriverDate.get(sale.driverId)!;
    if (!driverSales.has(dateKey)) {
      driverSales.set(dateKey, []);
    }
    
    driverSales.get(dateKey)!.push(sale);
  });
  
  // Group receivables by driver
  allReceivableRecords.forEach(record => {
    if (!receivablesByDriver.has(record.driverId)) {
      receivablesByDriver.set(record.driverId, []);
    }
    receivablesByDriver.get(record.driverId)!.push(record);
  });
  
  console.log('🔄 Processing calculations for all drivers and dates...');
  
  // Step 6: BATCH PROCESS ALL CALCULATIONS
  const upsertOperations = [];
  
  for (const date of dates) {
    const dateStr = date.toISOString().split('T')[0];
    const recordDate = new Date(dateStr + 'T00:00:00.000Z');
    
    for (const driver of drivers) {
      // Get sales for this driver on this date
      const driverDateSales = salesByDriverDate.get(driver.id)?.get(dateStr) || [];
      
      // Calculate aggregates for this driver-date combination
      let totalValue = 0;
      let discount = 0;
      let cashDeposited = 0;
      let cylindersDeposited = 0;
      let refillQuantity = 0;
      
      driverDateSales.forEach(sale => {
        totalValue += sale.totalValue || 0;
        discount += sale.discount || 0;
        cashDeposited += sale.cashDeposited || 0;
        cylindersDeposited += sale.cylindersDeposited || 0;
        
        if (sale.saleType === 'REFILL') {
          refillQuantity += sale.quantity || 0;
        }
      });
      
      // EXACT FORMULAS (unchanged):
      const cashReceivablesChange = totalValue - cashDeposited - discount;
      const cylinderReceivablesChange = refillQuantity - cylindersDeposited;
      
      // Find previous day's totals and today's onboarding values from pre-loaded data
      const driverReceivables = receivablesByDriver.get(driver.id) || [];
      let yesterdayCashTotal = 0;
      let yesterdayCylinderTotal = 0;
      let todaysOnboardingCash = 0;
      let todaysOnboardingCylinders = 0;
      
      // Find today's onboarding values (if any)
      const todaysRecord = driverReceivables.find(r => 
        r.date.getTime() === recordDate.getTime()
      );
      if (todaysRecord) {
        todaysOnboardingCash = todaysRecord.onboardingCashReceivables || 0;
        todaysOnboardingCylinders = todaysRecord.onboardingCylinderReceivables || 0;
      }
      
      // Find the latest record before this date (exclude same date)
      const recordsBeforeThisDate = driverReceivables.filter(r => r.date < recordDate);
      if (recordsBeforeThisDate.length > 0) {
        const latestRecord = recordsBeforeThisDate[recordsBeforeThisDate.length - 1];
        yesterdayCashTotal = latestRecord.totalCashReceivables;
        yesterdayCylinderTotal = latestRecord.totalCylinderReceivables;
      }
      
      // CORRECTED FORMULAS with onboarding values:
      // totalCashReceivables = cashReceivablesChange + onboardingCashReceivables + PREVIOUS DAY'S totalCashReceivables
      const totalCashReceivables = cashReceivablesChange + todaysOnboardingCash + yesterdayCashTotal;
      const totalCylinderReceivables = cylinderReceivablesChange + todaysOnboardingCylinders + yesterdayCylinderTotal;
      
      console.log(`${driver.name} calculation:`, {
        formula: `${cashReceivablesChange} + ${todaysOnboardingCash} + ${yesterdayCashTotal} = ${totalCashReceivables}`,
        currentInDB: todaysRecord?.totalCashReceivables,
        newCalculated: totalCashReceivables,
        needsUpdate: todaysRecord ? Math.abs(totalCashReceivables - todaysRecord.totalCashReceivables) > 0.01 : true,
      });
      
      // Prepare upsert operation
      upsertOperations.push({
        where: {
          tenantId_driverId_date: {
            tenantId,
            driverId: driver.id,
            date: recordDate,
          },
        },
        update: {
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
          // Only update onboarding values if they exist (using > 0 to handle 0 values properly)
          ...(todaysOnboardingCash > 0 && { onboardingCashReceivables: todaysOnboardingCash }),
          ...(todaysOnboardingCylinders > 0 && { onboardingCylinderReceivables: todaysOnboardingCylinders }),
        },
        create: {
          tenantId,
          driverId: driver.id,
          date: recordDate,
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
          onboardingCashReceivables: todaysOnboardingCash || 0,
          onboardingCylinderReceivables: todaysOnboardingCylinders || 0,
        },
      });
    }
    
    results.push({ date: dateStr, status: 'calculated' });
  }
  
  // Step 7: SHOW WHAT WOULD BE UPDATED (for testing - don't actually update)
  console.log(`💾 Would execute ${upsertOperations.length} upsert operations...`);
  
  return {
    results,
    upsertOperations: upsertOperations.map(op => ({
      driverName: drivers.find(d => d.id === op.create.driverId)?.name,
      ...op
    })),
  };
}