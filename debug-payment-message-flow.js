// Debug the payment message flow to see where it fails
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPaymentMessageFlow() {
  try {
    console.log('🔍 Debugging payment message flow...\n');

    const tenantId = 'cmdvbgp820000ub28u1hkluf4';
    const customerId = 'cmdvqoyd50003ubk4gybndqan';

    // 1. Check customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        tenantId: true,
        area: { select: { name: true } },
        driver: { select: { name: true } },
      },
    });

    console.log('1. Customer details:');
    console.log('   Name:', customer?.name);
    console.log('   Phone:', customer?.phone);
    console.log('   Tenant:', customer?.tenantId);
    console.log('   Area:', customer?.area?.name);

    // 2. Check message provider
    const provider = await prisma.messageProvider.findFirst({
      where: {
        tenantId: tenantId,
        isActive: true,
      },
    });

    console.log('\n2. Message provider:');
    console.log('   Name:', provider?.name);
    console.log('   Type:', provider?.type);
    console.log('   Config:', JSON.stringify(provider?.config || {}, null, 2));

    // 3. Check messaging settings
    const settings = await prisma.messagingSettings.findUnique({
      where: { tenantId: tenantId },
    });

    console.log('\n3. Messaging settings:');
    console.log(
      '   Payment notifications enabled:',
      settings?.paymentNotificationsEnabled
    );
    console.log('   WhatsApp enabled:', settings?.whatsappEnabled);

    // 4. Check PAYMENT_RECEIVED templates
    const templates = await prisma.messageTemplate.findMany({
      where: {
        tenantId: tenantId,
        trigger: 'PAYMENT_RECEIVED',
        isActive: true,
      },
    });

    console.log('\n4. PAYMENT_RECEIVED templates:');
    console.log('   Found:', templates.length, 'templates');
    templates.forEach((template, i) => {
      console.log(`   Template ${i + 1}:`, template.name);
      console.log(`   Provider ID:`, template.providerId);
      console.log(`   Message type:`, template.messageType);
      console.log(
        `   Template text:`,
        template.template.substring(0, 100) + '...'
      );
    });

    // 5. Check recent failed messages
    const failedMessages = await prisma.sentMessage.findMany({
      where: {
        tenantId: tenantId,
        phoneNumber: customer?.phone,
        status: 'FAILED',
        trigger: 'PAYMENT_RECEIVED',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    console.log('\n5. Recent failed payment messages:');
    console.log('   Found:', failedMessages.length, 'failed messages');
    failedMessages.forEach((msg, i) => {
      console.log(`   Failed message ${i + 1}:`);
      console.log(`   Error:`, msg.errorMessage);
      console.log(`   Template ID:`, msg.templateId);
      console.log(`   Provider ID:`, msg.providerId);
      console.log(`   Created:`, msg.createdAt);
    });

    // 6. Check if provider IDs match between templates and providers
    console.log('\n6. Provider ID matching:');
    const activeProvider = await prisma.messageProvider.findFirst({
      where: { tenantId: tenantId, isActive: true },
    });

    if (activeProvider && templates.length > 0) {
      const templateProviderIds = templates.map((t) => t.providerId);
      console.log('   Active provider ID:', activeProvider.id);
      console.log('   Template provider IDs:', templateProviderIds);
      console.log('   Match:', templateProviderIds.includes(activeProvider.id));
    }
  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugPaymentMessageFlow();
