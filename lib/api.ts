import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

export type User = {
  id: string;
  email: string;
  name?: string;
  organizationId: string;
  role: string;
};

export type ValidatedRequest = {
  user: User;
  body: any;
};

export async function validateRequest(request: NextRequest): Promise<ValidatedRequest> {
  const token = await getToken({ req: request });

  if (!token) {
    throw new Error('Unauthorized');
  }

  const user: User = {
    id: token.sub!,
    email: token.email as string,
    name: token.name as string | undefined,
    organizationId: token.organizationId as string,
    role: token.role as string
  };

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.json();
  }

  return { user, body };
} 