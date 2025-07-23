const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);

    if (userCount > 0) {
      console.log('Users already exist. Listing current users:');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          tenant: {
            select: {
              name: true,
              subdomain: true
            }
          }
        }
      });
      
      console.table(users);
      return;
    }

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test LPG Distributor',
        subdomain: 'test-lpg',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'FREEMIUM',
        isActive: true,
      },
    });

    // Create test admin user
    const hashedPassword = await bcrypt.hash('password123', 12);

    const user = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id,
        isActive: true,
      },
    });

    console.log('Test user created successfully:');
    console.log(`Email: ${user.email}`);
    console.log(`Password: password123`);
    console.log(`Role: ${user.role}`);
    console.log(`Tenant: ${tenant.name}`);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();