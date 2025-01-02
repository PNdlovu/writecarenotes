/**
 * @writecarenotes.com
 * @fileoverview New Call Form Component
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, AlertTriangle } from 'lucide-react';

import { Dialog } from '@/components/ui/Dialog';
import { Form } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button/Button';
import { Typography } from '@/components/ui/Typography';
import { Alert } from '@/components/ui/Alert';

import { OnCallRecord, Priority } from '../types/OnCallTypes';

const formSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    priority: z.enum(['urgent', 'high', 'medium', 'low'] as const),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.object({
        unit: z.string().min(1, 'Unit is required'),
        floor: z.string().min(1, 'Floor is required'),
        room: z.string().optional()
    }),
    resident: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        roomNumber: z.string().optional()
    }).optional()
});

interface NewCallFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<OnCallRecord>) => Promise<void>;
}

export const NewCallForm: React.FC<NewCallFormProps> = ({
    open,
    onClose,
    onSubmit
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: '',
            priority: 'medium',
            description: '',
            location: {
                unit: '',
                floor: '',
                room: ''
            }
        }
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            await onSubmit(data);
            form.reset();
            onClose();
        } catch (error) {
            form.setError('root', {
                type: 'submit',
                message: error instanceof Error ? error.message : 'Failed to create call'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <Dialog.Content className="sm:max-w-[500px]">
                <Dialog.Header>
                    <Dialog.Title>New On-Call Record</Dialog.Title>
                    <Dialog.Description>
                        Create a new on-call record. Fill in all required information.
                    </Dialog.Description>
                </Dialog.Header>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {form.formState.errors.root && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <Alert.Title>Error</Alert.Title>
                                <Alert.Description>
                                    {form.formState.errors.root.message}
                                </Alert.Description>
                            </Alert>
                        )}

                        <Form.Field
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <Form.Item>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control>
                                        <Form.Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <Form.SelectTrigger>
                                                <Form.SelectValue placeholder="Select category" />
                                            </Form.SelectTrigger>
                                            <Form.SelectContent>
                                                <Form.SelectItem value="medical">Medical Emergency</Form.SelectItem>
                                                <Form.SelectItem value="behavioral">Behavioral Issue</Form.SelectItem>
                                                <Form.SelectItem value="facility">Facility Issue</Form.SelectItem>
                                                <Form.SelectItem value="other">Other</Form.SelectItem>
                                            </Form.SelectContent>
                                        </Form.Select>
                                    </Form.Control>
                                    <Form.Message />
                                </Form.Item>
                            )}
                        />

                        <Form.Field
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <Form.Item>
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Control>
                                        <Form.RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <Form.RadioGroupItem
                                                value="urgent"
                                                label="Urgent"
                                                className="bg-red-50 data-[state=checked]:bg-red-100"
                                            />
                                            <Form.RadioGroupItem
                                                value="high"
                                                label="High"
                                                className="bg-orange-50 data-[state=checked]:bg-orange-100"
                                            />
                                            <Form.RadioGroupItem
                                                value="medium"
                                                label="Medium"
                                                className="bg-yellow-50 data-[state=checked]:bg-yellow-100"
                                            />
                                            <Form.RadioGroupItem
                                                value="low"
                                                label="Low"
                                                className="bg-green-50 data-[state=checked]:bg-green-100"
                                            />
                                        </Form.RadioGroup>
                                    </Form.Control>
                                    <Form.Message />
                                </Form.Item>
                            )}
                        />

                        <Form.Field
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <Form.Item>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control>
                                        <Form.Textarea
                                            {...field}
                                            placeholder="Describe the situation..."
                                            className="h-32"
                                        />
                                    </Form.Control>
                                    <Form.Message />
                                </Form.Item>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Field
                                control={form.control}
                                name="location.unit"
                                render={({ field }) => (
                                    <Form.Item>
                                        <Form.Label>Unit</Form.Label>
                                        <Form.Control>
                                            <Form.Input {...field} placeholder="Enter unit" />
                                        </Form.Control>
                                        <Form.Message />
                                    </Form.Item>
                                )}
                            />

                            <Form.Field
                                control={form.control}
                                name="location.floor"
                                render={({ field }) => (
                                    <Form.Item>
                                        <Form.Label>Floor</Form.Label>
                                        <Form.Control>
                                            <Form.Input {...field} placeholder="Enter floor" />
                                        </Form.Control>
                                        <Form.Message />
                                    </Form.Item>
                                )}
                            />

                            <Form.Field
                                control={form.control}
                                name="location.room"
                                render={({ field }) => (
                                    <Form.Item>
                                        <Form.Label>Room (Optional)</Form.Label>
                                        <Form.Control>
                                            <Form.Input {...field} placeholder="Enter room" />
                                        </Form.Control>
                                        <Form.Message />
                                    </Form.Item>
                                )}
                            />
                        </div>

                        <Dialog.Footer>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                    <>Creating...</>
                                ) : (
                                    <>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Create Call
                                    </>
                                )}
                            </Button>
                        </Dialog.Footer>
                    </form>
                </Form>
            </Dialog.Content>
        </Dialog>
    );
};
