import React from 'react';
import { ChildPerson } from '../../../../types/care';

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
        <button className="btn-primary">Add Record</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Details */}
        <div className="bg-white p-4 rounded-lg shadow">
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
        </div>

        {/* Special Needs */}
        {education.specialNeeds && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-gray-900">Special Educational Needs</h3>
            <ul className="mt-2 space-y-1">
              {education.specialNeeds.map((need, index) => (
                <li key={index} className="text-sm">• {need}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Education Plan */}
      {education.educationPlan && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Education Plan</h3>
          <p className="mt-2 text-sm">{education.educationPlan}</p>
        </div>
      )}
    </div>
  );
};
