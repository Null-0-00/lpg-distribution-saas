const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Template replacement function
function replaceTemplateVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(
      new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
      value
    );
  }
  return result;
}

async function testUpdatedTemplates() {
  try {
    console.log('=== TESTING UPDATED TEMPLATES ===\n');

    // Test data similar to the provided example
    const testData = {
      companyName: 'Eureka',
      customerName: 'Sakib',
      quantity: '২',
      size: '12L',
      cashAmount: '৪৫০ টাকা',
      newCylinderReceivablesBySize: '35L: ৬ টি, 12L: ১২ টি',
      receivedBy: 'Sakib',
      date: '৪/৮/২০২৫',
      time: '০৯:৩২ AM',

      // Additional variables for other templates
      cashChangeDetails: '💰 নগদ বকেয়া বৃদ্ধি: ৫০০ টাকা',
      cylinderChangeDetails: '🛢 সিলিন্ডার ফেরত: ২ টি',
      newCashAmount: '৯৫০ টাকা',
      changeReason: 'নতুন বিক্রয়',
      areaName: 'ঢাকা',
      driverName: 'করিম ভাই',

      paymentAmount: '৫০০ টাকা',
      paymentMethod: 'নগদ',
      cylindersReceived: '২',
      updatedCashReceivables: '৪৫০ টাকা',
      updatedCylinderReceivablesBySize: '35L: ৬ টি, 12L: ১২ টি',

      cylinderReceivablesBySize: '35L: ৬ টি, 12L: ১২ টি',
      daysPastDue: '৭',
    };

    // Get updated templates
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      include: { tenant: { select: { name: true } } },
      orderBy: { trigger: 'asc' },
    });

    console.log(`Testing ${templates.length} templates:\n`);

    for (const template of templates) {
      console.log(`📝 ${template.trigger} (${template.tenant.name})`);
      console.log(`Template: ${template.name}`);
      console.log('---');

      const renderedTemplate = replaceTemplateVariables(
        template.template,
        testData
      );
      console.log(renderedTemplate);

      // Check for unreplaced variables
      const unreplacedVars = renderedTemplate.match(/\{\{[^}]+\}\}/g);
      if (unreplacedVars) {
        console.log(`\n⚠️  Unreplaced variables: ${unreplacedVars.join(', ')}`);
      } else {
        console.log(`\n✅ All variables replaced successfully`);
      }

      console.log('\n' + '='.repeat(80) + '\n');
    }

    console.log('🎉 Template testing completed!');
  } catch (error) {
    console.error('❌ Error testing templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdatedTemplates();
