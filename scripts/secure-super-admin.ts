/**
 * SECURE SUPER ADMIN CREATION SCRIPT
 *
 * This script is for DEVELOPER/OWNER USE ONLY!
 *
 * Multiple security layers:
 * 1. Requires specific environment variables
 * 2. Requires developer secret key
 * 3. Only works in development environment
 * 4. Should be run locally by the owner only
 *
 * DO NOT expose this file in production or public repositories!
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Security constants - these should match your private environment
const REQUIRED_ENV_VARS = [
  'NEXTAUTH_SECRET',
  'DATABASE_URL',
  'DEVELOPER_SECRET_KEY', // Must be set by developer
  'SUPER_ADMIN_CREATION_ALLOWED', // Must be explicitly set to 'true'
];

const DEVELOPER_MASTER_KEY = process.env.DEVELOPER_SECRET_KEY;
const CREATION_ALLOWED = process.env.SUPER_ADMIN_CREATION_ALLOWED === 'true';
const NODE_ENV = process.env.NODE_ENV;

function validateEnvironment(): boolean {
  // Only allow in development
  if (NODE_ENV === 'production') {
    console.error(
      '🚫 SECURITY: Super admin creation is disabled in production'
    );
    return false;
  }

  // Check all required environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      console.error(
        `🚫 SECURITY: Missing required environment variable: ${envVar}`
      );
      return false;
    }
  }

  // Check if creation is explicitly allowed
  if (!CREATION_ALLOWED) {
    console.error(
      '🚫 SECURITY: Super admin creation not allowed. Set SUPER_ADMIN_CREATION_ALLOWED=true'
    );
    return false;
  }

  return true;
}

function validateDeveloperKey(inputKey: string): boolean {
  if (!DEVELOPER_MASTER_KEY) {
    console.error('🚫 SECURITY: DEVELOPER_SECRET_KEY not configured');
    return false;
  }

  // Use crypto.timingSafeEqual to prevent timing attacks
  const inputBuffer = Buffer.from(inputKey);
  const masterBuffer = Buffer.from(DEVELOPER_MASTER_KEY);

  if (inputBuffer.length !== masterBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, masterBuffer);
}

async function createSecureSuperAdmin() {
  console.log('🔐 SECURE SUPER ADMIN CREATION');
  console.log('==============================');
  console.log('⚠️  FOR DEVELOPER/OWNER USE ONLY!');
  console.log('');

  // Step 1: Environment validation
  console.log('Step 1: Validating environment...');
  if (!validateEnvironment()) {
    process.exit(1);
  }
  console.log('✅ Environment validation passed');

  // Step 2: Developer authentication
  console.log('');
  console.log('Step 2: Developer authentication required');
  console.log('Enter your developer secret key:');

  process.stdout.write('🔑 Developer Key: ');

  return new Promise((resolve) => {
    process.stdin.once('data', async (data) => {
      const inputKey = data.toString().trim();

      if (!validateDeveloperKey(inputKey)) {
        console.error('🚫 INVALID DEVELOPER KEY - ACCESS DENIED');
        process.exit(1);
      }

      console.log('✅ Developer authentication successful');

      try {
        // Step 3: Create super admin
        console.log('');
        console.log('Step 3: Creating super admin...');

        const superAdminData = {
          email: 'owner@your-domain.com', // Change this to your email
          name: 'System Owner',
          password: crypto.randomBytes(16).toString('hex') + '!A1', // Secure random password
        };

        // Check if super admin already exists
        const existing = await prisma.user.findFirst({
          where: { role: 'SUPER_ADMIN' },
        });

        if (existing) {
          console.log(
            '⚠️  Super admin already exists. Updating credentials...'
          );
        }

        const hashedPassword = await bcrypt.hash(superAdminData.password, 12);

        const superAdmin = existing
          ? await prisma.user.update({
              where: { id: existing.id },
              data: {
                email: superAdminData.email,
                name: superAdminData.name,
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                tenantId: null,
                isActive: true,
              },
            })
          : await prisma.user.create({
              data: {
                email: superAdminData.email,
                name: superAdminData.name,
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                tenantId: null,
                isActive: true,
              },
            });

        console.log('');
        console.log('🎉 SUPER ADMIN CREATED SUCCESSFULLY!');
        console.log('===================================');
        console.log(`📧 Email: ${superAdminData.email}`);
        console.log(`🔑 Password: ${superAdminData.password}`);
        console.log(`👤 User ID: ${superAdmin.id}`);
        console.log('');
        console.log('⚠️  CRITICAL SECURITY REMINDERS:');
        console.log('1. Save these credentials in a secure password manager');
        console.log('2. Delete this console output after saving credentials');
        console.log('3. Change the password after first login');
        console.log('4. Set SUPER_ADMIN_CREATION_ALLOWED=false after use');
        console.log('5. Never share these credentials');
        console.log('');
        console.log('🌐 Login at: http://localhost:3000/auth/login');
      } catch (error) {
        console.error('❌ Error creating super admin:', error);
      } finally {
        await prisma.$disconnect();
        process.exit(0);
      }
    });
  });
}

// Only run if called directly (not imported)
if (require.main === module) {
  createSecureSuperAdmin().catch(console.error);
}
