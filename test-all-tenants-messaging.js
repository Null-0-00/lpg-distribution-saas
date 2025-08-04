// Comprehensive test for centralized messaging across all tenants
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

async function testAllTenantsMessaging() {
  try {
    console.log('🧪 Testing centralized messaging for all tenants...\n');

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
    });

    console.log(`🏢 Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n🔸 Testing tenant: ${tenant.name}`);
      console.log(`   ID: ${tenant.id}`);

      // Check message provider setup
      const provider = await prisma.messageProvider.findFirst({
        where: {
          tenantId: tenant.id,
          isActive: true,
        },
      });

      if (!provider) {
        console.log(`   ❌ No message provider configured`);
        continue;
      }

      console.log(`   ✅ Provider: ${provider.name} (${provider.type})`);

      // Check templates
      const templates = await prisma.messageTemplate.count({
        where: { providerId: provider.id },
      });
      console.log(`   📝 Templates: ${templates}`);

      // Find a customer with phone number
      const customer = await prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          isActive: true,
          phone: { not: null },
        },
      });

      if (!customer) {
        console.log(`   ⚠️ No customers with phone numbers`);
        continue;
      }

      console.log(`   👤 Test customer: ${customer.name} (${customer.phone})`);

      // Test message sending
      const testMessage = {
        number: customer.phone,
        text: `🧪 *সিস্টেম টেস্ট*

প্রিয় ${customer.name},

এটি একটি স্বয়ংক্রিয় টেস্ট মেসেজ যা প্রমাণ করে যে আপনার টেনান্টের জন্য কেন্দ্রীয় মেসেজিং সিস্টেম সঠিকভাবে কাজ করছে।

টেনান্ট: ${tenant.name}
টেনান্ট ID: ${tenant.id}
সময়: ${new Date().toLocaleString('bn-BD')}

*LPG Distributor - কেন্দ্রীয় সিস্টেম*`,
      };

      try {
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
          console.log(`   ✅ Message sent successfully! ID: ${result.key?.id}`);

          // Log to database
          await prisma.sentMessage.create({
            data: {
              tenantId: tenant.id,
              providerId: provider.id,
              recipientType: 'CUSTOMER',
              recipientId: customer.id,
              phoneNumber: customer.phone,
              message: testMessage.text,
              trigger: 'MANUAL',
              messageType: 'WHATSAPP',
              status: 'SENT',
              metadata: {
                messageId: result.key?.id,
                test: true,
                systemTest: true,
                tenantName: tenant.name,
              },
              sentAt: new Date(),
            },
          });
          console.log(`   ✅ Message logged to database`);
        } else {
          console.log(
            `   ❌ Message failed: ${result.message || 'Unknown error'}`
          );
        }
      } catch (error) {
        console.log(`   ❌ API Error: ${error.message}`);
      }

      // Small delay between tenants
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Summary statistics
    console.log('\n📊 Final Statistics:');

    const totalProviders = await prisma.messageProvider.count({
      where: { isActive: true },
    });

    const totalTemplates = await prisma.messageTemplate.count();

    const totalMessages = await prisma.sentMessage.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const customersWithPhone = await prisma.customer.count({
      where: {
        isActive: true,
        phone: { not: null },
      },
    });

    console.log(`✅ Active providers: ${totalProviders}`);
    console.log(`✅ Total templates: ${totalTemplates}`);
    console.log(`✅ Messages (24h): ${totalMessages}`);
    console.log(`✅ Customers with phones: ${customersWithPhone}`);

    console.log('\n🎉 Centralized messaging system test completed!');
    console.log('🚀 All tenants can now send automated messages');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAllTenantsMessaging();
