#!/usr/bin/env tsx

/**
 * Manual Business Onboarding Script
 * Usage: npm run onboard-business
 *
 * This script creates a new tenant and admin user for manual business onboarding
 */

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { prompt } from 'enquirer';

const prisma = new PrismaClient();

interface OnboardingData {
  tenantName: string;
  subdomain: string;
  currency: string;
  timezone: string;
  subscriptionPlan: 'FREEMIUM' | 'PROFESSIONAL' | 'ENTERPRISE';
  userName: string;
  userEmail: string;
  userPassword: string;
}

async function main() {
  console.log('🚀 Manual Business Onboarding Script\n');

  try {
    // Collect business information
    const businessInfo = await prompt([
      {
        type: 'input',
        name: 'tenantName',
        message: 'Business Name:',
        required: true,
      },
      {
        type: 'input',
        name: 'subdomain',
        message: 'Subdomain (lowercase, no spaces):',
        required: true,
        validate: (input: string) => {
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Subdomain must contain only lowercase letters, numbers, and hyphens';
          }
          return true;
        },
      },
      {
        type: 'select',
        name: 'currency',
        message: 'Currency:',
        choices: ['USD', 'BDT', 'INR', 'EUR'],
        initial: 'USD',
      },
      {
        type: 'select',
        name: 'timezone',
        message: 'Timezone:',
        choices: ['UTC', 'Asia/Dhaka', 'Asia/Kolkata', 'America/New_York'],
        initial: 'UTC',
      },
      {
        type: 'select',
        name: 'subscriptionPlan',
        message: 'Subscription Plan:',
        choices: ['FREEMIUM', 'PROFESSIONAL', 'ENTERPRISE'],
        initial: 'PROFESSIONAL',
      },
    ]);

    // Collect admin user information
    const adminInfo = await prompt([
      {
        type: 'input',
        name: 'userName',
        message: 'Admin Name:',
        required: true,
      },
      {
        type: 'input',
        name: 'userEmail',
        message: 'Admin Email:',
        required: true,
        validate: (input: string) => {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
            return 'Please enter a valid email address';
          }
          return true;
        },
      },
      {
        type: 'password',
        name: 'userPassword',
        message: 'Admin Password (min 8 characters):',
        required: true,
        validate: (input: string) => {
          if (input.length < 8) {
            return 'Password must be at least 8 characters long';
          }
          return true;
        },
      },
    ]);

    const data: OnboardingData = {
      ...businessInfo,
      ...adminInfo,
    } as OnboardingData;

    // Check for existing subdomain
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain: data.subdomain.toLowerCase() },
    });

    if (existingTenant) {
      console.error(`❌ Error: Subdomain '${data.subdomain}' already exists`);
      process.exit(1);
    }

    // Check for existing email
    const existingUser = await prisma.user.findFirst({
      where: { email: data.userEmail },
    });

    if (existingUser) {
      console.error(`❌ Error: User email '${data.userEmail}' already exists`);
      process.exit(1);
    }

    // Confirm creation
    const confirm = await prompt({
      type: 'confirm',
      name: 'proceed',
      message: `Create business "${data.tenantName}" with subdomain "${data.subdomain}"?`,
    });

    if (!confirm.proceed) {
      console.log('❌ Onboarding cancelled');
      process.exit(0);
    }

    console.log('\n⏳ Creating business...');

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.userPassword, 12);

    // Create tenant and admin user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.tenantName,
          subdomain: data.subdomain.toLowerCase(),
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: data.subscriptionPlan,
          currency: data.currency,
          timezone: data.timezone,
          isActive: true,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.userEmail,
          name: data.userName,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });

      // Create default cylinder sizes
      const defaultSizes = ['12L', '35L', '5kg', '20L'];
      await tx.cylinderSize.createMany({
        data: defaultSizes.map((size) => ({
          tenantId: tenant.id,
          size,
          description: `${size} LPG Cylinder`,
        })),
      });

      // Create default expense parent categories
      const parentCategories = [
        { name: 'Operations', description: 'Day-to-day operational expenses' },
        {
          name: 'Marketing',
          description: 'Marketing and promotional expenses',
        },
        {
          name: 'Administrative',
          description: 'Administrative and office expenses',
        },
        {
          name: 'Transport',
          description: 'Vehicle and transport related expenses',
        },
      ];

      for (const parentCat of parentCategories) {
        await tx.expenseParentCategory.create({
          data: {
            tenantId: tenant.id,
            name: parentCat.name,
            description: parentCat.description,
          },
        });
      }

      // Log the onboarding event
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: 'CREATE',
          entityType: 'TENANT',
          entityId: tenant.id,
          newValues: {
            tenantName: data.tenantName,
            subdomain: data.subdomain,
            adminEmail: data.userEmail,
            onboardedAt: new Date().toISOString(),
            method: 'manual_script',
          },
        },
      });

      return { tenant, user };
    });

    console.log('\n✅ Business onboarded successfully!');
    console.log('📋 Details:');
    console.log(`   Business: ${result.tenant.name}`);
    console.log(`   Subdomain: ${result.tenant.subdomain}`);
    console.log(`   Admin: ${result.user.name} (${result.user.email})`);
    console.log(`   Login URL: /auth/login`);
    console.log(`   Tenant ID: ${result.tenant.id}`);
  } catch (error) {
    console.error('❌ Onboarding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
