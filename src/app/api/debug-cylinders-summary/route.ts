import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Make internal request to cylinders-summary API
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
      source: 'cylinders-summary API',
      emptyCylinders: cylindersData.emptyCylinders,
      totals: cylindersData.totals,
      receivablesBreakdown: cylindersData.receivablesBreakdown,
      lastUpdated: cylindersData.lastUpdated,
      dataSource: cylindersData.dataSource,
    });
  } catch (error) {
    console.error('Debug cylinders summary error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
