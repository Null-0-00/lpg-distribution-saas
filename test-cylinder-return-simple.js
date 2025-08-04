const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSimpleCylinderReturn() {
  try {
    // Find a cylinder receivable to test with
    const receivable = await prisma.customerReceivable.findFirst({
      where: {
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
        quantity: { gt: 0 },
      },
    });

    if (!receivable) {
      console.log('No cylinder receivables found');
      return;
    }

    console.log('Found receivable to test:', {
      id: receivable.id,
      customer: receivable.customerName,
      quantity: receivable.quantity,
      size: receivable.size,
      driverId: receivable.driverId,
    });

    // Test the sync function directly by importing the route logic
    // First, let's manually call the sync function logic

    // Get actual outstanding customer receivables
    const customerReceivables = await prisma.customerReceivable.groupBy({
      by: ['receivableType'],
      where: {
        tenantId: receivable.tenantId,
        driverId: receivable.driverId,
        status: { not: 'PAID' },
      },
      _sum: {
        amount: true,
        quantity: true,
      },
    });

    let actualCashReceivables = 0;
    let actualCylinderReceivables = 0;

    customerReceivables.forEach((group) => {
      if (group.receivableType === 'CASH') {
        actualCashReceivables = group._sum.amount || 0;
      } else if (group.receivableType === 'CYLINDER') {
        actualCylinderReceivables = group._sum.quantity || 0;
      }
    });

    console.log(
      `Actual customer receivables: Cash=${actualCashReceivables}, Cylinders=${actualCylinderReceivables}`
    );

    // Get the latest receivables record
    const latestRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId: receivable.tenantId,
        driverId: receivable.driverId,
      },
      orderBy: { date: 'desc' },
    });

    if (latestRecord) {
      console.log(
        `Current record: Cash=${latestRecord.totalCashReceivables}, Cylinders=${latestRecord.totalCylinderReceivables}`
      );

      // Check if sync is needed
      if (
        latestRecord.totalCashReceivables !== actualCashReceivables ||
        latestRecord.totalCylinderReceivables !== actualCylinderReceivables
      ) {
        console.log(`🔧 Mismatch detected - syncing receivables record`);

        await prisma.receivableRecord.update({
          where: { id: latestRecord.id },
          data: {
            totalCashReceivables: actualCashReceivables,
            totalCylinderReceivables: actualCylinderReceivables,
            calculatedAt: new Date(),
          },
        });

        console.log(`✅ Receivables record synced successfully`);

        // Verify the sync
        const updatedRecord = await prisma.receivableRecord.findUnique({
          where: { id: latestRecord.id },
        });

        console.log(
          `Updated record: Cash=${updatedRecord.totalCashReceivables}, Cylinders=${updatedRecord.totalCylinderReceivables}`
        );
      } else {
        console.log(`✅ Already in sync`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleCylinderReturn();
