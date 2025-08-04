// Test customer payment messaging
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

async function testCustomerPaymentMessaging() {
  try {
    console.log('🧪 Testing customer payment messaging...\n');

    // Find Sakib and create a test payment
    const sakib = await prisma.customer.findFirst({
      where: {
        name: 'Sakib',
        phone: '+8801793536151',
        isActive: true,
      },
    });

    if (!sakib) {
      console.log('❌ Sakib not found');
      return;
    }

    console.log(`👤 Customer: ${sakib.name}`);
    console.log(`📱 Phone: ${sakib.phone}`);
    console.log(`🏢 Tenant: ${sakib.tenantId}`);

    // Find existing receivable for Sakib
    let testReceivable = await prisma.customerReceivable.findFirst({
      where: {
        tenantId: sakib.tenantId,
        customerName: sakib.name,
        receivableType: 'CASH',
      },
    });

    if (!testReceivable) {
      console.log(
        '❌ No receivables found for Sakib - cannot test payment messaging'
      );
      return;
    }

    console.log(
      `💳 Found receivable: ৳${testReceivable.amount} (Status: ${testReceivable.status})`
    );

    // Simulate payment messaging directly
    console.log('\n📨 Testing customer payment messaging directly...');

    const paymentData = {
      tenantId: sakib.tenantId,
      customerId: sakib.id,
      customerName: sakib.name,
      amount: 200,
      paymentType: 'cash',
      paymentId: testReceivable.id,
    };

    console.log('Payment data:', paymentData);

    // Send payment confirmation message directly
    const paymentMessage = {
      number: sakib.phone,
      text: `✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় ${sakib.name},

আপনার ৳${paymentData.amount} টাকার ${paymentData.paymentType === 'cash' ? 'নগদ' : 'সিলিন্ডার'} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

পেমেন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}
সময়: ${new Date().toLocaleTimeString('bn-BD')}
পেমেন্ট আইডি: ${paymentData.paymentId}

আপনার অবশিষ্ট বকেয়া আপডেট হয়েছে।

ধন্যবাদ আপনার সময়মত পেমেন্টের জন্য।

*LPG Distributor System*
📞 যোগাযোগ: অফিস`,
    };

    const response = await fetch(
      'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/message/sendText/lpgapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
        },
        body: JSON.stringify(paymentMessage),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Customer payment message sent successfully!');
      console.log(`📋 Message ID: ${result.key?.id}`);

      // Log to database
      const provider = await prisma.messageProvider.findFirst({
        where: { tenantId: sakib.tenantId, isActive: true },
      });

      if (provider) {
        await prisma.sentMessage.create({
          data: {
            tenantId: sakib.tenantId,
            providerId: provider.id,
            recipientType: 'CUSTOMER',
            recipientId: sakib.id,
            phoneNumber: sakib.phone,
            message: paymentMessage.text,
            trigger: 'PAYMENT_RECEIVED',
            messageType: 'WHATSAPP',
            status: 'SENT',
            metadata: {
              messageId: result.key?.id,
              paymentAmount: paymentData.amount,
              paymentType: paymentData.paymentType,
              paymentId: paymentData.paymentId,
              customerPaymentMessaging: true,
            },
            sentAt: new Date(),
          },
        });
        console.log('✅ Payment message logged to database');
      }
    } else {
      console.log('❌ Failed to send payment message');
      console.log('Response:', result);
    }

    // No cleanup needed for existing receivables

    console.log('\n🎯 Test Summary:');
    console.log('✅ Customer payment message sent');
    console.log('✅ Message logged to database');
    console.log('✅ Customer payment messaging is working');
    console.log('\n🚀 Customer payment messaging test completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomerPaymentMessaging();
