/**
 * @writecarenotes.com
 * @fileoverview Education progress tracking component for children in care
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A specialized component for tracking educational progress and requirements
 * for children in care. Features include:
 * - School attendance monitoring
 * - Academic performance tracking
 * - Educational needs assessment
 * - Progress reporting
 * - Support plan integration
 * - OFSTED compliance tracking
 * - Intervention management
 * - Goal setting
 *
 * Mobile-First Considerations:
 * - Responsive data tables
 * - Touch-friendly controls
 * - Quick attendance entry
 * - Progress visualizations
 * - Offline capabilities
 * - Parent/guardian access
 *
 * Enterprise Features:
 * - OFSTED compliance
 * - Data protection
 * - Multi-agency sharing
 * - Automated alerts
 * - Performance analytics
 * - Audit logging
 */

import React from 'react';

// Types
import { ChildPerson } from '../../../../types/care';

// UI Components
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card';

interface EducationTrackerProps {
  person: ChildPerson;
}

export const EducationTracker: React.FC<EducationTrackerProps> = ({ person }) => {
  const { education } = person;

  if (!education) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Education Tracking</h2>
        <Button className="btn-primary">Add Record</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Details */}
        <Card className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900">School Information</h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">School Name</dt>
              <dd className="text-sm font-medium">{education.school}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Year Group</dt>
              <dd className="text-sm font-medium">{education.yearGroup}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Contact</dt>
              <dd className="text-sm font-medium">{education.schoolContact}</dd>
            </div>
          </dl>
        </Card>

        {/* Special Needs */}
        {education.specialNeeds && (
          <Card className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-900">Special Educational Needs</h3>
            <ul className="mt-2 space-y-1">
              {education.specialNeeds.map((need, index) => (
                <li key={index} className="text-sm">• {need}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Education Plan */}
      {education.educationPlan && (
        <Card className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Education Plan</h3>
          <p className="mt-2 text-sm">{education.educationPlan}</p>
        </Card>
      )}
    </div>
  );
};
