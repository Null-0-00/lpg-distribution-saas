import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const fixedCostStructureSchema = z.object({
  productId: z.string().nullable(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030),
  costPerUnit: z.number().min(0),
  costType: z.enum(['MANUAL', 'CALCULATED']),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const productId = searchParams.get('productId');
    const includeGlobal = searchParams.get('includeGlobal') === 'true';

    let where: any = {
      tenantId: session.user.tenantId,
      isActive: true,
    };

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (productId) where.productId = productId;
    if (!includeGlobal) where.productId = { not: null };

    const fixedCostStructures = await prisma.fixedCostStructure.findMany({
      where,
      include: {
        product: {
          include: {
            company: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { productId: 'asc' }],
    });

    return NextResponse.json(fixedCostStructures);
  } catch (error) {
    console.error('Fixed cost structures GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixed cost structures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = fixedCostStructureSchema.parse(body);

    // Check if fixed cost structure already exists for this product/month/year/type
    const existing = await prisma.fixedCostStructure.findUnique({
      where: {
        tenantId_productId_month_year_costType: {
          tenantId: session.user.tenantId,
          productId: validatedData.productId,
          month: validatedData.month,
          year: validatedData.year,
          costType: validatedData.costType,
        },
      },
    });

    if (existing) {
      // Update existing record
      const updated = await prisma.fixedCostStructure.update({
        where: { id: existing.id },
        data: {
          costPerUnit: validatedData.costPerUnit,
          description: validatedData.description || null,
        },
        include: {
          product: {
            include: {
              company: true,
            },
          },
        },
      });

      return NextResponse.json(updated);
    } else {
      // Create new record
      const fixedCostStructure = await prisma.fixedCostStructure.create({
        data: {
          ...validatedData,
          tenantId: session.user.tenantId,
          description: validatedData.description || null,
        },
        include: {
          product: {
            include: {
              company: true,
            },
          },
        },
      });

      return NextResponse.json(fixedCostStructure, { status: 201 });
    }
  } catch (error) {
    console.error('Fixed cost structure creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create fixed cost structure' },
      { status: 500 }
    );
  }
}
