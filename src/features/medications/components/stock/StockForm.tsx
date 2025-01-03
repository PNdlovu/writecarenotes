/**
 * @writecarenotes.com
 * @fileoverview Stock form component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Form component for adding and editing medication stock
 * with validation and error handling.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useStock } from '../../hooks/useStock';
import type { MedicationStock } from '../../types/stock';

const stockSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
  criticalLevel: z.number().min(0, 'Critical level cannot be negative'),
  location: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.reorderLevel > data.criticalLevel, {
  message: 'Reorder level must be greater than critical level',
  path: ['reorderLevel'],
});

type StockFormData = z.infer<typeof stockSchema>;

interface StockFormProps {
  medicationId: string;
  stock?: MedicationStock;
  onSubmit: (data: StockFormData) => Promise<void>;
  onCancel: () => void;
}

export function StockForm({
  medicationId,
  stock,
  onSubmit,
  onCancel,
}: StockFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createStock, updateStock } = useStock();

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: stock ? {
      batchNumber: stock.batchNumber,
      expiryDate: stock.expiryDate.split('T')[0], // Convert to YYYY-MM-DD
      quantity: stock.quantity,
      reorderLevel: stock.reorderLevel,
      criticalLevel: stock.criticalLevel,
      location: stock.location,
      notes: stock.notes,
    } : {
      batchNumber: '',
      expiryDate: '',
      quantity: 0,
      reorderLevel: 0,
      criticalLevel: 0,
      location: '',
      notes: '',
    },
  });

  const handleSubmit = async (data: StockFormData) => {
    try {
      setIsSubmitting(true);
      if (stock) {
        await updateStock({
          id: stock.id,
          data: {
            ...data,
            medicationId,
          },
        });
      } else {
        await createStock({
          ...data,
          medicationId,
        });
      }
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting stock:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Number *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!!stock} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Where this batch is stored
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Level *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Stock level at which to reorder
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criticalLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Critical Level *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Stock level that requires immediate attention
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Additional information about this batch
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : stock ? 'Update Stock' : 'Add Stock'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 