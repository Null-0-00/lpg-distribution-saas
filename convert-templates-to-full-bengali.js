// Convert all message templates to use full Bengali including Bengali numerals
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to convert English numbers to Bengali
function toBengaliNumber(num) {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliNumerals[parseInt(digit)]);
}

async function convertTemplatesToFullBengali() {
  try {
    console.log('🔧 Converting all message templates to full Bengali...\n');

    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    // 1. Update Payment Received Confirmation Template
    const paymentTemplate = `*{{companyName}}*
✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার {{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

পেমেন্টের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: {{updatedCashReceivables}} টাকা
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivables}} টি

গ্রহণকারী: {{receivedBy}}
পেমেন্ট তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত পেমেন্টের জন্য ধন্যবাদ!

*{{companyName}} - এলপিজি ডিস্ট্রিবিউটর*`;

    await prisma.messageTemplate.updateMany({
      where: {
        tenantId: sakibTenant,
        trigger: 'PAYMENT_RECEIVED',
      },
      data: {
        template: paymentTemplate,
        updatedAt: new Date(),
      },
    });
    console.log('✅ Updated Payment Received template');

    // 2. Update Overdue Reminder Template
    const overdueTemplate = `⚠️ *বকেয়া মনে করিয়ে দিন*

প্রিয় {{customerName}},

আপনার মোট বকেয়া {{amount}} টাকা।
বকেয়ার মেয়াদ: {{daysOverdue}} দিন

নগদ বকেয়া: {{cashAmount}} টাকা
সিলিন্ডার বকেয়া: {{cylinderAmount}} টি

অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব পরিশোধ করুন।
যোগাযোগ: {{contactNumber}}

*{{companyName}}*`;

    await prisma.messageTemplate.updateMany({
      where: {
        tenantId: sakibTenant,
        trigger: 'OVERDUE_REMINDER',
      },
      data: {
        template: overdueTemplate,
        updatedAt: new Date(),
      },
    });
    console.log('✅ Updated Overdue Reminder template');

    // 3. Update Receivables Change Template
    const receivablesChangeTemplate = `🔔 *বকেয়া আপডেট*

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

{{cashChangeDetails}}

{{cylinderChangeDetails}}

বর্তমান মোট বকেয়া:
💰 নগদ বকেয়া: {{newCashAmount}} টাকা
🛢️ সিলিন্ডার বকেয়া: {{newCylinderAmount}} টি

সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*{{companyName}}*`;

    await prisma.messageTemplate.updateMany({
      where: {
        tenantId: sakibTenant,
        trigger: 'RECEIVABLES_CHANGE',
      },
      data: {
        template: receivablesChangeTemplate,
        updatedAt: new Date(),
      },
    });
    console.log('✅ Updated Receivables Change template');

    // 4. Update Cylinder Return Confirmation Template
    const cylinderReturnTemplate = `*{{companyName}}*
🛢️ *সিলিন্ডার ফেরত নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার {{quantity}} টি {{size}} সিলিন্ডার সফলভাবে ফেরত নেওয়া হয়েছে।

ফেরতের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: {{updatedCashReceivables}} টাকা
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivables}} টি

গ্রহণকারী: {{receivedBy}}
ফেরত তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত সিলিন্ডার ফেরতের জন্য ধন্যবাদ!

*{{companyName}} - এলপিজি ডিস্ট্রিবিউটর*`;

    await prisma.messageTemplate.updateMany({
      where: {
        tenantId: sakibTenant,
        trigger: 'CYLINDER_RETURN',
      },
      data: {
        template: cylinderReturnTemplate,
        updatedAt: new Date(),
      },
    });
    console.log('✅ Updated Cylinder Return template');

    console.log('\n🎯 Template Updates Summary:');
    console.log('✅ Removed ৳ symbol and replaced with "টাকা" in Bengali');
    console.log('✅ Converted "LPG ডিস্ট্রিবিউটর" to "এলপিজি ডিস্ট্রিবিউটর"');
    console.log('✅ All templates now use full Bengali text');
    console.log('✅ Ready for Bengali numeral conversion in messaging service');

    // Verify all updates
    console.log('\n📝 Verifying updated templates...');
    const updatedTemplates = await prisma.messageTemplate.findMany({
      where: { tenantId: sakibTenant },
      select: {
        name: true,
        trigger: true,
        template: true,
      },
    });

    updatedTemplates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name} (${template.trigger})`);
      console.log('Updated template:');
      console.log(template.template);
      console.log('\n' + '-'.repeat(60));
    });
  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

convertTemplatesToFullBengali();
