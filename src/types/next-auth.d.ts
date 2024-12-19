import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    tenantId: string;
    careHomeId: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      tenantId: string;
      careHomeId: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    tenantId: string;
    careHomeId: string;
  }
}
