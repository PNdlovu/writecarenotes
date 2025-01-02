'use client';

/**
 * @writecarenotes.com
 * @fileoverview Search component for finding available domiciliary staff
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useToast } from '@/hooks/useToast';

const searchSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  area: z.string().optional(),
  maxTravelDistance: z.number().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  genderPreference: z.string().optional(),
  culturalRequirements: z.array(z.string()).optional()
});

type SearchData = z.infer<typeof searchSchema>;

interface Props {
  onSearch: (data: SearchData) => Promise<void>;
}

const specialtyOptions = [
  { value: 'PERSONAL_CARE', label: 'Personal Care' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'DEMENTIA', label: 'Dementia Care' },
  { value: 'END_OF_LIFE', label: 'End of Life Care' },
  { value: 'LEARNING_DISABILITIES', label: 'Learning Disabilities' },
  { value: 'MENTAL_HEALTH', label: 'Mental Health' },
  { value: 'PHYSICAL_DISABILITIES', label: 'Physical Disabilities' }
];

const languageOptions = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'WELSH', label: 'Welsh' },
  { value: 'POLISH', label: 'Polish' },
  { value: 'URDU', label: 'Urdu' },
  { value: 'PUNJABI', label: 'Punjabi' },
  { value: 'GUJARATI', label: 'Gujarati' },
  { value: 'BENGALI', label: 'Bengali' },
  { value: 'ARABIC', label: 'Arabic' }
];

export function StaffAvailabilitySearch({ onSearch }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const { showToast } = useToast();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      startTime: new Date(),
      endTime: new Date()
    }
  });

  const handleSearch = async (data: SearchData) => {
    try {
      setIsSearching(true);
      await onSearch(data);
    } catch (error) {
      console.error('Error searching staff:', error);
      showToast('error', 'Failed to search for staff');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Available Staff</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <DateTimePicker
                value={watch('startTime')}
                onChange={(date) => setValue('startTime', date)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Time
              </label>
              <DateTimePicker
                value={watch('endTime')}
                onChange={(date) => setValue('endTime', date)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Area
              </label>
              <Select
                options={[]} // These should be loaded from your area data
                value={watch('area')}
                onChange={(value) => setValue('area', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Maximum Travel Distance (miles)
              </label>
              <Input
                type="number"
                {...register('maxTravelDistance', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Required Specialties
            </label>
            <MultiSelect
              options={specialtyOptions}
              value={watch('specialties') || []}
              onChange={(value) => setValue('specialties', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Required Languages
            </label>
            <MultiSelect
              options={languageOptions}
              value={watch('languages') || []}
              onChange={(value) => setValue('languages', value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Gender Preference
              </label>
              <Select
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'NO_PREFERENCE', label: 'No Preference' }
                ]}
                value={watch('genderPreference')}
                onChange={(value) => setValue('genderPreference', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cultural Requirements
              </label>
              <MultiSelect
                options={[]} // These should be loaded from your cultural requirements data
                value={watch('culturalRequirements') || []}
                onChange={(value) => setValue('culturalRequirements', value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSearching}
              loading={isSearching}
            >
              Search Staff
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 