/**
 * @fileoverview Authentication logging service
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '../prisma';
import type { NextApiRequest } from 'next';

export type AuthAction = 'SIGNIN' | 'SIGNUP' | 'SIGNOUT' | 'FAILED_ATTEMPT' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';

interface AuthLogParams {
  userId?: string;
  action: AuthAction;
  success?: boolean;
  error?: string;
  request?: NextApiRequest;
  metadata?: Record<string, any>;
}

export class AuthLogger {
  static async log({
    userId,
    action,
    success = true,
    error,
    request,
    metadata = {}
  }: AuthLogParams) {
    try {
      const ip = request?.headers['x-forwarded-for'] || request?.socket.remoteAddress;
      const userAgent = request?.headers['user-agent'];

      await prisma.authLog.create({
        data: {
          userId,
          action,
          success,
          ip: typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : undefined,
          userAgent,
          error,
          metadata: {
            ...metadata,
            headers: request?.headers ? Object.fromEntries(
              Object.entries(request.headers).filter(([key]) => 
                !['cookie', 'authorization'].includes(key.toLowerCase())
              )
            ) : undefined
          }
        }
      });
    } catch (error) {
      console.error('Failed to create auth log:', error);
      // Don't throw - logging should never break the auth flow
    }
  }

  static async getRecentLogs(userId: string, limit = 10) {
    return prisma.authLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async getFailedAttempts(userId: string, minutes = 15) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    return prisma.authLog.count({
      where: {
        userId,
        action: 'FAILED_ATTEMPT',
        createdAt: { gte: since }
      }
    });
  }
} 


