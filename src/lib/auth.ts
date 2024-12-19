/**
 * @fileoverview Authentication configuration
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  careHomeId: string;
}

// Demo user for testing
const DEMO_USER: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'ADMIN',
  tenantId: 'demo-tenant',
  careHomeId: 'demo-carehome',
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For demo purposes, accept any credentials
        if (credentials?.email) {
          return DEMO_USER;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.careHomeId = user.careHomeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).careHomeId = token.careHomeId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-do-not-use-in-production',
  debug: process.env.NODE_ENV === 'development',
};

// Client-side auth hook
export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    getAuthHeaders: () => {
      if (!session?.user?.id) return {};
      return {
        Authorization: `Bearer ${session.user.id}`,
      };
    },
  };
}
