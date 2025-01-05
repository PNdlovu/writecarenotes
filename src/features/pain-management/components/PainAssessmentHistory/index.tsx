/**
 * @fileoverview Pain Assessment History Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author [Your Name]
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect } from 'react';
import { useTenantContext } from '@/lib/multi-tenant/hooks';
import { PainAssessmentService } from '../../services/painAssessmentService';
import { PainAssessment } from '../../types';
import { formatDate } from '@/lib/utils/date';

interface PainAssessmentHistoryProps {
  residentId: string;
}

export function PainAssessmentHistory({ residentId }: PainAssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<PainAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tenantContext = useTenantContext();

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const service = new PainAssessmentService(
          tenantContext,
          // Add other required services
        );

        const data = await service.getResidentAssessments(residentId);
        setAssessments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [residentId, tenantContext]);

  if (loading) {
    return <div>Loading assessments...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pain Assessment History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pain Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessed By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assessments.map((assessment) => (
              <tr key={assessment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(assessment.assessmentDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    assessment.painScore >= 7 ? 'bg-red-100 text-red-800' :
                    assessment.painScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {assessment.painScore}/10
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assessment.painType}
                </td>
                <td className="px-6 py-4">
                  {assessment.location.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assessment.assessedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 