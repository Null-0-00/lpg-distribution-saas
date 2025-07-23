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

    const assignment = await prisma.distributorAssignment.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            subscriptionStatus: true,
            isActive: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            territory: true,
            isActive: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            size: true,
            currentPrice: true,
            isActive: true,
          },
        },
        assignedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        createAdminErrorResponse('Assignment not found'),
        { status: 404 }
      );
    }

    await AuditLogger.logDistributorAssignmentAction(
      session.user.id,
      'VIEW',
      assignment.id,
      undefined,
      { action: 'view_details' },
      request
    );

    return NextResponse.json(createAdminResponse(assignment));
  } catch (error) {
    console.error('Get assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch assignment'
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

    const { territory, effectiveDate, expiryDate, notes, isActive } = data;

    // Get existing assignment for audit log
    const existingAssignment = await prisma.distributorAssignment.findUnique({
      where: { id },
      include: {
        tenant: { select: { name: true } },
        company: { select: { name: true } },
        product: { select: { name: true } },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        createAdminErrorResponse('Assignment not found'),
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (territory !== undefined) updatedData.territory = territory;
    if (effectiveDate !== undefined) {
      updatedData.effectiveDate = effectiveDate
        ? new Date(effectiveDate)
        : null;
    }
    if (expiryDate !== undefined) {
      updatedData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }
    if (notes !== undefined) updatedData.notes = notes;
    if (isActive !== undefined) updatedData.isActive = isActive;

    const updatedAssignment = await prisma.distributorAssignment.update({
      where: { id },
      data: updatedData,
      include: {
        tenant: {
          select: { id: true, name: true, subdomain: true },
        },
        company: {
          select: { id: true, name: true, code: true },
        },
        product: {
          select: { id: true, name: true, size: true },
        },
        assignedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await AuditLogger.logDistributorAssignmentAction(
      session.user.id,
      'UPDATE',
      id,
      existingAssignment,
      updatedAssignment,
      request
    );

    return NextResponse.json(
      createAdminResponse(updatedAssignment, 'Assignment updated successfully')
    );
  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to update assignment'
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
    const existingAssignment = await prisma.distributorAssignment.findUnique({
      where: { id },
      include: {
        tenant: { select: { name: true } },
        company: { select: { name: true } },
        product: { select: { name: true } },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        createAdminErrorResponse('Assignment not found'),
        { status: 404 }
      );
    }

    // Soft delete by deactivating
    const deactivatedAssignment = await prisma.distributorAssignment.update({
      where: { id },
      data: { isActive: false, expiryDate: new Date() },
    });

    await AuditLogger.logDistributorAssignmentAction(
      session.user.id,
      'UNASSIGN',
      id,
      existingAssignment,
      deactivatedAssignment,
      request
    );

    return NextResponse.json(
      createAdminResponse(
        { unassigned: true },
        'Assignment removed successfully'
      )
    );
  } catch (error) {
    console.error('Delete assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to remove assignment'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}
