/**
 * @writecarenotes.com
 * @fileoverview Create transfer dialog
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for creating new stock transfers
 * between locations with medication selection.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
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
} from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useOrganization } from '@/hooks/useOrganization';
import { TransferService } from '../../services/transferService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

const transferService = new TransferService();

const formSchema = z.object({
  medicationId: z.string().min(1, 'Please select a medication'),
  fromLocation: z.string().min(1, 'Please select source location'),
  toLocation: z.string().min(1, 'Please select destination location'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  batchNumber: z.string().min(1, 'Please select a batch'),
}).refine(
  (data) => data.fromLocation !== data.toLocation,
  {
    message: 'Source and destination locations must be different',
    path: ['toLocation'],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface CreateTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTransferDialog({
  open,
  onOpenChange,
}: CreateTransferDialogProps) {
  const { organizationId } = useOrganization();
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const {
    data: medications,
    isLoading: medicationsLoading,
    error: medicationsError
  } = useQuery({
    queryKey: ['medications', organizationId],
    queryFn: () => medicationService.getMedications(organizationId),
  });

  const {
    data: locations,
    isLoading: locationsLoading,
    error: locationsError
  } = useQuery({
    queryKey: ['storage-locations', organizationId],
    queryFn: () => locationService.getLocations(organizationId),
  });

  const {
    data: batches,
    isLoading: batchesLoading,
    error: batchesError
  } = useQuery({
    queryKey: ['medication-batches', selectedMedication],
    queryFn: () =>
      selectedMedication
        ? stockService.getMedicationBatches(selectedMedication)
        : Promise.resolve([]),
    enabled: !!selectedMedication,
  });

  const { mutate: createTransfer, isLoading: isCreating } = useMutation({
    mutationFn: (values: FormValues) =>
      transferService.createTransfer(organizationId, 'current-user-id', values),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-transfers']);
      onOpenChange(false);
      toast({
        title: 'Transfer created',
        description: 'The stock transfer has been initiated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating transfer',
        description: 'Failed to create stock transfer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Show error states
  if (medicationsError || locationsError || batchesError) {
    toast({
      title: 'Error loading data',
      description: 'Failed to load required data. Please try again.',
      variant: 'destructive',
    });
  }

  const onSubmit = (values: FormValues) => {
    // Validate stock availability
    const selectedBatch = batches?.find(b => b.batchNumber === values.batchNumber);
    if (selectedBatch && selectedBatch.quantity < values.quantity) {
      toast({
        title: 'Insufficient stock',
        description: `Only ${selectedBatch.quantity} units available in selected batch.`,
        variant: 'destructive',
      });
      return;
    }

    createTransfer(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Transfer</DialogTitle>
          <DialogDescription>
            Transfer stock between storage locations
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="medicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedMedication(value);
                      // Reset batch selection when medication changes
                      form.setValue('batchNumber', '');
                    }}
                    defaultValue={field.value}
                    disabled={medicationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medications?.map((medication) => (
                        <SelectItem
                          key={medication.id}
                          value={medication.id}
                        >
                          {medication.name}
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
              name="batchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedMedication || batchesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches?.map((batch) => (
                        <SelectItem
                          key={batch.batchNumber}
                          value={batch.batchNumber}
                        >
                          {batch.batchNumber} (Exp: {formatDate(batch.expiryDate)}) - {batch.quantity} units
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
              name="fromLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={locationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id}
                        >
                          {location.name}
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
              name="toLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={locationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id}
                          disabled={location.id === form.watch('fromLocation')}
                        >
                          {location.name}
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the quantity to transfer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 