const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncBabluReceivables() {
  try {
    const driverId = 'cmdvbkxz1000tub28y60nyk9j'; // BABLU

    // Get BABLU's tenant ID
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { tenantId: true, name: true },
    });

    if (!driver) {
      console.log('Driver not found');
      return;
    }

    console.log(`Syncing receivables for driver: ${driver.name}`);

    // Get actual outstanding customer receivables for BABLU
    const customerReceivables = await prisma.customerReceivable.groupBy({
      by: ['receivableType'],
      where: {
        tenantId: driver.tenantId,
        driverId: driverId,
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

    // Get the latest receivables record for BABLU
    const latestRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId: driver.tenantId,
        driverId: driverId,
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
        console.log(
          `🔧 Mismatch detected - syncing BABLU's receivables record`
        );

        await prisma.receivableRecord.update({
          where: { id: latestRecord.id },
          data: {
            totalCashReceivables: actualCashReceivables,
            totalCylinderReceivables: actualCylinderReceivables,
            calculatedAt: new Date(),
          },
        });

        console.log(`✅ BABLU's receivables record synced successfully`);

        // Verify the sync
        const updatedRecord = await prisma.receivableRecord.findUnique({
          where: { id: latestRecord.id },
        });

        console.log(
          `Updated record: Cash=${updatedRecord.totalCashReceivables}, Cylinders=${updatedRecord.totalCylinderReceivables}`
        );
      } else {
        console.log(`✅ BABLU's receivables already in sync`);
      }
    }

    // Now show BABLU's cylinder receivables for testing
    const babluCylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: driver.tenantId,
        driverId: driverId,
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
    });

    console.log("\nBABLU's outstanding cylinder receivables:");
    babluCylinderReceivables.forEach((r, i) => {
      console.log(
        `${i + 1}. Customer: ${r.customerName}, Quantity: ${r.quantity}, Size: ${r.size}, ID: ${r.id}`
      );
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncBabluReceivables();
