import { NextRequest } from 'next/server';

export function validateRequest(request: NextRequest) {
  // Add any common request validation logic here
  return {
    success: true,
    error: null
  };
}

export async function handleApiError(error: any) {
  console.error('API Error:', error);
  return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function createErrorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
