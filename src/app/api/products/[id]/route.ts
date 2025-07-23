import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';

export async function GET(
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

    const product = await prisma.product.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        cylinderSize: {
          select: {
            id: true,
            size: true,
            description: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { id } = await params;
    const data = await request.json();
    const {
      name, // Product name (e.g., LPG Cylinder, Cooking Gas)
      cylinderSizeId, // Reference to cylinder size
      size, // Backward compatibility - cylinder type/size (12L, 35L, 5kg, etc.)
      currentPrice,
      lowStockThreshold,
      isActive,
      companyId,
    } = data;

    if (!name || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, companyId' },
        { status: 400 }
      );
    }

    // Require either cylinderSizeId or size for backward compatibility
    if (!cylinderSizeId && !size) {
      return NextResponse.json(
        { error: 'Either cylinderSizeId or size is required' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify company belongs to tenant
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Verify cylinder size belongs to tenant if provided
    let cylinderSize = null;
    let actualSize = size;
    if (cylinderSizeId) {
      cylinderSize = await prisma.cylinderSize.findFirst({
        where: { id: cylinderSizeId, tenantId },
      });

      if (!cylinderSize) {
        return NextResponse.json(
          { error: 'Cylinder size not found' },
          { status: 404 }
        );
      }

      // Use cylinder size for the size field
      actualSize = cylinderSize.size;
    }

    // Check if another product with same name and cylinder size exists for this company (excluding current)
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(cylinderSizeId
          ? { cylinderSizeId }
          : { size: { equals: actualSize, mode: 'insensitive' } }),
        companyId,
        tenantId,
        id: { not: id },
      },
    });

    if (duplicateProduct) {
      return NextResponse.json(
        {
          error:
            'Product with this name and cylinder size already exists for this company',
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        companyId,
        name,
        size: actualSize,
        ...(cylinderSizeId && { cylinderSizeId }),
        currentPrice: currentPrice || 0,
        lowStockThreshold: lowStockThreshold || 0,
        isActive,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        cylinderSize: {
          select: {
            id: true,
            size: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
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

    // Check if product exists and belongs to tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has related data (sales, shipments, etc.)
    const [salesCount, dailySalesCount, shipmentsCount] = await Promise.all([
      prisma.sale.count({
        where: { productId: id },
      }),
      prisma.dailySales.count({
        where: { productId: id },
      }),
      prisma.shipment.count({
        where: { productId: id },
      }),
    ]);

    if (salesCount > 0 || dailySalesCount > 0 || shipmentsCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete product with existing sales or shipments. Deactivate instead.',
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
