import { ThirdPartyPayrollService, ProviderConfig } from './types';
import { XeroPayrollService } from './providers/xero';

export class PayrollProviderFactory {
  private static providers: Record<string, new () => ThirdPartyPayrollService> = {
    xero: XeroPayrollService,
    // Add more providers as they are implemented
    // quickbooks: QuickBooksPayrollService,
    // sage: SagePayrollService,
  };

  static async createProvider(config: ProviderConfig): Promise<ThirdPartyPayrollService> {
    const ProviderClass = this.providers[config.provider.toLowerCase()];
    if (!ProviderClass) {
      throw new Error(`Unsupported payroll provider: ${config.provider}`);
    }

    const provider = new ProviderClass();
    const connected = await provider.connect(config);
    
    if (!connected) {
      throw new Error(`Failed to connect to ${config.provider}`);
    }

    return provider;
  }

  static getSupportedProviders(): string[] {
    return Object.keys(this.providers);
  }
}


