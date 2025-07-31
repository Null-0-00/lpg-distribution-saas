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

    // Clear cache first
    const { cache } = await import('@/lib/cache');
    const todayStr = new Date().toISOString().split('T')[0];
    const cachePattern = `cylinders_summary:${tenantId}:*`;
    await cache.invalidate(cachePattern);
    console.log(`🗑️ Cleared cache for pattern: ${cachePattern}`);

    // Make request to cylinders-summary API (should get fresh data now)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cylindersResponse = await fetch(
      `${baseUrl}/api/inventory/cylinders-summary`,
      {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      }
    );

    if (!cylindersResponse.ok) {
      return NextResponse.json({
        error: 'Failed to fetch cylinders summary',
        status: cylindersResponse.status,
        statusText: cylindersResponse.statusText,
      });
    }

    const cylindersData = await cylindersResponse.json();

    return NextResponse.json({
      message: 'Cache cleared and fresh data fetched',
      source: 'cylinders-summary API (no cache)',
      emptyCylinders: cylindersData.emptyCylinders,
      totals: cylindersData.totals,
      receivablesBreakdown: cylindersData.receivablesBreakdown,
      lastUpdated: cylindersData.lastUpdated,
      performanceMetrics: cylindersData.performanceMetrics,
    });
  } catch (error) {
    console.error('Debug cylinders no-cache error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
