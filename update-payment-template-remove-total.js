// Remove total receivables line from payment template
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePaymentTemplateRemoveTotal() {
  try {
    console.log(
      '🔧 Removing total receivables line from payment template...\n'
    );

    const updatedTemplate = `*{{companyName}}*
✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার ৳{{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

পেমেন্টের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: ৳{{updatedCashReceivables}}
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivables}} টি

গ্রহণকারী: {{receivedBy}}
পেমেন্ট তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত পেমেন্টের জন্য ধন্যবাদ!

*{{companyName}} - LPG ডিস্ট্রিবিউটর*`;

    const updatedVariables = {
      customerName: 'গ্রাহকের নাম',
      amount: 'পেমেন্ট পরিমাণ',
      paymentType: 'পেমেন্ট প্রকার',
      updatedCashReceivables: 'আপডেটেড নগদ বকেয়া',
      updatedCylinderReceivables: 'আপডেটেড সিলিন্ডার বকেয়া',
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
        template: updatedTemplate,
        variables: updatedVariables,
        updatedAt: new Date(),
      },
    });

    console.log(
      `✅ Updated ${result.count} payment template(s) - removed total receivables line`
    );

    // Verify the update
    const updatedTemplateRecord = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: sakibTenant,
        trigger: 'PAYMENT_RECEIVED',
      },
    });

    console.log('\n📝 Updated template (total line removed):');
    console.log(updatedTemplateRecord.template);
  } catch (error) {
    console.error('❌ Error updating template:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePaymentTemplateRemoveTotal();
