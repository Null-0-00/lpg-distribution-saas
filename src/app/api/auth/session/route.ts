import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    return NextResponse.json({
      session,
      authenticated: !!session?.user,
      user: session?.user || null,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check session',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
