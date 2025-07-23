import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const permissions = await prisma.permission.findMany();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Permissions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
