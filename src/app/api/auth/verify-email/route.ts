/**
 * Email Verification API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyEmailVerificationCode } from '@/lib/email/verification';
import { sendEmail } from '@/lib/email/service';
import { createWelcomeEmail, getAppData } from '@/lib/email/templates';
import { prisma } from '@/lib/prisma';

// Validation schema
const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, code } = verifyEmailSchema.parse(body);

    // Verify the code
    const result = await verifyEmailVerificationCode(email, code);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (user) {
      // Send welcome email
      const appData = getAppData();
      const welcomeEmail = createWelcomeEmail({
        name: user.name || 'User',
        tenantName: user.tenant?.name || 'Your Business',
        dashboardUrl: `${appData.appUrl}/dashboard`,
        ...appData,
      });

      // Send welcome email (non-blocking)
      sendEmail({
        to: email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text,
      }).catch((error) => {
        console.error('Failed to send welcome email:', error);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

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
