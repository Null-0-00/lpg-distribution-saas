/**
 * Email Verification and Password Reset Utilities
 */

import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

// Configuration
const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_CODE_EXPIRY_MINUTES = 15;
const PASSWORD_RESET_CODE_EXPIRY_MINUTES = 30;
const MAX_ATTEMPTS_PER_HOUR = 5;

/**
 * Generate a secure verification code
 */
export function generateVerificationCode(): string {
  // Generate 6-digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

/**
 * Generate a secure password reset code
 */
export function generatePasswordResetCode(): string {
  // Generate 8-character alphanumeric code
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Create email verification code
 */
export async function createEmailVerificationCode(email: string): Promise<{
  code: string;
  expiresAt: Date;
}> {
  // Clean up expired codes first
  await cleanupExpiredCodes();

  // Check rate limiting
  const recentCodes = await prisma.emailVerificationCode.count({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
  });

  if (recentCodes >= MAX_ATTEMPTS_PER_HOUR) {
    throw new Error('Too many verification attempts. Please try again later.');
  }

  // Generate new code
  const code = generateVerificationCode();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
  );

  // Store in database
  await prisma.emailVerificationCode.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

/**
 * Create password reset code
 */
export async function createPasswordResetCode(email: string): Promise<{
  code: string;
  expiresAt: Date;
}> {
  // Clean up expired codes first
  await cleanupExpiredCodes();

  // Check rate limiting
  const recentCodes = await prisma.passwordResetCode.count({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
  });

  if (recentCodes >= MAX_ATTEMPTS_PER_HOUR) {
    throw new Error('Too many reset attempts. Please try again later.');
  }

  // Generate new code
  const code = generatePasswordResetCode();
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_CODE_EXPIRY_MINUTES * 60 * 1000
  );

  // Store in database
  await prisma.passwordResetCode.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

/**
 * Verify email verification code
 */
export async function verifyEmailVerificationCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  // Find the code
  const verificationCode = await prisma.emailVerificationCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!verificationCode) {
    return {
      success: false,
      error: 'Invalid or expired verification code',
    };
  }

  // Mark code as used
  await prisma.emailVerificationCode.update({
    where: {
      id: verificationCode.id,
    },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });

  // Update user's email verification status
  await prisma.user.updateMany({
    where: {
      email,
    },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Verify password reset code
 */
export async function verifyPasswordResetCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  // Find the code
  const resetCode = await prisma.passwordResetCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetCode) {
    return {
      success: false,
      error: 'Invalid or expired reset code',
    };
  }

  return { success: true };
}

/**
 * Use password reset code (mark as used)
 */
export async function usePasswordResetCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  // Find and verify the code
  const resetCode = await prisma.passwordResetCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetCode) {
    return {
      success: false,
      error: 'Invalid or expired reset code',
    };
  }

  // Mark code as used
  await prisma.passwordResetCode.update({
    where: {
      id: resetCode.id,
    },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });

  // Update user's password reset timestamp
  await prisma.user.updateMany({
    where: {
      email,
    },
    data: {
      passwordResetRequestedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Clean up expired and used codes
 */
export async function cleanupExpiredCodes(): Promise<void> {
  const now = new Date();

  // Delete expired email verification codes
  await prisma.emailVerificationCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        {
          used: true,
          usedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }, // Used codes older than 24h
      ],
    },
  });

  // Delete expired password reset codes
  await prisma.passwordResetCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        {
          used: true,
          usedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }, // Used codes older than 24h
      ],
    },
  });
}

/**
 * Check if user has verified their email
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  return user?.emailVerified ?? false;
}

/**
 * Get verification status and stats
 */
export async function getVerificationStats(email: string): Promise<{
  isVerified: boolean;
  pendingVerificationCodes: number;
  pendingResetCodes: number;
  lastVerificationAttempt?: Date;
  lastResetAttempt?: Date;
}> {
  const [user, verificationCodes, resetCodes] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    }),
    prisma.emailVerificationCode.findMany({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),
    prisma.passwordResetCode.findMany({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),
  ]);

  return {
    isVerified: user?.emailVerified ?? false,
    pendingVerificationCodes: verificationCodes.length,
    pendingResetCodes: resetCodes.length,
    lastVerificationAttempt: verificationCodes[0]?.createdAt,
    lastResetAttempt: resetCodes[0]?.createdAt,
  };
}

// Export constants for use in API routes
export const VERIFICATION_CONFIG = {
  CODE_LENGTH: VERIFICATION_CODE_LENGTH,
  VERIFICATION_EXPIRY_MINUTES: VERIFICATION_CODE_EXPIRY_MINUTES,
  RESET_EXPIRY_MINUTES: PASSWORD_RESET_CODE_EXPIRY_MINUTES,
  MAX_ATTEMPTS_PER_HOUR,
};
