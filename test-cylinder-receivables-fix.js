const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCylinderReceivables() {
  try {
    // First, let's check a specific customer receivable with cylinder type
    const receivables = await prisma.customerReceivable.findMany({
      where: {
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      take: 3,
      include: {
        driver: { select: { name: true } },
      },
    });

    console.log(
      'Outstanding cylinder receivables:',
      receivables.map((r) => ({
        id: r.id,
        customerName: r.customerName,
        quantity: r.quantity,
        size: r.size,
        driverName: r.driver.name,
        driverId: r.driverId,
      }))
    );

    if (receivables.length > 0) {
      const receivable = receivables[0];

      // Check the driver's current receivables record
      const receivablesRecord = await prisma.receivableRecord.findFirst({
        where: {
          tenantId: receivable.tenantId,
          driverId: receivable.driverId,
        },
        orderBy: { date: 'desc' },
      });

      console.log(
        'Current receivables record for driver',
        receivable.driverId,
        ':',
        {
          totalCylinderReceivables:
            receivablesRecord?.totalCylinderReceivables || 0,
          cylinderReceivablesChange:
            receivablesRecord?.cylinderReceivablesChange || 0,
          date: receivablesRecord?.date?.toISOString().split('T')[0],
        }
      );

      // Check recent sales for this driver to see cylinder deposits
      const recentSales = await prisma.sale.findMany({
        where: {
          tenantId: receivable.tenantId,
          driverId: receivable.driverId,
          saleDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: { saleDate: 'desc' },
        take: 5,
        select: {
          id: true,
          saleDate: true,
          saleType: true,
          quantity: true,
          cylindersDeposited: true,
          customerName: true,
          notes: true,
        },
      });

      console.log(
        'Recent sales with cylinder deposits:',
        recentSales.map((s) => ({
          id: s.id,
          date: s.saleDate.toISOString().split('T')[0],
          type: s.saleType,
          quantity: s.quantity,
          cylindersDeposited: s.cylindersDeposited,
          customer: s.customerName,
          notes: s.notes?.substring(0, 50) + '...',
        }))
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCylinderReceivables();
