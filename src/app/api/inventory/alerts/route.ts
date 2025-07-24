// Inventory Alerts API
// Monitor stock levels and generate automated alerts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InventoryCalculator } from '@/lib/business';

interface InventoryAlert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'MOVEMENT_ANOMALY';
  severity: 'critical' | 'warning' | 'info';
  product: {
    id: string;
    name: string;
    size: string;
    company: string;
  };
  message: string;
  currentStock: number;
  threshold?: number;
  recommendedAction: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    const severity = searchParams.get('severity') as
      | 'critical'
      | 'warning'
      | 'info'
      | null;
    // const includeResolved = searchParams.get('resolved') === 'true'; // Future feature

    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        company: {
          select: { name: true },
        },
      },
    });

    const inventoryCalculator = new InventoryCalculator(prisma);
    const alerts: InventoryAlert[] = [];

    // Check each product for alerts
    for (const product of products) {
      const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
        tenantId,
        product.id
      );

      const lowStockCheck = await inventoryCalculator.checkLowStockAlert(
        tenantId,
        product.id
      );

      const productInfo = {
        id: product.id,
        name: product.name,
        size: product.size,
        company: product.company.name,
      };

      // Out of stock alert (Critical)
      if (currentLevels.fullCylinders === 0) {
        alerts.push({
          id: `out-of-stock-${product.id}`,
          type: 'OUT_OF_STOCK',
          severity: 'critical',
          product: productInfo,
          message: `${product.company.name} ${product.name} (${product.size}L) is completely out of stock`,
          currentStock: currentLevels.fullCylinders,
          threshold: product.lowStockThreshold,
          recommendedAction:
            'Place urgent purchase order or transfer stock from other locations',
          createdAt: new Date(),
        });
      }
      // Low stock alert (Warning)
      else if (lowStockCheck.isLowStock) {
        alerts.push({
          id: `low-stock-${product.id}`,
          type: 'LOW_STOCK',
          severity: 'warning',
          product: productInfo,
          message: `${product.company.name} ${product.name} (${product.size}L) is running low on stock`,
          currentStock: currentLevels.fullCylinders,
          threshold: product.lowStockThreshold,
          recommendedAction: 'Consider placing a purchase order soon',
          createdAt: new Date(),
        });
      }

      // Check for movement anomalies in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentMovements = await prisma.inventoryMovement.findMany({
        where: {
          tenantId,
          productId: product.id,
          date: {
            gte: sevenDaysAgo,
          },
        },
      });

      // Look for unusual adjustment movements
      const adjustmentMovements = recentMovements.filter(
        (m) =>
          m.type === 'ADJUSTMENT_POSITIVE' || m.type === 'ADJUSTMENT_NEGATIVE'
      );

      if (adjustmentMovements.length > 3) {
        alerts.push({
          id: `movement-anomaly-${product.id}`,
          type: 'MOVEMENT_ANOMALY',
          severity: 'info',
          product: productInfo,
          message: `${product.company.name} ${product.name} (${product.size}L) has ${adjustmentMovements.length} inventory adjustments in the last 7 days`,
          currentStock: currentLevels.fullCylinders,
          recommendedAction:
            'Review inventory processes and investigate potential discrepancies',
          createdAt: new Date(),
        });
      }

      // Check for overstock (more than 5x threshold)
      const overstockThreshold = product.lowStockThreshold * 5;
      if (currentLevels.fullCylinders > overstockThreshold) {
        alerts.push({
          id: `overstock-${product.id}`,
          type: 'OVERSTOCK',
          severity: 'info',
          product: productInfo,
          message: `${product.company.name} ${product.name} (${product.size}L) may be overstocked`,
          currentStock: currentLevels.fullCylinders,
          threshold: overstockThreshold,
          recommendedAction:
            'Consider reducing future orders or transferring stock to other locations',
          createdAt: new Date(),
        });
      }
    }

    // Filter by severity if specified
    const filteredAlerts = severity
      ? alerts.filter((alert) => alert.severity === severity)
      : alerts;

    // Sort by severity (critical first, then warning, then info)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    filteredAlerts.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    // Calculate alert summary
    const summary = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter((a) => a.severity === 'critical').length,
      warning: filteredAlerts.filter((a) => a.severity === 'warning').length,
      info: filteredAlerts.filter((a) => a.severity === 'info').length,
      byType: {
        outOfStock: filteredAlerts.filter((a) => a.type === 'OUT_OF_STOCK')
          .length,
        lowStock: filteredAlerts.filter((a) => a.type === 'LOW_STOCK').length,
        overstock: filteredAlerts.filter((a) => a.type === 'OVERSTOCK').length,
        anomalies: filteredAlerts.filter((a) => a.type === 'MOVEMENT_ANOMALY')
          .length,
      },
    };

    return NextResponse.json({
      alerts: filteredAlerts,
      summary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Inventory alerts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get detailed alert information and recommendations
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const body = await request.json();
    const { productId, alertType } = body;

    if (!productId || !alertType) {
      return NextResponse.json(
        { error: 'Product ID and alert type required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
      include: {
        company: { select: { name: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const inventoryCalculator = new InventoryCalculator(prisma);
    const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
      tenantId,
      productId
    );

    // Get recent sales data for recommendations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.sale.findMany({
      where: {
        tenantId,
        productId,
        saleDate: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        quantity: true,
        saleDate: true,
      },
    });

    // Calculate average daily sales
    const totalSalesQuantity = recentSales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );
    const avgDailySales = recentSales.length > 0 ? totalSalesQuantity / 30 : 0;
    const daysOfStockRemaining =
      avgDailySales > 0
        ? Math.floor(currentLevels.fullCylinders / avgDailySales)
        : Infinity;

    // Generate specific recommendations based on alert type
    let recommendations: string[] = [];

    switch (alertType) {
      case 'OUT_OF_STOCK':
        recommendations = [
          'Contact suppliers immediately for emergency delivery',
          'Check if stock can be transferred from other locations',
          'Notify sales team to manage customer expectations',
          'Review supplier lead times to prevent future stockouts',
        ];
        break;

      case 'LOW_STOCK':
        recommendations = [
          `Place purchase order - estimated ${Math.ceil(avgDailySales * 7)} units needed for 1 week`,
          `Current stock will last approximately ${daysOfStockRemaining} days`,
          'Consider increasing safety stock levels',
          'Review sales forecast and adjust ordering schedule',
        ];
        break;

      case 'OVERSTOCK':
        recommendations = [
          'Delay next scheduled purchase order',
          'Consider promotional pricing to increase sales velocity',
          'Transfer excess stock to other locations if applicable',
          'Review demand forecasting accuracy',
        ];
        break;

      case 'MOVEMENT_ANOMALY':
        recommendations = [
          'Audit recent inventory movements and transactions',
          'Verify physical count matches system records',
          'Review driver performance and delivery processes',
          'Check for potential theft or damage issues',
        ];
        break;
    }

    return NextResponse.json({
      productInfo: {
        id: product.id,
        name: `${product.company.name} ${product.name} (${product.size}L)`,
        currentStock: currentLevels.fullCylinders,
        threshold: product.lowStockThreshold,
        price: product.currentPrice,
      },
      analytics: {
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        daysOfStockRemaining:
          daysOfStockRemaining === Infinity ? 'N/A' : daysOfStockRemaining,
        totalSalesLast30Days: totalSalesQuantity,
        stockValue: currentLevels.fullCylinders * product.currentPrice,
      },
      recommendations,
      actions: [
        {
          type: 'recalculate',
          label: 'Recalculate Inventory',
          description: 'Refresh inventory calculations for this product',
        },
        {
          type: 'adjustment',
          label: 'Record Adjustment',
          description: 'Add manual inventory adjustment if needed',
        },
        {
          type: 'purchase_order',
          label: 'Create Purchase Order',
          description: 'Generate purchase order based on recommendations',
        },
      ],
    });
  } catch (error) {
    console.error('Alert details fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
