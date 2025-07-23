import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { id } = await params;
    const data = await request.json();
    const { size, description, isActive } = data;

    if (!size) {
      return NextResponse.json(
        { error: 'Missing required field: size' },
        { status: 400 }
      );
    }

    // Check if cylinder size exists and belongs to tenant
    const existingSize = await prisma.cylinderSize.findFirst({
      where: { id, tenantId },
    });

    if (!existingSize) {
      return NextResponse.json(
        { error: 'Cylinder size not found' },
        { status: 404 }
      );
    }

    // Check if another size with same name exists (excluding current)
    const duplicateSize = await prisma.cylinderSize.findFirst({
      where: {
        size: { equals: size, mode: 'insensitive' },
        tenantId,
        id: { not: id },
      },
    });

    if (duplicateSize) {
      return NextResponse.json(
        { error: 'Cylinder size already exists' },
        { status: 409 }
      );
    }

    const cylinderSize = await prisma.cylinderSize.update({
      where: { id },
      data: {
        size: size.trim(),
        description: description?.trim() || null,
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      cylinderSize,
      message: 'Cylinder size updated successfully',
    });
  } catch (error) {
    console.error('Update cylinder size error:', error);
    return NextResponse.json(
      { error: 'Failed to update cylinder size' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { id } = await params;

    // Check if cylinder size exists and belongs to tenant
    const existingSize = await prisma.cylinderSize.findFirst({
      where: { id, tenantId },
    });

    if (!existingSize) {
      return NextResponse.json(
        { error: 'Cylinder size not found' },
        { status: 404 }
      );
    }

    // Check if any products are using this cylinder size
    const productsUsingSize = await prisma.product.findFirst({
      where: { cylinderSizeId: id, tenantId },
    });

    if (productsUsingSize) {
      return NextResponse.json(
        { error: 'Cannot delete cylinder size that is being used by products' },
        { status: 400 }
      );
    }

    await prisma.cylinderSize.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Cylinder size deleted successfully',
    });
  } catch (error) {
    console.error('Delete cylinder size error:', error);
    return NextResponse.json(
      { error: 'Failed to delete cylinder size' },
      { status: 500 }
    );
  }
}
