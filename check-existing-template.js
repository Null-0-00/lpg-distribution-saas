const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTemplate() {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: { tenantId: 'cmdvbgp820000ub28u1hkluf4' },
    });
    console.log(JSON.stringify(template, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplate();
