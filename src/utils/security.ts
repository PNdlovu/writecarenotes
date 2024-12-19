import { NextApiRequest, NextApiResponse } from 'next';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export class SecurityService {
  private static readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds limit' };
    }

    return { valid: true };
  }

  static hasPermission(
    userRoles: Role[],
    resource: string,
    action: string
  ): boolean {
    return userRoles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.resource === resource &&
          permission.actions.includes(action as any)
      )
    );
  }

  static validateSession(req: NextApiRequest): boolean {
    const session = req.cookies['session'];
    if (!session) return false;
    
    // Add your session validation logic here
    return true;
  }

  static encryptDocument(content: string, key: string): string {
    // Implement document encryption using a secure encryption algorithm
    // This is a placeholder - use a proper encryption library in production
    return content;
  }

  static decryptDocument(encryptedContent: string, key: string): string {
    // Implement document decryption
    // This is a placeholder - use a proper encryption library in production
    return encryptedContent;
  }
}

// Middleware for role-based access control
export function withRoleCheck(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  requiredRole: string
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userRoles = req.session?.user?.roles || [];
    
    if (!SecurityService.validateSession(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!userRoles.includes(requiredRole)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    return handler(req, res);
  };
}


