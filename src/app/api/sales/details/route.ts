import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;
    const { searchParams } = new URL(request.url);
    const salesIdsParam = searchParams.get('salesIds');

    if (!salesIdsParam) {
      return NextResponse.json(
        { error: 'Sales IDs are required' },
        { status: 400 }
      );
    }

    const salesIds = salesIdsParam.split(',').filter((id) => id.trim() !== '');

    if (salesIds.length === 0) {
      return NextResponse.json(
        { error: 'Valid sales IDs are required' },
        { status: 400 }
      );
    }

    // Fetch sales details with related data
    const sales = await prisma.sale.findMany({
      where: {
        id: { in: salesIds },
        tenantId,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            route: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            size: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ saleDate: 'desc' }, { createdAt: 'desc' }],
    });

    // Transform data for frontend
    const transformedSales = sales.map((sale) => ({
      id: sale.id,
      saleType: sale.saleType,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalValue: sale.totalValue,
      discount: sale.discount,
      netValue: sale.netValue,
      paymentType: sale.paymentType,
      cashDeposited: sale.cashDeposited,
      cylindersDeposited: sale.cylindersDeposited,
      saleDate: sale.saleDate.toISOString(),
      notes: sale.notes,
      driver: {
        name: sale.driver.name,
        phone: sale.driver.phone,
        route: sale.driver.route,
      },
      product: {
        id: sale.product.id,
        name: sale.product.name,
        size: sale.product.size,
        company: sale.product.company?.name,
      },
      createdBy: sale.user.name,
      createdAt: sale.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      sales: transformedSales,
      count: transformedSales.length,
    });
  } catch (error) {
    console.error('Sales details fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
