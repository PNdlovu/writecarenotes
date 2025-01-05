/**
 * @writecarenotes.com
 * @fileoverview Stock adjustment dialog component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for recording medication stock adjustments
 * with reason tracking and witness requirements.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/Form/Input';
import { Button } from '@/components/ui/Button/Button';
import { useStock } from '../../hooks/useStock';
import { useAuth } from '@/hooks/useAuth';
import type { StockAdjustmentReason } from '../../types';

interface StockAdjustmentProps {
  open: boolean;
  onClose: () => void;
  medicationId: string;
}

const formSchema = z.object({
  quantity: z.number(),
  reason: z.enum([
    'DAMAGED',
    'EXPIRED',
    'LOST',
    'RETURNED',
    'DISPOSED',
    'COUNT_ADJUSTMENT',
    'OTHER'
  ] as const),
  notes: z.string().min(1, 'Notes are required for stock adjustments'),
  witness: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const ADJUSTMENT_REASONS = [
  { value: 'DAMAGED', label: 'Damaged Stock' },
  { value: 'EXPIRED', label: 'Expired Stock' },
  { value: 'LOST', label: 'Lost Stock' },
  { value: 'RETURNED', label: 'Returned to Supplier' },
  { value: 'DISPOSED', label: 'Disposed' },
  { value: 'COUNT_ADJUSTMENT', label: 'Count Adjustment' },
  { value: 'OTHER', label: 'Other' }
];

export function StockAdjustment({ open, onClose, medicationId }: StockAdjustmentProps) {
  const { recordAdjustment, isRecordingAdjustment } = useStock(medicationId);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 0,
      notes: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await recordAdjustment({
        ...data,
        reason: data.reason as StockAdjustmentReason,
        performedBy: user.id,
        witness: data.witness || undefined
      });
      onClose();
      form.reset();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Stock Adjustment</DialogTitle>
          <DialogDescription>
            Record a stock adjustment with reason and required documentation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Use negative numbers for stock reduction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ADJUSTMENT_REASONS.map(reason => (
                        <SelectItem
                          key={reason.value}
                          value={reason.value}
                        >
                          {reason.label}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide detailed explanation for the adjustment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="witness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Witness (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for controlled medications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isRecordingAdjustment}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRecordingAdjustment}>
                {isRecordingAdjustment ? 'Recording...' : 'Record Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 