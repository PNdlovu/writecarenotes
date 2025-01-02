import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/lib/i18n';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/UseToast';
import { CreateHospitalPassInput } from '../../types/hospitalPass';
import { useHospitalPasses } from '../../hooks/useHospitalPasses';

const schema = z.object({
  hospitalName: z.string().min(1, 'Hospital name is required'),
  department: z.string().optional(),
  appointmentDateTime: z.string().min(1, 'Appointment date/time is required'),
  expectedReturnDateTime: z.string().optional(),
  reason: z.string().min(1, 'Reason is required'),
  accompaniedBy: z.string().optional(),
  transportMethod: z.enum(['AMBULANCE', 'PRIVATE', 'TAXI', 'OTHER']),
  transportNotes: z.string().optional(),
  medications: z.boolean().optional(),
  medicationNotes: z.string().optional(),
});

interface Props {
  residentId: string;
}

export const HospitalPassForm: FC<Props> = ({ residentId }) => {
  const { t } = useTranslation('resident');
  const { toast } = useToast();
  const { createPass } = useHospitalPasses(residentId);

  const form = useForm<CreateHospitalPassInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      hospitalName: '',
      department: '',
      reason: '',
      transportMethod: 'PRIVATE',
      medications: false,
    },
  });

  const onSubmit = async (data: CreateHospitalPassInput) => {
    try {
      await createPass.mutateAsync(data);
      form.reset();
      toast({
        title: t('hospitalPass.created'),
        description: t('hospitalPass.createdDescription'),
      });
    } catch (error) {
      toast({
        title: t('hospitalPass.error'),
        description: t('hospitalPass.errorDescription'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="hospitalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.hospitalName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.department')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.appointmentDateTime')}</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedReturnDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.expectedReturnDateTime')}</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.reason')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accompaniedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.accompaniedBy')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transportMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.transportMethod')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('hospitalPass.form.selectTransport')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AMBULANCE">{t('hospitalPass.transport.ambulance')}</SelectItem>
                  <SelectItem value="PRIVATE">{t('hospitalPass.transport.private')}</SelectItem>
                  <SelectItem value="TAXI">{t('hospitalPass.transport.taxi')}</SelectItem>
                  <SelectItem value="OTHER">{t('hospitalPass.transport.other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transportNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.transportNotes')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{t('hospitalPass.form.medications')}</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicationNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('hospitalPass.form.medicationNotes')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createPass.isPending}>
          {createPass.isPending ? t('common.saving') : t('hospitalPass.form.submit')}
        </Button>
      </form>
    </Form>
  );
};
