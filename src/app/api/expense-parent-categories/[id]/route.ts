import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if parent category exists and belongs to the tenant
    const parentCategory = await prisma.expenseParentCategory.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        categories: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!parentCategory) {
      return NextResponse.json(
        { error: 'Parent category not found' },
        { status: 404 }
      );
    }

    // Check if parent category has active sub-categories
    if (parentCategory.categories.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete parent category with active sub-categories. Please delete all sub-categories first.',
        },
        { status: 400 }
      );
    }

    // Soft delete the parent category
    await prisma.expenseParentCategory.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Parent category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting parent category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if parent category exists and belongs to the tenant
    const existingParentCategory = await prisma.expenseParentCategory.findFirst(
      {
        where: {
          id,
          tenantId: session.user.tenantId,
        },
      }
    );

    if (!existingParentCategory) {
      return NextResponse.json(
        { error: 'Parent category not found' },
        { status: 404 }
      );
    }

    // Update the parent category
    const updatedParentCategory = await prisma.expenseParentCategory.update({
      where: { id },
      data: {
        name,
        description,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedParentCategory);
  } catch (error) {
    console.error('Error updating parent category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
