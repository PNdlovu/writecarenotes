/**
 * @fileoverview Server-side authentication utilities
 * @version 1.0.0
 * @created 2024-03-21
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

/**
 * Get auth headers for server components
 */
export async function getAuthHeadersServer() {
  const session = await getServerSession(authOptions);
  return session ? { Authorization: `Bearer ${session.user?.id}` } : {};
}

/**
 * Get current session on server side
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if user is authenticated on server side
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

/**
 * Get current user on server side
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
} 


