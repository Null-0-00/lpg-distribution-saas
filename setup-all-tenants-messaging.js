// Universal setup script for Evolution API messaging across all tenants
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupAllTenantsMessaging() {
  try {
    console.log('🚀 Setting up Evolution API messaging for all tenants...\n');

    // Get all active tenants
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            customers: { where: { isActive: true } },
          },
        },
      },
    });

    if (tenants.length === 0) {
      console.log('❌ No active tenants found');
      return;
    }

    console.log(`🏢 Found ${tenants.length} active tenants:`);
    tenants.forEach((tenant) => {
      console.log(
        `  - ${tenant.name} (${tenant.id}) - ${tenant._count.customers} customers`
      );
    });

    console.log('\n🔧 Starting messaging setup for all tenants...\n');

    for (const tenant of tenants) {
      console.log(`\n📋 Processing tenant: ${tenant.name}`);
      console.log(`🆔 Tenant ID: ${tenant.id}`);

      try {
        // 1. Check/Create messaging settings
        let messagingSettings = await prisma.messagingSettings.findUnique({
          where: { tenantId: tenant.id },
        });

        if (!messagingSettings) {
          console.log('  ⚙️ Creating messaging settings...');
          messagingSettings = await prisma.messagingSettings.create({
            data: {
              tenantId: tenant.id,
              whatsappEnabled: true,
              smsEnabled: false,
              emailEnabled: false,
              receivablesNotificationsEnabled: true,
              paymentNotificationsEnabled: true,
              overdueRemindersEnabled: true,
            },
          });
          console.log('  ✅ Messaging settings created');
        } else {
          console.log('  ✅ Messaging settings already exist');
        }

        // 2. Check/Create message provider
        let provider = await prisma.messageProvider.findFirst({
          where: {
            tenantId: tenant.id,
            isActive: true,
            type: 'WHATSAPP_BUSINESS',
          },
        });

        if (!provider) {
          console.log('  🔧 Creating Evolution API provider...');
          provider = await prisma.messageProvider.create({
            data: {
              tenantId: tenant.id,
              name: 'Evolution API',
              type: 'WHATSAPP_BUSINESS',
              config: {
                provider: 'evolution',
                apiUrl:
                  process.env.EVOLUTION_API_URL ||
                  'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/',
                apiKey:
                  process.env.EVOLUTION_API_KEY ||
                  'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
                instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'lpgapp',
                webhookUrl:
                  process.env.EVOLUTION_WEBHOOK_URL ||
                  'http://localhost:3000/api/messaging/evolution/webhook',
                fromNumber: process.env.EVOLUTION_INSTANCE_NAME || 'lpgapp',
              },
              isActive: true,
              isDefault: true,
            },
          });
          console.log('  ✅ Evolution API provider created');
        } else {
          console.log('  ✅ Message provider already exists');
        }

        // 3. Create/Update default message templates
        const templates = [
          {
            name: 'Customer Receivables Change',
            trigger: 'RECEIVABLES_CHANGE',
            messageType: 'WHATSAPP',
            template: `🔔 *বকেয়া আপডেট*

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

পুরাতন বকেয়া: ৳{{oldAmount}}
নতুন বকেয়া: ৳{{newAmount}}
পরিবর্তন: {{change}} ({{changeType}})

নগদ বকেয়া: ৳{{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}} টি

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
          {
            name: 'Payment Received Confirmation',
            trigger: 'PAYMENT_RECEIVED',
            messageType: 'WHATSAPP',
            template: `✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার ৳{{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

গ্রহণকারী: {{receivedBy}}
সময়: {{date}} {{time}}

ধন্যবাদ!

*{{companyName}}*`,
            variables: {
              customerName: 'গ্রাহকের নাম',
              amount: 'পরিমাণ',
              paymentType: 'পেমেন্ট প্রকার',
              receivedBy: 'গ্রহণকারী',
              date: 'তারিখ',
              time: 'সময়',
              companyName: 'কোম্পানির নাম',
            },
          },
          {
            name: 'Overdue Reminder',
            trigger: 'OVERDUE_REMINDER',
            messageType: 'WHATSAPP',
            template: `⚠️ *বকেয়া মনে করিয়ে দিন*

প্রিয় {{customerName}},

আপনার মোট বকেয়া ৳{{amount}} টাকা।
বকেয়ার মেয়াদ: {{daysOverdue}} দিন

নগদ বকেয়া: ৳{{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}} টি

অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব পরিশোধ করুন।
যোগাযোগ: {{contactNumber}}

*{{companyName}}*`,
            variables: {
              customerName: 'গ্রাহকের নাম',
              amount: 'মোট বকেয়া',
              daysOverdue: 'বকেয়ার দিন',
              cashAmount: 'নগদ বকেয়া',
              cylinderAmount: 'সিলিন্ডার বকেয়া',
              contactNumber: 'যোগাযোগ নম্বর',
              companyName: 'কোম্পানির নাম',
            },
          },
        ];

        console.log('  📝 Creating/updating message templates...');
        let templatesCreated = 0;
        let templatesUpdated = 0;

        for (const templateData of templates) {
          const result = await prisma.messageTemplate.upsert({
            where: {
              tenantId_trigger_messageType: {
                tenantId: tenant.id,
                trigger: templateData.trigger,
                messageType: templateData.messageType,
              },
            },
            update: {
              name: templateData.name,
              template: templateData.template,
              variables: templateData.variables,
              isActive: true,
            },
            create: {
              tenantId: tenant.id,
              providerId: provider.id,
              name: templateData.name,
              trigger: templateData.trigger,
              messageType: templateData.messageType,
              template: templateData.template,
              variables: templateData.variables,
              isActive: true,
              isDefault: true,
            },
          });

          // Check if it was created or updated (Prisma doesn't return this info directly)
          const existingTemplate = await prisma.messageTemplate.findFirst({
            where: {
              tenantId: tenant.id,
              trigger: templateData.trigger,
              messageType: templateData.messageType,
              createdAt: { lt: new Date(Date.now() - 1000) }, // Created more than 1 second ago
            },
          });

          if (existingTemplate) {
            templatesUpdated++;
          } else {
            templatesCreated++;
          }
        }

        console.log(
          `  ✅ Templates processed: ${templatesCreated} created, ${templatesUpdated} updated`
        );

        // 4. Get customer statistics for this tenant
        const totalCustomers = await prisma.customer.count({
          where: {
            tenantId: tenant.id,
            isActive: true,
          },
        });

        const customersWithPhone = await prisma.customer.count({
          where: {
            tenantId: tenant.id,
            isActive: true,
            phone: { not: null },
          },
        });
        console.log(
          `  📊 Customer stats: ${totalCustomers} total, ${customersWithPhone} with phone numbers`
        );

        console.log(`  🎉 Messaging setup completed for ${tenant.name}`);
      } catch (tenantError) {
        console.error(
          `  ❌ Error setting up messaging for ${tenant.name}:`,
          tenantError.message
        );
      }
    }

    console.log('\n🎯 Summary:');
    console.log(`✅ Processed ${tenants.length} tenants`);

    // Final verification
    const totalProviders = await prisma.messageProvider.count({
      where: { isActive: true, type: 'WHATSAPP_BUSINESS' },
    });

    const totalTemplates = await prisma.messageTemplate.count({
      where: { isActive: true },
    });

    const totalSettings = await prisma.messagingSettings.count({
      where: { whatsappEnabled: true },
    });

    console.log(`📊 System totals:`);
    console.log(`   - Active WhatsApp providers: ${totalProviders}`);
    console.log(`   - Active message templates: ${totalTemplates}`);
    console.log(`   - Tenants with WhatsApp enabled: ${totalSettings}`);

    console.log(
      '\n🚀 All tenants are now ready for automated customer messaging!'
    );
    console.log(
      '📱 Any receivables change will automatically trigger WhatsApp messages to customers.'
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

setupAllTenantsMessaging();
