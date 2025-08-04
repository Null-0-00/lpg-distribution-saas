// Update customer phone to working WhatsApp number for testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCustomerPhone() {
  try {
    console.log('📱 Updating customer phone for testing...\n');

    // Find the customer with recent receivables
    const customer = await prisma.customer.findFirst({
      where: {
        name: 'Sakib',
        tenantId: 'cmdvbgp820000ub28u1hkluf4',
      },
    });

    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }

    console.log(`👤 Found customer: ${customer.name}`);
    console.log(`📱 Current phone: ${customer.phone}`);

    // Update to your specified WhatsApp number
    const workingPhone = '+8801793536151';

    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: { phone: workingPhone },
    });

    console.log(`✅ Updated phone to: ${updatedCustomer.phone}`);

    // Now test the customer messaging by updating receivables
    console.log('\n🔄 Testing receivables update with messaging...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current receivables
    const currentReceivables = await prisma.customerReceivableRecord.findUnique(
      {
        where: {
          tenantId_customerId_date: {
            tenantId: customer.tenantId,
            customerId: customer.id,
            date: today,
          },
        },
      }
    );

    const oldCash = currentReceivables?.cashReceivables || 0;
    const oldCylinder = currentReceivables?.cylinderReceivables || 0;
    const newCash = oldCash + 750; // Add 750 taka
    const newCylinder = oldCylinder + 3; // Add 3 cylinders

    console.log(
      `💰 Updating: Cash ${oldCash} → ${newCash}, Cylinder ${oldCylinder} → ${newCylinder}`
    );

    // Update receivables (this should trigger messaging)
    const updatedReceivables = await prisma.customerReceivableRecord.upsert({
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
        notes: 'Testing customer messaging integration',
      },
      create: {
        tenantId: customer.tenantId,
        customerId: customer.id,
        driverId: customer.driverId,
        date: today,
        cashReceivables: newCash,
        cylinderReceivables: newCylinder,
        totalReceivables: newCash + newCylinder,
        notes: 'Testing customer messaging integration',
      },
    });

    console.log('✅ Receivables updated');

    // Manual test of customer messaging
    console.log('\n📨 Manually triggering customer notification...');

    const testMessage = {
      number: workingPhone,
      text: `🔔 *বকেয়া আপডেট*

প্রিয় ${customer.name},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

পুরাতন বকেয়া: ৳${oldCash + oldCylinder}
নতুন বকেয়া: ৳${newCash + newCylinder}
পরিবর্তন: +৳${newCash + newCylinder - (oldCash + oldCylinder)}

নগদ বকেয়া: ৳${newCash}
সিলিন্ডার বকেয়া: ${newCylinder} টি

কারণ: Testing customer messaging integration
সময়: ${new Date().toLocaleString('bn-BD')}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
    };

    const fetch = require('node-fetch');
    const response = await fetch(
      'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/message/sendText/lpgapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
        },
        body: JSON.stringify(testMessage),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Customer receivables message sent successfully!');
      console.log(`📋 Message ID: ${result.key?.id}`);

      // Log to database
      await prisma.sentMessage.create({
        data: {
          tenantId: customer.tenantId,
          providerId: (
            await prisma.messageProvider.findFirst({
              where: { tenantId: customer.tenantId, isActive: true },
            })
          ).id,
          recipientType: 'CUSTOMER',
          recipientId: customer.id,
          phoneNumber: workingPhone,
          message: testMessage.text,
          trigger: 'RECEIVABLES_CHANGE',
          messageType: 'WHATSAPP',
          status: 'SENT',
          metadata: { messageId: result.key?.id, manual: true },
          sentAt: new Date(),
        },
      });

      console.log('✅ Message logged to database');
    } else {
      console.log('❌ Failed to send message');
      console.log('Error:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCustomerPhone();
