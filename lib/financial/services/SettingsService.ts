import { FinancialSettings } from '../types';
import { FinancialDB } from '../db';

export class SettingsService {
  constructor(private db: FinancialDB) {}

  async initializeSettings(settings: FinancialSettings): Promise<void> {
    await this.db.updateSettings(settings);
  }

  async getSettings(): Promise<FinancialSettings | null> {
    return this.db.getSettings();
  }

  async updateSettings(updates: Partial<FinancialSettings>): Promise<FinancialSettings> {
    const currentSettings = await this.getSettings();
    if (!currentSettings) {
      throw new Error('Settings not initialized');
    }

    return this.db.updateSettings(updates);
  }

  async validateSettings(settings: FinancialSettings): Promise<boolean> {
    // Add validation logic for each settings section
    try {
      this.validateOrganizationSettings(settings.organization);
      this.validateInvoicingSettings(settings.invoicing);
      this.validatePaymentSettings(settings.payments);
      this.validateNotificationSettings(settings.notifications);
      this.validateComplianceSettings(settings.compliance);
      return true;
    } catch (error) {
      console.error('Settings validation failed:', error);
      return false;
    }
  }

  private validateOrganizationSettings(settings: FinancialSettings['organization']): void {
    if (!settings.name) {
      throw new Error('Organization name is required');
    }
    if (!settings.fiscalYearStart || !/^(0[1-9]|1[0-2])$/.test(settings.fiscalYearStart)) {
      throw new Error('Invalid fiscal year start month');
    }
    if (!settings.defaultCurrency || !/^[A-Z]{3}$/.test(settings.defaultCurrency)) {
      throw new Error('Invalid currency code');
    }
  }

  private validateInvoicingSettings(settings: FinancialSettings['invoicing']): void {
    if (!settings.prefix) {
      throw new Error('Invoice prefix is required');
    }
    if (typeof settings.defaultDueDays !== 'number' || settings.defaultDueDays < 0) {
      throw new Error('Invalid default due days');
    }
  }

  private validatePaymentSettings(settings: FinancialSettings['payments']): void {
    if (!Array.isArray(settings.methods) || settings.methods.length === 0) {
      throw new Error('At least one payment method is required');
    }
    if (settings.gateway) {
      if (!settings.gateway.provider) {
        throw new Error('Payment gateway provider is required');
      }
      if (!settings.gateway.apiKey) {
        throw new Error('Payment gateway API key is required');
      }
    }
  }

  private validateNotificationSettings(settings: FinancialSettings['notifications']): void {
    if (typeof settings.invoiceGenerated !== 'boolean') {
      throw new Error('Invalid invoice generated notification setting');
    }
    if (typeof settings.paymentReceived !== 'boolean') {
      throw new Error('Invalid payment received notification setting');
    }
    if (typeof settings.paymentOverdue !== 'boolean') {
      throw new Error('Invalid payment overdue notification setting');
    }
  }

  private validateComplianceSettings(settings: FinancialSettings['compliance']): void {
    if (typeof settings.dataRetentionYears !== 'number' || settings.dataRetentionYears < 1) {
      throw new Error('Invalid data retention period');
    }
    if (typeof settings.vatEnabled !== 'boolean') {
      throw new Error('Invalid VAT enabled setting');
    }
    if (settings.vatEnabled && !settings.vatNumber) {
      throw new Error('VAT number is required when VAT is enabled');
    }
  }
}
