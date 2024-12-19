import { User } from '@/types/core';
import { API_CONFIG, STORAGE_KEYS } from '@/config/app-config';
import { jwtDecode } from 'jwt-decode';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  tenantId: string;
  mfaCode?: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  exp: number;
}

class AuthService {
  private static instance: AuthService;
  private refreshPromise: Promise<AuthTokens> | null = null;
  private user: User | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const data = await response.json();
          if (data.mfaRequired) {
            throw new Error('MFA_REQUIRED');
          }
        }
        throw new Error('Invalid credentials');
      }

      const { accessToken, refreshToken, user } = await response.json();

      // Store tokens
      this.setTokens({ accessToken, refreshToken });
      
      // Store user
      this.user = user;
      
      // Record login in audit log
      await this.recordLoginAudit(user.id, true);

      return user;
    } catch (error) {
      // Record failed login attempt
      if (credentials.email) {
        await this.recordLoginAudit(credentials.email, false);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await fetch(`${API_CONFIG.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear tokens and user data regardless of logout API success
      this.clearAuth();
    }
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_CONFIG.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();
        this.setTokens(tokens);
        return tokens;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async validateMFA(mfaCode: string): Promise<User> {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/validate-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mfaCode }),
    });

    if (!response.ok) {
      throw new Error('Invalid MFA code');
    }

    const { accessToken, refreshToken, user } = await response.json();
    this.setTokens({ accessToken, refreshToken });
    this.user = user;

    return user;
  }

  async setupMFA(): Promise<{ qrCode: string; secret: string }> {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/setup-mfa`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to setup MFA');
    }

    return response.json();
  }

  async verifyMFASetup(code: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/verify-mfa-setup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify MFA setup');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.getAccessToken()) {
      return null;
    }

    try {
      if (this.user) {
        return this.user;
      }

      const response = await fetch(`${API_CONFIG.baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const user = await response.json();
      this.user = user;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.user = null;
  }

  private async recordLoginAudit(
    userIdentifier: string,
    success: boolean
  ): Promise<void> {
    try {
      await fetch(`${API_CONFIG.baseUrl}/audit/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIdentifier,
          success,
          timestamp: new Date(),
          ipAddress: await this.getClientIP(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Error recording login audit:', error);
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
}

export const authService = AuthService.getInstance();


