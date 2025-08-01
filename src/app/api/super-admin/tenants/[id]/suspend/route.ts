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

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Check if tenant exists and is approved
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved tenants can be suspended' },
        { status: 400 }
      );
    }

    // Suspend the tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        approvalStatus: 'SUSPENDED',
        isActive: false,
        rejectionReason: reason || 'Suspended by super admin',
      },
    });

    // Log the action in audit log
    await prisma.auditLog.create({
      data: {
        userId: superAdminId,
        action: 'DEACTIVATE',
        entityType: 'Tenant',
        entityId: tenantId,
        oldValues: {
          approvalStatus: tenant.approvalStatus,
          isActive: tenant.isActive,
        },
        newValues: {
          approvalStatus: 'SUSPENDED',
          isActive: false,
        },
        metadata: {
          reason: reason || 'Super admin suspension',
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({
      message: 'Tenant suspended successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        approvalStatus: updatedTenant.approvalStatus,
        isActive: updatedTenant.isActive,
        rejectionReason: updatedTenant.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Tenant suspension error:', error);
    return NextResponse.json(
      { error: 'Failed to suspend tenant' },
      { status: 500 }
    );
  }
}
