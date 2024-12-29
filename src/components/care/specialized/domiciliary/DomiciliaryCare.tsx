import React from 'react';
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';

interface DomiciliaryCareProps extends BaseCareProps {
  homeAssessment?: {
    livingArrangement: string;
    accessNeeds: string[];
    safetyMeasures: string[];
    equipmentRequired: string[];
  };
  careSchedule?: {
    visits: {
      time: string;
      duration: string;
      tasks: string[];
      carers: number;
    }[];
    preferences: {
      preferredTimes: string[];
      preferredCarers?: string[];
      specialInstructions?: string[];
    };
  };
}

export const DomiciliaryCare: React.FC<DomiciliaryCareProps> = (props) => {
  const { homeAssessment, careSchedule, ...baseProps } = props;

  return (
    <div className="space-y-6">
      <BaseCareComponent {...baseProps} />
      
      {/* Domiciliary Care specific components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {homeAssessment && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Home Assessment</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Living Arrangement</dt>
                <dd>{homeAssessment.livingArrangement}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Access Needs</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {homeAssessment.accessNeeds.map((need, index) => (
                      <li key={index}>{need}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Safety Measures</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {homeAssessment.safetyMeasures.map((measure, index) => (
                      <li key={index}>{measure}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Required Equipment</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {homeAssessment.equipmentRequired.map((equipment, index) => (
                      <li key={index}>{equipment}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {careSchedule && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Care Schedule</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500 mb-2">Daily Visits</dt>
                <dd>
                  {careSchedule.visits.map((visit, index) => (
                    <div key={index} className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{visit.time}</span>
                        <span className="text-sm text-gray-500">
                          {visit.duration} - {visit.carers} carer(s)
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-sm">
                        {visit.tasks.map((task, tIndex) => (
                          <li key={tIndex}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Preferences</dt>
                <dd className="space-y-2">
                  <div>
                    <span className="text-sm">Preferred Times:</span>
                    <ul className="list-disc list-inside text-sm">
                      {careSchedule.preferences.preferredTimes.map((time, index) => (
                        <li key={index}>{time}</li>
                      ))}
                    </ul>
                  </div>
                  {careSchedule.preferences.preferredCarers && (
                    <div>
                      <span className="text-sm">Preferred Carers:</span>
                      <ul className="list-disc list-inside text-sm">
                        {careSchedule.preferences.preferredCarers.map((carer, index) => (
                          <li key={index}>{carer}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {careSchedule.preferences.specialInstructions && (
                    <div>
                      <span className="text-sm">Special Instructions:</span>
                      <ul className="list-disc list-inside text-sm">
                        {careSchedule.preferences.specialInstructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};
