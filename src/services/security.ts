import { jwtDecode } from 'jwt-decode';

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface User {
  id: string;
  email: string;
  roles: string[];
  tenantId: string;
  sessionData: {
    lastLogin: Date;
    deviceInfo: string;
    ipAddress: string;
  };
}

class SecurityService {
  private currentUser: User | null = null;
  private roles: Map<string, Role> = new Map();

  async initialize() {
    // Load roles and permissions
    const response = await fetch('/api/roles');
    const roles: Role[] = await response.json();
    roles.forEach(role => this.roles.set(role.id, role));

    // Setup interceptors for API calls
    this.setupInterceptors();
  }

  async authenticate(token: string): Promise<User> {
    try {
      const decoded = jwtDecode(token);
      // Validate token claims
      this.validateTokenClaims(decoded);
      
      // Get user details
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const user = await response.json();
      this.currentUser = user;
      
      // Log authentication
      await this.auditLog('AUTH', 'User authenticated', {
        userId: user.id,
        deviceInfo: navigator.userAgent,
      });

      return user;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  hasPermission(resource: string, action: string): boolean {
    if (!this.currentUser) return false;

    return this.currentUser.roles.some(roleId => {
      const role = this.roles.get(roleId);
      return role?.permissions.some(
        perm => perm.resource === resource && perm.actions.includes(action as any)
      );
    });
  }

  async auditLog(
    action: string,
    description: string,
    metadata: Record<string, any>
  ) {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          userId: this.currentUser?.id,
          tenantId: this.currentUser?.tenantId,
          timestamp: new Date(),
          metadata: {
            ...metadata,
            userAgent: navigator.userAgent,
            ipAddress: await this.getClientIP(),
          },
        }),
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  private validateTokenClaims(claims: any) {
    const now = Math.floor(Date.now() / 1000);
    
    if (claims.exp && claims.exp < now) {
      throw new Error('Token has expired');
    }
    
    if (claims.nbf && claims.nbf > now) {
      throw new Error('Token not yet valid');
    }
    
    if (!claims.sub || !claims.tenantId) {
      throw new Error('Token missing required claims');
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private setupInterceptors() {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        // Add security headers
        init = {
          ...init,
          headers: {
            ...init?.headers,
            'X-Tenant-ID': this.currentUser?.tenantId || '',
            'X-Request-ID': crypto.randomUUID(),
          },
        };

        // Check permissions
        const resource = input.split('/')[2];
        const method = (init?.method || 'GET').toLowerCase();
        const action = method === 'post' ? 'create' :
                      method === 'put' ? 'update' :
                      method === 'delete' ? 'delete' : 'read';

        if (!this.hasPermission(resource, action)) {
          throw new Error('Permission denied');
        }
      }

      return originalFetch(input, init);
    };
  }
}

export const securityService = new SecurityService();


