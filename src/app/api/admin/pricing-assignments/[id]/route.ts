import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdminAuth,
  createAdminResponse,
  createAdminErrorResponse,
} from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;

    const assignment = await prisma.distributorPricingAssignment.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { id: true, name: true, subdomain: true },
        },
        companyTier: {
          include: {
            company: true,
          },
        },
        productTier: {
          include: {
            product: {
              include: {
                company: true,
              },
            },
          },
        },
        assignedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        createAdminErrorResponse('Pricing assignment not found'),
        { status: 404 }
      );
    }

    await AuditLogger.logPricingAssignmentAction(
      session.user.id,
      'VIEW',
      assignment.id,
      undefined,
      { action: 'view_details' },
      request
    );

    return NextResponse.json(createAdminResponse(assignment));
  } catch (error) {
    console.error('Get pricing assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to fetch pricing assignment'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;
    const data = await request.json();

    const { companyTierId, productTierId, customPrice, isActive } = data;

    // Get existing assignment for audit log
    const existingAssignment =
      await prisma.distributorPricingAssignment.findUnique({
        where: { id },
        include: {
          tenant: true,
          companyTier: { include: { company: true } },
          productTier: { include: { product: { include: { company: true } } } },
        },
      });

    if (!existingAssignment) {
      return NextResponse.json(
        createAdminErrorResponse('Pricing assignment not found'),
        { status: 404 }
      );
    }

    // Verify company tier exists if provided and changed
    if (companyTierId && companyTierId !== existingAssignment.companyTierId) {
      const companyTier = await prisma.companyPricingTier.findUnique({
        where: { id: companyTierId },
      });

      if (!companyTier) {
        return NextResponse.json(
          createAdminErrorResponse('Company pricing tier not found'),
          { status: 404 }
        );
      }
    }

    // Verify product tier exists if provided and changed
    if (productTierId && productTierId !== existingAssignment.productTierId) {
      const productTier = await prisma.productPricingTier.findUnique({
        where: { id: productTierId },
      });

      if (!productTier) {
        return NextResponse.json(
          createAdminErrorResponse('Product pricing tier not found'),
          { status: 404 }
        );
      }
    }

    const updatedData: any = {};
    if (companyTierId !== undefined) updatedData.companyTierId = companyTierId;
    if (productTierId !== undefined) updatedData.productTierId = productTierId;
    if (customPrice !== undefined) updatedData.customPrice = customPrice;
    if (isActive !== undefined) updatedData.isActive = isActive;

    const updatedAssignment = await prisma.distributorPricingAssignment.update({
      where: { id },
      data: updatedData,
      include: {
        tenant: {
          select: { id: true, name: true, subdomain: true },
        },
        companyTier: {
          include: {
            company: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        productTier: {
          include: {
            product: {
              select: { id: true, name: true, size: true },
              include: {
                company: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        assignedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await AuditLogger.logPricingAssignmentAction(
      session.user.id,
      'UPDATE',
      id,
      existingAssignment,
      updatedAssignment,
      request
    );

    return NextResponse.json(
      createAdminResponse(
        updatedAssignment,
        'Pricing assignment updated successfully'
      )
    );
  } catch (error) {
    console.error('Update pricing assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to update pricing assignment'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;

    // Get existing assignment for audit log
    const existingAssignment =
      await prisma.distributorPricingAssignment.findUnique({
        where: { id },
        include: {
          tenant: true,
          companyTier: { include: { company: true } },
          productTier: { include: { product: { include: { company: true } } } },
        },
      });

    if (!existingAssignment) {
      return NextResponse.json(
        createAdminErrorResponse('Pricing assignment not found'),
        { status: 404 }
      );
    }

    // Soft delete by deactivating
    const deactivatedAssignment =
      await prisma.distributorPricingAssignment.update({
        where: { id },
        data: { isActive: false },
      });

    await AuditLogger.logPricingAssignmentAction(
      session.user.id,
      'UNASSIGN',
      id,
      existingAssignment,
      deactivatedAssignment,
      request
    );

    return NextResponse.json(
      createAdminResponse(
        { deactivated: true },
        'Pricing assignment deactivated successfully'
      )
    );
  } catch (error) {
    console.error('Delete pricing assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to delete pricing assignment'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}
