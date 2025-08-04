const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// New template formats based on the provided example
const NEW_TEMPLATES = {
  CYLINDER_RETURN: {
    name: '🛢 সিলিন্ডার ফেরত নিশ্চিতকরণ',
    template: `{{companyName}}
🛢 সিলিন্ডার ফেরত নিশ্চিতকরণ

প্রিয় {{customerName}},

আপনার {{quantity}} টি {{size}} সিলিন্ডার সফলভাবে ফেরত নেওয়া হয়েছে।

ফেরতের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: {{cashAmount}}
🛢 সিলিন্ডার বকেয়া: {{newCylinderReceivablesBySize}}

গ্রহণকারী: {{receivedBy}}
ফেরত তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত সিলিন্ডার ফেরতের জন্য ধন্যবাদ!

{{companyName}} - এলপিজি ডিস্ট্রিবিউটর`,
    variables: {
      companyName: 'কোম্পানির নাম',
      customerName: 'গ্রাহকের নাম',
      quantity: 'ফেরত সিলিন্ডার সংখ্যা',
      size: 'সিলিন্ডার সাইজ',
      cashAmount: 'নগদ বকেয়া',
      newCylinderReceivablesBySize: 'সাইজ অনুযায়ী সিলিন্ডার বকেয়া',
      receivedBy: 'গ্রহণকারী',
      date: 'তারিখ',
      time: 'সময়',
    },
  },

  RECEIVABLES_CHANGE: {
    name: '💰 বকেয়া আপডেট নিশ্চিতকরণ',
    template: `{{companyName}}
💰 বকেয়া আপডেট নিশ্চিতকরণ

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে।

বকেয়ার বিস্তারিত:
{{cashChangeDetails}}
{{cylinderChangeDetails}}

বর্তমান মোট বকেয়া:
💰 নগদ বকেয়া: {{newCashAmount}}
🛢 সিলিন্ডার বকেয়া: {{newCylinderReceivablesBySize}}

পরিবর্তনের কারণ: {{changeReason}}
এলাকা: {{areaName}}
ড্রাইভার: {{driverName}}
আপডেট তারিখ: {{date}}
সময়: {{time}}

আপনার সহযোগিতার জন্য ধন্যবাদ।

{{companyName}} - এলপিজি ডিস্ট্রিবিউটর`,
    variables: {
      companyName: 'কোম্পানির নাম',
      customerName: 'গ্রাহকের নাম',
      cashChangeDetails: 'নগদ পরিবর্তনের বিস্তারিত',
      cylinderChangeDetails: 'সিলিন্ডার পরিবর্তনের বিস্তারিত',
      newCashAmount: 'নতুন নগদ বকেয়া',
      newCylinderReceivablesBySize: 'সাইজ অনুযায়ী সিলিন্ডার বকেয়া',
      changeReason: 'পরিবর্তনের কারণ',
      areaName: 'এলাকার নাম',
      driverName: 'ড্রাইভারের নাম',
      date: 'তারিখ',
      time: 'সময়',
    },
  },

  PAYMENT_RECEIVED: {
    name: '💳 পেমেন্ট গ্রহণের নিশ্চিতকরণ',
    template: `{{companyName}}
💳 পেমেন্ট গ্রহণের নিশ্চিতকরণ

প্রিয় {{customerName}},

আপনার {{paymentAmount}} টাকা পেমেন্ট সফলভাবে গৃহীত হয়েছে।

পেমেন্টের বিস্তারিত:
💰 পেমেন্ট পরিমাণ: {{paymentAmount}}
💳 পেমেন্ট পদ্ধতি: {{paymentMethod}}
🛢 সিলিন্ডার জমা: {{cylindersReceived}} টি

পেমেন্টের পর আপডেটেড বকেয়া:
💰 নগদ বকেয়া: {{updatedCashReceivables}}
🛢 সিলিন্ডার বকেয়া: {{updatedCylinderReceivablesBySize}}

গ্রহণকারী: {{receivedBy}}
এলাকা: {{areaName}}
পেমেন্ট তারিখ: {{date}}
সময়: {{time}}

আপনার সময়মত পেমেন্টের জন্য ধন্যবাদ!

{{companyName}} - এলপিজি ডিস্ট্রিবিউটর`,
    variables: {
      companyName: 'কোম্পানির নাম',
      customerName: 'গ্রাহকের নাম',
      paymentAmount: 'পেমেন্ট পরিমাণ',
      paymentMethod: 'পেমেন্ট পদ্ধতি',
      cylindersReceived: 'প্রাপ্ত সিলিন্ডার',
      updatedCashReceivables: 'আপডেটেড নগদ বকেয়া',
      updatedCylinderReceivablesBySize: 'সাইজ অনুযায়ী সিলিন্ডার বকেয়া',
      receivedBy: 'গ্রহণকারী',
      areaName: 'এলাকার নাম',
      date: 'তারিখ',
      time: 'সময়',
    },
  },

  OVERDUE_REMINDER: {
    name: '⚠️ বকেয়া পরিশোধের অনুস্মারক',
    template: `{{companyName}}
⚠️ বকেয়া পরিশোধের অনুস্মারক

প্রিয় {{customerName}},

আপনার কিছু বকেয়া পরিশোধের জন্য অনুরোধ করা হচ্ছে।

বকেয়ার বিস্তারিত:
💰 নগদ বকেয়া: {{cashAmount}}
🛢 সিলিন্ডার বকেয়া: {{cylinderReceivablesBySize}}
📅 মোট বকেয়ার দিন: {{daysPastDue}} দিন

বকেয়া পরিশোধ করার জন্য আপনার এলাকার ড্রাইভার {{driverName}} এর সাথে যোগাযোগ করুন।

এলাকা: {{areaName}}
অনুস্মারক তারিখ: {{date}}
সময়: {{time}}

দ্রুত পরিশোধের জন্য অনুরোধ করা হলো।

{{companyName}} - এলপিজি ডিস্ট্রিবিউটর`,
    variables: {
      companyName: 'কোম্পানির নাম',
      customerName: 'গ্রাহকের নাম',
      cashAmount: 'নগদ বকেয়া',
      cylinderReceivablesBySize: 'সাইজ অনুযায়ী সিলিন্ডার বকেয়া',
      daysPastDue: 'বকেয়ার দিন',
      driverName: 'ড্রাইভারের নাম',
      areaName: 'এলাকার নাম',
      date: 'তারিখ',
      time: 'সময়',
    },
  },
};

async function updateAllTemplates() {
  try {
    console.log('=== UPDATING ALL MESSAGE TEMPLATES ===\n');

    // Get all templates
    const templates = await prisma.messageTemplate.findMany({
      include: {
        tenant: { select: { name: true } },
      },
    });

    console.log(`Found ${templates.length} templates to update\n`);

    let updateCount = 0;

    for (const template of templates) {
      const newTemplate = NEW_TEMPLATES[template.trigger];

      if (!newTemplate) {
        console.log(
          `⚠️  No new template defined for trigger: ${template.trigger}`
        );
        continue;
      }

      console.log(
        `Updating ${template.trigger} for ${template.tenant.name}...`
      );

      await prisma.messageTemplate.update({
        where: { id: template.id },
        data: {
          name: newTemplate.name,
          template: newTemplate.template,
          variables: newTemplate.variables,
        },
      });

      updateCount++;
      console.log(`  ✅ Updated successfully`);
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Updated ${updateCount} templates`);
    console.log(
      `📝 Template types updated: ${Object.keys(NEW_TEMPLATES).join(', ')}`
    );

    // Verify updates
    console.log(`\n=== VERIFICATION ===`);
    for (const trigger of Object.keys(NEW_TEMPLATES)) {
      const updatedTemplates = await prisma.messageTemplate.findMany({
        where: { trigger },
        include: { tenant: { select: { name: true } } },
      });

      console.log(`${trigger}:`);
      updatedTemplates.forEach((t) => {
        console.log(
          `  - ${t.tenant.name}: ${t.name} (${t.template.length} chars)`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error updating templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllTemplates();
