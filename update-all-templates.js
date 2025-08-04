const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllTemplates() {
  try {
    console.log('=== CHECKING ALL MESSAGE TEMPLATES ===\n');

    const templates = await prisma.messageTemplate.findMany({
      include: {
        tenant: { select: { name: true } },
      },
      orderBy: [{ trigger: 'asc' }, { tenant: { name: 'asc' } }],
    });

    console.log(`Found ${templates.length} templates:\n`);

    const groupedByTrigger = templates.reduce((acc, template) => {
      if (!acc[template.trigger]) {
        acc[template.trigger] = [];
      }
      acc[template.trigger].push(template);
      return acc;
    }, {});

    for (const [trigger, triggerTemplates] of Object.entries(
      groupedByTrigger
    )) {
      console.log(`📝 ${trigger}:`);
      triggerTemplates.forEach((template) => {
        console.log(
          `  - ${template.tenant.name}: ${template.name} (${template.isActive ? 'active' : 'inactive'})`
        );
        console.log(
          `    Template length: ${template.template?.length || 0} characters`
        );
      });
      console.log('');
    }

    // Show a sample template
    if (templates.length > 0) {
      const sampleTemplate =
        templates.find((t) => t.trigger === 'CYLINDER_RETURN') || templates[0];
      console.log('Sample template (CYLINDER_RETURN):');
      console.log('---');
      console.log(sampleTemplate.template?.substring(0, 200) + '...');
      console.log('---');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTemplates();
