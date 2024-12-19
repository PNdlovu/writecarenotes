import { LATEST_API_VERSION, type ApiVersion } from '@/config/api-versions';

interface ApiClientConfig {
  baseUrl: string;
  version?: ApiVersion;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private version: ApiVersion;

  constructor({ baseUrl, version = LATEST_API_VERSION }: ApiClientConfig) {
    this.baseUrl = baseUrl;
    this.version = version;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    
    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}/${this.version}/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Add version header
    const headers = new Headers(init.headers);
    headers.set('x-api-version', this.version);

    const response = await fetch(url.toString(), {
      ...init,
      headers,
    });

    // Check for deprecated version warning
    const warning = response.headers.get('Warning');
    if (warning) {
      console.warn('API Version Warning:', warning);
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // API Methods
  async getFacility(id: string) {
    return this.request(`facility/${id}`);
  }

  // Version upgrade helper
  upgradeToVersion(version: ApiVersion) {
    this.version = version;
    return this;
  }
}


