import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const commissionStructureSchema = z.object({
  productId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030),
  commission: z.number().min(0),
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

    let where: any = {
      tenantId: session.user.tenantId,
      isActive: true,
    };

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (productId) where.productId = productId;

    const commissionStructures = await prisma.commissionStructure.findMany({
      where,
      include: {
        product: {
          include: {
            company: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { product: { name: 'asc' } },
      ],
    });

    return NextResponse.json(commissionStructures);
  } catch (error) {
    console.error('Commission structures GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission structures' },
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
    const validatedData = commissionStructureSchema.parse(body);

    // Check if commission structure already exists for this product/month/year
    const existing = await prisma.commissionStructure.findUnique({
      where: {
        tenantId_productId_month_year: {
          tenantId: session.user.tenantId,
          productId: validatedData.productId,
          month: validatedData.month,
          year: validatedData.year,
        },
      },
    });

    if (existing) {
      // Update existing record
      const updated = await prisma.commissionStructure.update({
        where: { id: existing.id },
        data: {
          commission: validatedData.commission,
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
      const commissionStructure = await prisma.commissionStructure.create({
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

      return NextResponse.json(commissionStructure, { status: 201 });
    }
  } catch (error) {
    console.error('Commission structure creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create commission structure' },
      { status: 500 }
    );
  }
}
