/**
 * @writecarenotes.com
 * @fileoverview Report generator component for incident reporting
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React component for generating incident reports. Provides options
 * for different report types, date ranges, and export formats.
 * Supports regulatory compliance reporting for CQC, OFSTED, and
 * other authorities with proper formatting and data validation.
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, DatePicker, FormControl } from '@/components/ui';
import { validateReportParams } from '../api/validation';

interface ReportGeneratorProps {
  onGenerate: (params: any) => Promise<void>;
  isGenerating?: boolean;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onGenerate,
  isGenerating = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validateReportParams),
    defaultValues: {
      type: 'STANDARD',
      startDate: null,
      endDate: null,
      format: 'PDF',
    },
  });

  return (
    <form onSubmit={handleSubmit(onGenerate)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl error={!!errors.type}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Report Type"
                options={[
                  { value: 'STANDARD', label: 'Standard Report' },
                  { value: 'CQC', label: 'CQC Compliance Report' },
                  { value: 'DETAILED', label: 'Detailed Analysis Report' },
                ]}
                error={!!errors.type}
                helperText={errors.type?.message}
                required
              />
            )}
          />
        </FormControl>

        <FormControl error={!!errors.format}>
          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Export Format"
                options={[
                  { value: 'PDF', label: 'PDF Document' },
                  { value: 'EXCEL', label: 'Excel Spreadsheet' },
                  { value: 'CSV', label: 'CSV File' },
                ]}
                error={!!errors.format}
                helperText={errors.format?.message}
                required
              />
            )}
          />
        </FormControl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl error={!!errors.startDate}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Start Date"
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />
            )}
          />
        </FormControl>

        <FormControl error={!!errors.endDate}>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="End Date"
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                minDate={control._formValues.startDate}
              />
            )}
          />
        </FormControl>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating Report...' : 'Generate Report'}
        </Button>
      </div>
    </form>
  );
}; 