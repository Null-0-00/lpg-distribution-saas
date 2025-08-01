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
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    tenantId: string | null; // Null for SUPER_ADMIN users
    tenant?: any;
  }
}
