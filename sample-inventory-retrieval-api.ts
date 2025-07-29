// Sample API endpoints showing how to retrieve onboarding data with all breakdowns

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/inventory/breakdown - Get complete inventory breakdown
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const size = searchParams.get('size');
    const product = searchParams.get('product');

    // 1. Get full cylinders by product (with company + size + name breakdown)
    const fullCylinderInventory = await prisma.inventoryRecord.findMany({
      where: {
        tenantId,
        ...(product && {
          product: {
            name: {
              contains: product,
              mode: 'insensitive',
            },
          },
        }),
        ...(company && {
          product: {
            company: {
              name: {
                contains: company,
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(size && {
          product: {
            cylinderSize: {
              size: {
                contains: size,
                mode: 'insensitive',
              },
            },
          },
        }),
      },
      include: {
        product: {
          include: {
            company: true,
            cylinderSize: true,
          },
        },
      },
      orderBy: [
        { product: { company: { name: 'asc' } } },
        { product: { cylinderSize: { size: 'asc' } } },
        { product: { name: 'asc' } },
      ],
    });

    // 2. Get empty cylinders by size
    const emptyCylinderInventory = await prisma.inventoryRecord.findMany({
      where: {
        tenantId,
        ...(size && {
          cylinderSize: {
            size: {
              contains: size,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        cylinderSize: true,
      },
      orderBy: {
        cylinderSize: { size: 'asc' },
      },
    });

    // 3. Get aggregated data by company
    const inventoryByCompany = await prisma.inventoryRecord.groupBy({
      by: ['tenantId'],
      where: {
        tenantId,
        ...(company && {
          product: {
            company: {
              name: {
                contains: company,
                mode: 'insensitive',
              },
            },
          },
        }),
      },
      _sum: {
        fullCylinders: true,
      },
    });

    // 4. Get aggregated data by size
    const inventoryBySize = await prisma.inventoryRecord.groupBy({
      by: ['tenantId'],
      where: {
        tenantId,
        ...(size && {
          product: {
            cylinderSize: {
              size: {
                contains: size,
                mode: 'insensitive',
              },
            },
          },
        }),
      },
      _sum: {
        fullCylinders: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        // Full cylinder breakdown by product
        fullCylinders: fullCylinderInventory.map((item: any) => ({
          productId: item.productId,
          productName: item.product.name,
          companyName: item.product.company.name,
          cylinderSize: item.product.cylinderSize.size,
          fullCylinders: item.fullCylinders,
          currentPrice: item.product.currentPrice,
          inventoryValue: item.fullCylinders * item.product.currentPrice,
        })),

        // Empty cylinder breakdown by size
        emptyCylinders: emptyCylinderInventory.map((item: any) => ({
          cylinderSizeId: item.cylinderSizeId,
          cylinderSize: item.cylinderSize.size,
          emptyCylinders: item.emptyCylinders,
          emptyCylindersInHand: item.emptyCylindersInHand,
          cylinderReceivables: item.cylinderReceivables,
        })),

        // Summary totals
        totals: {
          totalFullCylinders: fullCylinderInventory.reduce(
            (sum: number, item: any) => sum + item.fullCylinders,
            0
          ),
          totalEmptyCylinders: emptyCylinderInventory.reduce(
            (sum: number, item: any) => sum + item.emptyCylinders,
            0
          ),
          totalInventoryValue: fullCylinderInventory.reduce(
            (sum: number, item: any) =>
              sum + item.fullCylinders * item.product.currentPrice,
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error('Error retrieving inventory breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve inventory data' },
      { status: 500 }
    );
  }
}

// Additional specialized endpoints:

// GET /api/inventory/by-company?company=Aygaz
export async function getInventoryByCompany(
  companyName: string,
  tenantId: string
) {
  return await prisma.inventoryRecord.findMany({
    where: {
      tenantId,
      product: {
        company: {
          name: {
            contains: companyName,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      product: {
        include: {
          company: true,
          cylinderSize: true,
        },
      },
    },
  });
}

// GET /api/inventory/by-size?size=12kg
export async function getInventoryBySize(
  cylinderSize: string,
  tenantId: string
) {
  const fullCylinders = await prisma.inventoryRecord.findMany({
    where: {
      tenantId,
      product: {
        cylinderSize: {
          size: {
            contains: cylinderSize,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      product: {
        include: {
          company: true,
          cylinderSize: true,
        },
      },
    },
  });

  const emptyCylinders = await prisma.inventoryRecord.findFirst({
    where: {
      tenantId,
      cylinderSize: {
        size: {
          contains: cylinderSize,
          mode: 'insensitive',
        },
      },
    },
    include: {
      cylinderSize: true,
    },
  });

  return {
    fullCylinders,
    emptyCylinders,
  };
}

// GET /api/inventory/by-product?product=Aygaz%2012kg
export async function getInventoryByProduct(
  productName: string,
  tenantId: string
) {
  return await prisma.inventoryRecord.findFirst({
    where: {
      tenantId,
      product: {
        name: {
          contains: productName,
          mode: 'insensitive',
        },
      },
    },
    include: {
      product: {
        include: {
          company: true,
          cylinderSize: true,
        },
      },
    },
  });
}
