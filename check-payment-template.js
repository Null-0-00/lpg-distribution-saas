// Check current payment received template
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPaymentTemplate() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: {
        trigger: 'PAYMENT_RECEIVED',
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        template: true,
        variables: true,
      },
    });

    console.log('📝 Current PAYMENT_RECEIVED templates:\n');
    templates.forEach((t, i) => {
      console.log(`Template ${i + 1}: ${t.name}`);
      console.log(`ID: ${t.id}`);
      console.log(`Tenant: ${t.tenantId}`);
      console.log(`Variables:`, JSON.stringify(t.variables, null, 2));
      console.log(`Template:`);
      console.log(t.template);
      console.log('\n---\n');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentTemplate();
