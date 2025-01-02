'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
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
import { Textarea } from '@/components/ui/Textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { createAssessment, updateAssessment } from '../api/assessment-service';
import type { Assessment } from '../types';

const assessmentSchema = z.object({
  residentId: z.string().min(1, 'Resident is required'),
  assessmentType: z.string().min(1, 'Assessment type is required'),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.date(),
  assignedToId: z.string().min(1, 'Assigned staff member is required'),
  notes: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  assessment?: Assessment;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  residents: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string }>;
}

export function AssessmentForm({
  assessment,
  onSubmit,
  onCancel,
  isSubmitting = false,
  residents,
  staff,
}: AssessmentFormProps) {
  const { t } = useTranslation('assessments');
  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: assessment
      ? {
          residentId: assessment.residentId,
          assessmentType: assessment.assessmentType,
          category: assessment.category,
          dueDate: new Date(assessment.nextDueDate),
          assignedToId: assessment.assignedToId,
          notes: assessment.notes,
        }
      : {
          dueDate: new Date(),
        },
  });

  const handleSubmit = async (data: AssessmentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      // Error will be handled by parent component
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="residentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.resident')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectResident')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assessmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.type')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Initial">Initial Assessment</SelectItem>
                  <SelectItem value="Monthly">Monthly Review</SelectItem>
                  <SelectItem value="Quarterly">Quarterly Assessment</SelectItem>
                  <SelectItem value="Annual">Annual Review</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.category')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectCategory')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Care Needs">Care Needs</SelectItem>
                  <SelectItem value="Mental Health">Mental Health</SelectItem>
                  <SelectItem value="Physical Health">Physical Health</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.dueDate')}</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedToId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.assignedTo')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectStaff')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.notes')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isSubmitting}
                  placeholder={t('form.notesPlaceholder')}
                  className="h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 mt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('form.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('form.saving') : t('form.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
