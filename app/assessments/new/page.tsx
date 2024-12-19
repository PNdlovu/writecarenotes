'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AssessmentForm } from '@/features/assessments/components/assessment-form';
import type { CreateAssessmentData } from '@/features/assessments/types';
import { assessmentApi } from '@/features/assessments/api/assessment-service';

export default function NewAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateAssessmentData) => {
    try {
      setIsSubmitting(true);
      const response = await assessmentApi.createAssessment(data);

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      const assessment = await response.json();

      toast({
        title: 'Success',
        description: 'Assessment created successfully',
      });

      router.push(`/assessments/${assessment.id}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">New Assessment</h1>
        <p className="text-muted-foreground">Create a new assessment</p>
      </div>

      <Card className="p-6">
        <AssessmentForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}
