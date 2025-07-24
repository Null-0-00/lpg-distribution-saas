import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Get NextAuth Secret - properly handle Vercel environment
const getAuthSecret = () => {
  // Production should always have NEXTAUTH_SECRET set
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required in production');
  }
  
  return process.env.NEXTAUTH_SECRET || 'dev-secret-key-at-least-32-characters-long-for-development';
};

// Get NextAuth URL - handle Vercel deployment automatically
const getAuthUrl = () => {
  // In production, use NEXTAUTH_URL or auto-detect Vercel URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://lpg-distribution-saas.vercel.app';
  }
  // Development
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  // Essential for Vercel deployment
  trustHost: true,
  
  // Configure URLs properly
  basePath: '/api/auth',

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          console.log('🔐 NextAuth: Authenticating user:', credentials.email);

          // Connect to database with timeout
          await prisma.$connect();

          // First find user by email to get tenant info
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email as string,
            },
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                },
              },
            },
          });

          console.log('🔍 User lookup result:', {
            found: !!user,
            email: credentials.email,
            userActive: user?.isActive,
            tenantActive: user?.tenant?.isActive
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null; // Return null instead of throwing
          }

          if (!user.isActive) {
            console.log('❌ User account deactivated:', user.email);
            return null; // Return null instead of throwing
          }

          if (!user.tenant?.isActive) {
            console.log('❌ Tenant account deactivated for:', user.tenant?.name);
            return null; // Return null instead of throwing
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password as string,
            user.password!
          );

          console.log('🔑 Password validation:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', user.email);
            return null; // Return null instead of throwing
          }

          console.log('✅ Authentication successful for:', user.email);
          
          // Return complete user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenant: user.tenant,
          };
        } catch (error) {
          console.error('🚨 Authentication error:', error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 2 * 60 * 60, // 2 hours
  },
  
  // JWT configuration for better Vercel performance
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        console.log('🎫 JWT: Adding user data to token');
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenant = user.tenant;
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        console.log('👤 Session: Building user session');
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl });

      // Always redirect to dashboard after sign in
      if (url === baseUrl || url === `${baseUrl}/`) {
        console.log('🏠 Redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }

      // Handle relative URLs
      if (url.startsWith('/')) {
        const redirectUrl = new URL(url, baseUrl).toString();
        console.log('📍 Relative URL redirect:', redirectUrl);
        return redirectUrl;
      }

      // Same origin URLs
      if (url.startsWith(baseUrl)) {
        console.log('🔗 Same origin redirect:', url);
        return url;
      }

      // Default to dashboard for safety
      console.log('🛡️ Default redirect to dashboard');
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user.email);

      // Log the sign-in event
      try {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId as string,
            userId: user.id,
            action: 'USER_SIGN_IN',
            entityType: 'USER',
            entityId: user.id,
            newValues: {
              email: user.email,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        console.error('Failed to log sign-in event:', error);
      }
    },

    async signOut(props: { session?: any; token?: any }) {
      const { session, token } = props;
      console.log('User signed out');

      // Log the sign-out event
      try {
        if (session?.user?.id) {
          await prisma.auditLog.create({
            data: {
              tenantId: session.user.tenantId,
              userId: session.user.id,
              action: 'USER_SIGN_OUT',
              entityType: 'USER',
              entityId: session.user.id,
              metadata: {
                email: session.user.email,
                timestamp: new Date().toISOString(),
              },
            },
          });
        }
      } catch (error) {
        console.error('Failed to log sign-out event:', error);
      }
    },
  },

  secret: getAuthSecret(),
  
  // Enhanced debugging for production issues
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
  
  // Logger for production debugging
  logger: {
    error(error: Error) {
      console.error('🚨 NextAuth Error:', error);
    },
    warn(code: string) {
      console.warn('⚠️ NextAuth Warning:', code);
    },
    debug(code: string, metadata?: any) {
      if (process.env.NEXTAUTH_DEBUG === 'true') {
        console.log('🐛 NextAuth Debug:', code, metadata);
      }
    },
  },
});
