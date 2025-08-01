/**
 * Resend Email Verification Code API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createEmailVerificationCode,
  isEmailVerified,
} from '@/lib/email/verification';
import { sendEmail } from '@/lib/email/service';
import { createVerificationEmail, getAppData } from '@/lib/email/templates';
import { VERIFICATION_CONFIG } from '@/lib/email/verification';
import { prisma } from '@/lib/prisma';

// Validation schema
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email } = resendVerificationSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Create new verification code
    const { code } = await createEmailVerificationCode(email);

    // Send verification email
    const appData = getAppData();
    const verificationEmail = createVerificationEmail({
      name: user.name || 'User',
      verificationCode: code,
      expiresInMinutes: VERIFICATION_CONFIG.VERIFICATION_EXPIRY_MINUTES,
      ...appData,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: verificationEmail.subject,
      html: verificationEmail.html,
      text: verificationEmail.text,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);

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
