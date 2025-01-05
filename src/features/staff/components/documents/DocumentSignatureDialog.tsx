import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import {
  Form,
  FormControl,
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
} from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { useToast } from '@/components/ui/UseToast';
import { Document } from '@/features/staff/types';

const signatureSchema = z.object({
  signatureType: z.enum(['APPROVED', 'REVIEWED', 'SIGNED']),
  comments: z.string().optional(),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

interface DocumentSignatureDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignatureComplete: () => void;
}

export function DocumentSignatureDialog({
  document,
  open,
  onOpenChange,
  onSignatureComplete,
}: DocumentSignatureDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signatureType: 'SIGNED',
      comments: '',
    },
  });

  const handleSubmit = async (data: SignatureFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/staff/${document.staffId}/documents/${document.id}/signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to sign document');
      }

      toast({
        title: 'Document signed successfully',
        description: `Document has been ${data.signatureType.toLowerCase()}`,
      });

      onSignatureComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Document</DialogTitle>
          <DialogDescription>
            Add your signature to "{document.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="signatureType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signature Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select signature type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="APPROVED">Approve</SelectItem>
                      <SelectItem value="REVIEWED">Review</SelectItem>
                      <SelectItem value="SIGNED">Sign</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any comments about your signature"
                      className="h-20"
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing...' : 'Sign Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


