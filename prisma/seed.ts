// Database Seeding Script
// Creates initial data for development and testing

import { PrismaClient, UserRole, SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo LPG Distributor',
      subdomain: 'demo',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.PROFESSIONAL,
      isActive: true,
      settings: {
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        businessHours: {
          start: '09:00',
          end: '18:00'
        }
      }
    }
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo.com'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true
    }
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create manager user
  const managerPassword = await hash('manager123', 12);
  const managerUser = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'manager@demo.com'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'manager@demo.com',
      name: 'Manager User',
      password: managerPassword,
      role: UserRole.MANAGER,
      isActive: true
    }
  });

  console.log('✅ Created manager user:', managerUser.email);

  // Create companies
  console.log('✅ No demo companies created.');

  // Create products
  const products = await Promise.all([
    // No demo products created
  ]);

  

  // Create drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: {
        tenantId_phone: {
          tenantId: tenant.id,
          phone: '+880-1711-123456'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Karim Rahman',
        phone: '+880-1711-123456',
        email: 'karim@demo.com',
        address: 'Dhanmondi, Dhaka',
        licenseNumber: 'DH-123456',
        route: 'Dhanmondi - Gulshan',
        joiningDate: new Date('2024-01-15'),
        status: 'ACTIVE',
        driverType: 'RETAIL'
      }
    }),
    prisma.driver.upsert({
      where: {
        tenantId_phone: {
          tenantId: tenant.id,
          phone: '+880-1722-234567'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Abdul Hamid',
        phone: '+880-1722-234567',
        email: 'hamid@demo.com',
        address: 'Uttara, Dhaka',
        licenseNumber: 'DH-234567',
        route: 'Uttara - Mirpur',
        joiningDate: new Date('2024-02-01'),
        status: 'ACTIVE',
        driverType: 'SHIPMENT'
      }
    })
  ]);

  console.log('✅ Created drivers:', drivers.map(d => d.name).join(', '));

  // Create expense categories
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: 'Transportation'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Transportation',
        description: 'Vehicle fuel, maintenance, and transportation costs',
        budget: 50000,
        isActive: true
      }
    }),
    prisma.expenseCategory.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: 'Salaries'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Salaries',
        description: 'Employee salaries and benefits',
        budget: 200000,
        isActive: true
      }
    }),
    prisma.expenseCategory.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: 'Office Rent'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Office Rent',
        description: 'Office and warehouse rental costs',
        budget: 80000,
        isActive: true
      }
    })
  ]);

  console.log('✅ Created expense categories:', expenseCategories.map(c => c.name).join(', '));

  // Create sample assets
  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        tenantId: tenant.id,
        name: 'Delivery Truck',
        category: 'FIXED_ASSET',
        subCategory: 'Vehicles',
        value: 2500000,
        description: 'Primary delivery vehicle for LPG cylinders',
        purchaseDate: new Date('2024-01-01'),
        depreciationRate: 20,
        isActive: true
      }
    }),
    prisma.asset.create({
      data: {
        tenantId: tenant.id,
        name: 'Office Equipment',
        category: 'FIXED_ASSET',
        subCategory: 'Furniture & Equipment',
        value: 150000,
        description: 'Computers, furniture, and office equipment',
        purchaseDate: new Date('2024-01-15'),
        depreciationRate: 10,
        isActive: true
      }
    }),
    prisma.asset.create({
      data: {
        tenantId: tenant.id,
        name: 'Cash in Bank',
        category: 'CURRENT_ASSET',
        value: 500000,
        description: 'Current bank balance',
        isActive: true
      }
    })
  ]);

  console.log('✅ Created assets:', assets.map(a => a.name).join(', '));

  // Create sample liabilities
  const liabilities = await Promise.all([
    prisma.liability.create({
      data: {
        tenantId: tenant.id,
        name: 'Bank Loan',
        category: 'LONG_TERM_LIABILITY',
        amount: 1000000,
        description: 'Business expansion loan',
        dueDate: new Date('2026-12-31'),
        isActive: true
      }
    }),
    prisma.liability.create({
      data: {
        tenantId: tenant.id,
        name: 'Accounts Payable',
        category: 'CURRENT_LIABILITY',
        amount: 150000,
        description: 'Outstanding supplier payments',
        dueDate: new Date('2024-12-31'),
        isActive: true
      }
    })
  ]);

  console.log('✅ Created liabilities:', liabilities.map(l => l.name).join(', '));

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({ where: { name: 'users:create' }, update: {}, create: { name: 'users:create', description: 'Create users' } }),
    prisma.permission.upsert({ where: { name: 'users:read' }, update: {}, create: { name: 'users:read', description: 'Read users' } }),
    prisma.permission.upsert({ where: { name: 'users:update' }, update: {}, create: { name: 'users:update', description: 'Update users' } }),
    prisma.permission.upsert({ where: { name: 'users:delete' }, update: {}, create: { name: 'users:delete', description: 'Delete users' } }),
    prisma.permission.upsert({ where: { name: 'roles:assign' }, update: {}, create: { name: 'roles:assign', description: 'Assign roles to users' } }),
  ]);

  console.log('✅ Created permissions:', permissions.map(p => p.name).join(', '));

  // Assign all permissions to admin
  await prisma.user.update({
    where: { id: adminUser.id },
    data: {
      permissions: {
        connect: permissions.map(p => ({ id: p.id }))
      }
    }
  });

  console.log('✅ Assigned all permissions to admin');

  // Create demo admin user
  const demoAdminPassword = await hash('demo.admin', 12);
  const demoAdminUser = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'demo@admin.com'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'demo@admin.com',
      name: 'Demo Admin',
      password: demoAdminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      permissions: {
        connect: permissions.map(p => ({ id: p.id }))
      }
    }
  });

  console.log('✅ Created demo admin user:', demoAdminUser.email);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('Manager: manager@demo.com / manager123');
  console.log('Tenant: demo (subdomain)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });