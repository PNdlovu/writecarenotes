/**
 * @writecarenotes.com
 * @fileoverview Configure temperature alerts dialog
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for configuring temperature alert settings
 * including notification preferences and alert thresholds.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization } from '@/hooks/useOrganization';
import { TemperatureService } from '../../services/temperatureService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/UseToast';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, XIcon } from '@heroicons/react/outline';

const temperatureService = new TemperatureService();

const formSchema = z.object({
  enableEmailAlerts: z.boolean(),
  enableSmsAlerts: z.boolean(),
  enablePushAlerts: z.boolean(),
  alertFrequency: z.enum(['immediate', '5min', '15min', '30min', '1hour']),
  excursionThreshold: z.number()
    .min(1, 'Threshold must be at least 1 minute')
    .max(60, 'Threshold must be at most 60 minutes'),
  escalationDelay: z.number()
    .min(5, 'Delay must be at least 5 minutes')
    .max(120, 'Delay must be at most 120 minutes'),
  recipients: z.array(z.string().email('Invalid email address')),
  phoneNumbers: z.array(z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')),
});

type FormValues = z.infer<typeof formSchema>;

interface ConfigureAlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigureAlertsDialog({
  open,
  onOpenChange,
}: ConfigureAlertsDialogProps) {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableEmailAlerts: true,
      enableSmsAlerts: false,
      enablePushAlerts: true,
      alertFrequency: 'immediate',
      excursionThreshold: 5,
      escalationDelay: 15,
      recipients: [],
      phoneNumbers: [],
    },
  });

  const { mutate: saveAlertSettings, isLoading: isSaving } = useMutation({
    mutationFn: (values: FormValues) =>
      temperatureService.saveAlertSettings(organizationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries(['alert-settings']);
      onOpenChange(false);
      toast({
        title: 'Alert settings saved',
        description: 'Temperature alert settings have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error saving settings',
        description: 'Failed to save alert settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    saveAlertSettings(values);
  };

  const addRecipient = () => {
    if (!newEmail) return;
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(newEmail);
      const currentRecipients = form.getValues('recipients');
      if (!currentRecipients.includes(newEmail)) {
        form.setValue('recipients', [...currentRecipients, newEmail]);
      }
      setNewEmail('');
    } catch (error) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
    }
  };

  const removeRecipient = (email: string) => {
    const currentRecipients = form.getValues('recipients');
    form.setValue('recipients', currentRecipients.filter(r => r !== email));
  };

  const addPhoneNumber = () => {
    if (!newPhone) return;
    const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
    try {
      phoneSchema.parse(newPhone);
      const currentPhones = form.getValues('phoneNumbers');
      if (!currentPhones.includes(newPhone)) {
        form.setValue('phoneNumbers', [...currentPhones, newPhone]);
      }
      setNewPhone('');
    } catch (error) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
    }
  };

  const removePhoneNumber = (phone: string) => {
    const currentPhones = form.getValues('phoneNumbers');
    form.setValue('phoneNumbers', currentPhones.filter(p => p !== phone));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Temperature Alerts</DialogTitle>
          <DialogDescription>
            Set up alert preferences and notification settings
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enableEmailAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Alerts
                      </FormLabel>
                      <FormDescription>
                        Receive alerts via email
                      </FormDescription>
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

              {form.watch('enableEmailAlerts') && (
                <div className="space-y-2">
                  <FormLabel>Email Recipients</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addRecipient}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('recipients').map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(email)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="enableSmsAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        SMS Alerts
                      </FormLabel>
                      <FormDescription>
                        Receive alerts via SMS
                      </FormDescription>
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

              {form.watch('enableSmsAlerts') && (
                <div className="space-y-2">
                  <FormLabel>Phone Numbers</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addPhoneNumber}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('phoneNumbers').map((phone) => (
                      <Badge
                        key={phone}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {phone}
                        <button
                          type="button"
                          onClick={() => removePhoneNumber(phone)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="enablePushAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Push Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive alerts via push notifications
                      </FormDescription>
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
            </div>

            <FormField
              control={form.control}
              name="alertFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="30min">Every 30 minutes</SelectItem>
                      <SelectItem value="1hour">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often to send alerts for ongoing issues
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="excursionThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excursion Threshold (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Time before triggering an alert
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="escalationDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escalation Delay (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={120}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Time before escalating alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 