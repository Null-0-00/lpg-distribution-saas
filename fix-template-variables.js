const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTemplateVariables() {
  try {
    console.log('=== FIXING TEMPLATE VARIABLE NAMES ===\n');

    // Get all templates
    const templates = await prisma.messageTemplate.findMany({
      include: {
        tenant: { select: { name: true } },
      },
    });

    console.log(`Found ${templates.length} templates to fix\n`);

    let updateCount = 0;

    for (const template of templates) {
      console.log(`Fixing ${template.trigger} for ${template.tenant.name}...`);

      // Replace incorrect variable names with correct ones
      let updatedTemplate = template.template;

      // Fix the variable names based on what's actually provided by the messaging service
      const variableFixes = {
        // Fix cash amount variable
        '{{newCashAmount}}': '{{cashAmount}}',

        // Fix cylinder receivables variable
        '{{newCylinderReceivablesBySize}}': '{{newCylinderReceivablesBySize}}', // This one is correct

        // Fix other common variables that might be wrong
        '{{updatedCashReceivables}}': '{{cashAmount}}',
        '{{updatedCylinderReceivablesBySize}}':
          '{{newCylinderReceivablesBySize}}',
        '{{cylinderReceivablesBySize}}': '{{newCylinderReceivablesBySize}}',
      };

      // Apply fixes
      let hasChanges = false;
      for (const [oldVar, newVar] of Object.entries(variableFixes)) {
        if (updatedTemplate.includes(oldVar)) {
          updatedTemplate = updatedTemplate.replace(
            new RegExp(oldVar.replace(/[{}]/g, '\\$&'), 'g'),
            newVar
          );
          hasChanges = true;
          console.log(`  - Replaced ${oldVar} with ${newVar}`);
        }
      }

      if (hasChanges) {
        // Update the template in database
        await prisma.messageTemplate.update({
          where: { id: template.id },
          data: {
            template: updatedTemplate,
          },
        });

        updateCount++;
        console.log(`  ✅ Updated successfully`);
      } else {
        console.log(`  ✅ No changes needed`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Updated ${updateCount} templates`);

    // Show the current variable usage in templates
    console.log(`\n=== CURRENT VARIABLE USAGE ===`);
    const updatedTemplates = await prisma.messageTemplate.findMany({
      include: { tenant: { select: { name: true } } },
    });

    const variableUsage = {};
    updatedTemplates.forEach((template) => {
      const variables = template.template.match(/\{\{[^}]+\}\}/g) || [];
      variables.forEach((variable) => {
        if (!variableUsage[variable]) {
          variableUsage[variable] = [];
        }
        variableUsage[variable].push(
          `${template.trigger} (${template.tenant.name})`
        );
      });
    });

    // Show variables that contain "cash" or "cylinder"
    console.log('\nCash and Cylinder variables in use:');
    Object.entries(variableUsage)
      .filter(
        ([variable]) =>
          variable.toLowerCase().includes('cash') ||
          variable.toLowerCase().includes('cylinder')
      )
      .forEach(([variable, usage]) => {
        console.log(`${variable}:`);
        usage.forEach((u) => console.log(`  - ${u}`));
      });
  } catch (error) {
    console.error('❌ Error fixing templates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplateVariables();
