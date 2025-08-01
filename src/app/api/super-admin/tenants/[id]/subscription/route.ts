import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { id: tenantId } = await params;
    const body = await request.json();
    const { subscriptionPlan, subscriptionStatus } = body;

    // Validate input
    if (!subscriptionPlan || !subscriptionStatus) {
      return NextResponse.json(
        { error: 'subscriptionPlan and subscriptionStatus are required' },
        { status: 400 }
      );
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Update tenant subscription
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionPlan,
        subscriptionStatus,
      },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: token.sub as string,
        action: 'UPDATE',
        entityType: 'Tenant',
        entityId: tenantId,
        oldValues: {
          subscriptionPlan: tenant.subscriptionPlan,
          subscriptionStatus: tenant.subscriptionStatus,
        },
        newValues: {
          subscriptionPlan,
          subscriptionStatus,
        },
        metadata: {
          reason: 'Super admin subscription update',
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({
      message: 'Subscription updated successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
