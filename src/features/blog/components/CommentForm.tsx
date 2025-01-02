/**
 * @writecarenotes.com
 * @fileoverview Blog comment form component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Form component for submitting blog post comments with validation
 * and user feedback.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment is too long (max 1000 characters)'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  onSubmit: (data: CommentFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const handleFormSubmit = async (data: CommentFormData) => {
    try {
      await onSubmit(data);
      reset(); // Clear form after successful submission
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div>
        <Input
          {...register('content')}
          as="textarea"
          placeholder="Write your comment..."
          rows={4}
          error={errors.content?.message}
          disabled={isSubmitting}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Post Comment
        </Button>
      </div>
    </form>
  );
}; 