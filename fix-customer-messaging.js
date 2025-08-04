// Fix customer messaging for the correct tenant
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCustomerMessaging() {
  try {
    console.log('🔧 Fixing customer messaging...\n');

    // Get the active tenant from recent receivables
    const recentReceivable = await prisma.customerReceivableRecord.findFirst({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            tenantId: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!recentReceivable) {
      console.log('❌ No recent receivables found');
      return;
    }

    const tenantId = recentReceivable.customer.tenantId;
    console.log(`🏢 Working with tenant: ${tenantId}`);
    console.log(
      `👤 Customer: ${recentReceivable.customer.name} (${recentReceivable.customer.phone})`
    );

    // Check messaging settings for this tenant
    let messagingSettings = await prisma.messagingSettings.findUnique({
      where: { tenantId },
    });

    if (!messagingSettings) {
      console.log('⚙️ Creating messaging settings for this tenant...');
      messagingSettings = await prisma.messagingSettings.create({
        data: {
          tenantId,
          whatsappEnabled: true,
          smsEnabled: false,
          emailEnabled: false,
          receivablesNotificationsEnabled: true,
          paymentNotificationsEnabled: true,
          overdueRemindersEnabled: true,
        },
      });
      console.log('✅ Messaging settings created');
    } else {
      console.log('✅ Messaging settings exist');
    }

    // Check message provider for this tenant
    let provider = await prisma.messageProvider.findFirst({
      where: {
        tenantId,
        isActive: true,
      },
    });

    if (!provider) {
      console.log('🔧 Creating Evolution API provider for this tenant...');

      // Use the existing provider config from the other tenant as template
      const existingProvider = await prisma.messageProvider.findFirst({
        where: { isActive: true, name: 'Evolution API' },
      });

      if (existingProvider) {
        provider = await prisma.messageProvider.create({
          data: {
            tenantId,
            name: 'Evolution API',
            type: 'WHATSAPP_BUSINESS',
            config: existingProvider.config,
            isActive: true,
            isDefault: true,
          },
        });
        console.log('✅ Provider created for tenant');
      } else {
        console.log('❌ No existing provider to copy from');
        return;
      }
    } else {
      console.log('✅ Message provider exists');
    }

    // Create default templates for this tenant
    const templates = [
      {
        name: 'Customer Receivables Change',
        trigger: 'RECEIVABLES_CHANGE',
        messageType: 'WHATSAPP',
        template: `🔔 *বকেয়া আপডেট*

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

পুরাতন বকেয়া: {{oldAmount}}
নতুন বকেয়া: {{newAmount}}
পরিবর্তন: {{change}} ({{changeType}})

নগদ বকেয়া: {{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}}

এলাকা: {{areaName}}
সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*{{companyName}}*`,
        variables: {
          customerName: 'গ্রাহকের নাম',
          oldAmount: 'পুরাতন বকেয়া',
          newAmount: 'নতুন বকেয়া',
          change: 'পরিবর্তন',
          changeType: 'বৃদ্ধি/হ্রাস',
          cashAmount: 'নগদ বকেয়া',
          cylinderAmount: 'সিলিন্ডার বকেয়া',
          areaName: 'এলাকার নাম',
          date: 'তারিখ',
          time: 'সময়',
          changeReason: 'কারণ',
          companyName: 'কোম্পানির নাম',
        },
      },
    ];

    for (const template of templates) {
      await prisma.messageTemplate.upsert({
        where: {
          tenantId_trigger_messageType: {
            tenantId,
            trigger: template.trigger,
            messageType: template.messageType,
          },
        },
        update: {
          name: template.name,
          template: template.template,
          variables: template.variables,
          isActive: true,
        },
        create: {
          tenantId,
          providerId: provider.id,
          name: template.name,
          trigger: template.trigger,
          messageType: template.messageType,
          template: template.template,
          variables: template.variables,
          isActive: true,
          isDefault: true,
        },
      });
    }

    console.log('📝 Message templates created/updated');

    // Now test sending a message to the customer
    console.log('\n📱 Testing customer message...');

    if (!recentReceivable.customer.phone) {
      console.log('❌ Customer has no phone number');
      return;
    }

    // Manual test message
    const testMessage = {
      number: recentReceivable.customer.phone,
      text: `🔔 *বকেয়া আপডেট টেস্ট*

প্রিয় ${recentReceivable.customer.name},

আপনার বকেয়া তথ্য:
নগদ বকেয়া: ৳${recentReceivable.cashReceivables}
সিলিন্ডার বকেয়া: ${recentReceivable.cylinderReceivables} টি

এটি একটি টেস্ট মেসেজ।

সময়: ${new Date().toLocaleString('bn-BD')}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
    };

    console.log(`📤 Sending test message to: ${testMessage.number}`);

    // Send directly via Evolution API
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
      console.log('✅ Test message sent successfully!');
      console.log(`📋 Message ID: ${result.key?.id}`);

      // Log the message in database
      await prisma.sentMessage.create({
        data: {
          tenantId,
          providerId: provider.id,
          recipientType: 'CUSTOMER',
          recipientId: recentReceivable.customerId,
          phoneNumber: recentReceivable.customer.phone,
          message: testMessage.text,
          trigger: 'MANUAL',
          messageType: 'WHATSAPP',
          status: 'SENT',
          metadata: { messageId: result.key?.id, test: true },
          sentAt: new Date(),
        },
      });

      console.log('✅ Message logged to database');
    } else {
      console.log('❌ Failed to send test message');
      console.log('Error:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCustomerMessaging();
