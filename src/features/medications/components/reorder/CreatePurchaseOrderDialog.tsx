/**
 * @writecarenotes.com
 * @fileoverview Create purchase order dialog
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for creating manual purchase orders
 * with medication selection and quantity specification.
 */

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
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization } from '@/hooks/useOrganization';
import { ReorderService } from '../../services/reorderService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMedications } from '@/hooks/useMedications';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Textarea } from '@/components/ui/Textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TrashIcon } from '@heroicons/react/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { isWeekend, addBusinessDays } from 'date-fns';

const reorderService = new ReorderService();

const formSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  items: z.array(z.object({
    medicationId: z.string().min(1, 'Medication is required'),
    quantity: z.number()
      .min(1, 'Quantity must be at least 1')
      .max(10000, 'Quantity must be at most 10000'),
    unitPrice: z.number()
      .min(0.01, 'Unit price must be greater than 0')
      .optional(),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  expectedDeliveryDate: z.date()
    .min(new Date(), 'Expected delivery date must be in the future')
    .refine(
      (date) => !isWeekend(date),
      'Expected delivery date must be a business day'
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: CreatePurchaseOrderDialogProps) {
  const { organizationId } = useOrganization();
  const { data: medications } = useMedications();
  const { data: suppliers } = useSuppliers();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ medicationId: '', quantity: 1 }],
      expectedDeliveryDate: addBusinessDays(new Date(), 3), // Default to 3 business days from now
    },
  });

  const { mutate: createPurchaseOrder, isLoading: isCreating } = useMutation({
    mutationFn: (values: FormValues) =>
      reorderService.createPurchaseOrder(organizationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      onOpenChange(false);
      toast({
        title: 'Purchase order created',
        description: 'The purchase order has been created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating order',
        description: 'Failed to create purchase order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createPurchaseOrder(values);
  };

  const addItem = () => {
    const items = form.getValues('items');
    form.setValue('items', [...items, { medicationId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const items = form.getValues('items');
    form.setValue('items', items.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for medications
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              {form.watch('items').map((_, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`items.${index}.medicationId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Medication</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select medication" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {medications?.map((medication) => (
                              <SelectItem key={medication.id} value={medication.id}>
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
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10000}
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

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={form.watch('items').length === 1}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                Add Item
              </Button>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      minDate={new Date()}
                      placeholderText="Select expected delivery date"
                    />
                  </FormControl>
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
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 