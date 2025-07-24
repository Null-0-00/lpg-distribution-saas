import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    return NextResponse.json({
      authenticated: !!session,
      session: session
        ? {
            user: {
              id: session.user?.id,
              email: session.user?.email,
              name: session.user?.name,
              role: session.user?.role,
            },
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      {
        error: 'Authentication test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
