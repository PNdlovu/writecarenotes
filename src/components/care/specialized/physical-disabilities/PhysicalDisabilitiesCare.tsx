import React from 'react';
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';

interface PhysicalDisabilitiesCareProps extends BaseCareProps {
  physicalAssessment?: {
    primaryDisability: string;
    mobilityStatus: string;
    equipmentNeeds: string[];
    adaptations: string[];
  };
  rehabilitationPlan?: {
    therapies: {
      type: string;
      frequency: string;
      provider: string;
      goals: string[];
    }[];
    exercises: {
      name: string;
      frequency: string;
      instructions: string;
    }[];
  };
}

export const PhysicalDisabilitiesCare: React.FC<PhysicalDisabilitiesCareProps> = (props) => {
  const { physicalAssessment, rehabilitationPlan, ...baseProps } = props;

  return (
    <div className="space-y-6">
      <BaseCareComponent {...baseProps} />
      
      {/* Physical Disabilities specific components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {physicalAssessment && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Physical Assessment</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Primary Disability</dt>
                <dd>{physicalAssessment.primaryDisability}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Mobility Status</dt>
                <dd>{physicalAssessment.mobilityStatus}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Equipment Needs</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {physicalAssessment.equipmentNeeds.map((need, index) => (
                      <li key={index}>{need}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Required Adaptations</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {physicalAssessment.adaptations.map((adaptation, index) => (
                      <li key={index}>{adaptation}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {rehabilitationPlan && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Rehabilitation Plan</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500 mb-2">Therapies</dt>
                <dd>
                  {rehabilitationPlan.therapies.map((therapy, index) => (
                    <div key={index} className="mb-3">
                      <h4 className="text-sm font-medium">{therapy.type}</h4>
                      <p className="text-sm">Provider: {therapy.provider}</p>
                      <p className="text-sm">Frequency: {therapy.frequency}</p>
                      <div className="mt-1">
                        <span className="text-sm text-gray-500">Goals:</span>
                        <ul className="list-disc list-inside text-sm">
                          {therapy.goals.map((goal, gIndex) => (
                            <li key={gIndex}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-2">Exercise Program</dt>
                <dd>
                  {rehabilitationPlan.exercises.map((exercise, index) => (
                    <div key={index} className="mb-2">
                      <h4 className="text-sm font-medium">{exercise.name}</h4>
                      <p className="text-sm">Frequency: {exercise.frequency}</p>
                      <p className="text-sm">{exercise.instructions}</p>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};
