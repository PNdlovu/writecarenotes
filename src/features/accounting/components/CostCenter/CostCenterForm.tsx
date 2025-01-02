/**
 * @fileoverview Cost Center Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Form component for creating and editing cost centers with validation
 */

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CostCenter, costCenterSchema } from '../../types/accounting';
import { useAccountingStore } from '../../stores/accountingStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface CostCenterFormProps {
  initialData?: CostCenter;
  organizationId: string;
  onSubmit: (data: CostCenter) => Promise<void>;
  onCancel: () => void;
}

export const CostCenterForm: React.FC<CostCenterFormProps> = ({
  initialData,
  organizationId,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation('accounting');
  const { costCenters } = useAccountingStore();
  const { isOnline, queueOfflineEntry } = useOfflineSync();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(costCenterSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      description: '',
      isActive: true,
      organizationId,
      parentId: null,
      budgetLimit: 0
    }
  });

  // Get potential parent cost centers (excluding self and children)
  const getPotentialParents = () => {
    return costCenters.filter(cc => 
      cc.organizationId === organizationId && 
      (!initialData || cc.id !== initialData.id) &&
      cc.isActive
    );
  };

  const handleFormSubmit = async (data: CostCenter) => {
    try {
      setIsSubmitting(true);

      if (!isOnline) {
        await queueOfflineEntry('costCenter', data);
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit cost center:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('costCenters.fields.code')}
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
            {t('costCenters.fields.name')}
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

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('costCenters.fields.description')}
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('costCenters.fields.parent')}
        </label>
        <select
          {...register('parentId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">{t('common.none')}</option>
          {getPotentialParents().map(cc => (
            <option key={cc.id} value={cc.id}>
              {cc.code} - {cc.name}
            </option>
          ))}
        </select>
        {errors.parentId && (
          <p className="mt-1 text-sm text-red-600">{errors.parentId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('costCenters.fields.budgetLimit')}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">£</span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('budgetLimit')}
            className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm"
          />
        </div>
        {errors.budgetLimit && (
          <p className="mt-1 text-sm text-red-600">{errors.budgetLimit.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label className="ml-2 block text-sm text-gray-900">
          {t('costCenters.fields.isActive')}
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
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 