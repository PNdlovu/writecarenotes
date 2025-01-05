'use client';

/**
 * @writecarenotes.com
 * @fileoverview Form component for managing domiciliary staff details
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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';

// Form schema matching the API schema
const vehicleDetailsSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  registration: z.string().optional(),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    expiryDate: z.string(),
    businessUseIncluded: z.boolean()
  }).optional()
});

const clientPreferencesSchema = z.object({
  genderPreference: z.string().optional(),
  languageRequirements: z.array(z.string()).optional(),
  specialNeeds: z.array(z.string()).optional(),
  culturalRequirements: z.array(z.string()).optional()
});

const formSchema = z.object({
  maxTravelDistance: z.number().optional(),
  preferredAreas: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  drivingLicense: z.boolean().optional(),
  hasVehicle: z.boolean().optional(),
  vehicleDetails: vehicleDetailsSchema.optional(),
  clientPreferences: clientPreferencesSchema.optional()
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  staffId: string;
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
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

export function DomiciliaryStaffForm({ staffId, initialData, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  });

  const hasVehicle = watch('hasVehicle');

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      showToast('success', 'Staff details updated successfully');
    } catch (error) {
      console.error('Error updating staff details:', error);
      showToast('error', 'Failed to update staff details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Travel & Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Maximum Travel Distance (miles)
            </label>
            <Input
              type="number"
              {...register('maxTravelDistance', { valueAsNumber: true })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Areas
            </label>
            <MultiSelect
              options={[]} // These should be loaded from your area data
              value={watch('preferredAreas') || []}
              onChange={(value) => setValue('preferredAreas', value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Specialties
            </label>
            <MultiSelect
              options={specialtyOptions}
              value={watch('specialties') || []}
              onChange={(value) => setValue('specialties', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Languages
            </label>
            <MultiSelect
              options={languageOptions}
              value={watch('languages') || []}
              onChange={(value) => setValue('languages', value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Has Driving License
            </label>
            <Switch
              checked={watch('drivingLicense')}
              onCheckedChange={(checked) => setValue('drivingLicense', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Has Vehicle
            </label>
            <Switch
              checked={watch('hasVehicle')}
              onCheckedChange={(checked) => setValue('hasVehicle', checked)}
            />
          </div>

          {hasVehicle && (
            <div className="space-y-4 mt-4">
              <Input
                label="Make"
                {...register('vehicleDetails.make')}
              />
              <Input
                label="Model"
                {...register('vehicleDetails.model')}
              />
              <Input
                label="Year"
                type="number"
                {...register('vehicleDetails.year', { valueAsNumber: true })}
              />
              <Input
                label="Registration"
                {...register('vehicleDetails.registration')}
              />

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Insurance Details</h4>
                <Input
                  label="Provider"
                  {...register('vehicleDetails.insurance.provider')}
                />
                <Input
                  label="Policy Number"
                  {...register('vehicleDetails.insurance.policyNumber')}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  {...register('vehicleDetails.insurance.expiryDate')}
                />
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Business Use Included
                  </label>
                  <Switch
                    checked={watch('vehicleDetails.insurance.businessUseIncluded')}
                    onCheckedChange={(checked) => 
                      setValue('vehicleDetails.insurance.businessUseIncluded', checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              value={watch('clientPreferences.genderPreference')}
              onChange={(value) => setValue('clientPreferences.genderPreference', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Language Requirements
            </label>
            <MultiSelect
              options={languageOptions}
              value={watch('clientPreferences.languageRequirements') || []}
              onChange={(value) => setValue('clientPreferences.languageRequirements', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Special Needs
            </label>
            <MultiSelect
              options={specialtyOptions}
              value={watch('clientPreferences.specialNeeds') || []}
              onChange={(value) => setValue('clientPreferences.specialNeeds', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cultural Requirements
            </label>
            <MultiSelect
              options={[]} // These should be loaded from your cultural requirements data
              value={watch('clientPreferences.culturalRequirements') || []}
              onChange={(value) => setValue('clientPreferences.culturalRequirements', value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
} 