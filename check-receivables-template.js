const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReceivablesTemplate() {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: 'cmdvbgp820000ub28u1hkluf4',
        trigger: 'RECEIVABLES_CHANGE',
      },
    });

    if (template) {
      console.log('📝 Current Template:');
      console.log(template.template);
      console.log('\n🔧 Current Variables:');
      console.log(JSON.stringify(template.variables, null, 2));
    } else {
      console.log('❌ Template not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkReceivablesTemplate();
