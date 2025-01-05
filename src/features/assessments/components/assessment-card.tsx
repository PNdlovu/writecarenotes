'use client';

import { useRouter } from 'next/navigation';
import type { Assessment } from '../types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AssessmentCardProps {
  assessment: Assessment;
}

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/assessments/${assessment.id}`);
  };

  const getStatusColor = (status: Assessment['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">{assessment.residentName}</h3>
          <p className="text-gray-600">{assessment.assessmentType}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(assessment.status)}`}>
          {assessment.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Category: {assessment.category}</p>
        {assessment.completedDate && (
          <p>Completed: {new Date(assessment.completedDate).toLocaleDateString()}</p>
        )}
        <p>Next Due: {new Date(assessment.nextDueDate).toLocaleDateString()}</p>
        <p>Assigned to: {assessment.assignedTo}</p>
        {assessment.score && <p>Score: {assessment.score}</p>}
      </div>

      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {assessment.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
