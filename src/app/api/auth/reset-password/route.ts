/**
 * Password Reset API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyPasswordResetCode,
  markPasswordResetCodeAsUsed,
} from '@/lib/email/verification';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(8, 'Reset code must be at least 8 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, code, password } = resetPasswordSchema.parse(body);

    // Verify the reset code
    const verifyResult = await verifyPasswordResetCode(email, code);

    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.error }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use the reset code (mark as used) and update password
    const useResult = await markPasswordResetCodeAsUsed(email, code);

    if (!useResult.success) {
      return NextResponse.json({ error: useResult.error }, { status: 400 });
    }

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
