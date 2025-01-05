/**
 * @fileoverview Account Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Form component for creating and editing chart of accounts entries
 * with validation and regional support
 */

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account, AccountType, AccountCategory, accountSchema } from '../../types/accounting';
import { useAccountingStore } from '../../stores/accountingStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface AccountFormProps {
  initialData?: Account;
  onSubmit: (data: Account) => Promise<void>;
  onCancel: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation('accounting');
  const { accounts } = useAccountingStore();
  const { isOnline, queueOfflineEntry } = useOfflineSync();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      type: AccountType.ASSET,
      category: AccountCategory.CURRENT_ASSET,
      isActive: true
    }
  });

  const selectedType = watch('type');

  // Get available categories based on selected type
  const getAvailableCategories = (type: AccountType): AccountCategory[] => {
    switch (type) {
      case AccountType.ASSET:
        return [
          AccountCategory.CURRENT_ASSET,
          AccountCategory.FIXED_ASSET,
          AccountCategory.INTANGIBLE_ASSET
        ];
      case AccountType.LIABILITY:
        return [
          AccountCategory.CURRENT_LIABILITY,
          AccountCategory.LONG_TERM_LIABILITY
        ];
      case AccountType.EQUITY:
        return [
          AccountCategory.CAPITAL,
          AccountCategory.RETAINED_EARNINGS
        ];
      case AccountType.REVENUE:
        return [
          AccountCategory.OPERATING_REVENUE,
          AccountCategory.OTHER_REVENUE
        ];
      case AccountType.EXPENSE:
        return [
          AccountCategory.OPERATING_EXPENSE,
          AccountCategory.ADMINISTRATIVE_EXPENSE,
          AccountCategory.FINANCIAL_EXPENSE
        ];
      default:
        return [];
    }
  };

  // Get potential parent accounts based on selected type
  const getPotentialParents = (): Account[] => {
    return accounts.filter(account => 
      account.type === selectedType && 
      (!initialData || account.id !== initialData.id)
    );
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (!isOnline) {
        await queueOfflineEntry('account', data);
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('accounts.fields.code')}
          </label>
          <input
            type="text"
            {...register('code')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('accounts.fields.name')}
          </label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('accounts.fields.type')}
          </label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {Object.values(AccountType).map(type => (
              <option key={type} value={type}>
                {t(`accounts.types.${type.toLowerCase()}`)}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('accounts.fields.category')}
          </label>
          <select
            {...register('category')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {getAvailableCategories(selectedType).map(category => (
              <option key={category} value={category}>
                {t(`accounts.categories.${category.toLowerCase()}`)}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('accounts.fields.parent')}
        </label>
        <select
          {...register('parentId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">{t('common.none')}</option>
          {getPotentialParents().map(account => (
            <option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('accounts.fields.description')}
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label className="ml-2 block text-sm text-gray-900">
          {t('accounts.fields.isActive')}
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
}; 