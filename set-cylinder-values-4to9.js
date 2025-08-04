// Set cylinder values to show change from 4 to 9 for 12L
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setCylinderValues() {
  try {
    console.log(
      '🔧 Setting cylinder values to show change from 4 to 9 for 12L...\n'
    );

    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    // First, get current cylinder receivables
    const currentReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: sakibTenant,
        customerName: 'Sakib',
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      select: {
        id: true,
        quantity: true,
        size: true,
      },
    });

    console.log('Current unpaid cylinder receivables:');
    currentReceivables.forEach((record) => {
      console.log(
        `${record.size}: ${record.quantity} টি (ID: ${record.id.slice(-8)})`
      );
    });

    // Set the values to match what you want:
    // 12L: 9 (current/new value)
    // 35L: 3 (keeping this as current)

    // Update 12L record to 9
    const twelveLRecord = currentReceivables.find((r) => r.size === '12L');
    if (twelveLRecord) {
      await prisma.customerReceivable.update({
        where: { id: twelveLRecord.id },
        data: {
          quantity: 9,
          notes:
            'Set to 9 for testing receivables change message (from previous 4)',
        },
      });
      console.log(`✅ Updated 12L record to 9 quantity`);
    }

    // Update 35L record to 3
    const thirtyFiveLRecord = currentReceivables.find((r) => r.size === '35L');
    if (thirtyFiveLRecord) {
      await prisma.customerReceivable.update({
        where: { id: thirtyFiveLRecord.id },
        data: {
          quantity: 3,
          notes: 'Set to 3 for testing receivables change message',
        },
      });
      console.log(`✅ Updated 35L record to 3 quantity`);
    }

    // Verify the update
    console.log('\n📊 Updated cylinder receivable counts:');
    const updatedReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: sakibTenant,
        customerName: 'Sakib',
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      select: {
        quantity: true,
        size: true,
      },
    });

    const sizeBreakdown = {};
    updatedReceivables.forEach((receivable) => {
      const size = receivable.size || '12L';
      sizeBreakdown[size] = (sizeBreakdown[size] || 0) + receivable.quantity;
    });

    Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
      console.log(`${size}: ${quantity} টি`);
    });

    console.log('\n✅ Cylinder counts updated successfully!');
    console.log(
      'Now when a receivables change message is sent, it should show:'
    );
    console.log('Previous: 12L: 4 টি, 35L: 3 টি');
    console.log('New: 12L: 9 টি, 35L: 3 টি');
    console.log('Change: 5 টি (বৃদ্ধি)');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setCylinderValues();
