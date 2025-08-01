import NextAuth from 'next-auth';
import { authConfig } from './config';

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);

export { authConfig };
