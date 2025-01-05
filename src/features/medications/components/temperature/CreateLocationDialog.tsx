/**
 * @writecarenotes.com
 * @fileoverview Create location dialog
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for creating new storage locations
 * with temperature and humidity monitoring settings.
 */

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
import { Button } from '@/components/ui/Button/Button';
import { Switch } from '@/components/ui/switch';
import { useOrganization } from '@/hooks/useOrganization';
import { TemperatureService } from '../../services/temperatureService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const temperatureService = new TemperatureService();

const formSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  minTemp: z.number()
    .min(-30, 'Minimum temperature must be at least -30°C')
    .max(30, 'Maximum temperature must be at most 30°C'),
  maxTemp: z.number()
    .min(-30, 'Minimum temperature must be at least -30°C')
    .max(30, 'Maximum temperature must be at most 30°C'),
  monitorHumidity: z.boolean(),
  minHumidity: z.number().optional(),
  maxHumidity: z.number().optional(),
}).refine((data) => data.maxTemp > data.minTemp, {
  message: 'Maximum temperature must be greater than minimum temperature',
  path: ['maxTemp'],
}).refine(
  (data) =>
    !data.monitorHumidity ||
    (data.minHumidity !== undefined &&
      data.maxHumidity !== undefined &&
      data.maxHumidity > data.minHumidity),
  {
    message: 'Maximum humidity must be greater than minimum humidity',
    path: ['maxHumidity'],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLocationDialog({
  open,
  onOpenChange,
}: CreateLocationDialogProps) {
  const { organizationId } = useOrganization();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minTemp: 2,
      maxTemp: 8,
      monitorHumidity: false,
      minHumidity: 30,
      maxHumidity: 60,
    },
  });

  const { mutate: createLocation, isLoading: isCreating } = useMutation({
    mutationFn: (values: FormValues) =>
      temperatureService.createLocation(organizationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries(['storage-locations']);
      onOpenChange(false);
      toast({
        title: 'Location created',
        description: 'The storage location has been created.',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createLocation(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Storage Location</DialogTitle>
          <DialogDescription>
            Create a new storage location with temperature monitoring
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Fridge" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a unique name for this storage location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minTemp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTemp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="monitorHumidity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Monitor Humidity
                    </FormLabel>
                    <FormDescription>
                      Enable humidity monitoring for this location
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

            {form.watch('monitorHumidity') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minHumidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Humidity (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxHumidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Humidity (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                Create Location
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 