/**
 * @fileoverview VAT Return Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * VAT Return form component with regional validation and offline support
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountingStore } from '../../stores/accountingStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { VATReturn, vatReturnSchema } from '../../types/accounting';

interface VATReturnFormProps {
  initialData?: VATReturn;
  period: {
    startDate: Date;
    endDate: Date;
  };
  organizationId: string;
  onSubmit: (data: VATReturn) => Promise<void>;
  onCancel: () => void;
}

export const VATReturnForm: React.FC<VATReturnFormProps> = ({
  initialData,
  period,
  organizationId,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation('accounting');
  const { formatCurrency, formatDate, getVATRate } = useRegionalCompliance();
  const { accounts } = useAccountingStore();
  const { isOnline, queueOfflineEntry } = useOfflineSync();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(vatReturnSchema),
    defaultValues: initialData || {
      organizationId,
      period: {
        startDate: period.startDate,
        endDate: period.endDate
      },
      salesVAT: 0,
      purchasesVAT: 0,
      adjustments: 0,
      totalVAT: 0,
      status: 'DRAFT'
    }
  });

  const watchedValues = watch(['salesVAT', 'purchasesVAT', 'adjustments']);

  // Calculate totals
  const totals = useMemo(() => {
    const salesVAT = parseFloat(watchedValues[0] || '0');
    const purchasesVAT = parseFloat(watchedValues[1] || '0');
    const adjustments = parseFloat(watchedValues[2] || '0');
    const totalVAT = salesVAT - purchasesVAT + adjustments;

    return {
      salesVAT,
      purchasesVAT,
      adjustments,
      totalVAT
    };
  }, [watchedValues]);

  // Update total VAT when values change
  React.useEffect(() => {
    setValue('totalVAT', totals.totalVAT);
  }, [totals.totalVAT, setValue]);

  const handleFormSubmit = async (data: VATReturn) => {
    try {
      setIsSubmitting(true);

      if (!isOnline) {
        await queueOfflineEntry('vatReturn', data);
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit VAT return:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {t('tax.vatReturn')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('tax.period')} {formatDate(period.startDate)} - {formatDate(period.endDate)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('tax.fields.salesVAT')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              step="0.01"
              {...register('salesVAT')}
              className="mt-1 block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                @ {getVATRate()}%
              </span>
            </div>
          </div>
          {errors.salesVAT && (
            <p className="mt-1 text-sm text-red-600">{errors.salesVAT.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('tax.fields.purchasesVAT')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              step="0.01"
              {...register('purchasesVAT')}
              className="mt-1 block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                @ {getVATRate()}%
              </span>
            </div>
          </div>
          {errors.purchasesVAT && (
            <p className="mt-1 text-sm text-red-600">{errors.purchasesVAT.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('tax.fields.adjustments')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              step="0.01"
              {...register('adjustments')}
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm"
            />
          </div>
          {errors.adjustments && (
            <p className="mt-1 text-sm text-red-600">{errors.adjustments.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('tax.fields.totalVAT')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              step="0.01"
              {...register('totalVAT')}
              disabled
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('tax.fields.notes')}
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('tax.fields.salesVAT')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(totals.salesVAT)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('tax.fields.purchasesVAT')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(totals.purchasesVAT)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('tax.fields.totalVAT')}
            </dt>
            <dd className={`mt-1 text-lg font-semibold ${totals.totalVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totals.totalVAT)}
            </dd>
          </div>
        </dl>
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