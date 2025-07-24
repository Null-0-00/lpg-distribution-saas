// Products API Endpoints
// Handle product operations for sales

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InventoryCalculator } from '@/lib/business';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);
    const includeInventory = searchParams.get('inventory') === 'true';
    const showAll = searchParams.get('showAll') === 'true';

    const products = await prisma.product.findMany({
      where: {
        tenantId,
        ...(showAll ? {} : { isActive: true }),
      },
      select: {
        id: true,
        name: true,
        size: true,
        cylinderSizeId: true,
        fullCylinderWeight: true,
        emptyCylinderWeight: true,
        currentPrice: true,
        lowStockThreshold: true,
        isActive: true, // Force reload
        companyId: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
    });

    // Add inventory levels if requested
    let productsWithInventory = products;
    if (includeInventory) {
      const inventoryCalculator = new InventoryCalculator(prisma);

      const productsWithLevels = await Promise.all(
        products.map(async (product) => {
          const levels = await inventoryCalculator.getCurrentInventoryLevels(
            tenantId,
            product.id
          );

          return {
            ...product,
            inventory: {
              fullCylinders: levels.fullCylinders,
              emptyCylinders: levels.emptyCylinders,
              totalCylinders: levels.totalCylinders,
              isLowStock: levels.fullCylinders <= product.lowStockThreshold,
            },
          } as typeof product & {
            inventory: {
              fullCylinders: number;
              emptyCylinders: number;
              totalCylinders: number;
              isLowStock: boolean;
            };
          };
        })
      );

      productsWithInventory = productsWithLevels;
    }

    return NextResponse.json({
      products: productsWithInventory.map((product) => ({
        id: product.id,
        name: product.name,
        size: product.size,
        cylinderSizeId: product.cylinderSizeId,
        cylinderSize: product.cylinderSize,
        fullName: `${product.company.name} ${product.name} (${product.cylinderSize?.size || product.size})`,
        currentPrice: product.currentPrice,
        lowStockThreshold: product.lowStockThreshold,
        isActive: product.isActive,
        company: product.company,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        ...(includeInventory && {
          inventory: (
            product as typeof product & {
              inventory?: {
                fullCylinders: number;
                emptyCylinders: number;
                totalCylinders: number;
                isLowStock: boolean;
              };
            }
          ).inventory,
        }),
      })),
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const data = await request.json();
    const {
      name, // Product name (e.g., LPG Cylinder, Cooking Gas)
      cylinderSizeId, // Reference to cylinder size
      size, // Backward compatibility - cylinder type/size (12L, 35L, 5kg, etc.)
      currentPrice,
      lowStockThreshold,
      isActive = true,
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

    // Check if product with same name and cylinder size exists for this company
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(cylinderSizeId
          ? { cylinderSizeId }
          : { size: { equals: actualSize, mode: 'insensitive' } }),
        companyId,
        tenantId,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          error:
            'Product with this name and cylinder size already exists for this company',
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        tenantId,
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

    return NextResponse.json(
      {
        success: true,
        product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
