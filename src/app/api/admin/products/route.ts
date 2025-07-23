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
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId');
    const isActive = searchParams.get('isActive');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { size: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (companyId) {
      whereClause.companyId = companyId;
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (minPrice || maxPrice) {
      whereClause.currentPrice = {};
      if (minPrice) whereClause.currentPrice.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.currentPrice.lte = parseFloat(maxPrice);
    }

    const [products, totalCount, companies, priceRange] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          company: {
            select: { id: true, name: true, code: true, isActive: true },
          },
          productPricingTiers: {
            where: { isActive: true },
            select: {
              id: true,
              tierName: true,
              price: true,
              marginPercent: true,
            },
          },
          distributorAssignments: {
            where: { isActive: true },
            include: {
              tenant: {
                select: { id: true, name: true },
              },
            },
          },
          _count: {
            select: {
              sales: true,
              purchases: true,
              inventoryMovements: true,
            },
          },
        },
        orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
        take: limit,
        skip: offset,
      }),

      prisma.product.count({ where: whereClause }),

      prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
      }),

      prisma.product.aggregate({
        _min: { currentPrice: true },
        _max: { currentPrice: true },
        _avg: { currentPrice: true },
      }),
    ]);

    await AuditLogger.logProductAction(
      session.user.id,
      'VIEW',
      undefined,
      undefined,
      { searchParams: Object.fromEntries(searchParams) },
      request
    );

    return NextResponse.json(
      createAdminResponse({
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1,
        },
        companies,
        priceRange: {
          min: priceRange._min.currentPrice || 0,
          max: priceRange._max.currentPrice || 0,
          average: priceRange._avg.currentPrice || 0,
        },
      })
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch products'
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
      companyId,
      name,
      size,
      fullCylinderWeight,
      emptyCylinderWeight,
      currentPrice,
      costPrice,
      marketPrice,
      lowStockThreshold = 10,
      specifications,
      performanceMetrics,
      analytics,
      isActive = true,
    } = data;

    if (!companyId || !name || !size) {
      return NextResponse.json(
        createAdminErrorResponse(
          'Company, product name, and size are required'
        ),
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(createAdminErrorResponse('Company not found'), {
        status: 404,
      });
    }

    // Check if product with same name already exists for this company
    const existingProduct = await prisma.product.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        createAdminErrorResponse(
          'Product with this name already exists for this company'
        ),
        { status: 409 }
      );
    }

    // Use company's tenant ID
    const product = await prisma.product.create({
      data: {
        tenantId: company.tenantId,
        companyId,
        name,
        size,
        fullCylinderWeight: fullCylinderWeight || null,
        emptyCylinderWeight: emptyCylinderWeight || null,
        currentPrice: currentPrice || 0,
        costPrice: costPrice || null,
        marketPrice: marketPrice || null,
        lowStockThreshold,
        specifications: specifications || null,
        performanceMetrics: performanceMetrics || null,
        analytics: analytics || null,
        isActive,
      },
      include: {
        company: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            sales: true,
            distributorAssignments: true,
          },
        },
      },
    });

    await AuditLogger.logProductAction(
      session.user.id,
      'CREATE',
      product.id,
      undefined,
      product,
      request
    );

    return NextResponse.json(
      createAdminResponse(product, 'Product created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to create product'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}
