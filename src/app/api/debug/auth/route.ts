import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development or have debug access
    const debugToken = request.nextUrl.searchParams.get('token');
    if (
      process.env.NODE_ENV === 'production' &&
      debugToken !== process.env.DEBUG_TOKEN
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checks = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Missing',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      },
      database: null as any,
      users: null as any,
    };

    // Test database connection
    try {
      await prisma.$connect();
      checks.database = { status: 'Connected' };

      // Check if users exist
      const userCount = await prisma.user.count();
      const sampleUser = await prisma.user.findFirst({
        where: { email: 'admin@demo.com' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      checks.users = {
        total: userCount,
        sampleUser: sampleUser || 'No admin@demo.com user found',
      };
    } catch (error) {
      checks.database = {
        status: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json(checks);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
