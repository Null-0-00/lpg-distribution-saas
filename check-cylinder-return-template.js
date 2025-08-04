const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCylinderReturnTemplate() {
  try {
    const template = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: 'cmdvbgp820000ub28u1hkluf4',
        trigger: 'CYLINDER_RETURN',
      },
    });
    console.log(template ? 'EXISTS' : 'NOT_FOUND');
    if (template) {
      console.log('Template ID:', template.id);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCylinderReturnTemplate();
