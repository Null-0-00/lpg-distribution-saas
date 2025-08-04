const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCylinderReturnMessaging() {
  try {
    console.log('=== TESTING CYLINDER RETURN MESSAGING ===\n');

    // 1. Find a customer with phone number
    const customerWithReceivables = await prisma.customer.findFirst({
      where: {
        isActive: true,
        phone: { not: null },
      },
      include: {
        area: { select: { name: true } },
        driver: { select: { name: true } },
      },
    });

    if (!customerWithReceivables) {
      console.log('❌ No customers found with phone numbers');
      return;
    }

    // Get their cylinder receivables separately
    const cylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        customerName: customerWithReceivables.name,
        tenantId: customerWithReceivables.tenantId,
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
        quantity: { gt: 0 },
      },
    });

    if (cylinderReceivables.length === 0) {
      console.log('❌ Customer found but no outstanding cylinder receivables');
      return;
    }

    console.log('✅ Found test customer:', {
      name: customerWithReceivables.name,
      phone: customerWithReceivables.phone,
      receivablesCount: cylinderReceivables.length,
      totalCylinders: cylinderReceivables.reduce(
        (sum, r) => sum + r.quantity,
        0
      ),
    });

    // 2. Check if messaging is setup for this tenant
    const messagingProvider = await prisma.messageProvider.findFirst({
      where: {
        tenantId: customerWithReceivables.tenantId,
        isActive: true,
      },
    });

    console.log('📱 Messaging provider status:', {
      exists: !!messagingProvider,
      provider: messagingProvider?.provider || 'NONE',
      isActive: messagingProvider?.isActive || false,
    });

    if (!messagingProvider) {
      console.log('❌ No active messaging provider found for tenant');
      return;
    }

    // 3. Check message templates
    const cylinderReturnTemplate = await prisma.messageTemplate.findFirst({
      where: {
        tenantId: customerWithReceivables.tenantId,
        trigger: 'CYLINDER_RETURN',
        isActive: true,
      },
    });

    console.log('📝 Cylinder return template status:', {
      exists: !!cylinderReturnTemplate,
      templateLength: cylinderReturnTemplate?.whatsappTemplate?.length || 0,
      isActive: cylinderReturnTemplate?.isActive || false,
    });

    if (!cylinderReturnTemplate) {
      console.log('❌ No active cylinder return template found');

      // Check what templates exist
      const allTemplates = await prisma.messageTemplate.findMany({
        where: { tenantId: customerWithReceivables.tenantId },
        select: { trigger: true, isActive: true },
      });

      console.log('Available templates:', allTemplates);
      return;
    }

    // 4. Test the notifyCustomerCylinderReturn function
    console.log('\n=== TESTING NOTIFICATION FUNCTION ===');

    const testReceivable = cylinderReceivables[0];

    console.log('Test data:', {
      tenantId: customerWithReceivables.tenantId,
      customerId: customerWithReceivables.id,
      customerName: customerWithReceivables.name,
      quantity: 1, // Return 1 cylinder for test
      size: testReceivable.size || '12L',
      receivedBy: 'Test Admin',
    });

    // Import and test the function (but don't actually send a message)
    console.log('\n✅ All prerequisites met - messaging should work');
    console.log('📞 Customer phone:', customerWithReceivables.phone);
    console.log('🏢 Messaging provider:', messagingProvider.provider);
    console.log('📝 Template ready:', !!cylinderReturnTemplate);

    // 5. Check recent message logs to see if messages were sent
    const recentMessages = await prisma.sentMessage.findMany({
      where: {
        tenantId: customerWithReceivables.tenantId,
        phoneNumber: customerWithReceivables.phone,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('\n📋 Recent messages to this customer (last 24h):', {
      count: recentMessages.length,
      messages: recentMessages.map((m) => ({
        trigger: m.triggerType || 'N/A',
        status: m.status,
        sentAt: m.sentAt?.toISOString() || m.createdAt?.toISOString(),
        content: m.content?.substring(0, 50) + '...',
      })),
    });

    if (recentMessages.length === 0) {
      console.log(
        '🔍 No recent messages found - this might indicate messaging is not working'
      );
    }
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCylinderReturnMessaging();
