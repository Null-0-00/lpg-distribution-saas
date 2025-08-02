import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { id: tenantId } = await params;
    const superAdminId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Check if tenant exists and is pending
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Tenant is not pending approval' },
        { status: 400 }
      );
    }

    // Reject the tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        approvalStatus: 'REJECTED',
        isActive: false,
        rejectedAt: new Date(),
        rejectionReason: reason || 'Rejected by super admin',
        approvedBy: null,
        approvedAt: null,
      },
    });

    // Log the action in audit log
    await prisma.auditLog.create({
      data: {
        userId: superAdminId,
        action: 'REJECT',
        entityType: 'Tenant',
        entityId: tenantId,
        newValues: {
          approvalStatus: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: reason || 'Rejected by super admin',
        },
        metadata: {
          reason: reason || 'Super admin rejection',
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({
      message: 'Tenant rejected successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        approvalStatus: updatedTenant.approvalStatus,
        isActive: updatedTenant.isActive,
        rejectedAt: updatedTenant.rejectedAt,
        rejectionReason: updatedTenant.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Tenant rejection error:', error);
    return NextResponse.json(
      { error: 'Failed to reject tenant' },
      { status: 500 }
    );
  }
}
