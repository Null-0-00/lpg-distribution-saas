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

    const type = searchParams.get('type') || 'both'; // 'company', 'product', or 'both'
    const companyId = searchParams.get('companyId');
    const productId = searchParams.get('productId');
    const isActive = searchParams.get('isActive');

    const responses: any = {};

    if (type === 'company' || type === 'both') {
      const companyWhere: any = {};
      if (companyId) companyWhere.companyId = companyId;
      if (isActive !== null && isActive !== undefined) {
        companyWhere.isActive = isActive === 'true';
      }

      responses.companyTiers = await prisma.companyPricingTier.findMany({
        where: companyWhere,
        include: {
          company: {
            select: { id: true, name: true, code: true },
          },
          distributorTiers: {
            where: { isActive: true },
            include: {
              tenant: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: [{ company: { name: 'asc' } }, { tierName: 'asc' }],
      });
    }

    if (type === 'product' || type === 'both') {
      const productWhere: any = {};
      if (productId) productWhere.productId = productId;
      if (companyId) {
        productWhere.product = { companyId };
      }
      if (isActive !== null && isActive !== undefined) {
        productWhere.isActive = isActive === 'true';
      }

      responses.productTiers = await prisma.productPricingTier.findMany({
        where: productWhere,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              size: true,
              company: {
                select: { id: true, name: true, code: true },
              },
            },
          },
          distributorTiers: {
            where: { isActive: true },
            include: {
              tenant: {
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
      });
    }

    await AuditLogger.log({
      userId: session.user.id,
      action: 'VIEW',
      entityType: 'PricingTier',
      metadata: {
        type,
        searchParams: Object.fromEntries(searchParams),
      },
      request,
    });

    return NextResponse.json(createAdminResponse(responses));
  } catch (error) {
    console.error('Get pricing tiers error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch pricing tiers'
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

    const { type, ...tierData } = data;

    if (!type || !['company', 'product'].includes(type)) {
      return NextResponse.json(
        createAdminErrorResponse('Type must be either "company" or "product"'),
        { status: 400 }
      );
    }

    let createdTier;

    if (type === 'company') {
      const {
        companyId,
        tierName,
        description,
        discountPercent = 0,
        minimumOrder,
        paymentTerms,
        creditLimit,
        isActive = true,
      } = tierData;

      if (!companyId || !tierName) {
        return NextResponse.json(
          createAdminErrorResponse('Company ID and tier name are required'),
          { status: 400 }
        );
      }

      // Check if tier name already exists for this company
      const existingTier = await prisma.companyPricingTier.findFirst({
        where: {
          companyId,
          tierName: { equals: tierName, mode: 'insensitive' },
        },
      });

      if (existingTier) {
        return NextResponse.json(
          createAdminErrorResponse('Tier name already exists for this company'),
          { status: 409 }
        );
      }

      createdTier = await prisma.companyPricingTier.create({
        data: {
          companyId,
          tierName,
          description,
          discountPercent,
          minimumOrder,
          paymentTerms,
          creditLimit,
          isActive,
        },
        include: {
          company: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      await AuditLogger.logPricingTierAction(
        session.user.id,
        'CREATE',
        'Company',
        createdTier.id,
        undefined,
        createdTier,
        request
      );
    } else {
      const {
        productId,
        tierName,
        price,
        costPrice,
        marginPercent,
        isActive = true,
        effectiveDate,
        expiryDate,
      } = tierData;

      if (!productId || !tierName || price === undefined) {
        return NextResponse.json(
          createAdminErrorResponse(
            'Product ID, tier name, and price are required'
          ),
          { status: 400 }
        );
      }

      // Check if tier name already exists for this product
      const existingTier = await prisma.productPricingTier.findFirst({
        where: {
          productId,
          tierName: { equals: tierName, mode: 'insensitive' },
        },
      });

      if (existingTier) {
        return NextResponse.json(
          createAdminErrorResponse('Tier name already exists for this product'),
          { status: 409 }
        );
      }

      createdTier = await prisma.productPricingTier.create({
        data: {
          productId,
          tierName,
          price,
          costPrice,
          marginPercent,
          isActive,
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              size: true,
              company: {
                select: { id: true, name: true, code: true },
              },
            },
          },
        },
      });

      await AuditLogger.logPricingTierAction(
        session.user.id,
        'CREATE',
        'Product',
        createdTier.id,
        undefined,
        createdTier,
        request
      );
    }

    return NextResponse.json(
      createAdminResponse(
        createdTier,
        `${type} pricing tier created successfully`
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create pricing tier error:', error);
    return NextResponse.json(
      createAdminErrorResponse(
        error instanceof Error ? error.message : 'Failed to create pricing tier'
      ),
      {
        status:
          error instanceof Error && error.message.includes('Admin') ? 403 : 500,
      }
    );
  }
}
