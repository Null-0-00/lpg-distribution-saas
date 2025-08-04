const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingTemplate() {
  try {
    // Get an existing template to see the structure
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        trigger: 'RECEIVABLES_CHANGE',
      },
    });

    if (existingTemplate) {
      console.log('Existing template structure:');
      console.log(JSON.stringify(existingTemplate, null, 2));
    } else {
      console.log('No existing template found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingTemplate();
