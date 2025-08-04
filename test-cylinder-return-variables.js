const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulate the messaging service variable replacement
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

async function testCylinderReturnVariables() {
  try {
    console.log('=== TESTING CYLINDER RETURN VARIABLE REPLACEMENT ===\n');

    // Get the cylinder return template
    const template = await prisma.messageTemplate.findFirst({
      where: {
        trigger: 'CYLINDER_RETURN',
        isActive: true,
      },
      include: {
        tenant: { select: { name: true } },
      },
    });

    if (!template) {
      console.log('❌ No cylinder return template found');
      return;
    }

    console.log(`Found template: ${template.name}`);
    console.log(`Tenant: ${template.tenant.name}\n`);

    // Simulate the EXACT variables that the messaging service now provides
    // (based on the fixed receivables-messaging.ts)
    const messagingServiceVariables = {
      // Required TemplateVariables interface properties
      driverName: 'করিম ভাই',
      amount: '৪৫০ টাকা',
      oldAmount: '',
      newAmount: '৪৫০ টাকা',
      change: '২',
      changeType: 'decrease',
      date: '৪/৮/২০২৫',
      time: '০৯:৩২ AM',

      // Custom properties - FIXED to match template expectations
      companyName: 'Eureka',
      customerName: 'Sakib',
      quantity: '২',
      size: '12L',
      cashAmount: '৪৫০ টাকা', // NOW PROVIDED BY MESSAGING SERVICE
      newCylinderReceivablesBySize: '35L: ৬ টি, 12L: ১২ টি', // NOW PROVIDED BY MESSAGING SERVICE
      receivedBy: 'Sakib',
      areaName: 'ঢাকা',
    };

    console.log('Variables provided by messaging service:');
    console.log('✅ cashAmount:', messagingServiceVariables.cashAmount);
    console.log(
      '✅ newCylinderReceivablesBySize:',
      messagingServiceVariables.newCylinderReceivablesBySize
    );
    console.log('');

    // Test the template rendering
    console.log('=== TEMPLATE RENDERING TEST ===');
    const renderedMessage = replaceTemplateVariables(
      template.template,
      messagingServiceVariables
    );

    // Check for unreplaced variables
    const unreplacedVars = renderedMessage.match(/\{\{[^}]+\}\}/g);

    if (unreplacedVars) {
      console.log('❌ STILL HAS UNREPLACED VARIABLES:');
      unreplacedVars.forEach((variable) => {
        console.log(`   ${variable}`);
      });
    } else {
      console.log('✅ ALL VARIABLES SUCCESSFULLY REPLACED!');
    }

    console.log('\n=== RENDERED MESSAGE ===');
    console.log('---');
    console.log(renderedMessage);
    console.log('---');

    // Specifically check the cash and cylinder lines
    const lines = renderedMessage.split('\n');
    const cashLine = lines.find((line) => line.includes('💰 নগদ বকেয়া:'));
    const cylinderLine = lines.find((line) =>
      line.includes('🛢 সিলিন্ডার বকেয়া:')
    );

    console.log('\n=== KEY LINES VERIFICATION ===');
    if (cashLine) {
      console.log('💰 Cash line:', cashLine.trim());
      if (cashLine.includes('{{') || cashLine.includes('}}')) {
        console.log('   ❌ Still contains unreplaced variables');
      } else {
        console.log('   ✅ All variables replaced');
      }
    }

    if (cylinderLine) {
      console.log('🛢 Cylinder line:', cylinderLine.trim());
      if (cylinderLine.includes('{{') || cylinderLine.includes('}}')) {
        console.log('   ❌ Still contains unreplaced variables');
      } else {
        console.log('   ✅ All variables replaced');
      }
    }

    console.log('\n🎉 Test completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCylinderReturnVariables();
