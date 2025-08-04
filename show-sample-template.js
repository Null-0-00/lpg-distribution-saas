const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showSampleTemplate() {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: { trigger: 'CYLINDER_RETURN', isActive: true },
      include: { tenant: { select: { name: true } } },
    });

    if (template) {
      console.log('=== SAMPLE FIXED TEMPLATE ===');
      console.log(`Trigger: ${template.trigger}`);
      console.log(`Tenant: ${template.tenant.name}`);
      console.log(`Name: ${template.name}`);
      console.log('\nTemplate Content:');
      console.log('---');
      console.log(template.template);
      console.log('---');

      // Highlight the key variables
      const cashVariable = template.template.match(
        /💰 নগদ বকেয়া: \{\{([^}]+)\}\}/
      );
      const cylinderVariable = template.template.match(
        /🛢 সিলিন্ডার বকেয়া: \{\{([^}]+)\}\}/
      );

      console.log('\n✅ KEY VARIABLES VERIFIED:');
      console.log(
        `💰 Cash variable: {{${cashVariable ? cashVariable[1] : 'NOT FOUND'}}}`
      );
      console.log(
        `🛢 Cylinder variable: {{${cylinderVariable ? cylinderVariable[1] : 'NOT FOUND'}}}`
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showSampleTemplate();
