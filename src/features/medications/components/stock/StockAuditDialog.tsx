/**
 * @writecarenotes.com
 * @fileoverview Stock audit dialog
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dialog component for conducting stock audits and counts,
 * with discrepancy tracking and adjustment creation.
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const stockService = new StockService();

const formSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  auditNotes: z.string().optional(),
  counts: z.array(z.object({
    medicationId: z.string(),
    batchNumber: z.string(),
    expectedQuantity: z.number(),
    actualQuantity: z.number(),
    notes: z.string().optional(),
  })),
});

type FormValues = z.infer<typeof formSchema>;

interface StockAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockAuditDialog({
  open,
  onOpenChange,
}: StockAuditDialogProps) {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      counts: [],
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['storage-locations', organizationId],
    queryFn: () => stockService.getLocations(organizationId),
  });

  const { data: stockItems } = useQuery({
    queryKey: ['stock-items', selectedLocation],
    queryFn: () => 
      selectedLocation 
        ? stockService.getStockItems(organizationId, selectedLocation)
        : Promise.resolve([]),
    enabled: !!selectedLocation,
  });

  const { mutate: submitAudit, isLoading: isSubmitting } = useMutation({
    mutationFn: (values: FormValues) =>
      stockService.submitStockAudit(organizationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-items']);
      onOpenChange(false);
      toast({
        title: 'Audit submitted',
        description: 'Stock audit has been completed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error submitting audit',
        description: 'Failed to submit stock audit. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    if (stockItems) {
      form.setValue('counts', stockItems.map(item => ({
        medicationId: item.medicationId,
        batchNumber: item.batchNumber,
        expectedQuantity: item.quantity,
        actualQuantity: item.quantity,
        notes: '',
      })));
    }
  };

  const onSubmit = (values: FormValues) => {
    const discrepancies = values.counts.filter(
      count => count.actualQuantity !== count.expectedQuantity
    );

    if (discrepancies.length > 0) {
      // Show confirmation dialog for discrepancies
      if (window.confirm(`Found ${discrepancies.length} discrepancies. Continue with submission?`)) {
        submitAudit(values);
      }
    } else {
      submitAudit(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Stock Audit</DialogTitle>
          <DialogDescription>
            Conduct a stock count and record any discrepancies
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onLocationChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
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

            {selectedLocation && stockItems && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Discrepancy</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch('counts').map((count, index) => {
                      const medication = stockItems.find(
                        item => item.medicationId === count.medicationId
                      );
                      const discrepancy = count.actualQuantity - count.expectedQuantity;

                      return (
                        <TableRow key={`${count.medicationId}-${count.batchNumber}`}>
                          <TableCell>{medication?.name}</TableCell>
                          <TableCell>{count.batchNumber}</TableCell>
                          <TableCell>{count.expectedQuantity}</TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`counts.${index}.actualQuantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value, 10))
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            {discrepancy !== 0 && (
                              <Badge
                                variant={discrepancy < 0 ? 'destructive' : 'default'}
                              >
                                {discrepancy > 0 ? '+' : ''}{discrepancy}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`counts.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Add notes..."
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <FormField
              control={form.control}
              name="auditNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any general notes about this audit..."
                      {...field}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Audit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 