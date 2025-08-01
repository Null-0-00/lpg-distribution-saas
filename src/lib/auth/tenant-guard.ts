/**
 * Tenant Access Guard Utilities
 */

import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

/**
 * Validates that a session has tenant access
 * Returns the tenantId if valid, or throws a NextResponse if invalid
 */
export function validateTenantAccess(session: Session | null): string {
  if (!session) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = session.user?.tenantId;
  if (!tenantId) {
    throw NextResponse.json({ error: 'No tenant access' }, { status: 403 });
  }

  return tenantId;
}

/**
 * Validates that a session has tenant access, returns null instead of throwing
 */
export function getTenantId(session: Session | null): string | null {
  if (!session || !session.user?.tenantId) {
    return null;
  }
  return session.user.tenantId;
}

/**
 * Creates a standardized tenant validation error response
 */
export function createTenantAccessError() {
  return NextResponse.json({ error: 'No tenant access' }, { status: 403 });
}

/**
 * Creates a standardized unauthorized error response
 */
export function createUnauthorizedError() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
