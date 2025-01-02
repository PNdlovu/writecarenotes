import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Form/Input';
import { Textarea } from '@/components/ui/Form/Textarea';
import { Button } from '@/components/ui/Button';
import { PerformanceRating, ReviewType } from '@/features/staff/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const reviewSchema = z.object({
  type: z.nativeEnum(ReviewType),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  rating: z.nativeEnum(PerformanceRating),
  scores: z.array(z.object({
    category: z.string(),
    score: z.number().min(1).max(5),
    weight: z.number().min(0).max(100),
    comments: z.string().optional(),
  })),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  trainingRecommendations: z.array(z.string()).optional(),
});

interface ReviewDialogProps {
  staffId: string;
  review?: any;
  trigger?: React.ReactNode;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({ staffId, review, trigger }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: review || {
      type: ReviewType.QUARTERLY,
      period: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      rating: PerformanceRating.MEETS_EXPECTATIONS,
      scores: [
        { category: 'Job Knowledge', score: 3, weight: 20 },
        { category: 'Quality of Work', score: 3, weight: 20 },
        { category: 'Initiative', score: 3, weight: 20 },
        { category: 'Communication', score: 3, weight: 20 },
        { category: 'Teamwork', score: 3, weight: 20 },
      ],
      strengths: [],
      areasForImprovement: [],
      trainingRecommendations: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      const response = await fetch(`/api/staff/${staffId}/performance/reviews${review ? `/${review.id}` : ''}`, {
        method: review ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews', staffId] });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof reviewSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">New Review</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{review ? 'Edit' : 'New'} Performance Review</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select review type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ReviewType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
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
                name="period.start"
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
                name="period.end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PerformanceRating).map((rating) => (
                        <SelectItem key={rating} value={rating}>
                          {rating.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('scores')?.map((_, index) => (
              <div key={index} className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`scores.${index}.category`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`scores.${index}.score`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score (1-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`scores.${index}.weight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Review'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;


