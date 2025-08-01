// Bulk Sales Delete API
// Handles deletion of multiple sales entries

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';

const bulkDeleteSchema = z.object({
  salesIds: z
    .array(z.string().cuid())
    .min(1, 'At least one sale ID is required'),
  date: z.string().optional(), // Allow specifying which date's sales to delete
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);
    const { role } = session!.user;
    const body = await request.json();
    const { salesIds, date } = bulkDeleteSchema.parse(body);

    console.log('Bulk delete request:', { salesIds, tenantId });

    // First, check which sales exist and their dates
    const allSalesInfo = await prisma.sale.findMany({
      where: {
        id: { in: salesIds },
        tenantId,
      },
      select: {
        id: true,
        saleDate: true,
        driver: { select: { name: true } },
        product: { select: { name: true } },
      },
    });

    console.log(
      'Found sales info:',
      allSalesInfo.map((s) => ({
        id: s.id,
        saleDate: s.saleDate,
        driver: s.driver.name,
        product: s.product.name,
      }))
    );

    // Allow deletion of sales from the specified date or today
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Target date range:', { targetDate, endOfDay });

    // Verify all sales exist, belong to tenant, and are from target date
    const salesToDelete = await prisma.sale.findMany({
      where: {
        id: { in: salesIds },
        tenantId,
        saleDate: {
          gte: targetDate,
          lte: endOfDay,
        },
      },
      include: {
        driver: { select: { name: true } },
        product: { select: { name: true } },
      },
    });

    console.log(
      'Sales to delete (filtered by target date):',
      salesToDelete.length
    );

    if (salesToDelete.length !== salesIds.length) {
      const foundIds = salesToDelete.map((s) => s.id);
      const missingIds = salesIds.filter((id) => !foundIds.includes(id));

      console.log('Validation failed:', {
        requestedIds: salesIds,
        foundIds,
        missingIds,
        targetDateRange: { targetDate, endOfDay },
      });

      return NextResponse.json(
        {
          error:
            'Some sales not found, do not belong to your account, or are not from the target date',
          details: {
            requestedIds: salesIds,
            foundIds,
            missingIds,
            targetDateRange: { targetDate, endOfDay },
          },
        },
        { status: 404 }
      );
    }

    // Delete sales in a transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // First, delete related inventory movements
        await tx.inventoryMovement.deleteMany({
          where: {
            tenantId,
            reference: { in: salesIds },
          },
        });

        // Then delete the sales
        const deletedSales = await tx.sale.deleteMany({
          where: {
            id: { in: salesIds },
            tenantId,
          },
        });

        return deletedSales;
      },
      {
        timeout: 20000, // 20 seconds timeout for bulk operations
      }
    );

    console.log('Bulk delete completed:', {
      deletedCount: result.count,
      salesDetails: salesToDelete.map((s) => ({
        id: s.id,
        driver: s.driver.name,
        product: s.product.name,
        quantity: s.quantity,
        value: s.totalValue,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} sales entries`,
      deletedCount: result.count,
      deletedSales: salesToDelete.map((s) => ({
        id: s.id,
        driver: s.driver.name,
        product: s.product.name,
        quantity: s.quantity,
        value: s.totalValue,
      })),
    });
  } catch (error) {
    console.error('Bulk delete error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
