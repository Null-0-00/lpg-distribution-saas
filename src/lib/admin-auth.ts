import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function requireAdminAuth(request: NextRequest) {
  const session = await auth();

  if (!session) {
    throw new Error('Authentication required');
  }

  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }

  return session;
}

export async function requireAdminOrManager(request: NextRequest) {
  const session = await auth();

  if (!session) {
    throw new Error('Authentication required');
  }

  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    throw new Error('Admin or Manager access required');
  }

  return session;
}

export async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    return user?.isActive === true && user.role === 'ADMIN';
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
}

export async function getRequestMetadata(request: NextRequest) {
  return {
    ipAddress:
      (request as any).ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
  };
}

export function createAdminResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message: message || 'Operation completed successfully',
    timestamp: new Date().toISOString(),
  };
}

export function createAdminErrorResponse(error: string, code: number = 400) {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    statusCode: code,
  };
}
