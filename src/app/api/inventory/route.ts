// Inventory Management API Endpoints
// Real-time inventory monitoring, calculations, and reporting

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { InventoryCalculator } from '@/lib/business';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters directly
    const productId = searchParams.get('productId');
    const companyId = searchParams.get('companyId');
    const companyName = searchParams.get('companyName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeMovements = searchParams.get('includeMovements') === 'true';
    const includeLowStock = searchParams.get('includeLowStock') === 'true';

    // Get products with current inventory levels
    const whereClause: Record<string, unknown> = {
      tenantId,
      isActive: true,
    };
    
    if (productId) whereClause.id = productId;
    if (companyId) whereClause.companyId = companyId;
    if (companyName) {
      whereClause.company = {
        name: companyName
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { company: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const inventoryCalculator = new InventoryCalculator(prisma);
    
    // Calculate current inventory levels for each product
    const inventoryData = await Promise.all(
      products.map(async (product) => {
        const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
          tenantId, 
          product.id
        );

        const lowStockCheck = await inventoryCalculator.checkLowStockAlert(
          tenantId, 
          product.id
        );

        let movements: unknown[] = [];
        if (includeMovements) {
          const movementWhere: Record<string, unknown> = {
            tenantId,
            productId: product.id
          };

          if (startDate || endDate) {
            const dateFilter: Record<string, Date> = {};
            if (startDate) dateFilter.gte = new Date(startDate);
            if (endDate) dateFilter.lte = new Date(endDate);
            movementWhere.date = dateFilter;
          }

          movements = await prisma.inventoryMovement.findMany({
            where: movementWhere,
            include: {
              driver: {
                select: { name: true }
              }
            },
            orderBy: { date: 'desc' },
            take: 50 // Limit to last 50 movements
          });
        }

        return {
          product: {
            id: product.id,
            name: product.name,
            size: product.size,
            fullName: `${product.company.name} ${product.name} (${product.size}L)`,
            currentPrice: product.currentPrice,
            lowStockThreshold: product.lowStockThreshold,
            company: product.company
          },
          inventory: {
            fullCylinders: currentLevels.fullCylinders,
            emptyCylinders: currentLevels.emptyCylinders,
            totalCylinders: currentLevels.totalCylinders,
            isLowStock: lowStockCheck.isLowStock,
            stockValue: currentLevels.fullCylinders * product.currentPrice,
            stockHealth: lowStockCheck.isLowStock ? 'critical' : 
                        currentLevels.fullCylinders <= (product.lowStockThreshold * 1.5) ? 'warning' : 'good'
          },
          ...(includeMovements && { movements })
        };
      })
    );

    // Filter low stock items if requested
    const filteredData = includeLowStock 
      ? inventoryData.filter(item => item.inventory.isLowStock)
      : inventoryData;

    // Calculate summary statistics
    const summary = {
      totalProducts: filteredData.length,
      totalFullCylinders: filteredData.reduce((sum, item) => sum + item.inventory.fullCylinders, 0),
      totalEmptyCylinders: filteredData.reduce((sum, item) => sum + item.inventory.emptyCylinders, 0),
      totalStockValue: filteredData.reduce((sum, item) => sum + item.inventory.stockValue, 0),
      lowStockItems: inventoryData.filter(item => item.inventory.isLowStock).length,
      criticalStockItems: inventoryData.filter(item => item.inventory.fullCylinders === 0).length,
      stockHealth: {
        good: inventoryData.filter(item => item.inventory.stockHealth === 'good').length,
        warning: inventoryData.filter(item => item.inventory.stockHealth === 'warning').length,
        critical: inventoryData.filter(item => item.inventory.stockHealth === 'critical').length
      }
    };

    return NextResponse.json({
      inventory: filteredData,
      summary,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Recalculate inventory for specific product or all products
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role } = session.user;
    
    // Only admins can trigger recalculation
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { productId, date } = body;

    const inventoryCalculator = new InventoryCalculator(prisma);
    const targetDate = date ? new Date(date) : new Date();

    if (productId) {
      // Recalculate for specific product
      const product = await prisma.product.findFirst({
        where: { id: productId, tenantId }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Get previous day's levels
      const previousDate = new Date(targetDate);
      previousDate.setDate(previousDate.getDate() - 1);

      const previousLevels = await inventoryCalculator.getCurrentInventoryLevels(
        tenantId, 
        productId
      );

      const inventoryResult = await inventoryCalculator.calculateInventoryForDate({
        date: targetDate,
        tenantId,
        productId,
        previousFullCylinders: previousLevels.fullCylinders,
        previousEmptyCylinders: previousLevels.emptyCylinders
      });

      await inventoryCalculator.updateInventoryRecord(
        tenantId,
        targetDate,
        productId,
        inventoryResult
      );

      return NextResponse.json({
        success: true,
        message: `Inventory recalculated for ${product.name}`,
        result: inventoryResult
      });

    } else {
      // Recalculate for all products
      const products = await prisma.product.findMany({
        where: { tenantId, isActive: true }
      });

      const results = [];
      for (const product of products) {
        const previousLevels = await inventoryCalculator.getCurrentInventoryLevels(
          tenantId, 
          product.id
        );

        const inventoryResult = await inventoryCalculator.calculateInventoryForDate({
          date: targetDate,
          tenantId,
          productId: product.id,
          previousFullCylinders: previousLevels.fullCylinders,
          previousEmptyCylinders: previousLevels.emptyCylinders
        });

        await inventoryCalculator.updateInventoryRecord(
          tenantId,
          targetDate,
          product.id,
          inventoryResult
        );

        results.push({
          productId: product.id,
          productName: product.name,
          result: inventoryResult
        });
      }

      return NextResponse.json({
        success: true,
        message: `Inventory recalculated for ${products.length} products`,
        results
      });
    }

  } catch (error) {
    console.error('Inventory recalculation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}