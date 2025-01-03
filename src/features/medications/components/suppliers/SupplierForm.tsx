/**
 * @writecarenotes.com
 * @fileoverview Supplier form component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Form component for adding and editing medication suppliers
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
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { MedicationSupplier } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accountNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  orderMethods: z.array(z.string()).min(1, 'At least one order method is required'),
  contacts: z.array(z.object({
    name: z.string().min(1, 'Contact name is required'),
    role: z.string().min(1, 'Contact role is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Contact phone is required'),
    isMain: z.boolean(),
  })).min(1, 'At least one contact is required'),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: MedicationSupplier;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
}

const ORDER_METHODS = [
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'portal', label: 'Online Portal' },
  { id: 'fax', label: 'Fax' },
  { id: 'edi', label: 'EDI' },
];

export function SupplierForm({ supplier, onSubmit, onCancel }: SupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSupplier, updateSupplier } = useSuppliers();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier ? {
      ...supplier,
      contacts: supplier.contacts.map(contact => ({
        ...contact,
        isMain: contact.isMain || false,
      })),
    } : {
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      orderMethods: [],
      contacts: [{
        name: '',
        role: '',
        email: '',
        phone: '',
        isMain: true,
      }],
      notes: '',
    },
  });

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      setIsSubmitting(true);
      if (supplier) {
        await updateSupplier(supplier.id, data);
      } else {
        await addSupplier(data);
      }
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting supplier:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const addContact = () => {
    const contacts = form.getValues('contacts');
    form.setValue('contacts', [
      ...contacts,
      {
        name: '',
        role: '',
        email: '',
        phone: '',
        isMain: false,
      },
    ]);
  };

  const removeContact = (index: number) => {
    const contacts = form.getValues('contacts');
    if (contacts.length > 1) {
      form.setValue('contacts', contacts.filter((_, i) => i !== index));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orderMethods"
          render={() => (
            <FormItem>
              <FormLabel>Order Methods *</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {ORDER_METHODS.map((method) => (
                  <FormField
                    key={method.id}
                    control={form.control}
                    name="orderMethods"
                    render={({ field }) => (
                      <FormItem
                        key={method.id}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(method.id)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              if (checked) {
                                field.onChange([...value, method.id]);
                              } else {
                                field.onChange(value.filter((v) => v !== method.id));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {method.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Contacts *</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addContact}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {form.watch('contacts').map((_, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Contact {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`contacts.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contacts.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contacts.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contacts.${index}.phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`contacts.${index}.isMain`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          // Uncheck other main contacts
                          if (checked) {
                            const contacts = form.getValues('contacts');
                            contacts.forEach((_, i) => {
                              if (i !== index) {
                                form.setValue(`contacts.${i}.isMain`, false);
                              }
                            });
                          }
                          field.onChange(checked);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Main Contact
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          ))}
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
                Additional information about the supplier
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
            {isSubmitting ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 