import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2030),
  driverId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      month: searchParams.get('month'),
      year: searchParams.get('year'),
      driverId: searchParams.get('driverId') || undefined,
    };

    const validatedParams = analyticsQuerySchema.parse(queryParams);
    const { month, year, driverId } = validatedParams;

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all products for the tenant
    const products = await prisma.product.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        company: true,
      },
    });

    // Get commission structures for the month/year
    const commissionStructures = await prisma.commissionStructure.findMany({
      where: {
        tenantId: session.user.tenantId,
        month,
        year,
        isActive: true,
      },
    });

    // Get fixed cost structures for the month/year
    const fixedCostStructures = await prisma.fixedCostStructure.findMany({
      where: {
        tenantId: session.user.tenantId,
        month,
        year,
        isActive: true,
      },
    });

    // Get total expenses for the month
    const totalExpenses = await prisma.expense.findMany({
      where: {
        tenantId: session.user.tenantId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalExpenseAmount = totalExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Get sales data for the month
    const salesFilter: any = {
      tenantId: session.user.tenantId,
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (driverId) {
      salesFilter.driverId = driverId;
    }

    const sales = await prisma.sale.findMany({
      where: salesFilter,
      include: {
        product: {
          include: {
            company: true,
          },
        },
        driver: true,
      },
    });

    // Calculate total sales quantity for cost per unit calculation
    const totalSalesQuantity = sales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );
    const costPerUnit =
      totalSalesQuantity > 0 ? totalExpenseAmount / totalSalesQuantity : 0;

    // Group sales by product
    const productSales = sales.reduce(
      (acc, sale) => {
        const productId = sale.productId;
        if (!acc[productId]) {
          acc[productId] = {
            product: sale.product,
            totalQuantity: 0,
            totalRevenue: 0,
            latestPrice: 0,
            sales: [],
          };
        }
        acc[productId].totalQuantity += sale.quantity;
        acc[productId].totalRevenue += sale.totalValue;
        acc[productId].latestPrice = sale.unitPrice; // Last price will be the latest
        acc[productId].sales.push(sale);
        return acc;
      },
      {} as Record<string, any>
    );

    // Group sales by driver if no specific driver requested
    const driverAnalytics = !driverId
      ? sales.reduce(
          (acc, sale) => {
            const driverId = sale.driverId;
            if (!acc[driverId]) {
              acc[driverId] = {
                driver: sale.driver,
                totalQuantity: 0,
                totalRevenue: 0,
                sales: [],
                costPerUnit: 0,
              };
            }
            acc[driverId].totalQuantity += sale.quantity;
            acc[driverId].totalRevenue += sale.totalValue;
            acc[driverId].sales.push(sale);
            return acc;
          },
          {} as Record<string, any>
        )
      : {};

    // Calculate cost per unit for each driver
    Object.values(driverAnalytics).forEach((driver: any) => {
      driver.costPerUnit =
        driver.totalQuantity > 0
          ? totalExpenseAmount / driver.totalQuantity
          : 0;
    });

    // Calculate analytics for each product
    const productAnalytics = products.map((product) => {
      const productSale = productSales[product.id];
      const commission =
        commissionStructures.find((c) => c.productId === product.id)
          ?.commission || 0;
      const fixedCost =
        fixedCostStructures.find((f) => f.productId === product.id)
          ?.costPerUnit || 0;

      // Use global fixed cost if no product-specific cost
      const globalFixedCost =
        fixedCostStructures.find((f) => f.productId === null)?.costPerUnit || 0;
      const effectiveFixedCost = fixedCost || globalFixedCost;

      const buyingPrice = product.costPrice || 0;
      const sellingPrice =
        productSale?.latestPrice || product.currentPrice || 0;
      const salesQuantity = productSale?.totalQuantity || 0;
      const revenue = productSale?.totalRevenue || 0;

      // Breakeven Price = Buying Price - Commission + Fixed Cost Per Unit
      const breakevenPrice = buyingPrice - commission + effectiveFixedCost;

      // Profit per unit = Selling Price - Breakeven Price
      const profitPerUnit = sellingPrice - breakevenPrice;

      return {
        product: {
          id: product.id,
          name: product.name,
          size: product.size,
          company: product.company.name,
        },
        buyingPrice,
        sellingPrice,
        commission,
        fixedCostPerUnit: effectiveFixedCost,
        breakevenPrice,
        profitPerUnit,
        salesQuantity,
        revenue,
        totalProfit: profitPerUnit * salesQuantity,
      };
    });

    // Calculate overall analytics
    const totalRevenue = Object.values(productSales).reduce(
      (sum: number, p: any) => sum + p.totalRevenue,
      0
    );
    const totalProfit = productAnalytics.reduce(
      (sum, p) => sum + p.totalProfit,
      0
    );
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const analytics = {
      month,
      year,
      driverId,
      overview: {
        totalExpenses: totalExpenseAmount,
        totalRevenue,
        totalSalesQuantity,
        costPerUnit,
        totalProfit,
        profitMargin,
      },
      products: productAnalytics,
      drivers: Object.values(driverAnalytics).map((driver: any) => ({
        driver: {
          id: driver.driver.id,
          name: driver.driver.name,
        },
        totalQuantity: driver.totalQuantity,
        totalRevenue: driver.totalRevenue,
        costPerUnit: driver.costPerUnit,
      })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
