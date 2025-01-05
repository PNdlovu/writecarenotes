import { Request, Response, NextFunction } from 'express';
import { TelehealthError } from '../errors/TelehealthError';

declare global {
  namespace Express {
    interface User {
      id: string;
      organizationId: string;
      region: string;
      roles: string[];
    }
  }
}

export function authMiddleware(requiredPermissions?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new TelehealthError('Authentication required', 401);
      }

      // Verify token and get user
      // This is a mock implementation - replace with your actual auth logic
      const user = await verifyToken(token);
      req.user = user;

      // Check permissions if required
      if (requiredPermissions?.length) {
        const hasPermission = requiredPermissions.every(permission =>
          user.roles.includes(permission)
        );
        if (!hasPermission) {
          throw new TelehealthError('Insufficient permissions', 403);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function verifyToken(token: string): Promise<Express.User> {
  // Mock implementation - replace with actual token verification
  return {
    id: 'user-123',
    organizationId: 'org-123',
    region: 'UK_CQC',
    roles: ['CREATE_CONSULTATION', 'VIEW_CONSULTATION', 'CREATE_VIDEO_SESSION']
  };
} 