import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    const superAdminId = token.sub as string;

    // Check if tenant exists and is suspended
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.approvalStatus !== 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Only suspended tenants can be activated' },
        { status: 400 }
      );
    }

    // Activate the tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        approvalStatus: 'APPROVED',
        isActive: true,
        rejectionReason: null,
      },
    });

    // Log the action in audit log
    await prisma.auditLog.create({
      data: {
        userId: superAdminId,
        action: 'ACTIVATE',
        entityType: 'Tenant',
        entityId: tenantId,
        oldValues: {
          approvalStatus: tenant.approvalStatus,
          isActive: tenant.isActive,
        },
        newValues: {
          approvalStatus: 'APPROVED',
          isActive: true,
        },
        metadata: {
          reason: 'Super admin reactivation',
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({
      message: 'Tenant activated successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        approvalStatus: updatedTenant.approvalStatus,
        isActive: updatedTenant.isActive,
      },
    });
  } catch (error) {
    console.error('Tenant activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate tenant' },
      { status: 500 }
    );
  }
}
