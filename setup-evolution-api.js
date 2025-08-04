// Setup Evolution API Integration
// Run this script to set up Evolution API with your .env configuration

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupEvolutionAPI() {
  console.log('🚀 Setting up Evolution API integration...');

  try {
    // Get environment variables
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
    const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;
    const EVOLUTION_WEBHOOK_URL = process.env.EVOLUTION_WEBHOOK_URL;

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
      throw new Error(
        'Missing Evolution API environment variables. Please check your .env file.'
      );
    }

    console.log('📋 Configuration:');
    console.log(`  API URL: ${EVOLUTION_API_URL}`);
    console.log(`  Instance: ${EVOLUTION_INSTANCE_NAME}`);
    console.log(`  Webhook: ${EVOLUTION_WEBHOOK_URL}`);

    // Get the first active tenant for demo
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    if (!tenant) {
      throw new Error('No active tenant found. Please create a tenant first.');
    }

    console.log(`🏢 Setting up for tenant: ${tenant.name} (${tenant.id})`);

    // Create Evolution API provider
    const provider = await prisma.messageProvider.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: 'Evolution API',
        },
      },
      update: {
        config: {
          provider: 'evolution',
          apiUrl: EVOLUTION_API_URL,
          apiKey: EVOLUTION_API_KEY,
          instanceName: EVOLUTION_INSTANCE_NAME,
          webhookUrl: EVOLUTION_WEBHOOK_URL,
          fromNumber: EVOLUTION_INSTANCE_NAME,
        },
        isActive: true,
        isDefault: true,
      },
      create: {
        tenantId: tenant.id,
        name: 'Evolution API',
        type: 'WHATSAPP_BUSINESS',
        config: {
          provider: 'evolution',
          apiUrl: EVOLUTION_API_URL,
          apiKey: EVOLUTION_API_KEY,
          instanceName: EVOLUTION_INSTANCE_NAME,
          webhookUrl: EVOLUTION_WEBHOOK_URL,
          fromNumber: EVOLUTION_INSTANCE_NAME,
        },
        isActive: true,
        isDefault: true,
      },
    });

    console.log(`✅ Provider created/updated: ${provider.id}`);

    // Setup messaging settings
    await prisma.messagingSettings.upsert({
      where: { tenantId: tenant.id },
      update: {
        whatsappEnabled: true,
        receivablesNotificationsEnabled: true,
        paymentNotificationsEnabled: true,
        overdueRemindersEnabled: true,
      },
      create: {
        tenantId: tenant.id,
        whatsappEnabled: true,
        smsEnabled: false,
        emailEnabled: false,
        receivablesNotificationsEnabled: true,
        paymentNotificationsEnabled: true,
        overdueRemindersEnabled: true,
      },
    });

    console.log('⚙️ Messaging settings configured');

    // Create default message templates
    const templates = [
      {
        name: 'Receivables Change Notification',
        trigger: 'RECEIVABLES_CHANGE',
        messageType: 'WHATSAPP',
        template: `🔔 *বকেয়া আপডেট*

{{driverName}} ভাই,
আপনার আজকের বকেয়া {{changeType}} {{change}} টাকা

পুরাতন বকেয়া: {{oldAmount}}
নতুন বকেয়া: {{newAmount}}
পরিবর্তন: {{change}}

সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
        variables: {
          driverName: 'চালকের নাম',
          amount: 'পরিমাণ',
          oldAmount: 'পুরাতন বকেয়া',
          newAmount: 'নতুন বকেয়া',
          change: 'পরিবর্তন',
          changeType: 'বৃদ্ধি/হ্রাস',
          date: 'তারিখ',
          time: 'সময়',
          changeReason: 'পরিবর্তনের কারণ',
        },
      },
      {
        name: 'Payment Received Confirmation',
        trigger: 'PAYMENT_RECEIVED',
        messageType: 'WHATSAPP',
        template: `✅ *পেমেন্ট সফল*

{{driverName}} ভাই,
আপনার {{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

সময়: {{date}} {{time}}

ধন্যবাদ!

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
        variables: {
          driverName: 'চালকের নাম',
          amount: 'পরিমাণ',
          paymentType: 'পেমেন্ট প্রকার',
          date: 'তারিখ',
          time: 'সময়',
        },
      },
    ];

    for (const template of templates) {
      await prisma.messageTemplate.upsert({
        where: {
          tenantId_trigger_messageType: {
            tenantId: tenant.id,
            trigger: template.trigger,
            messageType: template.messageType,
          },
        },
        update: {
          name: template.name,
          template: template.template,
          variables: template.variables,
          isActive: true,
          isDefault: true,
        },
        create: {
          tenantId: tenant.id,
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

    console.log(`📝 Created ${templates.length} message templates`);

    console.log('\n🎉 Evolution API setup completed successfully!');
    console.log('\n📱 Next steps:');
    console.log(
      '1. Scan QR code to connect WhatsApp (check /api/messaging/evolution/setup)'
    );
    console.log('2. Test messaging by updating customer receivables');
    console.log('3. Monitor sent messages in the database');
  } catch (error) {
    console.error('❌ Error setting up Evolution API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupEvolutionAPI();
