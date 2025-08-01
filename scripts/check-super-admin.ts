import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@lpg-saas.com',
      },
    });

    if (superAdmin) {
      console.log('✅ Super admin found:', {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        isActive: superAdmin.isActive,
        tenantId: superAdmin.tenantId,
      });
    } else {
      console.log('❌ Super admin not found');
    }
  } catch (error) {
    console.error('❌ Error checking super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
