import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, createAdminResponse, createAdminErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminAuth(request);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const territory = searchParams.get('territory');
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    if (territory) {
      whereClause.territory = territory;
    }

    const [companies, totalCount, territories] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        include: {
          products: {
            select: { id: true, name: true, isActive: true }
          },
          distributorAssignments: {
            where: { isActive: true },
            include: {
              tenant: {
                select: { id: true, name: true }
              }
            }
          },
          companyPricingTiers: {
            where: { isActive: true },
            select: { id: true, tierName: true, discountPercent: true }
          },
          _count: {
            select: {
              products: true,
              purchases: true,
              shipments: true
            }
          }
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset
      }),
      
      prisma.company.count({ where: whereClause }),
      
      prisma.company.findMany({
        select: { territory: true },
        where: { territory: { not: null } },
        distinct: ['territory']
      })
    ]);

    await AuditLogger.logCompanyAction(
      session.user.id,
      'VIEW',
      undefined,
      undefined,
      { searchParams: Object.fromEntries(searchParams) },
      request
    );

    return NextResponse.json(createAdminResponse({
      companies,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1
      },
      territories: territories.map(t => t.territory).filter(Boolean)
    }));
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to fetch companies'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminAuth(request);
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
      isActive = true
    } = data;

    if (!name) {
      return NextResponse.json(
        createAdminErrorResponse('Company name is required'),
        { status: 400 }
      );
    }

    // Check if company with same name already exists
    const existingCompany = await prisma.company.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existingCompany) {
      return NextResponse.json(
        createAdminErrorResponse('Company with this name already exists'),
        { status: 409 }
      );
    }

    // Check if code is provided and unique
    if (code) {
      const existingCode = await prisma.company.findFirst({
        where: { 
          code: { equals: code, mode: 'insensitive' }
        }
      });

      if (existingCode) {
        return NextResponse.json(
          createAdminErrorResponse('Company code already exists'),
          { status: 409 }
        );
      }
    }

    // Create with system tenant (companies are global)
    const systemTenant = await prisma.tenant.findFirst({
      where: { subdomain: 'system' }
    });

    if (!systemTenant) {
      return NextResponse.json(
        createAdminErrorResponse('System tenant not found'),
        { status: 500 }
      );
    }

    const company = await prisma.company.create({
      data: {
        tenantId: systemTenant.id,
        name,
        code,
        address,
        phone,
        email,
        contactInfo: contactInfo || null,
        businessTerms: businessTerms || null,
        supplierInfo: supplierInfo || null,
        territory,
        analytics: analytics || null,
        isActive
      },
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
      'CREATE',
      company.id,
      undefined,
      company,
      request
    );

    return NextResponse.json(
      createAdminResponse(company, 'Company created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to create company'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
    );
  }
}