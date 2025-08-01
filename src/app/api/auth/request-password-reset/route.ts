/**
 * Password Reset Request API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPasswordResetCode } from '@/lib/email/verification';
import { sendEmail } from '@/lib/email/service';
import { createPasswordResetEmail, getAppData } from '@/lib/email/templates';
import { VERIFICATION_CONFIG } from '@/lib/email/verification';
import { prisma } from '@/lib/prisma';

// Validation schema
const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email } = requestResetSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'If an account with that email exists, a password reset code has been sent.',
      });
    }

    // Create password reset code
    const { code } = await createPasswordResetCode(email);

    // Send password reset email
    const appData = getAppData();
    const resetEmail = createPasswordResetEmail({
      name: user.name || 'User',
      resetCode: code,
      expiresInMinutes: VERIFICATION_CONFIG.RESET_EXPIRY_MINUTES,
      ...appData,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: resetEmail.subject,
      html: resetEmail.html,
      text: resetEmail.text,
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'If an account with that email exists, a password reset code has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    // Check for rate limiting error
    if (error instanceof Error && error.message.includes('Too many')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
