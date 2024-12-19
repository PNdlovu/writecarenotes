import 'next-auth';
import { UserRole } from '@/types/models';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    organizationId: string;
  }

  interface Session {
    user: User & {
      role: UserRole;
      organizationId: string;
    };
  }
}

declare module 'next/server' {
  interface NextRequest {
    nextauth?: {
      user?: any;
      session?: any;
    };
  }
}
