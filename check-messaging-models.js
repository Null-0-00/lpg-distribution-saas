const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModels() {
  try {
    console.log('Available Prisma models:', Object.keys(prisma));

    // Find models related to messaging
    const messagingModels = Object.keys(prisma).filter(
      (key) =>
        key.toLowerCase().includes('message') ||
        key.toLowerCase().includes('whatsapp') ||
        key.toLowerCase().includes('template')
    );

    console.log('Messaging-related models:', messagingModels);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkModels();
