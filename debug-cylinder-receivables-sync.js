const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCylinderReceivablesSync() {
  try {
    // Get a specific driver with cylinder receivables
    const driverId = 'cmdvbkxz1000tub28y60nyk9j'; // BABLU from previous test

    console.log('=== DEBUGGING CYLINDER RECEIVABLES SYNC ===\n');

    // 1. Check the receivables record
    const receivablesRecord = await prisma.receivableRecord.findFirst({
      where: { driverId },
      orderBy: { date: 'desc' },
    });

    console.log('1. Receivables Record:', {
      totalCylinderReceivables:
        receivablesRecord?.totalCylinderReceivables || 0,
      cylinderReceivablesChange:
        receivablesRecord?.cylinderReceivablesChange || 0,
      date: receivablesRecord?.date?.toISOString().split('T')[0],
    });

    // 2. Check outstanding customer receivables for this driver
    const customerReceivables = await prisma.customerReceivable.findMany({
      where: {
        driverId,
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
    });

    const totalCustomerCylinderReceivables = customerReceivables.reduce(
      (sum, r) => sum + r.quantity,
      0
    );

    console.log('2. Customer Receivables:', {
      count: customerReceivables.length,
      details: customerReceivables.map((r) => ({
        customerName: r.customerName,
        quantity: r.quantity,
        size: r.size,
        status: r.status,
      })),
      totalQuantity: totalCustomerCylinderReceivables,
    });

    // 3. Check today's sales data for this driver
    const today = new Date();
    const startOfDay = new Date(
      today.toISOString().split('T')[0] + 'T00:00:00.000Z'
    );
    const endOfDay = new Date(
      today.toISOString().split('T')[0] + 'T23:59:59.999Z'
    );

    const todaysSales = await prisma.sale.findMany({
      where: {
        driverId,
        saleDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        saleType: true,
        quantity: true,
        cylindersDeposited: true,
        customerName: true,
        notes: true,
      },
    });

    const totalRefillQuantity = todaysSales
      .filter((s) => s.saleType === 'REFILL')
      .reduce((sum, s) => sum + s.quantity, 0);

    const totalCylinderDeposits = todaysSales.reduce(
      (sum, s) => sum + s.cylindersDeposited,
      0
    );

    console.log("3. Today's Sales:", {
      count: todaysSales.length,
      totalRefillQuantity,
      totalCylinderDeposits,
      calculatedChange: totalRefillQuantity - totalCylinderDeposits,
      details: todaysSales.map((s) => ({
        type: s.saleType,
        quantity: s.quantity,
        cylindersDeposited: s.cylindersDeposited,
        customer: s.customerName,
        notes: s.notes?.substring(0, 30) + '...',
      })),
    });

    // 4. Compare the numbers
    console.log('4. COMPARISON:');
    console.log(
      '   Receivables Record shows:',
      receivablesRecord?.totalCylinderReceivables || 0,
      'cylinders'
    );
    console.log(
      '   Customer Records total:',
      totalCustomerCylinderReceivables,
      'cylinders'
    );
    console.log(
      '   Difference:',
      Math.abs(
        (receivablesRecord?.totalCylinderReceivables || 0) -
          totalCustomerCylinderReceivables
      )
    );

    if (
      (receivablesRecord?.totalCylinderReceivables || 0) !==
      totalCustomerCylinderReceivables
    ) {
      console.log('   ❌ MISMATCH DETECTED!');
      console.log(
        '   The receivables record does not match the sum of customer receivables.'
      );
    } else {
      console.log('   ✅ Numbers match perfectly.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugCylinderReceivablesSync();
