const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCylinderReturnFix() {
  try {
    // Test with BABLU's first cylinder receivable
    const receivable = await prisma.customerReceivable.findFirst({
      where: {
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
        driverId: 'cmdvbkxz1000tub28y60nyk9j', // BABLU
      },
    });

    if (!receivable) {
      console.log('No cylinder receivables found for testing');
      return;
    }

    console.log('Testing cylinder return with:', {
      customer: receivable.customerName,
      quantity: receivable.quantity,
      size: receivable.size,
    });

    // Before state
    console.log('\n=== BEFORE CYLINDER RETURN ===');
    const beforeRecord = await prisma.receivableRecord.findFirst({
      where: { driverId: receivable.driverId },
      orderBy: { date: 'desc' },
    });

    const beforeCustomerReceivables = await prisma.customerReceivable.aggregate(
      {
        where: {
          driverId: receivable.driverId,
          receivableType: 'CYLINDER',
          status: { not: 'PAID' },
        },
        _sum: { quantity: true },
      }
    );

    console.log(
      'Receivables Record:',
      beforeRecord?.totalCylinderReceivables || 0
    );
    console.log(
      'Customer Receivables:',
      beforeCustomerReceivables._sum.quantity || 0
    );

    // Perform cylinder return API call
    console.log('\n=== PERFORMING CYLINDER RETURN ===');
    const returnQuantity = Math.min(2, receivable.quantity); // Return 2 or whatever is available

    const response = await fetch(
      'http://localhost:3000/api/receivables/cylinder-returns',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In real scenario, this would need proper authentication
        },
        body: JSON.stringify({
          customerReceivableId: receivable.id,
          quantity: returnQuantity,
          notes: 'Test cylinder return',
        }),
      }
    );

    if (response.ok) {
      console.log('✅ Cylinder return successful');
    } else {
      const error = await response.text();
      console.log('❌ Cylinder return failed:', error);
      return;
    }

    // After state
    console.log('\n=== AFTER CYLINDER RETURN ===');

    // Wait a moment for the calculation to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const afterRecord = await prisma.receivableRecord.findFirst({
      where: { driverId: receivable.driverId },
      orderBy: { date: 'desc' },
    });

    const afterCustomerReceivables = await prisma.customerReceivable.aggregate({
      where: {
        driverId: receivable.driverId,
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      _sum: { quantity: true },
    });

    console.log(
      'Receivables Record:',
      afterRecord?.totalCylinderReceivables || 0
    );
    console.log(
      'Customer Receivables:',
      afterCustomerReceivables._sum.quantity || 0
    );

    // Check if they match now
    const recordValue = afterRecord?.totalCylinderReceivables || 0;
    const customerValue = afterCustomerReceivables._sum.quantity || 0;

    console.log('\n=== VERIFICATION ===');
    if (recordValue === customerValue) {
      console.log(
        '✅ SUCCESS: Receivables record and customer receivables are now in sync!'
      );
      console.log(`   Both show ${recordValue} cylinders`);
    } else {
      console.log('❌ STILL NOT SYNCED:');
      console.log(`   Receivables Record: ${recordValue}`);
      console.log(`   Customer Receivables: ${customerValue}`);
      console.log(`   Difference: ${Math.abs(recordValue - customerValue)}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCylinderReturnFix();
