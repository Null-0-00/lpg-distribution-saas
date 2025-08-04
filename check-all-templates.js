const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllTemplates() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: { tenantId: 'cmdvbgp820000ub28u1hkluf4' },
      select: {
        id: true,
        name: true,
        trigger: true,
        template: true,
      },
    });

    console.log(`Found ${templates.length} message templates:\n`);

    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.trigger})`);
      console.log('Template:');
      console.log(template.template);
      console.log('\n' + '='.repeat(80) + '\n');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTemplates();
