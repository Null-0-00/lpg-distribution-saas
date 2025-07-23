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
    const companyTierId = searchParams.get('companyTierId');
    const productTierId = searchParams.get('productTierId');
    const isActive = searchParams.get('isActive');
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (tenantId) whereClause.tenantId = tenantId;
    if (companyTierId) whereClause.companyTierId = companyTierId;
    if (productTierId) whereClause.productTierId = productTierId;
    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const [assignments, totalCount, distributors, companyTiers, productTiers] =
      await Promise.all([
        prisma.distributorPricingAssignment.findMany({
          where: whereClause,
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
          orderBy: [{ tenant: { name: 'asc' } }, { createdAt: 'desc' }],
          take: limit,
          skip: offset,
        }),

        prisma.distributorPricingAssignment.count({ where: whereClause }),

        prisma.tenant.findMany({
          where: { isActive: true },
          select: { id: true, name: true, subdomain: true },
          orderBy: { name: 'asc' },
        }),

        prisma.companyPricingTier.findMany({
          where: { isActive: true },
          include: {
            company: {
              select: { id: true, name: true, code: true },
            },
          },
          orderBy: [{ company: { name: 'asc' } }, { tierName: 'asc' }],
        }),

        prisma.productPricingTier.findMany({
          where: { isActive: true },
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
          orderBy: [
            { product: { company: { name: 'asc' } } },
            { product: { name: 'asc' } },
            { tierName: 'asc' },
          ],
        }),
      ]);

    await AuditLogger.logPricingAssignmentAction(
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
        companyTiers,
        productTiers,
      })
    );
  } catch (error) {
    console.error('Get pricing assignments error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to fetch pricing assignments'
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
      companyTierId,
      productTierId,
      customPrice,
      isActive = true,
    } = data;

    if (!tenantId) {
      return NextResponse.json(
        createAdminErrorResponse('Distributor (tenant) is required'),
        { status: 400 }
      );
    }

    if (!companyTierId && !productTierId) {
      return NextResponse.json(
        createAdminErrorResponse(
          'Either company tier or product tier must be specified'
        ),
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

    // Verify company tier exists if provided
    if (companyTierId) {
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

    // Verify product tier exists if provided
    if (productTierId) {
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

    // Check for conflicting assignments
    const conflictingAssignment =
      await prisma.distributorPricingAssignment.findFirst({
        where: {
          tenantId,
          companyTierId: companyTierId || null,
          productTierId: productTierId || null,
          isActive: true,
        },
      });

    if (conflictingAssignment) {
      return NextResponse.json(
        createAdminErrorResponse(
          'A similar active pricing assignment already exists for this distributor'
        ),
        { status: 409 }
      );
    }

    const assignment = await prisma.distributorPricingAssignment.create({
      data: {
        tenantId,
        companyTierId: companyTierId || null,
        productTierId: productTierId || null,
        customPrice: customPrice || null,
        assignedBy: session.user.id,
        isActive,
      },
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
      'ASSIGN',
      assignment.id,
      undefined,
      assignment,
      request
    );

    return NextResponse.json(
      createAdminResponse(
        assignment,
        'Pricing assignment created successfully'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create pricing assignment error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to create pricing assignment'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}
