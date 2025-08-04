const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProviderDetails() {
  try {
    console.log('=== CHECKING PROVIDER DETAILS ===\n');

    const providers = await prisma.messageProvider.findMany({
      select: {
        id: true,
        tenantId: true,
        name: true,
        type: true,
        isDefault: true,
        tenant: { select: { name: true } },
      },
    });

    console.log('All message providers:');
    providers.forEach((p) => {
      console.log(
        `- ${p.tenant.name}: ${p.name} (${p.type}) (${p.isDefault ? 'default' : 'not default'})`
      );
    });

    // Check if there's an issue with the provider value
    const specificProvider = await prisma.messageProvider.findFirst({
      where: { isDefault: true },
    });

    if (specificProvider) {
      console.log('\nProvider details:', {
        id: specificProvider.id,
        name: specificProvider.name,
        type: specificProvider.type,
        isDefault: specificProvider.isDefault,
        config: specificProvider.config,
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviderDetails();
