/**
 * @fileoverview Journal Entry Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Form component for creating and editing journal entries with offline support
 * and regional validation
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useAccountingStore } from '../../stores/accountingStore';
import { JournalEntry, JournalEntryLine } from '../../types/journal';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { DatePicker } from '@/components/ui/DatePicker';
import { Textarea } from '@/components/ui/Textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

// Form Schema
const journalEntryLineSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  description: z.string().optional(),
  debit: z.number().min(0),
  credit: z.number().min(0),
  costCenterId: z.string().optional()
});

const journalEntrySchema = z.object({
  date: z.date(),
  reference: z.string().optional(),
  description: z.string(),
  lines: z.array(journalEntryLineSchema)
    .min(2, 'At least two entries required')
    .refine(
      (lines) => {
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
      },
      { message: 'Debits must equal credits' }
    )
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormProps {
  initialData?: JournalEntry;
  onSubmit: (data: JournalEntryFormData) => Promise<void>;
  onCancel: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation('accounting');
  const { region, formatCurrency } = useRegionalCompliance();
  const { isOnline, queueOfflineEntry } = useOfflineSync();
  const { accounts, costCenters } = useAccountingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty }
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: initialData || {
      date: new Date(),
      lines: [{ debit: 0, credit: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines'
  });

  // Watch all line items for running totals
  const lines = watch('lines');
  const totalDebit = lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
  const totalCredit = lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;

  const handleFormSubmit = async (data: JournalEntryFormData) => {
    try {
      setIsSubmitting(true);

      if (!isOnline) {
        await queueOfflineEntry('journalEntry', data);
        // Show offline notification
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit journal entry:', error);
      // Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLine = () => {
    append({ accountId: '', debit: 0, credit: 0 });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('journal.fields.date')}
          </label>
          <DatePicker
            {...register('date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('journal.fields.reference')}
          </label>
          <Input
            type="text"
            {...register('reference')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('journal.fields.description')}
        </label>
        <Textarea
          {...register('description')}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-700">
          <div className="col-span-4">{t('journal.fields.account')}</div>
          <div className="col-span-3">{t('journal.fields.debit')}</div>
          <div className="col-span-3">{t('journal.fields.credit')}</div>
          <div className="col-span-2">{t('journal.fields.costCenter')}</div>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Select
                {...register(`lines.${index}.accountId`)}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">{t('common.select')}</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-3">
              <Input
                type="number"
                step="0.01"
                {...register(`lines.${index}.debit`, { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div className="col-span-3">
              <Input
                type="number"
                step="0.01"
                {...register(`lines.${index}.credit`, { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div className="col-span-2 flex">
              <Select
                {...register(`lines.${index}.costCenterId`)}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">{t('common.select')}</option>
                {costCenters.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </Select>

              {fields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        ))}

        {errors.lines && (
          <p className="mt-1 text-sm text-red-600">{errors.lines.message}</p>
        )}

        <Button
          type="button"
          onClick={addLine}
          className="text-blue-600 hover:text-blue-800"
        >
          + {t('common.addLine')}
        </Button>
      </div>

      <div className="flex justify-between border-t pt-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {t('journal.fields.debit')}: {formatCurrency(totalDebit)}
          </p>
          <p className="text-sm font-medium">
            {t('journal.fields.credit')}: {formatCurrency(totalCredit)}
          </p>
          <p className="text-sm font-medium">
            {t('journal.fields.difference')}: {formatCurrency(totalDebit - totalCredit)}
          </p>
        </div>

        <div className="space-x-4">
          <Button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}; 