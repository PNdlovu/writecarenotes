import { authService } from './authService';
import { API_CONFIG } from '@/config/app-config';

interface RequestConfig extends RequestInit {
  tenant?: string;
  requiresAuth?: boolean;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private defaultTimeout: number;

  private constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.defaultTimeout = 30000; // 30 seconds
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      tenant,
      requiresAuth = true,
      timeout = this.defaultTimeout,
      ...requestConfig
    } = config;

    // Merge headers
    const headers = new Headers(requestConfig.headers || {});
    
    // Add tenant header if provided
    if (tenant) {
      headers.set('X-Tenant-ID', tenant);
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Add default headers
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    // Create fetch promise with timeout
    const fetchPromise = fetch(`${this.baseUrl}${endpoint}`, {
      ...requestConfig,
      headers,
    });

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });

    try {
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && requiresAuth) {
        try {
          await authService.refreshAccessToken();
          // Retry request with new token
          return this.request<T>(endpoint, config);
        } catch (refreshError) {
          // If refresh fails, throw authentication error
          throw new Error('Authentication failed');
        }
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Parse successful response
      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      // Enhance error with request details
      error.endpoint = endpoint;
      error.config = { ...config, headers: Object.fromEntries(headers) };
      throw error;
    }
  }

  // Convenience methods for common HTTP methods
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
    return response.data;
  }

  // Batch request handling
  async batch<T>(
    requests: Array<{
      endpoint: string;
      config?: RequestConfig;
    }>
  ): Promise<T[]> {
    return Promise.all(
      requests.map(({ endpoint, config }) =>
        this.request(endpoint, config).then((response) => response.data)
      )
    );
  }

  // Upload handling with progress
  async upload(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    config: RequestConfig = {}
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseUrl}${endpoint}`);

      // Add headers
      const token = authService.getAccessToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      if (config.tenant) {
        xhr.setRequestHeader('X-Tenant-ID', config.tenant);
      }

      xhr.send(formData);
    });
  }
}

export const apiClient = ApiClient.getInstance();


