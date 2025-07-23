import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantName,
      subdomain,
      currency,
      timezone,
      language,
      subscriptionPlan,
      userName,
      userEmail,
      userPassword,
    } = body;

    // Validate required fields
    if (!tenantName || !subdomain || !userName || !userEmail || !userPassword) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: userEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(userPassword, 12);

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          subdomain: subdomain.toLowerCase(),
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: subscriptionPlan as any,
          currency,
          timezone,
          language,
          isActive: true,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: userEmail,
          name: userName,
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

      // Create default expense categories
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
            tenantName,
            subdomain,
            adminEmail: userEmail,
            onboardedAt: new Date().toISOString(),
          },
        },
      });

      return { tenant, user };
    });

    return NextResponse.json({
      success: true,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
      },
      adminUser: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to onboard business' },
      { status: 500 }
    );
  }
}
