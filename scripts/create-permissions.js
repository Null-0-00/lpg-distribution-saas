const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPermissions() {
  try {
    // Check if permissions already exist
    const existingPermissions = await prisma.permission.count();

    if (existingPermissions > 0) {
      console.log('Permissions already exist. Current permissions:');
      const permissions = await prisma.permission.findMany();
      console.table(permissions);
      return;
    }

    // Create default permissions
    const defaultPermissions = [
      { name: 'manage_users', description: 'Create, update, and delete users' },
      { name: 'manage_sales', description: 'Create and manage sales records' },
      {
        name: 'manage_inventory',
        description: 'Manage inventory and stock levels',
      },
      {
        name: 'manage_drivers',
        description: 'Manage driver information and assignments',
      },
      { name: 'manage_expenses', description: 'Create and approve expenses' },
      {
        name: 'manage_receivables',
        description: 'Manage customer receivables',
      },
      {
        name: 'view_reports',
        description: 'Access financial and business reports',
      },
      { name: 'manage_categories', description: 'Manage expense categories' },
      { name: 'approve_expenses', description: 'Approve pending expenses' },
      { name: 'manage_companies', description: 'Manage company information' },
      { name: 'manage_products', description: 'Manage product catalog' },
      { name: 'admin_access', description: 'Full administrative access' },
    ];

    for (const permission of defaultPermissions) {
      await prisma.permission.create({
        data: permission,
      });
    }

    console.log('Default permissions created successfully:');
    const permissions = await prisma.permission.findMany();
    console.table(permissions);
  } catch (error) {
    console.error('Error creating permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPermissions();
