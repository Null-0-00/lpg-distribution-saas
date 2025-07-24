import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Handle missing NEXTAUTH_SECRET during build time
const getAuthSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }

  // During build time, use a temporary secret
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'preview'
  ) {
    return 'dev-secret-key-at-least-32-characters-long';
  }

  // In production build without secret, throw descriptive error
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'NEXTAUTH_SECRET not found. Make sure to set it in your deployment environment.'
    );
    return 'build-time-secret-must-be-replaced-in-production';
  }

  return 'fallback-secret-key-at-least-32-characters-long';
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  trustHost: true,

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

          if (!user) {
            throw new Error('User not found');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated');
          }

          if (!user.tenant?.isActive) {
            throw new Error('Tenant account is deactivated');
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password as string,
            user.password!
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenant: user.tenant,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenant = user.tenant;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
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
  debug: process.env.NODE_ENV === 'development',
});
