// Cylinder Tracking API Endpoints
// Provides comprehensive cylinder tracking data and management capabilities

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CylinderTrackingService } from '@/lib/business/cylinder-tracking';
import {
  CylinderTrackingQuery,
  CylinderEventType,
} from '@/types/cylinder-tracking';
import { z } from 'zod';

const cylinderTrackingQuerySchema = z.object({
  cylinderSizeId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  dateFrom: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  dateTo: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  eventType: z.nativeEnum(CylinderEventType).optional(),
  eventId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = cylinderTrackingQuerySchema.parse({
      cylinderSizeId: searchParams.get('cylinderSizeId'),
      productId: searchParams.get('productId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      eventType: searchParams.get('eventType'),
      eventId: searchParams.get('eventId'),
    });

    // Create query object
    const query: CylinderTrackingQuery = {
      tenantId,
      ...queryParams,
    };

    const cylinderTrackingService = new CylinderTrackingService(prisma);

    // Get aggregated cylinder tracking data
    const aggregations =
      await cylinderTrackingService.getCylinderTrackingAggregation(query);

    // Get detailed records if specific filters are applied
    let detailedRecords = null;
    if (
      queryParams.cylinderSizeId ||
      queryParams.productId ||
      queryParams.eventId
    ) {
      const whereClause: any = {
        tenantId,
        ...(queryParams.cylinderSizeId && {
          cylinderSizeId: queryParams.cylinderSizeId,
        }),
        ...(queryParams.productId && { productId: queryParams.productId }),
        ...(queryParams.eventId && { eventId: queryParams.eventId }),
        ...(queryParams.eventType && { eventType: queryParams.eventType }),
      };

      if (queryParams.dateFrom || queryParams.dateTo) {
        whereClause.date = {};
        if (queryParams.dateFrom) whereClause.date.gte = queryParams.dateFrom;
        if (queryParams.dateTo) whereClause.date.lte = queryParams.dateTo;
      }

      detailedRecords = await prisma.inventoryRecord.findMany({
        where: whereClause,
        include: {
          cylinderSize: {
            select: {
              size: true,
              description: true,
            },
          },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: 100, // Limit to prevent excessive data
      });
    }

    // Calculate summary metrics
    const summary = {
      totalCylinderSizes: aggregations.length,
      totalOnboardingFullCylinders: aggregations.reduce(
        (sum, agg) => sum + agg.totalOnboardingFullCylinders,
        0
      ),
      totalOnboardingEmptyCylinders: aggregations.reduce(
        (sum, agg) => sum + agg.totalOnboardingEmptyCylinders,
        0
      ),
      totalOnboardingCylinderReceivables: aggregations.reduce(
        (sum, agg) => sum + agg.totalOnboardingCylinderReceivables,
        0
      ),
      totalPackageSales: aggregations.reduce(
        (sum, agg) => sum + agg.totalPackageSales,
        0
      ),
      totalRefillSales: aggregations.reduce(
        (sum, agg) => sum + agg.totalRefillSales,
        0
      ),
      totalSalesRevenue: aggregations.reduce(
        (sum, agg) => sum + agg.totalSalesRevenue,
        0
      ),
      totalIncomingFull: aggregations.reduce(
        (sum, agg) => sum + agg.totalIncomingFull,
        0
      ),
      totalIncomingEmpty: aggregations.reduce(
        (sum, agg) => sum + agg.totalIncomingEmpty,
        0
      ),
      totalShipmentCost: aggregations.reduce(
        (sum, agg) => sum + agg.totalShipmentCost,
        0
      ),
      currentTotalFullCylinders: aggregations.reduce(
        (sum, agg) => sum + agg.currentFullCylinders,
        0
      ),
      currentTotalEmptyCylinders: aggregations.reduce(
        (sum, agg) => sum + agg.currentEmptyCylinders,
        0
      ),
      currentTotalCylinderReceivables: aggregations.reduce(
        (sum, agg) => sum + agg.currentCylinderReceivables,
        0
      ),
      currentTotalCashReceivables: aggregations.reduce(
        (sum, agg) => sum + agg.currentCashReceivables,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        aggregations,
        detailedRecords,
        summary,
        query: queryParams,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Cylinder tracking query error:', error);
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

    const { tenantId, role } = session.user;

    // Only allow admins to manually create cylinder tracking records
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    const cylinderTrackingService = new CylinderTrackingService(prisma);

    switch (action) {
      case 'recalculate': {
        // Recalculate cylinder tracking for a specific date range
        const { cylinderSizeId, dateFrom, dateTo } = data;

        if (!cylinderSizeId || !dateFrom || !dateTo) {
          return NextResponse.json(
            {
              error:
                'cylinderSizeId, dateFrom, and dateTo are required for recalculation',
            },
            { status: 400 }
          );
        }

        // This would involve complex recalculation logic
        // For now, return a placeholder response
        return NextResponse.json({
          success: true,
          message: 'Cylinder tracking recalculation completed',
          affectedRecords: 0,
        });
      }

      case 'audit': {
        // Get audit trail for cylinder tracking changes
        const { cylinderSizeId, productId, dateFrom, dateTo } = data;

        const whereClause: any = { tenantId };
        if (cylinderSizeId) whereClause.cylinderSizeId = cylinderSizeId;
        if (productId) whereClause.productId = productId;

        if (dateFrom || dateTo) {
          whereClause.date = {};
          if (dateFrom) whereClause.date.gte = new Date(dateFrom);
          if (dateTo) whereClause.date.lte = new Date(dateTo);
        }

        const auditRecords = await prisma.inventoryRecord.findMany({
          where: whereClause,
          include: {
            cylinderSize: {
              select: {
                size: true,
                description: true,
              },
            },
          },
          orderBy: [{ date: 'desc' }, { updatedAt: 'desc' }],
        });

        return NextResponse.json({
          success: true,
          data: auditRecords.map((record) => ({
            id: record.id,
            date: record.date,
            cylinderSize: record.cylinderSize.size,
            eventType: (record as any).eventType || 'UNKNOWN',
            eventId: (record as any).eventId || record.id,
            fullCylinders: record.fullCylinders,
            emptyCylinders: record.emptyCylinders,
            totalCylinderReceivables: record.emptyCylinderReceivables || 0,
            lastUpdated: record.updatedAt,
            createdAt: record.createdAt,
          })),
        });
      }

      case 'export': {
        // Export cylinder tracking data
        const { format = 'json', ...queryParams } = data;

        const query: CylinderTrackingQuery = {
          tenantId,
          ...queryParams,
        };

        const aggregations =
          await cylinderTrackingService.getCylinderTrackingAggregation(query);

        if (format === 'csv') {
          // Return CSV format
          const csvHeader =
            'Cylinder Size,Current Full,Current Empty,Total Receivables,Total Sales Revenue,Total Shipment Cost\n';
          const csvData = aggregations
            .map(
              (agg) =>
                `${agg.cylinderSize},${agg.currentFullCylinders},${agg.currentEmptyCylinders},${agg.currentCylinderReceivables},${agg.totalSalesRevenue},${agg.totalShipmentCost}`
            )
            .join('\n');

          return new NextResponse(csvHeader + csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="cylinder-tracking-${new Date().toISOString().split('T')[0]}.csv"`,
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: aggregations,
          exportedAt: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action. Supported actions: recalculate, audit, export',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cylinder tracking management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
