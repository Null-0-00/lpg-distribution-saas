const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCylinderCount() {
  try {
    console.log('🔍 Debugging cylinder count for Sakib...\n');

    // Get all cylinder receivables for Sakib
    const cylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: 'cmdvbgp820000ub28u1hkluf4',
        customerName: 'Sakib',
        receivableType: 'CYLINDER',
      },
      select: {
        id: true,
        quantity: true,
        size: true,
        status: true,
        createdAt: true,
        notes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(
      `Found ${cylinderReceivables.length} cylinder receivable records:`
    );

    let totalUnpaid = 0;
    const sizeBreakdownAll = {};
    const sizeBreakdownUnpaid = {};

    cylinderReceivables.forEach((receivable, index) => {
      const size = receivable.size || '12L';

      // All records
      if (!sizeBreakdownAll[size]) {
        sizeBreakdownAll[size] = 0;
      }
      sizeBreakdownAll[size] += receivable.quantity;

      // Only unpaid records
      if (receivable.status !== 'PAID') {
        if (!sizeBreakdownUnpaid[size]) {
          sizeBreakdownUnpaid[size] = 0;
        }
        sizeBreakdownUnpaid[size] += receivable.quantity;
        totalUnpaid += receivable.quantity;
      }

      console.log(
        `${index + 1}. ID: ${receivable.id.slice(-8)}, Size: ${receivable.size || 'NULL'}, Quantity: ${receivable.quantity}, Status: ${receivable.status}, Created: ${receivable.createdAt.toLocaleDateString()}`
      );
      if (receivable.notes) {
        console.log(`   Notes: ${receivable.notes.slice(0, 100)}...`);
      }
    });

    console.log('\n📊 All cylinder receivables by size:');
    Object.entries(sizeBreakdownAll).forEach(([size, quantity]) => {
      console.log(`${size}: ${quantity} টি`);
    });

    console.log('\n📊 Unpaid cylinder receivables by size:');
    Object.entries(sizeBreakdownUnpaid).forEach(([size, quantity]) => {
      console.log(`${size}: ${quantity} টি`);
    });

    console.log(`\nTotal unpaid cylinders: ${totalUnpaid}`);

    // Check what the messaging service would return
    console.log('\n🔧 Testing messaging service function...');
    const cylinderReceivablesForMessaging =
      await prisma.customerReceivable.findMany({
        where: {
          tenantId: 'cmdvbgp820000ub28u1hkluf4',
          customerName: 'Sakib',
          receivableType: 'CYLINDER',
          status: { not: 'PAID' },
        },
        select: {
          quantity: true,
          size: true,
        },
      });

    const messagingSizeBreakdown = {};
    cylinderReceivablesForMessaging.forEach((receivable) => {
      const size = receivable.size || '12L'; // Default to 12L if no size specified
      messagingSizeBreakdown[size] =
        (messagingSizeBreakdown[size] || 0) + receivable.quantity;
    });

    console.log('📨 What messaging service sees:');
    Object.entries(messagingSizeBreakdown).forEach(([size, quantity]) => {
      console.log(`${size}: ${quantity} টি`);
    });

    // Check if there's a specific issue with 12L records
    console.log('\n🔍 Detailed analysis of 12L records:');
    const twelveLRecords = cylinderReceivables.filter(
      (r) => (r.size || '12L') === '12L'
    );
    twelveLRecords.forEach((record, index) => {
      console.log(
        `${index + 1}. Quantity: ${record.quantity}, Status: ${record.status}, Created: ${record.createdAt.toISOString()}`
      );
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugCylinderCount();
