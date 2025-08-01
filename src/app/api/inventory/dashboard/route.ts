import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);
    const { searchParams } = new URL(request.url);

    const includeMovements = searchParams.get('includeMovements') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 4 days if no dates provided
    const today = new Date();
    const defaultStartDate =
      startDate ||
      new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const defaultEndDate = endDate || today.toISOString().split('T')[0];

    console.log('🚀 Dashboard API: Starting combined inventory data fetch...');
    const startTime = performance.now();

    // For now, let's make internal API calls to combine the data
    const baseUrl = request.url.split('/api/')[0];

    const [inventoryResponse, dailyResponse, cylindersResponse] =
      await Promise.all([
        fetch(`${baseUrl}/api/inventory?includeMovements=${includeMovements}`, {
          headers: { Cookie: request.headers.get('Cookie') || '' },
        }),
        fetch(
          `${baseUrl}/api/inventory/daily?startDate=${defaultStartDate}&endDate=${defaultEndDate}`,
          {
            headers: { Cookie: request.headers.get('Cookie') || '' },
          }
        ),
        fetch(`${baseUrl}/api/inventory/cylinders-summary`, {
          headers: { Cookie: request.headers.get('Cookie') || '' },
        }),
      ]);

    const [inventoryData, dailyData, cylindersData] = await Promise.all([
      inventoryResponse.json(),
      dailyResponse.json(),
      cylindersResponse.json(),
    ]);

    const endTime = performance.now();
    const responseData = {
      // Main inventory data
      inventory: inventoryData.inventory || [],
      summary: inventoryData.summary || {},

      // Cylinder summary data
      cylinderSummary: cylindersData,

      // Daily inventory data
      dailyInventory: dailyData.dailyInventory || [],

      lastUpdated: new Date().toISOString(),
      dataSource: 'COMBINED_DASHBOARD_API',
      performanceMetrics: {
        queryTime: `${(endTime - startTime).toFixed(2)}ms`,
        cacheUsed: false,
      },
    };

    console.log(
      `🎉 Dashboard API: Successfully combined all data in ${(endTime - startTime).toFixed(2)}ms`
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
