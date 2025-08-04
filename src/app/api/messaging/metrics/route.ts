import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get previous month for comparison
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // Current month metrics
    const currentMonthMessages = await prisma.sentMessage.aggregate({
      where: {
        tenantId,
        sentAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    // Previous month metrics for comparison
    const previousMonthMessages = await prisma.sentMessage.aggregate({
      where: {
        tenantId,
        sentAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    // Messages by type (current month)
    const messagesByType = await prisma.sentMessage.groupBy({
      by: ['trigger'],
      where: {
        tenantId,
        sentAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    // Messages by status (current month)
    const messagesByStatus = await prisma.sentMessage.groupBy({
      by: ['status'],
      where: {
        tenantId,
        sentAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    // Daily message counts for the current month (for chart)
    const dailyMessageCounts = await prisma.sentMessage.groupBy({
      by: ['sentAt'],
      where: {
        tenantId,
        sentAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    // Process daily counts into a more usable format
    const dailyCounts = dailyMessageCounts.reduce(
      (acc, item) => {
        const date = item.sentAt?.toISOString().split('T')[0];
        if (date) {
          acc[date] = (acc[date] || 0) + item._count.id;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate percentage change from previous month
    const currentCount = currentMonthMessages._count.id;
    const previousCount = previousMonthMessages._count.id;
    const percentageChange =
      previousCount > 0
        ? ((currentCount - previousCount) / previousCount) * 100
        : currentCount > 0
          ? 100
          : 0;

    return NextResponse.json({
      currentMonth: {
        total: currentCount,
        percentageChange: Math.round(percentageChange * 100) / 100,
        monthName: currentMonthStart.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      },
      previousMonth: {
        total: previousCount,
        monthName: previousMonthStart.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      },
      breakdown: {
        byType: messagesByType.map((item) => ({
          type: item.trigger,
          count: item._count.id,
        })),
        byStatus: messagesByStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
      },
      dailyCounts,
    });
  } catch (error) {
    console.error('Error fetching messaging metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
