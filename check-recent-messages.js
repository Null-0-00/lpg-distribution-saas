// Check recent messages to Sakib
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentMessages() {
  try {
    const recentMessages = await prisma.sentMessage.findMany({
      where: {
        phoneNumber: '+8801793536151',
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        phoneNumber: true,
        message: true,
        status: true,
        trigger: true,
        metadata: true,
        sentAt: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    console.log('📱 Recent messages to +8801793536151:');
    console.log(
      'Found',
      recentMessages.length,
      'messages in last 30 minutes\n'
    );

    recentMessages.forEach((msg, i) => {
      console.log(`Message ${i + 1}:`);
      console.log(`  Status: ${msg.status}`);
      console.log(`  Trigger: ${msg.trigger}`);
      console.log(`  Sent: ${msg.sentAt || 'Not sent'}`);
      console.log(`  Error: ${msg.errorMessage || 'None'}`);
      console.log(`  Message: ${msg.message.substring(0, 100)}...`);
      if (msg.metadata) {
        console.log(`  Metadata:`, JSON.stringify(msg.metadata, null, 2));
      }
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentMessages();
