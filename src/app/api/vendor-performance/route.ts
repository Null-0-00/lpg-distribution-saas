import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'last-12-months';

    const tenantId = session.user.tenantId;

    // Calculate date range
    let dateFrom: Date;
    let dateTo: Date = new Date();

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate + 'T23:59:59.999Z');
    } else {
      switch (period) {
        case 'last-3-months':
          dateFrom = new Date();
          dateFrom.setMonth(dateFrom.getMonth() - 3);
          break;
        case 'last-6-months':
          dateFrom = new Date();
          dateFrom.setMonth(dateFrom.getMonth() - 6);
          break;
        case 'last-12-months':
        default:
          dateFrom = new Date();
          dateFrom.setFullYear(dateFrom.getFullYear() - 1);
          break;
      }
    }

    // Get vendor performance data
    const vendorPerformance = await calculateVendorPerformance(
      tenantId,
      companyId,
      dateFrom,
      dateTo
    );

    return NextResponse.json({
      vendorPerformance,
      period: { from: dateFrom, to: dateTo },
    });
  } catch (error) {
    console.error('Get vendor performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor performance' },
      { status: 500 }
    );
  }
}

async function calculateVendorPerformance(
  tenantId: string,
  companyId: string | null,
  dateFrom: Date,
  dateTo: Date
) {
  const whereClause: any = {
    tenantId,
    createdAt: { gte: dateFrom, lte: dateTo },
  };

  if (companyId) {
    whereClause.companyId = companyId;
  }

  // Get all companies for this tenant
  const companies = await prisma.company.findMany({
    where: {
      tenantId,
      ...(companyId && { id: companyId }),
    },
  });

  const vendorMetrics = await Promise.all(
    companies.map(async (company) => {
      // Purchase Orders
      const purchaseOrders = await prisma.purchaseOrder.findMany({
        where: {
          tenantId,
          companyId: company.id,
          orderDate: { gte: dateFrom, lte: dateTo },
        },
        include: {
          items: true,
        },
      });

      // Purchases
      const purchases = await prisma.purchase.findMany({
        where: {
          tenantId,
          companyId: company.id,
          purchaseDate: { gte: dateFrom, lte: dateTo },
        },
      });

      // Shipments
      const shipments = await prisma.shipment.findMany({
        where: {
          tenantId,
          companyId: company.id,
          shipmentDate: { gte: dateFrom, lte: dateTo },
        },
      });

      // Calculate metrics
      const totalPurchaseOrders = purchaseOrders.length;
      const totalPurchaseValue = purchases.reduce(
        (sum, p) => sum + p.totalCost,
        0
      );
      const totalShipments = shipments.length;
      const totalShipmentQuantity = shipments.reduce(
        (sum, s) => sum + s.quantity,
        0
      );

      // On-time delivery calculation
      const completedPOs = purchaseOrders.filter(
        (po) => po.status === 'RECEIVED'
      );
      const onTimeDeliveries = completedPOs.filter(
        (po) =>
          po.actualDeliveryDate &&
          po.expectedDeliveryDate &&
          po.actualDeliveryDate <= po.expectedDeliveryDate
      ).length;
      const onTimeDeliveryRate =
        completedPOs.length > 0
          ? (onTimeDeliveries / completedPOs.length) * 100
          : 0;

      // Average delivery time
      const deliveredPOs = completedPOs.filter(
        (po) => po.actualDeliveryDate && po.orderDate
      );
      const totalDeliveryDays = deliveredPOs.reduce((sum, po) => {
        const orderDate = new Date(po.orderDate);
        const deliveryDate = new Date(po.actualDeliveryDate!);
        const diffTime = deliveryDate.getTime() - orderDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      const avgDeliveryTime =
        deliveredPOs.length > 0 ? totalDeliveryDays / deliveredPOs.length : 0;

      // Quality metrics (based on shipment types)
      const incomingShipments = shipments.filter(
        (s) =>
          s.shipmentType === 'INCOMING_FULL' ||
          s.shipmentType === 'INCOMING_EMPTY'
      );
      const qualityScore = 100; // Placeholder - would be based on actual quality assessments

      // Cost efficiency (average cost per unit)
      const avgCostPerUnit =
        totalShipmentQuantity > 0
          ? totalPurchaseValue / totalShipmentQuantity
          : 0;

      // Order fulfillment rate
      const totalOrderedQuantity = purchaseOrders.reduce(
        (sum, po) =>
          sum + po.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      );
      const totalReceivedQuantity = purchaseOrders.reduce(
        (sum, po) =>
          sum +
          po.items.reduce(
            (itemSum, item) => itemSum + item.receivedQuantity,
            0
          ),
        0
      );
      const fulfillmentRate =
        totalOrderedQuantity > 0
          ? (totalReceivedQuantity / totalOrderedQuantity) * 100
          : 0;

      // Monthly breakdown
      const monthlyData = await getMonthlyVendorData(
        tenantId,
        company.id,
        dateFrom,
        dateTo
      );

      return {
        company: {
          id: company.id,
          name: company.name,
          code: company.code,
          address: company.address,
          contactInfo: company.contactInfo,
        },
        metrics: {
          totalPurchaseOrders,
          totalPurchaseValue,
          totalShipments,
          totalShipmentQuantity,
          onTimeDeliveryRate,
          avgDeliveryTime,
          qualityScore,
          avgCostPerUnit,
          fulfillmentRate,
        },
        performance: {
          reliability: onTimeDeliveryRate,
          efficiency: Math.min(100, 100 - (avgDeliveryTime - 7) * 2), // Penalty for delays beyond 7 days
          costEffectiveness: 85, // Placeholder - would compare against market rates
          overall: (onTimeDeliveryRate + qualityScore + fulfillmentRate) / 3,
        },
        monthlyData,
        trends: {
          purchaseValueTrend: calculateTrend(
            monthlyData.map((m) => m.purchaseValue)
          ),
          deliveryTimeTrend: calculateTrend(
            monthlyData.map((m) => m.avgDeliveryTime)
          ),
          qualityTrend: calculateTrend(monthlyData.map((m) => m.qualityScore)),
        },
      };
    })
  );

  // Sort by overall performance
  vendorMetrics.sort((a, b) => b.performance.overall - a.performance.overall);

  return {
    vendors: vendorMetrics,
    summary: {
      totalVendors: vendorMetrics.length,
      avgPerformance:
        vendorMetrics.reduce((sum, v) => sum + v.performance.overall, 0) /
        vendorMetrics.length,
      topPerformer: vendorMetrics[0]?.company.name || 'N/A',
      totalPurchaseValue: vendorMetrics.reduce(
        (sum, v) => sum + v.metrics.totalPurchaseValue,
        0
      ),
      avgDeliveryTime:
        vendorMetrics.reduce((sum, v) => sum + v.metrics.avgDeliveryTime, 0) /
        vendorMetrics.length,
    },
  };
}

async function getMonthlyVendorData(
  tenantId: string,
  companyId: string,
  dateFrom: Date,
  dateTo: Date
) {
  const monthlyData = [];
  const currentDate = new Date(dateFrom);

  while (currentDate <= dateTo) {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Get data for this month
    const [purchases, shipments, purchaseOrders] = await Promise.all([
      prisma.purchase.findMany({
        where: {
          tenantId,
          companyId,
          purchaseDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.shipment.findMany({
        where: {
          tenantId,
          companyId,
          shipmentDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.purchaseOrder.findMany({
        where: {
          tenantId,
          companyId,
          orderDate: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    const purchaseValue = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const shipmentCount = shipments.length;
    const orderCount = purchaseOrders.length;

    // Calculate average delivery time for this month
    const completedPOs = purchaseOrders.filter(
      (po) => po.status === 'RECEIVED' && po.actualDeliveryDate
    );
    const avgDeliveryTime =
      completedPOs.length > 0
        ? completedPOs.reduce((sum, po) => {
            const orderDate = new Date(po.orderDate);
            const deliveryDate = new Date(po.actualDeliveryDate!);
            const diffTime = deliveryDate.getTime() - orderDate.getTime();
            return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }, 0) / completedPOs.length
        : 0;

    monthlyData.push({
      month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
      purchaseValue,
      shipmentCount,
      orderCount,
      avgDeliveryTime,
      qualityScore: 100, // Placeholder
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return monthlyData;
}

function calculateTrend(
  values: number[]
): 'improving' | 'stable' | 'declining' {
  if (values.length < 2) return 'stable';

  const recent = values.slice(-3);
  const earlier = values.slice(0, -3);

  if (recent.length === 0 || earlier.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const earlierAvg =
    earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

  const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;

  if (changePercent > 5) return 'improving';
  if (changePercent < -5) return 'declining';
  return 'stable';
}
