/**
 * WriteCareNotes.com
 * @fileoverview API Client Configuration
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import axios from 'axios'
import { NextRequest } from 'next/server';
import { ApiError } from './errors';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors (401, 403, etc)
    return Promise.reject(error)
  }
)

export async function validateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new ApiError('Unauthorized', 401);
  }
  // Add more validation as needed
  return true;
}

export function createSuccessResponse(data: any, message?: string) {
  return Response.json({
    success: true,
    message,
    data,
  });
}

export function createErrorResponse(error: Error | ApiError, statusCode: number = 400) {
  const message = error instanceof ApiError ? error.message : 'An error occurred';
  const status = error instanceof ApiError ? error.statusCode : statusCode;
  
  return Response.json({
    success: false,
    message,
    error: error instanceof ApiError ? error.data : undefined,
  }, { status });
}
