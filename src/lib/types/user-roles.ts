// User Role Types for Optimized Schema
// Since UserRole enum doesn't exist in the optimized schema, we define it here

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

/**
 * Helper function to check if a role (string or enum) matches a UserRole
 */
export function isUserRole(
  role: string | UserRole,
  targetRole: UserRole
): boolean {
  return role === targetRole || role === targetRole.toString();
}

/**
 * Helper function to check if user has admin permissions
 */
export function isAdmin(role: string | UserRole): boolean {
  return isUserRole(role, UserRole.ADMIN);
}

/**
 * Helper function to check if user has manager or admin permissions
 */
export function isManagerOrAdmin(role: string | UserRole): boolean {
  return isUserRole(role, UserRole.ADMIN) || isUserRole(role, UserRole.MANAGER);
}
