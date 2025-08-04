const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testActualCylinderReturn() {
  try {
    // Use one of BABLU's cylinder receivables
    const receivableId = 'cmdw298qf002pubdc5dwncbm6'; // Sakib, 3 cylinders, 35L
    const returnQuantity = 2; // Return 2 out of 3 cylinders

    console.log('=== BEFORE CYLINDER RETURN ===');

    // Get the receivable details
    const receivable = await prisma.customerReceivable.findUnique({
      where: { id: receivableId },
      include: { driver: { select: { name: true } } },
    });

    if (!receivable) {
      console.log('Receivable not found');
      return;
    }

    console.log('Receivable details:', {
      customer: receivable.customerName,
      quantity: receivable.quantity,
      size: receivable.size,
      driver: receivable.driver.name,
    });

    // Check current receivables totals
    const beforeRecord = await prisma.receivableRecord.findFirst({
      where: { driverId: receivable.driverId },
      orderBy: { date: 'desc' },
    });

    console.log('Current totals:', {
      cylinderReceivables: beforeRecord?.totalCylinderReceivables || 0,
    });

    console.log('\n=== SIMULATING CYLINDER RETURN ===');

    // Simulate the cylinder return logic manually (since we can't easily call the API with auth)
    await prisma.$transaction(async (tx) => {
      const newQuantity = receivable.quantity - returnQuantity;
      const newStatus = newQuantity <= 0 ? 'PAID' : receivable.status;

      // Update customer receivable
      await tx.customerReceivable.update({
        where: { id: receivableId },
        data: {
          quantity: newQuantity,
          status: newStatus,
        },
      });

      console.log(
        `Updated customer receivable: ${receivable.quantity} -> ${newQuantity} cylinders`
      );

      // Find or create today's sales record for cylinder deposits
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Get any product for this sale record
      const product = await tx.product.findFirst({
        where: { tenantId: receivable.tenantId },
      });

      // Create a deposit-only sale record
      await tx.sale.create({
        data: {
          tenantId: receivable.tenantId,
          userId: 'system', // Would be actual user ID in real scenario
          driverId: receivable.driverId,
          productId: product?.id || '',
          saleDate: today,
          saleType: 'REFILL',
          paymentType: 'CASH',
          quantity: 0,
          unitPrice: 0,
          totalValue: 0,
          discount: 0,
          netValue: 0,
          cashDeposited: 0,
          cylindersDeposited: returnQuantity,
          customerName: receivable.customerName,
          notes: `Cylinder return test: ${returnQuantity} cylinders of ${receivable.size}`,
        },
      });

      console.log(
        `Created sale record with ${returnQuantity} cylinder deposits`
      );
    });

    // Now simulate the sync function
    console.log('\n=== SYNCING RECEIVABLES ===');

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

    let actualCylinderReceivables = 0;
    customerReceivables.forEach((group) => {
      if (group.receivableType === 'CYLINDER') {
        actualCylinderReceivables = group._sum.quantity || 0;
      }
    });

    // Update the receivables record
    const latestRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId: receivable.tenantId,
        driverId: receivable.driverId,
      },
      orderBy: { date: 'desc' },
    });

    if (latestRecord) {
      await prisma.receivableRecord.update({
        where: { id: latestRecord.id },
        data: {
          totalCylinderReceivables: actualCylinderReceivables,
          calculatedAt: new Date(),
        },
      });
    }

    console.log('\n=== AFTER CYLINDER RETURN ===');

    // Check the updated receivable
    const updatedReceivable = await prisma.customerReceivable.findUnique({
      where: { id: receivableId },
    });

    console.log('Updated receivable:', {
      customer: updatedReceivable.customerName,
      quantity: updatedReceivable.quantity,
      status: updatedReceivable.status,
    });

    // Check updated totals
    const afterRecord = await prisma.receivableRecord.findFirst({
      where: { driverId: receivable.driverId },
      orderBy: { date: 'desc' },
    });

    console.log('Updated totals:', {
      cylinderReceivables: afterRecord?.totalCylinderReceivables || 0,
    });

    // Verify the math
    const expectedTotal =
      (beforeRecord?.totalCylinderReceivables || 0) - returnQuantity;
    const actualTotal = afterRecord?.totalCylinderReceivables || 0;

    console.log('\n=== VERIFICATION ===');
    console.log(`Expected total: ${expectedTotal}`);
    console.log(`Actual total: ${actualTotal}`);

    if (expectedTotal === actualTotal) {
      console.log('✅ SUCCESS: Cylinder return correctly updated receivables!');
    } else {
      console.log('❌ MISMATCH: Something went wrong');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testActualCylinderReturn();
