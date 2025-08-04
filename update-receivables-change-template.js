// Update receivables change template to handle separate cash/cylinder changes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateReceivablesChangeTemplate() {
  try {
    console.log('🔧 Updating receivables change template...\n');

    const newTemplate = `🔔 *বকেয়া আপডেট*

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

{{#cashChanged}}
💰 নগদ বকেয়া পরিবর্তন:
পুরাতন: ৳{{oldCashAmount}}
নতুন: ৳{{newCashAmount}}
পরিবর্তন: ৳{{cashChange}} ({{cashChangeType}})
{{/cashChanged}}

{{#cylinderChanged}}
🛢️ সিলিন্ডার বকেয়া পরিবর্তন:
পুরাতন: {{oldCylinderAmount}} টি
নতুন: {{newCylinderAmount}} টি
পরিবর্তন: {{cylinderChange}} টি ({{cylinderChangeType}})
{{/cylinderChanged}}

বর্তমান মোট বকেয়া:
💰 নগদ বকেয়া: ৳{{newCashAmount}}
🛢️ সিলিন্ডার বকেয়া: {{newCylinderAmount}} টি

সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*{{companyName}}*`;

    const newVariables = {
      customerName: 'গ্রাহকের নাম',
      oldCashAmount: 'পুরাতন নগদ বকেয়া',
      newCashAmount: 'নতুন নগদ বকেয়া',
      cashChange: 'নগদ পরিবর্তন',
      cashChangeType: 'নগদ বৃদ্ধি/হ্রাস',
      oldCylinderAmount: 'পুরাতন সিলিন্ডার বকেয়া',
      newCylinderAmount: 'নতুন সিলিন্ডার বকেয়া',
      cylinderChange: 'সিলিন্ডার পরিবর্তন',
      cylinderChangeType: 'সিলিন্ডার বৃদ্ধি/হ্রাস',
      cashChanged: 'নগদ পরিবর্তিত হয়েছে',
      cylinderChanged: 'সিলিন্ডার পরিবর্তিত হয়েছে',
      date: 'তারিখ',
      time: 'সময়',
      changeReason: 'কারণ',
      companyName: 'কোম্পানির নাম',
    };

    // Update template for Sakib's tenant
    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    const result = await prisma.messageTemplate.updateMany({
      where: {
        tenantId: sakibTenant,
        trigger: 'RECEIVABLES_CHANGE',
      },
      data: {
        template: newTemplate,
        variables: newVariables,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Updated ${result.count} receivables change template(s)`);

    // Verify the update
    const updatedTemplate = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: sakibTenant,
        trigger: 'RECEIVABLES_CHANGE',
      },
    });

    console.log('\n📝 Updated template:');
    console.log(updatedTemplate.template);

    console.log('\n🔧 New variables:');
    console.log(JSON.stringify(updatedTemplate.variables, null, 2));
  } catch (error) {
    console.error('❌ Error updating template:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateReceivablesChangeTemplate();
