import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, createAdminResponse, createAdminErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        company: true,
        productPricingTiers: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        distributorAssignments: {
          where: { isActive: true },
          include: {
            tenant: {
              select: { id: true, name: true, subdomain: true }
            }
          }
        },
        sales: {
          select: { 
            id: true, 
            quantity: true, 
            totalValue: true, 
            saleDate: true,
            driver: { select: { name: true } }
          },
          orderBy: { saleDate: 'desc' },
          take: 10
        },
        purchases: {
          select: { 
            id: true, 
            quantity: true, 
            totalCost: true, 
            purchaseDate: true 
          },
          orderBy: { purchaseDate: 'desc' },
          take: 10
        },
        _count: {
          select: {
            sales: true,
            purchases: true,
            inventoryMovements: true,
            distributorAssignments: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        createAdminErrorResponse('Product not found'),
        { status: 404 }
      );
    }

    // Calculate performance metrics
    const performanceMetrics = await calculateProductPerformance(product.id);

    await AuditLogger.logProductAction(
      session.user.id,
      'VIEW',
      product.id,
      undefined,
      { action: 'view_details' },
      request
    );

    return NextResponse.json(createAdminResponse({
      ...product,
      performanceMetrics
    }));
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to fetch product'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;
    const data = await request.json();
    
    const {
      name,
      size,
      fullCylinderWeight,
      emptyCylinderWeight,
      currentPrice,
      costPrice,
      marketPrice,
      lowStockThreshold,
      specifications,
      performanceMetrics,
      analytics,
      isActive
    } = data;

    // Get existing product for audit log
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!existingProduct) {
      return NextResponse.json(
        createAdminErrorResponse('Product not found'),
        { status: 404 }
      );
    }

    // Check for name conflicts within the same company
    if (name && name !== existingProduct.name) {
      const nameConflict = await prisma.product.findFirst({
        where: { 
          companyId: existingProduct.companyId,
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          createAdminErrorResponse('Product with this name already exists for this company'),
          { status: 409 }
        );
      }
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (size !== undefined) updatedData.size = size;
    if (fullCylinderWeight !== undefined) updatedData.fullCylinderWeight = fullCylinderWeight;
    if (emptyCylinderWeight !== undefined) updatedData.emptyCylinderWeight = emptyCylinderWeight;
    if (currentPrice !== undefined) updatedData.currentPrice = currentPrice;
    if (costPrice !== undefined) updatedData.costPrice = costPrice;
    if (marketPrice !== undefined) updatedData.marketPrice = marketPrice;
    if (lowStockThreshold !== undefined) updatedData.lowStockThreshold = lowStockThreshold;
    if (specifications !== undefined) updatedData.specifications = specifications;
    if (performanceMetrics !== undefined) updatedData.performanceMetrics = performanceMetrics;
    if (analytics !== undefined) updatedData.analytics = analytics;
    if (isActive !== undefined) updatedData.isActive = isActive;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updatedData,
      include: {
        company: {
          select: { id: true, name: true, code: true }
        },
        _count: {
          select: {
            sales: true,
            distributorAssignments: true
          }
        }
      }
    });

    await AuditLogger.logProductAction(
      session.user.id,
      'UPDATE',
      id,
      existingProduct,
      updatedProduct,
      request
    );

    return NextResponse.json(
      createAdminResponse(updatedProduct, 'Product updated successfully')
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to update product'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(request);
    const { id } = await params;
    
    // Get existing product for audit log
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        company: true,
        _count: {
          select: {
            sales: true,
            purchases: true,
            inventoryMovements: true,
            distributorAssignments: true
          }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        createAdminErrorResponse('Product not found'),
        { status: 404 }
      );
    }

    // Check if product has active relationships
    const hasActiveData = existingProduct._count.sales > 0 || 
                         existingProduct._count.purchases > 0 || 
                         existingProduct._count.inventoryMovements > 0 ||
                         existingProduct._count.distributorAssignments > 0;

    if (hasActiveData) {
      // Soft delete by deactivating instead of hard delete
      const deactivatedProduct = await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      await AuditLogger.logProductAction(
        session.user.id,
        'DEACTIVATE',
        id,
        existingProduct,
        deactivatedProduct,
        request
      );

      return NextResponse.json(
        createAdminResponse(
          { deactivated: true },
          'Product deactivated due to existing relationships'
        )
      );
    } else {
      // Hard delete if no relationships exist
      await prisma.product.delete({
        where: { id }
      });

      await AuditLogger.logProductAction(
        session.user.id,
        'DELETE',
        id,
        existingProduct,
        null,
        request
      );

      return NextResponse.json(
        createAdminResponse(
          { deleted: true },
          'Product deleted successfully'
        )
      );
    }
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      createAdminErrorResponse(error instanceof Error ? error.message : 'Failed to delete product'),
      { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

async function calculateProductPerformance(productId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [salesData, purchaseData, inventoryData] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        productId,
        saleDate: { gte: thirtyDaysAgo }
      },
      _sum: { quantity: true, netValue: true },
      _count: true
    }),

    prisma.purchase.aggregate({
      where: {
        productId,
        purchaseDate: { gte: thirtyDaysAgo }
      },
      _sum: { quantity: true, totalCost: true },
      _count: true
    }),

    prisma.inventoryRecord.findMany({
      where: {
        productId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'desc' },
      take: 30
    })
  ]);

  const totalSales = salesData._sum.quantity || 0;
  const totalRevenue = salesData._sum.netValue || 0;
  const totalPurchases = purchaseData._sum.quantity || 0;
  const totalCost = purchaseData._sum.totalCost || 0;

  const averageInventory = inventoryData.length > 0 
    ? inventoryData.reduce((sum, record) => sum + record.fullCylinders, 0) / inventoryData.length
    : 0;

  const turnoverRate = averageInventory > 0 ? totalSales / averageInventory : 0;
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  return {
    last30Days: {
      sales: totalSales,
      revenue: totalRevenue,
      purchases: totalPurchases,
      cost: totalCost,
      profit: totalRevenue - totalCost,
      profitMargin,
      turnoverRate,
      averageInventory
    },
    trends: {
      salesTrend: calculateTrend(inventoryData.map(d => d.totalSales)),
      inventoryTrend: calculateTrend(inventoryData.map(d => d.fullCylinders))
    }
  };
}

function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const changePercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  
  if (changePercent > 5) return 'increasing';
  if (changePercent < -5) return 'decreasing';
  return 'stable';
}