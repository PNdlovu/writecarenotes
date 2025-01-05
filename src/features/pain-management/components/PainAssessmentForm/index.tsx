/**
 * @fileoverview Pain Assessment Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author [Your Name]
 * @copyright Write Care Notes Ltd
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTenantContext } from '@/lib/multi-tenant/hooks';
import { PainAssessmentService } from '../../services/painAssessmentService';
import { PainScale, PainType, PainAssessment } from '../../types';
import { painAssessmentSchema } from './validation';
import { useTranslation } from 'next-i18next';
import { useOfflinePainAssessment } from '../../hooks/useOfflinePainAssessment';
import { painScaleConfig } from '../../config/regional';

interface PainAssessmentFormProps {
  residentId: string;
  onSuccess: (assessment: PainAssessment) => void;
  onError: (error: Error) => void;
}

export function PainAssessmentForm({ residentId, onSuccess, onError }: PainAssessmentFormProps) {
  const { t } = useTranslation('pain-management');
  const { saveAssessment, isOnline, pendingSync } = useOfflinePainAssessment();
  const tenantContext = useTenantContext();
  const regionalConfig = painScaleConfig[tenantContext.region];
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(painAssessmentSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const assessment = await saveAssessment({
        residentId,
        ...data,
        assessmentDate: new Date(),
        tenantId: tenantContext.tenantId
      });

      onSuccess(assessment);
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!isOnline && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">
            {t('offlineMode')} 
            {pendingSync.length > 0 && t('pendingSyncCount', { count: pendingSync.length })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pain Scale Selection - Now region-aware */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('painScale')}
          </label>
          <select
            {...register('painScale')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {regionalConfig.scales.map(scale => (
              <option key={scale} value={scale}>{t(`scales.${scale}`)}</option>
            ))}
          </select>
          {errors.painScale && (
            <p className="mt-1 text-sm text-red-600">{t(errors.painScale.message)}</p>
          )}
        </div>

        {/* Pain Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pain Score (0-10)
          </label>
          <input
            type="number"
            {...register('painScore')}
            min={0}
            max={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.painScore && (
            <p className="mt-1 text-sm text-red-600">{errors.painScore.message}</p>
          )}
        </div>

        {/* Pain Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pain Type
          </label>
          <select
            {...register('painType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {Object.values(PainType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.painType && (
            <p className="mt-1 text-sm text-red-600">{errors.painType.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pain Location
          </label>
          <input
            type="text"
            {...register('location')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="e.g., Lower back, Left knee"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Region-specific requirements */}
      {regionalConfig.requiresDoubleSignOff && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            {t('secondAssessor')}
          </label>
          <input
            type="text"
            {...register('secondAssessor')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? t('saving') : t('saveAssessment')}
        </button>
      </div>
    </form>
  );
} 