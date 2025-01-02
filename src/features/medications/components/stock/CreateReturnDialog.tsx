/**
 * @writecarenotes.com
 * @fileoverview Create return dialog
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for creating supplier returns
 * with reason tracking and return authorization.
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
import { Button } from '@/components/ui/Button/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/Textarea';
import { useOrganization } from '@/hooks/useOrganization';
import { StockService } from '../../services/stockService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { addBusinessDays } from 'date-fns';

const stockService = new StockService();

const returnReasons = [
  'damaged',
  'expired',
  'recall',
  'wrong_item',
  'quality_issue',
  'other',
] as const;

const formSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  items: z.array(z.object({
    medicationId: z.string().min(1, 'Medication is required'),
    batchNumber: z.string().min(1, 'Batch number is required'),
    quantity: z.number()
      .min(1, 'Quantity must be at least 1')
      .max(10000, 'Quantity must be at most 10000'),
    reason: z.enum(returnReasons),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  returnAuthorizationNumber: z.string().optional(),
  expectedCollectionDate: z.date()
    .min(new Date(), 'Collection date must be in the future'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReturnDialog({
  open,
  onOpenChange,
}: CreateReturnDialogProps) {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ medicationId: '', batchNumber: '', quantity: 1, reason: 'damaged' }],
      expectedCollectionDate: addBusinessDays(new Date(), 2),
    },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', organizationId],
    queryFn: () => stockService.getSuppliers(organizationId),
  });

  const { data: medications } = useQuery({
    queryKey: ['supplier-medications', selectedSupplier],
    queryFn: () =>
      selectedSupplier
        ? stockService.getSupplierMedications(organizationId, selectedSupplier)
        : Promise.resolve([]),
    enabled: !!selectedSupplier,
  });

  const { mutate: createReturn, isLoading: isCreating } = useMutation({
    mutationFn: (values: FormValues) =>
      stockService.createSupplierReturn(organizationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-returns']);
      onOpenChange(false);
      toast({
        title: 'Return created',
        description: 'The supplier return has been initiated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating return',
        description: 'Failed to create supplier return. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const addItem = () => {
    const items = form.getValues('items');
    form.setValue('items', [...items, { medicationId: '', batchNumber: '', quantity: 1, reason: 'damaged' }]);
  };

  const removeItem = (index: number) => {
    const items = form.getValues('items');
    form.setValue('items', items.filter((_, i) => i !== index));
  };

  const onSubmit = (values: FormValues) => {
    createReturn(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Supplier Return</DialogTitle>
          <DialogDescription>
            Create a new return request for medications
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSupplier(value);
                      // Reset items when supplier changes
                      form.setValue('items', [{ medicationId: '', batchNumber: '', quantity: 1, reason: 'damaged' }]);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id}
                        >
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
              {form.watch('items').map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">Return Item {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.medicationId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedSupplier}
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
                      name={`items.${index}.batchNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter batch number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      name={`items.${index}.reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Reason</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="recall">Recall</SelectItem>
                              <SelectItem value="wrong_item">Wrong Item</SelectItem>
                              <SelectItem value="quality_issue">Quality Issue</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter any notes about this item..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                Add Another Item
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="returnAuthorizationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Authorization Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter RMA number if available" />
                    </FormControl>
                    <FormDescription>
                      If provided by supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedCollectionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Collection Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        minDate={new Date()}
                        placeholderText="Select collection date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter contact name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter contact phone" type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter any additional notes about this return..."
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
                {isCreating ? 'Creating...' : 'Create Return'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 