/**
 * @writecarenotes.com
 * @fileoverview Incident form component for creating and editing incidents
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React component for incident form handling. Provides a comprehensive
 * form for creating and editing incidents with validation, error handling,
 * and offline support. Implements accessibility features and responsive
 * design for optimal user experience across devices.
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, Select, FormControl, FormHelperText } from '@/components/ui';
import { useIncidentForm } from '../hooks/useIncidentForm';
import { IncidentFormProps, IncidentType, IncidentSeverity } from '../types';
import { validateIncident } from '../api/validation';

export const IncidentForm: React.FC<IncidentFormProps> = ({
  incident,
  onSubmit,
  onSaveDraft,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(validateIncident),
    defaultValues: incident || {
      type: IncidentType.OTHER,
      severity: IncidentSeverity.MINOR,
      description: '',
      location: '',
      immediateActions: [],
      notificationsSent: false,
      safeguardingReferral: false,
      cqcReportable: false,
    },
  });

  const { handleSaveDraft, isOffline } = useIncidentForm({
    onSaveDraft,
    formData: incident,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl error={!!errors.type}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Incident Type"
                options={Object.values(IncidentType).map(type => ({
                  value: type,
                  label: type.replace(/_/g, ' '),
                }))}
                error={!!errors.type}
                helperText={errors.type?.message}
                required
              />
            )}
          />
        </FormControl>

        <FormControl error={!!errors.severity}>
          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Severity"
                options={Object.values(IncidentSeverity).map(severity => ({
                  value: severity,
                  label: severity,
                }))}
                error={!!errors.severity}
                helperText={errors.severity?.message}
                required
              />
            )}
          />
        </FormControl>
      </div>

      <FormControl error={!!errors.description}>
        <TextField
          {...register('description')}
          label="Description"
          multiline
          rows={4}
          error={!!errors.description}
          helperText={errors.description?.message}
          required
        />
      </FormControl>

      <FormControl error={!!errors.location}>
        <TextField
          {...register('location')}
          label="Location"
          error={!!errors.location}
          helperText={errors.location?.message}
          required
        />
      </FormControl>

      <FormControl error={!!errors.immediateActions}>
        <TextField
          {...register('immediateActions')}
          label="Immediate Actions Taken"
          multiline
          rows={3}
          error={!!errors.immediateActions}
          helperText={errors.immediateActions?.message}
          required
        />
      </FormControl>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormControl>
          <Controller
            name="notificationsSent"
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                />
                <span>Notifications Sent</span>
              </label>
            )}
          />
        </FormControl>

        <FormControl>
          <Controller
            name="safeguardingReferral"
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                />
                <span>Safeguarding Referral</span>
              </label>
            )}
          />
        </FormControl>

        <FormControl>
          <Controller
            name="cqcReportable"
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                />
                <span>CQC Reportable</span>
              </label>
            )}
          />
        </FormControl>
      </div>

      <div className="flex justify-end space-x-4">
        {onSaveDraft && (
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={!isDirty || isSubmitting}
          >
            Save Draft
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={!isDirty || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Incident'}
        </Button>
      </div>

      {isOffline && (
        <FormHelperText className="text-warning">
          You are currently offline. Changes will be synchronized when you're back online.
        </FormHelperText>
      )}
    </form>
  );
}; 