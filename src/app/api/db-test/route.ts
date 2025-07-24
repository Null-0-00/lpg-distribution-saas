import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic database connectivity
    const result =
      await prisma.$queryRaw`SELECT 1 as connected, NOW() as timestamp`;

    // Test if tables exist
    const tenantCount = await prisma.tenant.count();

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connected successfully',
      database: {
        connected: true,
        timestamp: result,
        tenantCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        directUrl: process.env.DIRECT_URL ? 'configured' : 'missing',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? 'configured'
          : 'missing',
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
          directUrl: process.env.DIRECT_URL ? 'configured' : 'missing',
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? 'configured'
            : 'missing',
        },
      },
      { status: 500 }
    );
  }
}
