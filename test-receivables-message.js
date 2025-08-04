// Test receivables messaging by simulating a customer receivable update
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the messaging service
async function testReceivablesMessaging() {
  console.log('🔔 Testing receivables messaging integration...');

  try {
    // Get a test customer
    const customer = await prisma.customer.findFirst({
      where: {
        isActive: true,
        phone: { not: null },
        // Look for a customer with phone number
      },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
        area: { select: { name: true } },
      },
    });

    if (!customer) {
      console.log('❌ No customer found with phone number');
      return;
    }

    if (!customer.phone) {
      console.log('❌ Customer has no phone number');
      return;
    }

    console.log(`📱 Found test customer: ${customer.name} (${customer.phone})`);
    console.log(`🚚 Driver: ${customer.driver?.name || 'None'}`);

    // Check if customer has existing receivables record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await prisma.customerReceivableRecord.findUnique({
      where: {
        tenantId_customerId_date: {
          tenantId: customer.tenantId,
          customerId: customer.id,
          date: today,
        },
      },
    });

    console.log('📋 Current receivables:', existingRecord || 'None');

    // Create/update receivables to trigger messaging
    const oldCash = existingRecord?.cashReceivables || 0;
    const oldCylinder = existingRecord?.cylinderReceivables || 0;
    const newCash = oldCash + 500; // Add 500 taka
    const newCylinder = oldCylinder + 2; // Add 2 cylinders

    console.log(
      `💰 Updating receivables: Cash ${oldCash} → ${newCash}, Cylinder ${oldCylinder} → ${newCylinder}`
    );

    // Update receivables
    const updatedRecord = await prisma.customerReceivableRecord.upsert({
      where: {
        tenantId_customerId_date: {
          tenantId: customer.tenantId,
          customerId: customer.id,
          date: today,
        },
      },
      update: {
        cashReceivables: newCash,
        cylinderReceivables: newCylinder,
        totalReceivables: newCash + newCylinder,
        notes: 'Test receivables update for messaging',
        updatedAt: new Date(),
      },
      create: {
        tenantId: customer.tenantId,
        customerId: customer.id,
        driverId: customer.driverId,
        date: today,
        cashReceivables: newCash,
        cylinderReceivables: newCylinder,
        totalReceivables: newCash + newCylinder,
        notes: 'Test receivables update for messaging',
      },
    });

    console.log('✅ Receivables updated:', updatedRecord);

    // Now manually trigger the messaging
    const {
      notifyCustomerReceivablesChange,
    } = require('./src/lib/messaging/customer-messaging');

    await notifyCustomerReceivablesChange({
      tenantId: customer.tenantId,
      customerId: customer.id,
      oldCashReceivables: oldCash,
      newCashReceivables: newCash,
      oldCylinderReceivables: oldCylinder,
      newCylinderReceivables: newCylinder,
      changeReason: 'Test receivables update',
      updatedBy: 'System Test',
    });

    console.log('🔔 Messaging triggered successfully!');
    console.log('📱 Check WhatsApp for the message');
  } catch (error) {
    console.error('❌ Error testing receivables messaging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testReceivablesMessaging();
