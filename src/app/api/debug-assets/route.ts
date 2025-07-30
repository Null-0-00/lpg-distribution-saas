import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Make internal request to assets API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const assetsResponse = await fetch(`${baseUrl}/api/assets?includeAutoCalculated=true`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!assetsResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch assets',
        status: assetsResponse.status,
        statusText: assetsResponse.statusText 
      });
    }

    const assetsData = await assetsResponse.json();

    // Filter out only empty cylinder assets
    const emptyCylinderAssets = assetsData.assets.filter((asset: any) => 
      asset.name.includes('Empty Cylinders')
    );

    return NextResponse.json({
      source: 'assets API',
      emptyCylinderAssets: emptyCylinderAssets.map((asset: any) => ({
        name: asset.name,
        size: asset.details?.size,
        quantity: asset.details?.quantity,
        value: asset.currentValue,
        description: asset.description,
      })),
      totalAssets: assetsData.assets.length,
      autoCalculatedAssets: assetsData.assets.filter((a: any) => a.isAutoCalculated).length,
    });

  } catch (error) {
    console.error('Debug assets error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}