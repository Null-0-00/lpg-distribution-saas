import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's sales
    const [
      todaysSales,
      totalRevenue,
      pendingReceivables,
      lowStockAlerts,
      pendingApprovals,
      monthlyExpenses,
    ] = await Promise.all([
      // Today's sales count
      prisma.sale.count({
        where: {
          tenantId,
          saleDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Today's revenue
      prisma.sale.aggregate({
        where: {
          tenantId,
          saleDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: {
          netValue: true,
        },
      }),

      // Pending receivables (latest entry)
      prisma.receivableRecord.findFirst({
        where: { tenantId },
        orderBy: { date: 'desc' },
        select: {
          totalCashReceivables: true,
          totalCylinderReceivables: true,
        },
      }),

      // Low stock alerts (inventory records with less than 10 full cylinders)
      prisma.inventoryRecord.count({
        where: {
          tenantId,
          fullCylinders: {
            lt: 10,
          },
        },
      }),

      // Pending expense approvals
      prisma.expense.count({
        where: {
          tenantId,
          isApproved: false,
        },
      }),

      // This month's expenses
      prisma.expense.aggregate({
        where: {
          tenantId,
          isApproved: true,
          expenseDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const dashboardStats = {
      todaySales: todaysSales,
      totalRevenue: totalRevenue._sum.netValue || 0,
      pendingReceivables: pendingReceivables
        ? pendingReceivables.totalCashReceivables +
          pendingReceivables.totalCylinderReceivables
        : 0,
      lowStockAlerts,
      pendingApprovals,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);

    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This endpoint could be used to update dashboard preferences or settings
    const { preferences } = await request.json();

    // Store user dashboard preferences (simplified for now)
    // In a real implementation, you might want to create a separate UserSettings table
    console.log(
      'Dashboard preferences updated for user:',
      session.user.id,
      preferences
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating dashboard preferences:', error);

    return NextResponse.json(
      { error: 'Failed to update dashboard preferences' },
      { status: 500 }
    );
  }
}
