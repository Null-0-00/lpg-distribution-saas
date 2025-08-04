// Update message templates to show cylinder receivables by size
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTemplatesForCylinderSizes() {
  try {
    console.log(
      '🔧 Updating message templates to show cylinder receivables by size...\n'
    );

    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    // 1. Update Payment Received Confirmation Template
    const paymentTemplate = `*{{companyName}}*
✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার {{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

পেমেন্টের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: {{updatedCashReceivables}} টাকা
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivablesBySize}}

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
        variables: {
          customerName: 'গ্রাহকের নাম',
          amount: 'পেমেন্ট পরিমাণ',
          paymentType: 'পেমেন্ট প্রকার',
          updatedCashReceivables: 'আপডেটেড নগদ বকেয়া',
          updatedCylinderReceivablesBySize:
            'আপডেটেড সিলিন্ডার বকেয়া সাইজ অনুসারে',
          receivedBy: 'গ্রহণকারী',
          date: 'তারিখ',
          time: 'সময়',
          companyName: 'কোম্পানির নাম',
        },
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
সিলিন্ডার বকেয়া: {{cylinderReceivablesBySize}}

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
        variables: {
          customerName: 'গ্রাহকের নাম',
          amount: 'মোট বকেয়া',
          daysOverdue: 'মেয়াদোত্তীর্ণ দিন',
          cashAmount: 'নগদ বকেয়া',
          cylinderReceivablesBySize: 'সিলিন্ডার বকেয়া সাইজ অনুসারে',
          contactNumber: 'যোগাযোগ নম্বর',
          companyName: 'কোম্পানির নাম',
        },
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
🛢️ সিলিন্ডার বকেয়া: {{newCylinderReceivablesBySize}}

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
        variables: {
          customerName: 'গ্রাহকের নাম',
          cashChangeDetails: 'নগদ বকেয়া পরিবর্তনের বিবরণ',
          cylinderChangeDetails: 'সিলিন্ডার বকেয়া পরিবর্তনের বিবরণ',
          newCashAmount: 'নতুন নগদ বকেয়া',
          newCylinderReceivablesBySize: 'নতুন সিলিন্ডার বকেয়া সাইজ অনুসারে',
          date: 'তারিখ',
          time: 'সময়',
          changeReason: 'কারণ',
          companyName: 'কোম্পানির নাম',
        },
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
🛢️ সিলিন্ডার বকেয়া: {{updatedCylinderReceivablesBySize}}

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
        variables: {
          customerName: 'গ্রাহকের নাম',
          quantity: 'সিলিন্ডার সংখ্যা',
          size: 'সিলিন্ডার সাইজ',
          updatedCashReceivables: 'আপডেটেড নগদ বকেয়া',
          updatedCylinderReceivablesBySize:
            'আপডেটেড সিলিন্ডার বকেয়া সাইজ অনুসারে',
          receivedBy: 'গ্রহণকারী',
          date: 'তারিখ',
          time: 'সময়',
          companyName: 'কোম্পানির নাম',
        },
        updatedAt: new Date(),
      },
    });
    console.log('✅ Updated Cylinder Return template');

    console.log('\n🎯 Template Updates Summary:');
    console.log(
      '✅ All templates now show cylinder receivables by individual sizes'
    );
    console.log('✅ Updated variable names to reflect size-based breakdown');
    console.log('✅ Templates ready for size-specific cylinder messaging');
  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateTemplatesForCylinderSizes();
