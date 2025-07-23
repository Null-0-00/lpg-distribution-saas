import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parentCategories = await prisma.expenseParentCategory.findMany({
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
      },
      include: {
        categories: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ parentCategories });
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const parentCategory = await prisma.expenseParentCategory.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        description,
      },
      include: {
        categories: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    return NextResponse.json(parentCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating parent category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
