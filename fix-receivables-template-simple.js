// Fix receivables change template to use simple variable substitution
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixReceivablesTemplate() {
  try {
    console.log(
      '🔧 Fixing receivables change template for simple substitution...\n'
    );

    const newTemplate = `🔔 *বকেয়া আপডেট*

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

{{cashChangeDetails}}

{{cylinderChangeDetails}}

বর্তমান মোট বকেয়া:
💰 নগদ বকেয়া: ৳{{newCashAmount}}
🛢️ সিলিন্ডার বকেয়া: {{newCylinderAmount}} টি

সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*{{companyName}}*`;

    const newVariables = {
      customerName: 'গ্রাহকের নাম',
      cashChangeDetails: 'নগদ বকেয়া পরিবর্তনের বিবরণ',
      cylinderChangeDetails: 'সিলিন্ডার বকেয়া পরিবর্তনের বিবরণ',
      newCashAmount: 'নতুন নগদ বকেয়া',
      newCylinderAmount: 'নতুন সিলিন্ডার বকেয়া',
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

fixReceivablesTemplate();
