'use client';

import { useQuery } from '@tanstack/react-query';
import { AssessmentForm } from '@/features/assessments/components/assessment-form';
import { fetchResidents } from '@/features/residents/api/resident-service';
import { fetchStaff } from '@/features/staff/api/staff-service';

export default function NewAssessmentPage() {
  const { data: residents = [], isLoading: isLoadingResidents } = useQuery({
    queryKey: ['residents'],
    queryFn: fetchResidents,
  });

  const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  if (isLoadingResidents || isLoadingStaff) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">New Assessment</h1>
      <AssessmentForm
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
