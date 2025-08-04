const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCylinderReceivablesBySize() {
  try {
    console.log('🔍 Checking cylinder receivables by size for Sakib...\n');

    // Find Sakib's cylinder receivables with sizes
    const cylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: 'cmdvbgp820000ub28u1hkluf4',
        customerName: 'Sakib',
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      select: {
        id: true,
        quantity: true,
        size: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${cylinderReceivables.length} cylinder receivables:`);

    // Group by size
    const sizeBreakdown = {};
    cylinderReceivables.forEach((receivable) => {
      const size = receivable.size || 'Unknown';
      if (!sizeBreakdown[size]) {
        sizeBreakdown[size] = 0;
      }
      sizeBreakdown[size] += receivable.quantity;
    });

    console.log('\n📊 Cylinder receivables by size:');
    Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
      console.log(`${size}: ${quantity} টি`);
    });

    console.log('\n📋 Individual records:');
    cylinderReceivables.forEach((receivable, index) => {
      console.log(
        `${index + 1}. Size: ${receivable.size || 'Unknown'}, Quantity: ${receivable.quantity}, Status: ${receivable.status}`
      );
    });

    // Check if there are any available cylinder sizes in the system
    console.log('\n🔧 Available cylinder sizes in system:');
    const cylinderSizes = await prisma.cylinderSize.findMany({
      where: { tenantId: 'cmdvbgp820000ub28u1hkluf4' },
      select: { size: true, name: true },
    });

    cylinderSizes.forEach((size) => {
      console.log(`- ${size.size} (${size.name})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCylinderReceivablesBySize();
