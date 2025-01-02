/**
 * @writecarenotes.com
 * @fileoverview Stock transaction form component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Form component for recording stock transactions
 * including receipts, adjustments, and administrations.
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/Form/Input';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStock } from '../../hooks/useStock';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { MedicationStock, StockTransactionType } from '../../types/stock';

const transactionSchema = z.object({
  type: z.enum(['RECEIPT', 'ADJUSTMENT', 'ADMINISTRATION'] as const),
  stockId: z.string().min(1, 'Stock batch is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  supplierId: z.string().optional(),
  expiryDate: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface StockTransactionFormProps {
  medicationId: string;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

const TRANSACTION_TYPES: {
  value: StockTransactionType;
  label: string;
  description: string;
}[] = [
  {
    value: 'RECEIPT',
    label: 'Stock Receipt',
    description: 'Record new stock received from supplier',
  },
  {
    value: 'ADJUSTMENT',
    label: 'Stock Adjustment',
    description: 'Adjust stock level due to damage, loss, etc.',
  },
  {
    value: 'ADMINISTRATION',
    label: 'Administration',
    description: 'Record medication administration to resident',
  },
];

export function StockTransactionForm({
  medicationId,
  onSubmit,
  onCancel,
}: StockTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { useStockByMedication, createStockTransaction } = useStock();
  const { suppliers } = useSuppliers();

  const {
    data: stockItems,
    isLoading: isLoadingStock,
  } = useStockByMedication(medicationId);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'RECEIPT',
      stockId: '',
      quantity: 0,
      reason: '',
      notes: '',
      supplierId: undefined,
      expiryDate: undefined,
    },
  });

  const transactionType = form.watch('type');
  const selectedStockId = form.watch('stockId');
  const selectedStock = stockItems?.find(item => item.id === selectedStockId);

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      await createStockTransaction({
        ...data,
        quantity:
          data.type === 'ADJUSTMENT' || data.type === 'ADMINISTRATION'
            ? -Math.abs(data.quantity)
            : Math.abs(data.quantity),
      });
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStock) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading stock information...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
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
          name="stockId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Batch *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock batch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stockItems?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div>
                        <div>Batch {item.batchNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.quantity} units available
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                {selectedStock && (transactionType === 'ADJUSTMENT' || transactionType === 'ADMINISTRATION') && (
                  <FormDescription>
                    Current stock: {selectedStock.quantity} units
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {transactionType === 'RECEIPT' && (
            <>
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
                        {suppliers.map((supplier) => (
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

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason *</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                {transactionType === 'RECEIPT' && 'Details of the stock receipt'}
                {transactionType === 'ADJUSTMENT' && 'Reason for the stock adjustment'}
                {transactionType === 'ADMINISTRATION' && 'Details of the medication administration'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Any additional information about this transaction
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
            {isSubmitting ? 'Saving...' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 