import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MedicationUnit } from '../types/mar';
import { Region } from '@/types/region';
import { useRegionalSettings } from '@/hooks/useRegionalSettings';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';

interface MedicationFormData {
  id?: string;
  name: string;
  dosage: number;
  unit: MedicationUnit;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  barcode?: string;
  active: boolean;
  requiresDoubleSignature?: boolean;
  controlledDrug?: boolean;
  stockLevel?: number;
  // Ofsted specific fields
  parentalConsent?: boolean;
  parentalConsentDate?: string;
  parentalConsentBy?: string;
  ofstedNotificationDate?: string;
  healthcarePlanReviewDate?: string;
  ageSpecificDosage?: boolean;
  pediatricFormulation?: boolean;
}

interface MedicationFormProps {
  initialValues?: MedicationFormData;
  onSubmit: (values: MedicationFormData) => void;
  onCancel: () => void;
  region: Region;
  settingType?: SettingType;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dosage: z.number().min(0, 'Dosage must be a positive number'),
  unit: z.nativeEnum(MedicationUnit),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
  barcode: z.string().optional(),
  active: z.boolean(),
  requiresDoubleSignature: z.boolean().optional(),
  controlledDrug: z.boolean().optional(),
  stockLevel: z.number().optional(),
  // Ofsted specific fields
  parentalConsent: z.boolean().optional(),
  parentalConsentDate: z.string().optional(),
  parentalConsentBy: z.string().optional(),
  ofstedNotificationDate: z.string().optional(),
  healthcarePlanReviewDate: z.string().optional(),
  ageSpecificDosage: z.boolean().optional(),
  pediatricFormulation: z.boolean().optional(),
});

export const MedicationForm: React.FC<MedicationFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  region,
  settingType = 'CARE_HOME',
}) => {
  const { settings } = useRegionalSettings(region, settingType);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: '',
      dosage: 0,
      unit: MedicationUnit.MG,
      frequency: '',
      route: '',
      startDate: new Date().toISOString(),
      active: true,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(MedicationUnit).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="route"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={new Date(field.value)}
                    onChange={(date) => field.onChange(date?.toISOString())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => field.onChange(date?.toISOString())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Regional-specific fields */}
        {region === 'england' && (
          <FormField
            control={form.control}
            name="requiresDoubleSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Requires Double Signature (CQC)</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {(region === 'england' || region === 'northernIreland') && (
          <FormField
            control={form.control}
            name="controlledDrug"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Controlled Drug</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {settings.stockControlEnabled && (
          <FormField
            control={form.control}
            name="stockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Level</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Ofsted specific fields for children's services */}
        {settingType !== 'CARE_HOME' && (
          <>
            <FormField
              control={form.control}
              name="parentalConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Parental Consent Obtained</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('parentalConsent') && (
              <>
                <FormField
                  control={form.control}
                  name="parentalConsentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parental Consent Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date?.toISOString())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentalConsentBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consent Given By</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="ofstedNotificationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ofsted Notification Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthcarePlanReviewDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Healthcare Plan Review Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ageSpecificDosage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Age-Specific Dosage Required</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pediatricFormulation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Pediatric Formulation Required</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};


