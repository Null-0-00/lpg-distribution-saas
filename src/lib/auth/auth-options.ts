import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

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
              email: credentials.email,
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
            credentials.password,
            user.password
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
          console.error('Authentication error');
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
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenant = token.tenant as any;
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
      console.log('User signed in');

      // Log the sign-in event
      try {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId as string,
            userId: user.id,
            action: 'USER_SIGN_IN',
            entityType: 'USER',
            entityId: user.id,
            changes: {
              email: user.email,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        console.error('Failed to log sign-in event:', error);
      }
    },

    async signOut({ session, token }) {
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
              changes: {
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

  secret:
    process.env.NEXTAUTH_SECRET ||
    (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'NEXTAUTH_SECRET environment variable is required in production'
        );
      }
      return 'development-secret-key-change-in-production';
    })(),

  debug: process.env.NODE_ENV === 'development',
};
