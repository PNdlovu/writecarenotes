/**
 * @writecarenotes.com
 * @fileoverview Investigation form component for incident investigations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React component for managing incident investigations. Provides
 * a comprehensive form for recording investigation details,
 * findings, root causes, and recommendations. Implements
 * validation and proper data handling.
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, FormControl, FormHelperText } from '@/components/ui';
import { InvestigationFormProps } from '../types';
import { validateInvestigation } from '../api/validation';

export const InvestigationForm: React.FC<InvestigationFormProps> = ({
  incident,
  investigation,
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
    resolver: zodResolver(validateInvestigation),
    defaultValues: investigation || {
      findings: [],
      rootCauses: [],
      recommendations: [],
      preventiveMeasures: [],
      status: 'IN_PROGRESS',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Incident Summary</h3>
        <p className="text-gray-600">{incident.description}</p>
      </div>

      <FormControl error={!!errors.findings}>
        <TextField
          {...register('findings')}
          label="Investigation Findings"
          multiline
          rows={4}
          error={!!errors.findings}
          helperText={errors.findings?.message}
          required
          placeholder="Detail your investigation findings here..."
        />
      </FormControl>

      <FormControl error={!!errors.rootCauses}>
        <TextField
          {...register('rootCauses')}
          label="Root Causes"
          multiline
          rows={4}
          error={!!errors.rootCauses}
          helperText={errors.rootCauses?.message}
          required
          placeholder="List the identified root causes..."
        />
      </FormControl>

      <FormControl error={!!errors.recommendations}>
        <TextField
          {...register('recommendations')}
          label="Recommendations"
          multiline
          rows={4}
          error={!!errors.recommendations}
          helperText={errors.recommendations?.message}
          required
          placeholder="Provide recommendations for preventing similar incidents..."
        />
      </FormControl>

      <FormControl error={!!errors.preventiveMeasures}>
        <TextField
          {...register('preventiveMeasures')}
          label="Preventive Measures"
          multiline
          rows={4}
          error={!!errors.preventiveMeasures}
          helperText={errors.preventiveMeasures?.message}
          required
          placeholder="Detail the preventive measures to be implemented..."
        />
      </FormControl>

      <div className="space-y-4">
        <h3 className="font-medium">Witness Statements</h3>
        <Controller
          name="witnesses"
          control={control}
          render={({ field }) => (
            <div className="space-y-4">
              {field.value?.map((witness, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <FormControl>
                    <TextField
                      {...register(`witnesses.${index}.statement`)}
                      label={`Statement from ${witness.name} (${witness.role})`}
                      multiline
                      rows={3}
                      error={!!errors.witnesses?.[index]?.statement}
                      helperText={errors.witnesses?.[index]?.statement?.message}
                    />
                  </FormControl>
                </div>
              ))}
            </div>
          )}
        />
      </div>

      <div className="flex justify-end space-x-4">
        {onSaveDraft && (
          <Button
            variant="secondary"
            onClick={() => onSaveDraft(investigation)}
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
          {isSubmitting ? 'Saving...' : 'Complete Investigation'}
        </Button>
      </div>

      {errors.root && (
        <FormHelperText className="text-error mt-4">
          {errors.root.message}
        </FormHelperText>
      )}
    </form>
  );
}; 