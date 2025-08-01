import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthConfig = {
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
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isActive: true,
              tenantId: true,
              avatar: true,
              pagePermissions: true,
              tenant: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                },
              },
              permissions: {
                select: {
                  name: true,
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
            user.password as string
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Parse pagePermissions JSON properly
          let parsedPagePermissions: string[] = [];

          console.log('=== AUTH AUTHORIZE DEBUG ===');
          console.log('Raw user.pagePermissions:', user.pagePermissions);
          console.log('Type of pagePermissions:', typeof user.pagePermissions);
          console.log('Is array:', Array.isArray(user.pagePermissions));
          console.log('Stringified:', JSON.stringify(user.pagePermissions));

          if (user.pagePermissions) {
            try {
              // If it's already an array, use it; if it's a JSON string, parse it
              parsedPagePermissions = Array.isArray(user.pagePermissions)
                ? user.pagePermissions
                : JSON.parse(user.pagePermissions as string);
              console.log('Parsed pagePermissions:', parsedPagePermissions);
            } catch (error) {
              console.error('Error parsing pagePermissions:', error);
              parsedPagePermissions = [];
            }
          }

          console.log('Final parsed permissions:', parsedPagePermissions);
          console.log('=============================');

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenant: user.tenant,
            pagePermissions: parsedPagePermissions,
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
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        console.log('=== JWT CALLBACK DEBUG ===');
        console.log('User object:', user);
        console.log('User pagePermissions:', user.pagePermissions);
        console.log('User pagePermissions type:', typeof user.pagePermissions);
        console.log('========================');

        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenant = user.tenant;
        token.pagePermissions = user.pagePermissions;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        console.log('=== SESSION CALLBACK DEBUG ===');
        console.log('Token:', JSON.stringify(token, null, 2));
        console.log('Token pagePermissions:', token.pagePermissions);
        console.log(
          'Token pagePermissions type:',
          typeof token.pagePermissions
        );
        console.log(
          'Token pagePermissions is array:',
          Array.isArray(token.pagePermissions)
        );

        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenant = token.tenant as any;
        session.user.pagePermissions =
          (token.pagePermissions as string[]) || [];

        // If token doesn't have user data (old token), fetch fresh user data
        if (!token.role || !token.tenantId) {
          console.log('Token missing user data, fetching fresh user data...');
          try {
            const user = await prisma.user.findFirst({
              where: { id: token.sub },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                tenantId: true,
                pagePermissions: true,
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                  },
                },
              },
            });

            if (user) {
              // Parse pagePermissions JSON properly
              let parsedPagePermissions: string[] = [];
              if (user.pagePermissions) {
                try {
                  parsedPagePermissions = Array.isArray(user.pagePermissions)
                    ? user.pagePermissions
                    : JSON.parse(user.pagePermissions as string);
                } catch (error) {
                  console.error(
                    'Error parsing pagePermissions in session:',
                    error
                  );
                  parsedPagePermissions = [];
                }
              }

              session.user.id = user.id;
              session.user.email = user.email;
              session.user.name = user.name;
              session.user.role = user.role;
              session.user.tenantId = user.tenantId;
              session.user.tenant = user.tenant;
              session.user.pagePermissions = parsedPagePermissions;

              console.log(
                'Updated session with fresh user data:',
                JSON.stringify(session.user, null, 2)
              );
            }
          } catch (error) {
            console.error(
              'Error fetching fresh user data in session callback:',
              error
            );
          }
        }

        console.log(
          'Final session user:',
          JSON.stringify(session.user, null, 2)
        );
        console.log('==============================');
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
    async signIn(message: any) {
      const { user, account, profile } = message;
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
            metadata: {
              email: user.email,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        console.error('Failed to log sign-in event:', error);
      }
    },

    async signOut(message: any) {
      const { session, token } = message || {};
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
