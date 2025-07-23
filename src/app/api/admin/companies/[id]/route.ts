import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, createAdminResponse, createAdminErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;
    
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            _count: {
              select: {
                purchases: true,
                inventoryMovements: true
              }
            }
          }
        },
        distributorAssignments: {
          where: { isActive: true },
          include: {
            tenant: {
              select: { id: true, name: true, subdomain: true }
            },
            product: {
              select: { id: true, name: true }
            }
          }
        },
        companyPricingTiers: {
          where: { isActive: true }
        },
        _count: {
          select: {
            products: true,
            purchases: true,
            shipments: true,
            distributorAssignments: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        createAdminErrorResponse('Company not found'),
        { status: 404 }
      );
    }

    await AuditLogger.logCompanyAction(
      session.user.id,
      'VIEW',
      company.id,
      undefined,
      { action: 'view_details' },
      request
    );

    return NextResponse.json(createAdminResponse(company));
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to fetch company'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
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
    
    const {
      name,
      code,
      address,
      phone,
      email,
      contactInfo,
      businessTerms,
      supplierInfo,
      territory,
      analytics,
      isActive
    } = data;

    // Get existing company for audit log
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        createAdminErrorResponse('Company not found'),
        { status: 404 }
      );
    }

    // Check for name conflicts (excluding current company)
    if (name && name !== existingCompany.name) {
      const nameConflict = await prisma.company.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          createAdminErrorResponse('Company with this name already exists'),
          { status: 409 }
        );
      }
    }

    // Check for code conflicts (excluding current company)
    if (code && code !== existingCompany.code) {
      const codeConflict = await prisma.company.findFirst({
        where: { 
          code: { equals: code, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (codeConflict) {
        return NextResponse.json(
          createAdminErrorResponse('Company code already exists'),
          { status: 409 }
        );
      }
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (code !== undefined) updatedData.code = code;
    if (address !== undefined) updatedData.address = address;
    if (phone !== undefined) updatedData.phone = phone;
    if (email !== undefined) updatedData.email = email;
    if (contactInfo !== undefined) updatedData.contactInfo = contactInfo;
    if (businessTerms !== undefined) updatedData.businessTerms = businessTerms;
    if (supplierInfo !== undefined) updatedData.supplierInfo = supplierInfo;
    if (territory !== undefined) updatedData.territory = territory;
    if (analytics !== undefined) updatedData.analytics = analytics;
    if (isActive !== undefined) updatedData.isActive = isActive;

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: updatedData,
      include: {
        _count: {
          select: {
            products: true,
            distributorAssignments: true
          }
        }
      }
    });

    await AuditLogger.logCompanyAction(
      session.user.id,
      'UPDATE',
      id,
      existingCompany,
      updatedCompany,
      request
    );

    return NextResponse.json(
      createAdminResponse(updatedCompany, 'Company updated successfully')
    );
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to update company'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
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
    
    // Get existing company for audit log
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            purchases: true,
            distributorAssignments: true
          }
        }
      }
    });

    if (!existingCompany) {
      return NextResponse.json(
        createAdminErrorResponse('Company not found'),
        { status: 404 }
      );
    }

    // Check if company has active relationships
    const hasActiveData = existingCompany._count.products > 0 || 
                         existingCompany._count.purchases > 0 || 
                         existingCompany._count.distributorAssignments > 0;

    if (hasActiveData) {
      // Soft delete by deactivating instead of hard delete
      const deactivatedCompany = await prisma.company.update({
        where: { id },
        data: { isActive: false }
      });

      await AuditLogger.logCompanyAction(
        session.user.id,
        'DEACTIVATE',
        id,
        existingCompany,
        deactivatedCompany,
        request
      );

      return NextResponse.json(
        createAdminResponse(
          { deactivated: true },
          'Company deactivated due to existing relationships'
        )
      );
    } else {
      // Hard delete if no relationships exist
      await prisma.company.delete({
        where: { id }
      });

      await AuditLogger.logCompanyAction(
        session.user.id,
        'DELETE',
        id,
        existingCompany,
        null,
        request
      );

      return NextResponse.json(
        createAdminResponse(
          { deleted: true },
          'Company deleted successfully'
        )
      );
    }
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to delete company'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
    );
  }
}