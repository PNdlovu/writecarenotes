'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getAssessment } from '@/features/assessments/api/assessment-service';
import { AssessmentForm } from '@/features/assessments/components/assessment-form';
import { fetchResidents } from '@/features/residents/api/resident-service';
import { fetchStaff } from '@/features/staff/api/staff-service';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => getAssessment(id),
  });

  const { data: residents = [], isLoading: isLoadingResidents } = useQuery({
    queryKey: ['residents'],
    queryFn: fetchResidents,
  });

  const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  const isLoading = isLoadingAssessment || isLoadingResidents || isLoadingStaff;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-4">Assessment not found</h2>
        <Button onClick={() => router.push('/assessments')}>
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Assessment</h1>
      <AssessmentForm
        assessment={assessment}
        residents={residents.map(r => ({
          id: r.id,
          name: `${r.firstName} ${r.lastName}`,
        }))}
        staff={staff.map(s => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
        }))}
      />
    </div>
  );
}
