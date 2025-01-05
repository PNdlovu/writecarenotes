/**
 * @fileoverview API client with interceptors, error handling, and retry logic
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { NetworkError, ApiError, ValidationError } from '@/lib/errors';

interface RequestConfig extends RequestInit {
  retry?: number;
  retryDelay?: number;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private defaultConfig: RequestConfig;

  constructor(baseUrl = '/api', defaultConfig: RequestConfig = {}) {
    this.baseUrl = baseUrl;
    this.defaultConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      retry: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...defaultConfig,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 400) {
        throw new ValidationError(data.message, data.errors);
      }
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        window.location.href = '/auth/login';
        throw new ApiError('Unauthorized', response.status);
      }
      if (response.status === 403) {
        throw new ApiError('Forbidden', response.status);
      }
      if (response.status === 404) {
        throw new ApiError('Not found', response.status);
      }
      if (response.status >= 500) {
        throw new ApiError('Server error', response.status);
      }
      throw new ApiError(data.message || 'Unknown error', response.status);
    }

    return { data };
  }

  private async fetchWithRetry<T>(url: string, config: RequestConfig): Promise<ApiResponse<T>> {
    const { retry = 3, retryDelay = 1000, timeout, ...fetchConfig } = config;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...fetchConfig,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof ApiError) {
          // Don't retry client errors (4xx)
          throw error;
        }
        
        if (attempt === retry) {
          throw new NetworkError('Network request failed', { cause: lastError });
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    throw lastError;
  }

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    return this.fetchWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    return this.fetchWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    return this.fetchWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    return this.fetchWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();


