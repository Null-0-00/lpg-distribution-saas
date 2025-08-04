// Create cylinder return message template
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCylinderReturnTemplate() {
  try {
    console.log('🔧 Creating cylinder return message template...\n');

    const cylinderReturnTemplate = `*{{companyName}}*
🛢️ *সিলিন্ডার ফেরত নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার {{quantity}} টি {{size}} সিলিন্ডার সফলভাবে ফেরত নেওয়া হয়েছে।

ফেরতের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: ৳{{updatedCashReceivables}}
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivables}} টি

গ্রহণকারী: {{receivedBy}}
ফেরত তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত সিলিন্ডার ফেরতের জন্য ধন্যবাদ!

*{{companyName}} - LPG ডিস্ট্রিবিউটর*`;

    const templateVariables = {
      customerName: 'গ্রাহকের নাম',
      quantity: 'সিলিন্ডার সংখ্যা',
      size: 'সিলিন্ডার সাইজ',
      updatedCashReceivables: 'আপডেটেড নগদ বকেয়া',
      updatedCylinderReceivables: 'আপডেটেড সিলিন্ডার বকেয়া',
      receivedBy: 'গ্রহণকারী',
      date: 'তারিখ',
      time: 'সময়',
      companyName: 'কোম্পানির নাম',
    };

    // Create template for Sakib's tenant
    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    // Get the provider ID from existing template
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: { tenantId: sakibTenant },
      select: { providerId: true },
    });

    const newTemplate = await prisma.messageTemplate.create({
      data: {
        tenantId: sakibTenant,
        providerId: existingTemplate?.providerId || 'cmdvz6r240003ublgjlzzz3o1',
        name: 'Cylinder Return Confirmation',
        trigger: 'CYLINDER_RETURN',
        messageType: 'WHATSAPP',
        template: cylinderReturnTemplate,
        variables: templateVariables,
        isActive: true,
        isDefault: true,
      },
    });

    console.log(`✅ Created cylinder return template: ${newTemplate.id}`);

    // Verify the creation
    const createdTemplate = await prisma.messageTemplate.findUnique({
      where: { id: newTemplate.id },
    });

    console.log('\n📝 Created template:');
    console.log(createdTemplate.template);

    console.log('\n🔧 Template variables:');
    console.log(JSON.stringify(createdTemplate.variables, null, 2));
  } catch (error) {
    console.error('❌ Error creating template:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createCylinderReturnTemplate();
