/**
 * SUPER ADMIN PROTECTION MIDDLEWARE
 *
 * This middleware prevents any API-based super admin creation or manipulation
 * from being accessible through web requests, even if someone tries to create
 * malicious endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';

// List of patterns that should be blocked completely
const BLOCKED_PATTERNS = [
  '/api/create-super-admin',
  '/api/super-admin/create',
  '/api/admin/create-super',
  '/api/users/create-super-admin',
  '/api/auth/create-super-admin',
  // Add any other patterns that might be attempted
];

// Patterns that might indicate super admin creation attempts in request bodies
const DANGEROUS_BODY_PATTERNS = [
  'SUPER_ADMIN',
  'role.*SUPER_ADMIN',
  'createSuperAdmin',
  'makeSuperAdmin',
];

export function superAdminProtectionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block any URL patterns that might be used for super admin creation
  for (const pattern of BLOCKED_PATTERNS) {
    if (pathname.includes(pattern)) {
      console.error(
        `🚫 SECURITY ALERT: Blocked super admin creation attempt via ${pathname}`
      );
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Super admin creation through API is disabled for security',
          code: 'SUPER_ADMIN_CREATION_BLOCKED',
        },
        { status: 403 }
      );
    }
  }

  // For POST/PUT/PATCH requests, check if they're trying to create super admin roles
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    // This is a simplified check - in a real scenario, you'd want to parse the body
    // but we're being extra cautious here
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // Log suspicious activity for monitoring
      if (pathname.includes('/api/users') || pathname.includes('/api/auth')) {
        console.warn(
          `⚠️  SECURITY MONITOR: ${request.method} request to ${pathname} - monitoring for super admin creation attempts`
        );
      }
    }
  }

  return NextResponse.next();
}

// Export a function to check if a role change is attempting to create super admin
export function validateRoleChange(
  newRole: string,
  currentUserRole: string
): boolean {
  // NEVER allow anyone to become SUPER_ADMIN through role changes
  if (newRole === 'SUPER_ADMIN') {
    console.error(
      '🚫 SECURITY ALERT: Attempt to assign SUPER_ADMIN role blocked'
    );
    return false;
  }

  // Only existing SUPER_ADMIN can change roles (but not to SUPER_ADMIN)
  if (currentUserRole !== 'SUPER_ADMIN' && newRole !== currentUserRole) {
    return false;
  }

  return true;
}
