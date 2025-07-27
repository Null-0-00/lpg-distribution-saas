import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - Tenant required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const whereClause: any = {};

    // For companies, we need to get companies that this distributor works with
    // This could be via distributor assignments or generally available companies
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // Get companies available to this distributor
    let companies = await prisma.company.findMany({
      where: {
        ...whereClause,
        OR: [
          // Companies specifically assigned to this distributor
          {
            distributorAssignments: {
              some: {
                tenantId: session.user.tenantId,
                isActive: true,
              },
            },
          },
          // Or generally available companies (no specific assignments)
          {
            distributorAssignments: {
              none: {},
            },
            isActive: true,
          },
          // Or companies created by this tenant (distributor's own companies)
          {
            tenantId: session.user.tenantId,
            isActive: true,
          },
        ],
      },
      include: {
        products: includeProducts
          ? {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                size: true,
                currentPrice: true,
                lowStockThreshold: true,
                isActive: true,
              },
            }
          : false,
        distributorAssignments: {
          where: {
            tenantId: session.user.tenantId,
            isActive: true,
          },
          select: {
            id: true,
            territory: true,
            notes: true,
            effectiveDate: true,
            expiryDate: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // If no companies found through distributor assignments, get all companies for this tenant
    if (companies.length === 0) {
      console.log(
        'No companies found through distributor assignments, fetching all companies for tenant'
      );
      companies = await prisma.company.findMany({
        where: {
          ...whereClause,
          tenantId: session.user.tenantId,
          isActive: true,
        },
        include: {
          products: includeProducts
            ? {
                where: { isActive: true },
                select: {
                  id: true,
                  name: true,
                  size: true,
                  currentPrice: true,
                  lowStockThreshold: true,
                  isActive: true,
                },
              }
            : false,
          distributorAssignments: {
            where: {
              tenantId: session.user.tenantId,
              isActive: true,
            },
            select: {
              id: true,
              territory: true,
              notes: true,
              effectiveDate: true,
              expiryDate: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    // Format response to include distributor-specific info
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      code: company.code,
      address: company.address,
      phone: company.phone,
      email: company.email,
      contactInfo: company.contactInfo,
      territory: company.territory,
      isActive: company.isActive,
      products: company.products || [],
      distributorAssignment: company.distributorAssignments[0] || null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    console.log(
      `Companies API: Found ${formattedCompanies.length} companies for tenant ${session.user.tenantId}`
    );
    console.log(
      'Company names:',
      formattedCompanies.map((c) => c.name)
    );

    return NextResponse.json({
      success: true,
      companies: formattedCompanies,
      total: formattedCompanies.length,
    });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - Tenant required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, code, address, phone, email, isActive = true } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if company with same name already exists for this tenant
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        tenantId: session.user.tenantId,
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        code,
        address,
        phone,
        email,
        isActive,
      },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            size: true,
            currentPrice: true,
            lowStockThreshold: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        company,
        message: 'Company created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
