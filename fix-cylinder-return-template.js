const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCylinderReturnTemplate() {
  try {
    console.log('=== CREATING CYLINDER RETURN TEMPLATE ===\n');

    // Get all tenants to add the template for each
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    });

    console.log(`Found ${tenants.length} tenants to update`);

    for (const tenant of tenants) {
      console.log(`\nProcessing tenant: ${tenant.name}`);

      // Check if cylinder return template already exists
      const existingTemplate = await prisma.messageTemplate.findFirst({
        where: {
          tenantId: tenant.id,
          trigger: 'CYLINDER_RETURN',
        },
      });

      if (existingTemplate) {
        console.log('  ✅ Cylinder return template already exists');
        continue;
      }

      // Get the provider ID for this tenant
      const provider = await prisma.messageProvider.findFirst({
        where: { tenantId: tenant.id },
      });

      if (!provider) {
        console.log('  ❌ No message provider found for tenant');
        continue;
      }

      // Create the cylinder return template
      const template = await prisma.messageTemplate.create({
        data: {
          tenantId: tenant.id,
          providerId: provider.id,
          trigger: 'CYLINDER_RETURN',
          messageType: 'WHATSAPP',
          name: 'সিলিন্ডার ফেরত',
          template: `🛢️ *সিলিন্ডার ফেরত*

প্রিয় {{customerName}},

আপনার {{quantity}} টি {{size}} সিলিন্ডার ফেরত নেওয়া হয়েছে।

🎯 বর্তমান অবস্থা:
💰 নগদ বাকি: {{cashAmount}}
🛢️ সিলিন্ডার বাকি: {{cylinderAmount}}

📍 এলাকা: {{areaName}}
👤 গ্রহণকারী: {{receivedBy}}
⏰ সময়: {{time}}

ধন্যবাদ।

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,

          variables: {
            customerName: 'গ্রাহকের নাম',
            quantity: 'ফেরত সিলিন্ডার সংখ্যা',
            size: 'সিলিন্ডার সাইজ',
            cashAmount: 'নগদ বাকি',
            cylinderAmount: 'সিলিন্ডার বাকি',
            areaName: 'এলাকার নাম',
            receivedBy: 'গ্রহণকারী',
            time: 'সময়',
          },

          isActive: true,
          isDefault: true,
        },
      });

      console.log(`  ✅ Created cylinder return template (ID: ${template.id})`);
    }

    console.log('\n=== VERIFICATION ===');

    // Verify all tenants now have the template
    for (const tenant of tenants) {
      const template = await prisma.messageTemplate.findFirst({
        where: {
          tenantId: tenant.id,
          trigger: 'CYLINDER_RETURN',
          isActive: true,
        },
      });

      console.log(
        `${tenant.name}: ${template ? '✅ Has template' : '❌ Missing template'}`
      );
    }

    console.log('\n✅ Cylinder return template setup completed!');
  } catch (error) {
    console.error('❌ Error creating cylinder return template:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createCylinderReturnTemplate();
