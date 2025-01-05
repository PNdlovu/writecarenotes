export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

export const LATEST_API_VERSION = API_VERSIONS.V2;

export interface VersionConfig {
  version: ApiVersion;
  deprecated?: boolean;
  sunset?: Date;
  features: string[];
}

export const API_VERSION_CONFIGS: Record<ApiVersion, VersionConfig> = {
  [API_VERSIONS.V1]: {
    version: API_VERSIONS.V1,
    deprecated: true,
    sunset: new Date('2025-12-31'),
    features: ['basic-facility-management', 'departments'],
  },
  [API_VERSIONS.V2]: {
    version: API_VERSIONS.V2,
    deprecated: false,
    features: ['basic-facility-management', 'departments', 'compliance-tracking', 'advanced-analytics'],
  },
};


