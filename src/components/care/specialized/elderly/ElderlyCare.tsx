import React from 'react';
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';

interface ElderlyCareProps extends BaseCareProps {
  mobilityAssessment?: {
    level: string;
    aids: string[];
    notes: string;
  };
  endOfLifeCare?: {
    plan: string;
    preferences: string[];
    dnacpr: boolean;
  };
}

export const ElderlyCare: React.FC<ElderlyCareProps> = (props) => {
  const { mobilityAssessment, endOfLifeCare, ...baseProps } = props;

  return (
    <div className="space-y-6">
      <BaseCareComponent {...baseProps} />
      
      {/* Elderly-specific components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mobilityAssessment && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Mobility Assessment</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Mobility Level</dt>
                <dd>{mobilityAssessment.level}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Mobility Aids</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {mobilityAssessment.aids.map((aid, index) => (
                      <li key={index}>{aid}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Notes</dt>
                <dd>{mobilityAssessment.notes}</dd>
              </div>
            </dl>
          </div>
        )}

        {endOfLifeCare && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">End of Life Care</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Care Plan</dt>
                <dd>{endOfLifeCare.plan}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Preferences</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {endOfLifeCare.preferences.map((pref, index) => (
                      <li key={index}>{pref}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">DNACPR Status</dt>
                <dd>{endOfLifeCare.dnacpr ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};
