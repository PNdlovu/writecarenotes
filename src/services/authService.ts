/**
 * WriteCareNotes.com
 * @fileoverview Authentication Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { User } from '@/types/core';
import { API_CONFIG, STORAGE_KEYS } from '@/config/app-config';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, isAfter } from 'date-fns';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  region: string;
  mfaCode?: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  region: string;
  roles: string[];
  exp: number;
}

interface MagicLinkRequest {
  email: string;
  region: string;
  ipAddress: string;
  userAgent: string;
}

interface MagicLinkVerification {
  token: string;
  region: string;
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
      await this.recordLoginAudit({
        success: true,
        region: credentials.region,
        ipAddress: await this.getClientIP(),
        method: 'PASSWORD',
      });

      return user;
    } catch (error) {
      // Record failed login attempt
      if (credentials.email) {
        await this.recordLoginAudit({
          success: false,
          region: credentials.region,
          ipAddress: await this.getClientIP(),
          method: 'PASSWORD',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  }

  async sendMagicLink(request: MagicLinkRequest): Promise<void> {
    try {
      // Generate secure token
      const token = uuidv4();
      const expiresAt = addMinutes(new Date(), 30); // 30 minutes expiry

      // Store magic link details
      await fetch(`${API_CONFIG.baseUrl}/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
          region: request.region,
          token,
          expiresAt,
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
        }),
      });

      // Send email with magic link
      await fetch(`${API_CONFIG.baseUrl}/auth/send-magic-link-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
          region: request.region,
          token,
        }),
      });
    } catch (error) {
      throw new Error('Failed to send magic link');
    }
  }

  async verifyMagicLink(verification: MagicLinkVerification): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth/verify-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verification),
      });

      if (!response.ok) {
        throw new Error('Invalid or expired magic link');
      }

      const { accessToken, refreshToken, user } = await response.json();

      // Store tokens
      this.setTokens({ accessToken, refreshToken });
      
      // Store user
      this.user = user;

      // Record successful login
      await this.recordLoginAudit({
        success: true,
        region: verification.region,
        ipAddress: await this.getClientIP(),
        method: 'MAGIC_LINK',
      });

      return user;
    } catch (error) {
      // Record failed verification
      await this.recordLoginAudit({
        success: false,
        region: verification.region,
        ipAddress: await this.getClientIP(),
        method: 'MAGIC_LINK',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async checkUserExists(email: string, region: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/auth/check-user?email=${encodeURIComponent(email)}&region=${region}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check user existence');
      }

      const { exists } = await response.json();
      return exists;
    } catch (error) {
      throw new Error('Failed to check user existence');
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

  async recordLoginAudit(data: {
    success: boolean;
    region: string;
    ipAddress: string;
    method: 'PASSWORD' | 'MAGIC_LINK' | 'MAGIC_LINK_REQUEST';
    error?: string;
  }): Promise<void> {
    try {
      await fetch(`${API_CONFIG.baseUrl}/audit/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Error recording login audit:', error);
    }
  }

  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }

  private getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.user = null;
  }
}

export const authService = AuthService.getInstance();


