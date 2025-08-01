import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      tenantId: string | null; // Null for SUPER_ADMIN users
      avatar?: string;
      pagePermissions?: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string | null; // Null for SUPER_ADMIN users
    avatar?: string;
    tenant?: any;
    pagePermissions?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    tenantId: string | null; // Null for SUPER_ADMIN users
    tenant?: any;
    pagePermissions?: string[];
  }
}
