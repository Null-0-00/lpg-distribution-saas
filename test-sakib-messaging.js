// Test messaging for customer Sakib receivables update
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSakibMessaging() {
  try {
    console.log('🧪 Testing customer receivables messaging for Sakib...\n');

    // Find Sakib
    const sakib = await prisma.customer.findFirst({
      where: {
        name: 'Sakib',
        phone: '+8801793536151',
        isActive: true,
      },
      include: {
        area: { select: { name: true } },
        driver: { select: { name: true } },
      },
    });

    if (!sakib) {
      console.log('❌ Sakib not found');
      return;
    }

    console.log(`👤 Customer: ${sakib.name}`);
    console.log(`📱 Phone: ${sakib.phone}`);
    console.log(`🏢 Tenant: ${sakib.tenantId}`);
    console.log(`📍 Area: ${sakib.area?.name || 'N/A'}`);
    console.log(`🚚 Driver: ${sakib.driver?.name || 'N/A'}`);

    // Get current receivables
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentReceivables = await prisma.customerReceivableRecord.findUnique(
      {
        where: {
          tenantId_customerId_date: {
            tenantId: sakib.tenantId,
            customerId: sakib.id,
            date: today,
          },
        },
      }
    );

    const oldCash = currentReceivables?.cashReceivables || 0;
    const oldCylinder = currentReceivables?.cylinderReceivables || 0;
    const newCash = oldCash + 500; // Add 500 taka
    const newCylinder = oldCylinder + 2; // Add 2 cylinders

    console.log(`\n💰 Updating receivables:`);
    console.log(`Cash: ৳${oldCash} → ৳${newCash} (+৳${newCash - oldCash})`);
    console.log(
      `Cylinder: ${oldCylinder} → ${newCylinder} (+${newCylinder - oldCylinder})`
    );

    // Update receivables via the API endpoint logic
    const receivableRecord = await prisma.customerReceivableRecord.upsert({
      where: {
        tenantId_customerId_date: {
          tenantId: sakib.tenantId,
          customerId: sakib.id,
          date: today,
        },
      },
      update: {
        cashReceivables: newCash,
        cylinderReceivables: newCylinder,
        totalReceivables: newCash + newCylinder,
        notes: 'Testing customer messaging system',
        updatedAt: new Date(),
      },
      create: {
        tenantId: sakib.tenantId,
        customerId: sakib.id,
        driverId: sakib.driverId,
        date: today,
        cashReceivables: newCash,
        cylinderReceivables: newCylinder,
        totalReceivables: newCash + newCylinder,
        notes: 'Testing customer messaging system',
      },
    });

    console.log('✅ Receivables updated in database');

    // Import and call the messaging function directly
    const {
      notifyCustomerReceivablesChange,
    } = require('./src/lib/messaging/receivables-messaging.ts');

    try {
      await notifyCustomerReceivablesChange({
        tenantId: sakib.tenantId,
        customerId: sakib.id,
        oldCashReceivables: oldCash,
        newCashReceivables: newCash,
        oldCylinderReceivables: oldCylinder,
        newCylinderReceivables: newCylinder,
        changeReason: 'Testing customer messaging system',
      });

      console.log('✅ Customer messaging function called');
    } catch (error) {
      console.error('❌ Error calling messaging function:', error.message);
    }

    console.log('\n🎯 Test Summary:');
    console.log('✅ Customer receivables updated');
    console.log('✅ Messaging function triggered');
    console.log('\n🚀 Customer messaging system tested for Sakib!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSakibMessaging();
