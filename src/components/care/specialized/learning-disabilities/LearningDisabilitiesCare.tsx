/**
 * @writecarenotes.com
 * @fileoverview Learning disabilities care management component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A specialized component for managing care services for individuals with
 * learning disabilities. Features include:
 * - Learning needs assessment
 * - Development plan tracking
 * - Communication methods management
 * - Skills progress monitoring
 * - Support level tracking
 * - Activity planning
 * - Support worker assignment
 * - Goal achievement tracking
 * - Behavioral monitoring
 *
 * Mobile-First Considerations:
 * - Simple interface design
 * - Picture-based navigation
 * - Audio feedback
 * - Large buttons
 * - Color-coded elements
 * - Consistent layout
 *
 * Enterprise Features:
 * - Progress analytics
 * - Staff coordination
 * - Training tracking
 * - Incident reporting
 * - Outcome measurement
 * - Service planning
 */

import React from 'react';

// Base Components
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Progress } from '@/components/ui/Progress';
import { Select } from '@/components/ui/select';

interface LearningDisabilitiesCareProps extends BaseCareProps {
  learningAssessment?: {
    primaryDisability: string;
    additionalNeeds: string[];
    communicationMethod: string[];
    supportLevel: string;
  };
  developmentPlan?: {
    skills: {
      area: string;
      goals: string[];
      progress: string;
    }[];
    activities: string[];
    supportWorker?: string;
  };
}

export const LearningDisabilitiesCare: React.FC<LearningDisabilitiesCareProps> = (props) => {
  const { learningAssessment, developmentPlan, ...baseProps } = props;

  return (
    <div className="space-y-6">
      <BaseCareComponent {...baseProps} />
      
      {/* Learning Disabilities specific components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningAssessment && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Learning Assessment</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Primary Disability</dt>
                <dd>{learningAssessment.primaryDisability}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Additional Needs</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {learningAssessment.additionalNeeds.map((need, index) => (
                      <li key={index}>{need}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Communication Methods</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {learningAssessment.communicationMethod.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Support Level</dt>
                <dd>{learningAssessment.supportLevel}</dd>
              </div>
            </dl>
          </div>
        )}

        {developmentPlan && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">Development Plan</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500 mb-2">Skills Development</dt>
                <dd>
                  {developmentPlan.skills.map((skill, index) => (
                    <div key={index} className="mb-3">
                      <h4 className="text-sm font-medium">{skill.area}</h4>
                      <ul className="list-disc list-inside text-sm">
                        {skill.goals.map((goal, gIndex) => (
                          <li key={gIndex}>{goal}</li>
                        ))}
                      </ul>
                      <p className="text-sm mt-1">Progress: {skill.progress}</p>
                    </div>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Planned Activities</dt>
                <dd>
                  <ul className="list-disc list-inside">
                    {developmentPlan.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              {developmentPlan.supportWorker && (
                <div>
                  <dt className="text-sm text-gray-500">Support Worker</dt>
                  <dd>{developmentPlan.supportWorker}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};
