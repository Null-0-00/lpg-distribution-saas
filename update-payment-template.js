// Update payment received template with receivables information
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePaymentTemplate() {
  try {
    console.log('🔧 Updating payment received template...\n');

    const newTemplate = `*{{companyName}}*
✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার ৳{{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

পেমেন্টের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: ৳{{updatedCashReceivables}}
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivables}} টি
📊 মোট বকেয়া: ৳{{updatedTotalReceivables}}

গ্রহণকারী: {{receivedBy}}
পেমেন্ট তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত পেমেন্টের জন্য ধন্যবাদ!

*{{companyName}} - LPG ডিস্ট্রিবিউটর*`;

    const newVariables = {
      customerName: 'গ্রাহকের নাম',
      amount: 'পেমেন্ট পরিমাণ',
      paymentType: 'পেমেন্ট প্রকার',
      updatedCashReceivables: 'আপডেটেড নগদ বকেয়া',
      updatedCylinderReceivables: 'আপডেটেড সিলিন্ডার বকেয়া',
      updatedTotalReceivables: 'আপডেটেড মোট বকেয়া',
      receivedBy: 'গ্রহণকারী',
      date: 'তারিখ',
      time: 'সময়',
      companyName: 'কোম্পানির নাম',
    };

    // Update template for Sakib's tenant
    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    const result = await prisma.messageTemplate.updateMany({
      where: {
        tenantId: sakibTenant,
        trigger: 'PAYMENT_RECEIVED',
        name: 'Payment Received Confirmation',
      },
      data: {
        template: newTemplate,
        variables: newVariables,
        updatedAt: new Date(),
      },
    });

    console.log(
      `✅ Updated ${result.count} payment template(s) for tenant ${sakibTenant}`
    );

    // Verify the update
    const updatedTemplate = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: sakibTenant,
        trigger: 'PAYMENT_RECEIVED',
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

updatePaymentTemplate();
