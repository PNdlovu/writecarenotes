import { 
  AccountingProviderType,
  AccountingSync,
  TaxReport,
  SyncStatus,
  HMRCConfig
} from '../../types/accounting';
import { AccountingProviderAdapter } from './index';

export class HMRCAdapter extends AccountingProviderAdapter {
  private config: HMRCConfig;
  private token?: string;

  constructor(config: HMRCConfig) {
    super(config);
    this.config = config;
  }

  getType(): AccountingProviderType {
    return AccountingProviderType.HMRC;
  }

  async authenticate(): Promise<void> {
    const tokenUrl = this.config.environment === 'production'
      ? 'https://api.service.hmrc.gov.uk/oauth/token'
      : 'https://test-api.service.hmrc.gov.uk/oauth/token';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: this.config.scopes.join(' ')
      })
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with HMRC');
    }

    const data = await response.json();
    this.token = data.access_token;
  }

  async syncTransactions(startDate: Date, endDate: Date): Promise<AccountingSync> {
    if (!this.token) {
      await this.authenticate();
    }

    // Initialize sync record
    const sync: AccountingSync = {
      id: crypto.randomUUID(),
      providerId: 'HMRC',
      startDate,
      endDate,
      status: SyncStatus.IN_PROGRESS,
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0
    };

    try {
      // Fetch VAT obligations if VAT number is configured
      if (this.config.vatNumber) {
        await this.syncVATTransactions(startDate, endDate);
      }

      // Fetch PAYE transactions if employer reference is configured
      if (this.config.employerReference) {
        await this.syncPAYETransactions(startDate, endDate);
      }

      sync.status = SyncStatus.COMPLETED;
    } catch (error) {
      sync.status = SyncStatus.FAILED;
      sync.errors = [error.message];
    }

    return sync;
  }

  async submitTaxReturn(report: TaxReport): Promise<TaxReport> {
    if (!this.token) {
      await this.authenticate();
    }

    const baseUrl = this.config.environment === 'production'
      ? 'https://api.service.hmrc.gov.uk'
      : 'https://test-api.service.hmrc.gov.uk';

    // Submit VAT return
    if (this.config.vatNumber) {
      const vatResponse = await fetch(`${baseUrl}/organisations/vat/${this.config.vatNumber}/returns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          periodKey: report.period,
          vatDueSales: report.vatAmount,
          vatDueAcquisitions: 0,
          totalVatDue: report.vatAmount,
          vatReclaimedCurrPeriod: 0,
          netVatDue: report.vatAmount,
          totalValueSalesExVAT: report.totalIncome,
          totalValuePurchasesExVAT: report.totalExpenses,
          totalValueGoodsSuppliedExVAT: 0,
          totalAcquisitionsExVAT: 0,
          finalised: true
        })
      });

      if (!vatResponse.ok) {
        throw new Error('Failed to submit VAT return to HMRC');
      }

      const vatData = await vatResponse.json();
      report.hmrcReference = vatData.formBundleNumber;
      report.status = 'SUBMITTED';
      report.submittedAt = new Date();
    }

    return report;
  }

  private async syncVATTransactions(startDate: Date, endDate: Date): Promise<void> {
    const baseUrl = this.config.environment === 'production'
      ? 'https://api.service.hmrc.gov.uk'
      : 'https://test-api.service.hmrc.gov.uk';

    const response = await fetch(
      `${baseUrl}/organisations/vat/${this.config.vatNumber}/obligations?from=${startDate.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch VAT obligations from HMRC');
    }
  }

  private async syncPAYETransactions(startDate: Date, endDate: Date): Promise<void> {
    const baseUrl = this.config.environment === 'production'
      ? 'https://api.service.hmrc.gov.uk'
      : 'https://test-api.service.hmrc.gov.uk';

    const response = await fetch(
      `${baseUrl}/organisations/paye/${this.config.employerReference}/statements?fromDate=${startDate.toISOString().split('T')[0]}&toDate=${endDate.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch PAYE statements from HMRC');
    }
  }
}
