import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking session and token...');
    
    // Get session via auth()
    const session = await auth();
    console.log('Session from auth():', JSON.stringify(session, null, 2));
    
    // Get token via getToken
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    console.log('Token from getToken():', JSON.stringify(token, null, 2));

    return NextResponse.json({
      session: session,
      token: token,
      hasSession: !!session,
      hasToken: !!token,
      sessionRole: session?.user?.role,
      tokenRole: token?.role,
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}