/**
 * @fileoverview Account Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Component for creating and editing accounts with validation and regional compliance
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/use-toast';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountStore } from '../../stores/accountStore';

// Form validation schema
const accountFormSchema = z.object({
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  parentAccountId: z.string().optional(),
  vatCode: z.string().optional(),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  accountId?: string;
  initialData?: AccountFormData;
}

export function AccountForm({ accountId, initialData }: AccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { validateVATCode } = useRegionalCompliance();
  const { createAccount, updateAccount, isLoading, error } = useAccountStore();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialData || {
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (data.vatCode && !validateVATCode(data.vatCode)) {
        form.setError('vatCode', {
          type: 'manual',
          message: 'Invalid VAT code for your region',
        });
        return;
      }

      if (accountId) {
        await updateAccount(accountId, data);
        toast({
          title: 'Account updated',
          description: 'The account has been successfully updated.',
        });
      } else {
        await createAccount(data);
        toast({
          title: 'Account created',
          description: 'The account has been successfully created.',
        });
      }

      router.push('/accounting/accounts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter account code" />
                </FormControl>
                <FormDescription>
                  A unique identifier for this account
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter account name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter category" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter account description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vatCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VAT Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter VAT code" />
                </FormControl>
                <FormDescription>
                  Leave blank if not applicable
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Inactive accounts cannot be used in transactions
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

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter any additional notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : accountId ? 'Update Account' : 'Create Account'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/accounting/accounts')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
} 