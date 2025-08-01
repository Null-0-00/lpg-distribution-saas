import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createEmailVerificationCode } from '@/lib/email/verification';
import { sendEmail } from '@/lib/email/service';
import { createVerificationEmail, getAppData } from '@/lib/email/templates';
import { VERIFICATION_CONFIG } from '@/lib/email/verification';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // For development, use real database now that it's set up
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.USE_MOCK_AUTH === 'true'
    ) {
      console.log('Using development mock registration');

      // Simulate user creation without database
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        name: validatedData.name,
        email: validatedData.email,
        role: 'ADMIN',
        tenantId: 'mock-tenant-' + Date.now(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(
        {
          message: 'User created successfully (development mode)',
          user: mockUser,
        },
        { status: 201 }
      );
    }

    // Check if user already exists globally (across all tenants)
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate subdomain from company name
    const subdomain = validatedData.company
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      return NextResponse.json(
        {
          error:
            'A company with a similar name already exists. Please choose a different company name.',
        },
        { status: 400 }
      );
    }

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant (pending approval by default)
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.company,
          subdomain,
          contactEmail: validatedData.email,
          contactPhone: validatedData.phone,
          businessDescription: `${validatedData.company} - LPG Distribution Business`,
          subscriptionStatus: 'TRIAL',
          subscriptionPlan: 'FREEMIUM',
          approvalStatus: 'PENDING', // Requires super admin approval
          isActive: false, // Not active until approved
        },
      });

      // Create user as admin for the tenant
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: 'ADMIN', // First user becomes admin of their tenant
          tenantId: tenant.id,
          isActive: false, // Not active until tenant is approved
          emailVerified: false, // Requires email verification
        },
      });

      return { tenant, user };
    });

    // Log the registration in audit log
    await prisma.auditLog.create({
      data: {
        userId: result.user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: result.user.id,
        newValues: {
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          tenantId: result.tenant.id,
          tenantName: result.tenant.name,
        },
        metadata: {
          registrationType: 'self-registration',
          requiresApproval: true,
        },
      },
    });

    const user = result.user;
    const tenant = result.tenant;

    // Create and send email verification code
    try {
      const { code } = await createEmailVerificationCode(validatedData.email);

      // Send verification email
      const appData = getAppData();
      const verificationEmail = createVerificationEmail({
        name: validatedData.name,
        verificationCode: code,
        expiresInMinutes: VERIFICATION_CONFIG.VERIFICATION_EXPIRY_MINUTES,
        ...appData,
      });

      const emailResult = await sendEmail({
        to: validatedData.email,
        subject: verificationEmail.subject,
        html: verificationEmail.html,
        text: verificationEmail.text,
      });

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Continue with registration even if email fails
      }
    } catch (emailError) {
      console.error('Email verification setup failed:', emailError);
      // Continue with registration even if email verification setup fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message:
          'Registration successful! Please check your email for a verification code to complete your account setup. Your account is also pending approval by our administrators.',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          approvalStatus: tenant.approvalStatus,
        },
        user: userWithoutPassword,
        requiresEmailVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    // More detailed error for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
