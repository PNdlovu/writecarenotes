import { AppConfigurationClient } from '@azure/app-configuration'
import { DefaultAzureCredential } from '@azure/identity'

interface AzureConfig {
  ai: {
    openai: {
      endpoint: string
      apiKey: string
      deploymentName: string
      maxTokens: number
    }
    cognitive: {
      endpoint: string
      apiKey: string
      maxBatchSize: number
    }
  }
  costManagement: {
    maxDailyTokens: number
    maxMonthlyTokens: number
    maxDailyAPICalls: number
  }
  featureFlags: {
    useAdvancedAI: boolean
    use3DVisualization: boolean
  }
}

export class AzureConfigService {
  private static instance: AzureConfigService
  private client: AppConfigurationClient
  private cache: Map<string, { value: any; timestamp: number }>
  private readonly cacheDuration = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    const connectionString = process.env.AZURE_APP_CONFIG_CONNECTION_STRING
    const credential = new DefaultAzureCredential()

    this.client = connectionString
      ? new AppConfigurationClient(connectionString)
      : new AppConfigurationClient(
          process.env.AZURE_APP_CONFIG_ENDPOINT!,
          credential
        )

    this.cache = new Map()
  }

  public static getInstance(): AzureConfigService {
    if (!AzureConfigService.instance) {
      AzureConfigService.instance = new AzureConfigService()
    }
    return AzureConfigService.instance
  }

  private async getConfigurationSetting(key: string): Promise<any> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.value
    }

    const setting = await this.client.getConfigurationSetting({ key })
    const value = JSON.parse(setting.value || '{}')
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })

    return value
  }

  public async getConfig(): Promise<AzureConfig> {
    const [aiConfig, costConfig, featureFlags] = await Promise.all([
      this.getConfigurationSetting('ai'),
      this.getConfigurationSetting('costManagement'),
      this.getConfigurationSetting('featureFlags')
    ])

    return {
      ai: aiConfig,
      costManagement: costConfig,
      featureFlags: featureFlags
    }
  }

  public async getFeatureFlag(flag: keyof AzureConfig['featureFlags']): Promise<boolean> {
    const flags = await this.getConfigurationSetting('featureFlags')
    return flags[flag] ?? false
  }

  public async refreshConfig(): Promise<void> {
    this.cache.clear()
    await this.getConfig()
  }
}

export const azureConfigService = AzureConfigService.getInstance()
