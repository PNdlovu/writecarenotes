import { UKRegion } from '../types/region.types';
import { logger } from '../../../utils/logger';
import { ConfigService } from '../../../config/configService';
import { cache } from '../../../utils/cache';
import axios, { AxiosInstance } from 'axios';

/**
 * Service for managing external API integrations with regional healthcare systems
 */
export class RegionalApiService {
  private static instance: RegionalApiService;
  private readonly apiClients: Map<string, AxiosInstance>;
  private config: ConfigService;

  private constructor() {
    this.config = ConfigService.getInstance();
    this.apiClients = new Map();
    this.initializeApiClients();
  }

  public static getInstance(): RegionalApiService {
    if (!RegionalApiService.instance) {
      RegionalApiService.instance = new RegionalApiService();
    }
    return RegionalApiService.instance;
  }

  /**
   * NHS Integration (England)
   */
  async connectToNHS(regionCode: UKRegion): Promise<any> {
    try {
      const client = this.getApiClient('NHS');
      const response = await client.get(`/api/v1/region/${regionCode}/health-services`);
      logger.info(`Successfully connected to NHS API for region: ${regionCode}`);
      return response.data;
    } catch (error) {
      logger.error(`NHS API connection failed for region ${regionCode}:`, error);
      throw new Error(`NHS API connection failed: ${error.message}`);
    }
  }

  /**
   * HSE Integration (Ireland)
   */
  async connectToHSE(regionCode: UKRegion): Promise<any> {
    try {
      const client = this.getApiClient('HSE');
      const response = await client.get(`/api/v1/region/${regionCode}/services`);
      logger.info(`Successfully connected to HSE API for region: ${regionCode}`);
      return response.data;
    } catch (error) {
      logger.error(`HSE API connection failed for region ${regionCode}:`, error);
      throw new Error(`HSE API connection failed: ${error.message}`);
    }
  }

  /**
   * NHS Wales Integration
   */
  async connectToNHSWales(regionCode: UKRegion): Promise<any> {
    try {
      const client = this.getApiClient('NHS_WALES');
      const response = await client.get(`/api/v1/region/${regionCode}/health-services`);
      logger.info(`Successfully connected to NHS Wales API for region: ${regionCode}`);
      return response.data;
    } catch (error) {
      logger.error(`NHS Wales API connection failed for region ${regionCode}:`, error);
      throw new Error(`NHS Wales API connection failed: ${error.message}`);
    }
  }

  /**
   * NHS Scotland Integration
   */
  async connectToNHSScotland(regionCode: UKRegion): Promise<any> {
    try {
      const client = this.getApiClient('NHS_SCOTLAND');
      const response = await client.get(`/api/v1/region/${regionCode}/health-services`);
      logger.info(`Successfully connected to NHS Scotland API for region: ${regionCode}`);
      return response.data;
    } catch (error) {
      logger.error(`NHS Scotland API connection failed for region ${regionCode}:`, error);
      throw new Error(`NHS Scotland API connection failed: ${error.message}`);
    }
  }

  /**
   * Local Authority API Integration
   */
  async connectToLocalAuthority(regionCode: UKRegion): Promise<any> {
    try {
      const client = this.getApiClient('LOCAL_AUTHORITY');
      const response = await client.get(`/api/v1/region/${regionCode}/services`);
      logger.info(`Successfully connected to Local Authority API for region: ${regionCode}`);
      return response.data;
    } catch (error) {
      logger.error(`Local Authority API connection failed for region ${regionCode}:`, error);
      throw new Error(`Local Authority API connection failed: ${error.message}`);
    }
  }

  /**
   * Emergency Services Integration
   */
  async connectToEmergencyServices(regionCode: UKRegion): Promise<any> {
    try {
      const client = this.getApiClient('EMERGENCY_SERVICES');
      const response = await client.get(`/api/v1/region/${regionCode}/emergency`);
      logger.info(`Successfully connected to Emergency Services API for region: ${regionCode}`);
      return response.data;
    } catch (error) {
      logger.error(`Emergency Services API connection failed for region ${regionCode}:`, error);
      throw new Error(`Emergency Services API connection failed: ${error.message}`);
    }
  }

  private initializeApiClients(): void {
    const apiConfigs = {
      NHS: {
        baseURL: this.config.get('NHS_API_URL'),
        headers: {
          'Authorization': `Bearer ${this.config.get('NHS_API_KEY')}`,
          'X-API-Version': '1.0'
        }
      },
      HSE: {
        baseURL: this.config.get('HSE_API_URL'),
        headers: {
          'Authorization': `Bearer ${this.config.get('HSE_API_KEY')}`,
          'X-API-Version': '1.0'
        }
      },
      NHS_WALES: {
        baseURL: this.config.get('NHS_WALES_API_URL'),
        headers: {
          'Authorization': `Bearer ${this.config.get('NHS_WALES_API_KEY')}`,
          'X-API-Version': '1.0'
        }
      },
      NHS_SCOTLAND: {
        baseURL: this.config.get('NHS_SCOTLAND_API_URL'),
        headers: {
          'Authorization': `Bearer ${this.config.get('NHS_SCOTLAND_API_KEY')}`,
          'X-API-Version': '1.0'
        }
      },
      LOCAL_AUTHORITY: {
        baseURL: this.config.get('LOCAL_AUTHORITY_API_URL'),
        headers: {
          'Authorization': `Bearer ${this.config.get('LOCAL_AUTHORITY_API_KEY')}`,
          'X-API-Version': '1.0'
        }
      },
      EMERGENCY_SERVICES: {
        baseURL: this.config.get('EMERGENCY_SERVICES_API_URL'),
        headers: {
          'Authorization': `Bearer ${this.config.get('EMERGENCY_SERVICES_API_KEY')}`,
          'X-API-Version': '1.0'
        }
      }
    };

    Object.entries(apiConfigs).forEach(([name, config]) => {
      this.apiClients.set(name, axios.create(config));
    });
  }

  private getApiClient(name: string): AxiosInstance {
    const client = this.apiClients.get(name);
    if (!client) {
      throw new Error(`API client not found: ${name}`);
    }
    return client;
  }
}
