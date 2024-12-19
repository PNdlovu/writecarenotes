import { 
  AccountingProvider, 
  AccountingProviderType,
  AccountingTransaction,
  TaxReport,
  AccountingSync,
  HMRCConfig
} from '../../types/accounting';

export class AccountingService {
  private providers: Map<string, AccountingProviderAdapter>;

  constructor() {
    this.providers = new Map();
  }

  async registerProvider(provider: AccountingProvider): Promise<void> {
    const adapter = this.createProviderAdapter(provider);
    this.providers.set(provider.id, adapter);
  }

  async unregisterProvider(providerId: string): Promise<void> {
    this.providers.delete(providerId);
  }

  async syncTransactions(providerId: string, startDate: Date, endDate: Date): Promise<AccountingSync> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }
    return provider.syncTransactions(startDate, endDate);
  }

  async submitTaxReturn(report: TaxReport): Promise<TaxReport> {
    const hmrcProvider = Array.from(this.providers.values())
      .find(p => p.getType() === AccountingProviderType.HMRC);
    
    if (!hmrcProvider) {
      throw new Error('HMRC provider not configured');
    }

    return hmrcProvider.submitTaxReturn(report);
  }

  private createProviderAdapter(provider: AccountingProvider): AccountingProviderAdapter {
    switch (provider.type) {
      case AccountingProviderType.XERO:
        return new XeroAdapter(provider.config);
      case AccountingProviderType.QUICKBOOKS:
        return new QuickBooksAdapter(provider.config);
      case AccountingProviderType.SAGE:
        return new SageAdapter(provider.config);
      case AccountingProviderType.HMRC:
        return new HMRCAdapter(provider.config);
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }
}

abstract class AccountingProviderAdapter {
  protected config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  abstract getType(): AccountingProviderType;
  abstract syncTransactions(startDate: Date, endDate: Date): Promise<AccountingSync>;
  abstract submitTaxReturn?(report: TaxReport): Promise<TaxReport>;
}
