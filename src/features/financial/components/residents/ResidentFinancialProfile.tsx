import React, { useEffect, useState } from 'react';
import { useFinancial } from '../../hooks/useFinancial';
import { ResidentFinancial } from '../../types/financial.types';

interface ResidentFinancialProfileProps {
  tenantId: string;
  residentId: string;
}

export function ResidentFinancialProfile({ tenantId, residentId }: ResidentFinancialProfileProps) {
  const { settings, loading, error, getResidentFinancial, updateResidentFinancial } = useFinancial(tenantId);
  const [profile, setProfile] = useState<ResidentFinancial | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [residentId]);

  const loadProfile = async () => {
    const data = await getResidentFinancial(residentId);
    setProfile(data);
  };

  const handleChange = async (field: string, value: any) => {
    if (profile) {
      const updatedProfile = { ...profile, [field]: value };
      setProfile(updatedProfile);
    }
  };

  const handleSubmit = async () => {
    if (profile) {
      try {
        setSaving(true);
        await updateResidentFinancial(residentId, profile);
      } finally {
        setSaving(false);
      }
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

  if (!profile || !settings) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
        No financial profile available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Resident Financial Profile</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Funding Type */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Funding Type</label>
            <select
              value={profile.fundingType}
              onChange={(e) => handleChange('fundingType', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
            >
              <option value="SELF_FUNDED">Self Funded</option>
              <option value="LOCAL_AUTHORITY">Local Authority</option>
              <option value="NHS">NHS</option>
              <option value="MIXED">Mixed Funding</option>
            </select>
          </div>

          {/* Weekly Fee */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Weekly Fee</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {settings.currency === 'GBP' ? '£' : settings.currency === 'EUR' ? '€' : '$'}
                </span>
              </div>
              <input
                type="number"
                value={profile.weeklyFee}
                onChange={(e) => handleChange('weeklyFee', Number(e.target.value))}
                className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Contribution Fields */}
          {profile.fundingType === 'MIXED' && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Local Authority Contribution</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {settings.currency === 'GBP' ? '£' : settings.currency === 'EUR' ? '€' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={profile.localAuthorityContribution || 0}
                    onChange={(e) => handleChange('localAuthorityContribution', Number(e.target.value))}
                    className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">NHS Contribution</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {settings.currency === 'GBP' ? '£' : settings.currency === 'EUR' ? '€' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={profile.nhsContribution || 0}
                    onChange={(e) => handleChange('nhsContribution', Number(e.target.value))}
                    className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Personal Contribution</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {settings.currency === 'GBP' ? '£' : settings.currency === 'EUR' ? '€' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={profile.personalContribution || 0}
                    onChange={(e) => handleChange('personalContribution', Number(e.target.value))}
                    className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </>
          )}

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={profile.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
            >
              <option value="DIRECT_DEBIT">Direct Debit</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          {/* Billing Contact */}
          <div className="col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    value={profile.billingContact?.name || ''}
                    onChange={(e) => handleChange('billingContact', {
                      ...profile.billingContact,
                      name: e.target.value
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={profile.billingContact?.email || ''}
                    onChange={(e) => handleChange('billingContact', {
                      ...profile.billingContact,
                      email: e.target.value
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={profile.billingContact?.phone || ''}
                    onChange={(e) => handleChange('billingContact', {
                      ...profile.billingContact,
                      phone: e.target.value
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Contact Address</label>
                  <textarea
                    rows={2}
                    value={profile.billingContact?.address || ''}
                    onChange={(e) => handleChange('billingContact', {
                      ...profile.billingContact,
                      address: e.target.value
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
} 


