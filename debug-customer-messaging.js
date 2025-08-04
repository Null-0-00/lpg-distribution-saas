// Debug customer messaging issues
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCustomerMessaging() {
  try {
    console.log('🔍 Debugging customer messaging...\n');

    // Check customers with phone numbers
    const customersWithPhones = await prisma.customer.findMany({
      where: {
        isActive: true,
        phone: { not: null },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        customerCode: true,
        tenantId: true,
      },
      take: 10,
    });

    console.log('📱 Customers with phone numbers:');
    if (customersWithPhones.length === 0) {
      console.log('  ❌ NO CUSTOMERS WITH PHONE NUMBERS FOUND!');
    } else {
      customersWithPhones.forEach((customer) => {
        console.log(
          `  - ${customer.name}: ${customer.phone} (${customer.customerCode || 'No Code'})`
        );
      });
    }

    // Get total counts
    const totalCustomers = await prisma.customer.count({
      where: { isActive: true },
    });

    const customersWithPhonesCount = await prisma.customer.count({
      where: {
        isActive: true,
        phone: { not: null },
      },
    });

    console.log('\n📊 Statistics:');
    console.log(`Total active customers: ${totalCustomers}`);
    console.log(`Customers with phone numbers: ${customersWithPhonesCount}`);
    console.log(
      `Customers without phone numbers: ${totalCustomers - customersWithPhonesCount}`
    );

    // Check recent receivables updates
    const recentReceivables = await prisma.customerReceivableRecord.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    console.log('\n🔄 Recent receivables updates (last 24h):');
    if (recentReceivables.length === 0) {
      console.log('  ❌ No recent receivables updates found');
    } else {
      recentReceivables.forEach((record) => {
        const hasPhone = record.customer.phone ? '✅' : '❌';
        console.log(
          `  ${hasPhone} ${record.customer.name}: ${record.customer.phone || 'NO PHONE'} - Cash: ৳${record.cashReceivables}, Cylinder: ${record.cylinderReceivables}`
        );
      });
    }

    // Check sent messages
    const recentMessages = await prisma.sentMessage.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('\n📨 Recent sent messages (last 24h):');
    if (recentMessages.length === 0) {
      console.log('  ❌ No messages sent in the last 24 hours');
    } else {
      recentMessages.forEach((msg) => {
        console.log(
          `  - To: ${msg.phoneNumber}, Type: ${msg.recipientType}, Status: ${msg.status}, Trigger: ${msg.trigger}`
        );
        console.log(`    Message: ${msg.message.substring(0, 100)}...`);
        if (msg.errorMessage) {
          console.log(`    Error: ${msg.errorMessage}`);
        }
      });
    }

    // Check message providers
    const providers = await prisma.messageProvider.findMany({
      where: { isActive: true },
    });

    console.log('\n🔧 Message providers:');
    providers.forEach((provider) => {
      console.log(
        `  - ${provider.name}: ${provider.type} (Active: ${provider.isActive}, Default: ${provider.isDefault})`
      );
    });

    // Check messaging settings
    const messagingSettings = await prisma.messagingSettings.findMany();
    console.log('\n⚙️ Messaging settings:');
    messagingSettings.forEach((setting) => {
      console.log(`  - Tenant: ${setting.tenantId}`);
      console.log(`    WhatsApp: ${setting.whatsappEnabled ? '✅' : '❌'}`);
      console.log(
        `    Receivables Notifications: ${setting.receivablesNotificationsEnabled ? '✅' : '❌'}`
      );
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugCustomerMessaging();
