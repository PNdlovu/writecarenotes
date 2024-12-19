import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { azureConfig } from '@/lib/azure-config';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: azureConfig.clientId,
      clientSecret: azureConfig.clientSecret,
      tenantId: azureConfig.tenantId,
      authorization: {
        params: {
          scope: 'openid profile email offline_access',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.organizationId = user.organizationId;
        token.role = user.role;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.organizationId = token.organizationId as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log sign-in event
      await prisma.auditLog.create({
        data: {
          type: 'AUTH',
          action: 'SIGN_IN',
          userId: user.id,
          metadata: {
            provider: account?.provider,
            email: user.email,
          },
        },
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      organizationId: string;
      role: string;
    };
    accessToken: string;
  }

  interface User {
    organizationId: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    organizationId: string;
    role: string;
    accessToken: string;
  }
}