import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Form/Input';
import { Textarea } from '@/components/ui/Form/Textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChildrenInCareTranslation } from '@/lib/i18n/hooks/useChildrenInCareTranslation';

const placementFormSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  expectedEndDate: z.string(),
  placementType: z.string().min(1, 'Placement type is required'),
  legalStatus: z.string().min(1, 'Legal status is required'),
  placingAuthority: z.string().min(1, 'Placing authority is required'),
  reasonForPlacement: z.string().min(1, 'Reason for placement is required'),
  riskAssessment: z.string().min(1, 'Risk assessment is required'),
  carePlan: z.string().min(1, 'Care plan is required'),
  contactArrangements: z.string().min(1, 'Contact arrangements are required'),
  educationArrangements: z.string().min(1, 'Education arrangements are required'),
  healthNeeds: z.string().min(1, 'Health needs are required'),
  culturalNeeds: z.string().min(1, 'Cultural needs are required'),
  specialRequirements: z.string(),
});

type PlacementFormValues = z.infer<typeof placementFormSchema>;

export const PlacementManager = () => {
  const form = useForm<PlacementFormValues>({
    resolver: zodResolver(placementFormSchema),
    defaultValues: {
      startDate: '',
      expectedEndDate: '',
      placementType: '',
      legalStatus: '',
      placingAuthority: '',
      reasonForPlacement: '',
      riskAssessment: '',
      carePlan: '',
      contactArrangements: '',
      educationArrangements: '',
      healthNeeds: '',
      culturalNeeds: '',
      specialRequirements: '',
    },
  });

  const onSubmit = async (data: PlacementFormValues) => {
    try {
      // TODO: Implement API call to save placement data
      console.log('Placement data:', data);
    } catch (error) {
      console.error('Error saving placement:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Placement Management</CardTitle>
          <CardDescription>
            Manage placement details and requirements for children in care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add New Placement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Placement</DialogTitle>
                <DialogDescription>
                  Enter the details for the new placement
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expectedEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="placementType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placement Type</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="legalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Status</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="placingAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placing Authority</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reasonForPlacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Placement</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskAssessment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Assessment</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carePlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Care Plan</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactArrangements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Arrangements</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="educationArrangements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Arrangements</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="healthNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Needs</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="culturalNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultural Needs</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requirements</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          Any additional requirements or considerations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Create Placement</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};
