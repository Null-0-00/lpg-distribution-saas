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

    // Approve the tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        approvalStatus: 'APPROVED',
        isActive: true,
        approvedBy: superAdminId,
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    // Log the action in audit log
    await prisma.auditLog.create({
      data: {
        userId: superAdminId,
        action: 'APPROVE',
        entityType: 'Tenant',
        entityId: tenantId,
        newValues: {
          approvalStatus: 'APPROVED',
          approvedBy: superAdminId,
          approvedAt: new Date(),
        },
        metadata: {
          reason: 'Super admin approval',
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({
      message: 'Tenant approved successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        approvalStatus: updatedTenant.approvalStatus,
        isActive: updatedTenant.isActive,
        approvedAt: updatedTenant.approvedAt,
      },
    });
  } catch (error) {
    console.error('Tenant approval error:', error);
    return NextResponse.json(
      { error: 'Failed to approve tenant' },
      { status: 500 }
    );
  }
}
