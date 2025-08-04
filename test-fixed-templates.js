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

async function testFixedTemplates() {
  try {
    console.log('=== TESTING FIXED TEMPLATES ===\n');

    // Test data with CORRECT variable names that are actually provided by the messaging service
    const testData = {
      companyName: 'Eureka',
      customerName: 'Sakib',
      quantity: '২',
      size: '12L',

      // CORRECT variable names based on messaging service
      cashAmount: '৪৫০ টাকা', // This is what the messaging service provides
      newCylinderReceivablesBySize: '35L: ৬ টি, 12L: ১২ টি', // This is correct

      receivedBy: 'Sakib',
      date: '৪/৮/২০২৫',
      time: '০৯:৩২ AM',

      // Additional variables for other templates
      cashChangeDetails: '💰 নগদ বকেয়া বৃদ্ধি: ৫০০ টাকা',
      cylinderChangeDetails: '🛢 সিলিন্ডার ফেরত: ২ টি',
      changeReason: 'নতুন বিক্রয়',
      areaName: 'ঢাকা',
      driverName: 'করিম ভাই',

      paymentAmount: '৫০০ টাকা',
      paymentMethod: 'নগদ',
      cylindersReceived: '২',

      daysPastDue: '৭',
    };

    // Get updated templates
    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      include: { tenant: { select: { name: true } } },
      orderBy: { trigger: 'asc' },
      take: 4, // Just test one of each type
    });

    console.log(`Testing ${templates.length} fixed templates:\n`);

    const results = [];

    for (const template of templates) {
      if (results.find((r) => r.trigger === template.trigger)) continue; // Skip duplicates

      console.log(`📝 ${template.trigger} (${template.tenant.name})`);
      console.log(`Template: ${template.name}`);

      const renderedTemplate = replaceTemplateVariables(
        template.template,
        testData
      );

      // Check for unreplaced variables
      const unreplacedVars = renderedTemplate.match(/\{\{[^}]+\}\}/g);

      if (unreplacedVars) {
        console.log(`❌ Unreplaced variables: ${unreplacedVars.join(', ')}`);
        results.push({
          trigger: template.trigger,
          status: 'FAILED',
          unreplaced: unreplacedVars,
        });
      } else {
        console.log(`✅ All variables replaced successfully`);
        results.push({ trigger: template.trigger, status: 'SUCCESS' });
      }

      // Show a snippet of the rendered template to verify cash and cylinder variables
      const lines = renderedTemplate.split('\n');
      const cashLine = lines.find((line) => line.includes('💰 নগদ বকেয়া:'));
      const cylinderLine = lines.find((line) =>
        line.includes('🛢 সিলিন্ডার বকেয়া:')
      );

      if (cashLine) console.log(`   Cash line: ${cashLine.trim()}`);
      if (cylinderLine) console.log(`   Cylinder line: ${cylinderLine.trim()}`);

      console.log('\n' + '-'.repeat(60) + '\n');
    }

    console.log('=== TEST RESULTS SUMMARY ===');
    results.forEach((result) => {
      const status = result.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`${status} ${result.trigger}: ${result.status}`);
      if (result.unreplaced) {
        console.log(`    Missing: ${result.unreplaced.join(', ')}`);
      }
    });

    const successCount = results.filter((r) => r.status === 'SUCCESS').length;
    const failCount = results.filter((r) => r.status === 'FAILED').length;

    console.log(
      `\n📊 Results: ${successCount} successful, ${failCount} failed`
    );

    if (failCount === 0) {
      console.log(
        '🎉 All templates are working correctly with the fixed variables!'
      );
    } else {
      console.log(
        '⚠️  Some templates still have issues that need to be addressed.'
      );
    }
  } catch (error) {
    console.error('❌ Error testing templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedTemplates();
