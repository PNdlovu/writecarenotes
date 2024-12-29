import React from 'react';
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';

interface MentalHealthCareProps extends BaseCareProps {
  mentalHealthAssessment?: {
    diagnosis: string[];
    riskLevel: string;
    interventions: string[];
    medications: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
  };
  therapyPlan?: {
    type: string;
    frequency: string;
    goals: string[];
    progress: string;
  };
}

export const MentalHealthCare: React.FC<MentalHealthCareProps> = (props) => {
  const { mentalHealthAssessment, therapyPlan, ...baseProps } = props;

  return (
    <div className="space-y-6">
      <BaseCareComponent {...baseProps} />
      
      {/* Mental Health specific components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mentalHealthAssessment && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Mental Health Assessment</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Diagnosis</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {mentalHealthAssessment.diagnosis.map((diag, index) => (
                      <li key={index}>{diag}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Risk Level</dt>
                <dd>{mentalHealthAssessment.riskLevel}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Current Medications</dt>
                <dd>
                  <ul className="space-y-2">
                    {mentalHealthAssessment.medications.map((med, index) => (
                      <li key={index} className="text-sm">
                        {med.name} - {med.dosage} ({med.frequency})
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {therapyPlan && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Therapy Plan</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Type</dt>
                <dd>{therapyPlan.type}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Frequency</dt>
                <dd>{therapyPlan.frequency}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Goals</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {therapyPlan.goals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Progress</dt>
                <dd>{therapyPlan.progress}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};
