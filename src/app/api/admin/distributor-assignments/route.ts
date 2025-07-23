import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdminAuth,
  createAdminResponse,
  createAdminErrorResponse,
} from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminAuth(request);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const tenantId = searchParams.get('tenantId');
    const companyId = searchParams.get('companyId');
    const productId = searchParams.get('productId');
    const territory = searchParams.get('territory');
    const isActive = searchParams.get('isActive');
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (tenantId) whereClause.tenantId = tenantId;
    if (companyId) whereClause.companyId = companyId;
    if (productId) whereClause.productId = productId;
    if (territory)
      whereClause.territory = { contains: territory, mode: 'insensitive' };
    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const [assignments, totalCount, distributors, companies, territories] =
      await Promise.all([
        prisma.distributorAssignment.findMany({
          where: whereClause,
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
          orderBy: [{ tenant: { name: 'asc' } }, { createdAt: 'desc' }],
          take: limit,
          skip: offset,
        }),

        prisma.distributorAssignment.count({ where: whereClause }),

        prisma.tenant.findMany({
          where: { isActive: true },
          select: { id: true, name: true, subdomain: true },
          orderBy: { name: 'asc' },
        }),

        prisma.company.findMany({
          where: { isActive: true },
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        }),

        prisma.distributorAssignment.findMany({
          select: { territory: true },
          where: {
            territory: { not: null },
            isActive: true,
          },
          distinct: ['territory'],
        }),
      ]);

    await AuditLogger.logDistributorAssignmentAction(
      session.user.id,
      'VIEW',
      undefined,
      undefined,
      { searchParams: Object.fromEntries(searchParams) },
      request
    );

    return NextResponse.json(
      createAdminResponse({
        assignments,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1,
        },
        distributors,
        companies,
        territories: territories.map((t) => t.territory).filter(Boolean),
      })
    );
  } catch (error) {
    console.error('Get distributor assignments error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch assignments'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminAuth(request);
    const data = await request.json();

    const {
      tenantId,
      companyId,
      productId,
      territory,
      effectiveDate,
      expiryDate,
      notes,
      isActive = true,
    } = data;

    if (!tenantId) {
      return NextResponse.json(
        createAdminErrorResponse('Distributor (tenant) is required'),
        { status: 400 }
      );
    }

    // Verify distributor exists
    const distributor = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!distributor) {
      return NextResponse.json(
        createAdminErrorResponse('Distributor not found'),
        { status: 404 }
      );
    }

    // Verify company exists if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          createAdminErrorResponse('Company not found'),
          { status: 404 }
        );
      }
    }

    // Verify product exists if provided
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json(
          createAdminErrorResponse('Product not found'),
          { status: 404 }
        );
      }

      // If product is specified, company must also be specified and match
      if (!companyId) {
        return NextResponse.json(
          createAdminErrorResponse(
            'Company must be specified when assigning specific products'
          ),
          { status: 400 }
        );
      }

      if (product.companyId !== companyId) {
        return NextResponse.json(
          createAdminErrorResponse(
            'Product does not belong to the specified company'
          ),
          { status: 400 }
        );
      }
    }

    // Check for conflicting assignments
    const conflictingAssignment = await prisma.distributorAssignment.findFirst({
      where: {
        tenantId,
        companyId: companyId || null,
        productId: productId || null,
        isActive: true,
        OR: [{ expiryDate: null }, { expiryDate: { gte: new Date() } }],
      },
    });

    if (conflictingAssignment) {
      return NextResponse.json(
        createAdminErrorResponse(
          'A similar active assignment already exists for this distributor'
        ),
        { status: 409 }
      );
    }

    const assignment = await prisma.distributorAssignment.create({
      data: {
        tenantId,
        companyId: companyId || null,
        productId: productId || null,
        territory,
        assignedBy: session.user.id,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes,
        isActive,
      },
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
      'ASSIGN',
      assignment.id,
      undefined,
      assignment,
      request
    );

    return NextResponse.json(
      createAdminResponse(
        assignment,
        'Distributor assignment created successfully'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create distributor assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to create assignment'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}
