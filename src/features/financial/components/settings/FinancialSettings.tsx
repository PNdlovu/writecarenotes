import React from 'react';
import { useFinancial } from '../../hooks/useFinancial';

interface FinancialSettingsProps {
  tenantId: string;
}

export function FinancialSettings({ tenantId }: FinancialSettingsProps) {
  const { settings, loading, error, updateSettings } = useFinancial(tenantId);

  const handleChange = async (field: string, value: any) => {
    if (settings) {
      await updateSettings({ ...settings, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        {error.message}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
        No settings available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Financial Settings</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
            >
              <option value="GBP">British Pound (£)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>

          {/* Tax Rate */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => handleChange('taxRate', Number(e.target.value))}
              min={0}
              max={100}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Billing Cycle */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
            <select
              value={settings.billingCycle}
              onChange={(e) => handleChange('billingCycle', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
            </select>
          </div>

          {/* Payment Terms */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Payment Terms (days)</label>
            <input
              type="number"
              value={settings.paymentTerms}
              onChange={(e) => handleChange('paymentTerms', Number(e.target.value))}
              min={0}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Auto Invoicing */}
          <div className="col-span-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoInvoicing}
                onChange={(e) => handleChange('autoInvoicing', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Automatic Invoicing</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 


