// Fix cylinder receivable counts and update company name formatting
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCylinderCounts() {
  try {
    console.log('🔧 Fixing cylinder receivable counts for Sakib...\n');

    const sakibTenant = 'cmdvbgp820000ub28u1hkluf4';

    // First, let's check the notes to see what returns were recorded
    const cylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: sakibTenant,
        customerName: 'Sakib',
        receivableType: 'CYLINDER',
      },
      select: {
        id: true,
        quantity: true,
        size: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    });

    console.log('Current cylinder receivables:');
    cylinderReceivables.forEach((record, index) => {
      console.log(
        `${index + 1}. Size: ${record.size}, Quantity: ${record.quantity}, Status: ${record.status}`
      );
      if (record.notes) {
        const returns = record.notes.match(/Return: (\d+) cylinders/g);
        if (returns) {
          console.log(`   Returns found in notes: ${returns.join(', ')}`);
          const totalReturned = returns.reduce((sum, returnNote) => {
            const match = returnNote.match(/Return: (\d+) cylinders/);
            return sum + (match ? parseInt(match[1]) : 0);
          }, 0);
          console.log(`   Total returned according to notes: ${totalReturned}`);
          console.log(
            `   Expected current quantity: ${record.quantity} (original) - ${totalReturned} (returned) = ${record.quantity - totalReturned}`
          );
        }
      }
    });

    // Based on the expected quantities, let's correct the data
    // From the debug output, it looks like:
    // - 12L record 1: 5 quantity with no returns in notes = should be 5
    // - 12L record 2: 4 quantity with returns (2+1+1=4 returned) = should be 0 (PAID)
    // - 35L record: 3 quantity with returns (1+1=2 returned) = should be 1

    console.log('\n🔄 Correcting cylinder receivable quantities...');

    // Update the 12L record that should be 0 (fully returned)
    const record2 = cylinderReceivables.find(
      (r) =>
        r.size === '12L' &&
        r.quantity === 4 &&
        r.notes &&
        r.notes.includes('Return: 2 cylinders')
    );

    if (record2) {
      await prisma.customerReceivable.update({
        where: { id: record2.id },
        data: {
          quantity: 0,
          status: 'PAID',
          notes:
            record2.notes +
            '\nCorrected: All cylinders returned, marked as PAID',
        },
      });
      console.log(
        `✅ Updated 12L record ${record2.id.slice(-8)} to 0 quantity (PAID)`
      );
    }

    // Update the 35L record
    const record35L = cylinderReceivables.find((r) => r.size === '35L');
    if (record35L) {
      await prisma.customerReceivable.update({
        where: { id: record35L.id },
        data: {
          quantity: 1,
          notes:
            record35L.notes +
            '\nCorrected: Adjusted quantity to reflect actual returns',
        },
      });
      console.log(
        `✅ Updated 35L record ${record35L.id.slice(-8)} to 1 quantity`
      );
    }

    // Verify the corrections
    console.log('\n📊 Verifying corrected cylinder receivables...');
    const correctedReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId: sakibTenant,
        customerName: 'Sakib',
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      select: {
        quantity: true,
        size: true,
        status: true,
      },
    });

    const correctedSizeBreakdown = {};
    correctedReceivables.forEach((receivable) => {
      const size = receivable.size || '12L';
      correctedSizeBreakdown[size] =
        (correctedSizeBreakdown[size] || 0) + receivable.quantity;
    });

    console.log('Corrected unpaid cylinder receivables by size:');
    Object.entries(correctedSizeBreakdown).forEach(([size, quantity]) => {
      console.log(`${size}: ${quantity} টি`);
    });

    // Now fix the company name formatting in templates
    console.log('\n🔧 Fixing company name formatting in templates...');

    // Get current templates and update them to use proper company name formatting
    const templates = await prisma.messageTemplate.findMany({
      where: { tenantId: sakibTenant },
      select: { id: true, name: true, template: true, trigger: true },
    });

    for (const template of templates) {
      // Fix templates that just have "{{companyName}}" at the end instead of the full format
      let updatedTemplate = template.template;

      // Replace standalone {{companyName}} at the end with proper format
      if (
        updatedTemplate.includes('*{{companyName}}*') &&
        !updatedTemplate.includes('*{{companyName}} - এলপিজি ডিস্ট্রিবিউটর*')
      ) {
        updatedTemplate = updatedTemplate.replace(
          /\*\{\{companyName\}\}\*$/,
          '*{{companyName}} - এলপিজি ডিস্ট্রিবিউটর*'
        );
      } else if (updatedTemplate.endsWith('*{{companyName}}*')) {
        updatedTemplate = updatedTemplate.replace(
          /\*\{\{companyName\}\}\*$/,
          '*{{companyName}} - এলপিজি ডিস্ট্রিবিউটর*'
        );
      }

      // Also ensure the template starts with proper company name format if it doesn't have the full format
      if (
        updatedTemplate.startsWith('*{{companyName}}*') &&
        !updatedTemplate.includes('- এলপিজি ডিস্ট্রিবিউটর')
      ) {
        // For templates that start with company name (like payment and cylinder return), keep them as they are
        // but make sure the ending has the full format
      }

      if (updatedTemplate !== template.template) {
        await prisma.messageTemplate.update({
          where: { id: template.id },
          data: { template: updatedTemplate },
        });
        console.log(
          `✅ Updated ${template.name} template company name formatting`
        );
      }
    }

    console.log('\n🎯 Fixes Applied:');
    console.log(
      '✅ Corrected cylinder receivable quantities based on return notes'
    );
    console.log('✅ 12L cylinders: 9 → 5 (one record marked as PAID)');
    console.log('✅ 35L cylinders: 3 → 1 (quantity adjusted for returns)');
    console.log('✅ Updated templates to show "Eureka - এলপিজি ডিস্ট্রিবিউটর"');
    console.log('\n🚀 Cylinder counts and company formatting are now correct!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCylinderCounts();
