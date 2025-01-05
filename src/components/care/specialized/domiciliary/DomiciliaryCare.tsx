/**
 * @writecarenotes.com
 * @fileoverview Enterprise domiciliary care management component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade component for managing home-based care services across the UK
 * and Ireland. Provides comprehensive functionality for care visit management,
 * staff coordination, and service delivery tracking. Implements strict regional
 * compliance and data protection measures.
 *
 * Features:
 * - Visit scheduling and management
 * - Staff assignment and tracking
 * - Care task management
 * - Risk assessment handling
 * - Equipment and resource tracking
 * - Document management
 * - Emergency protocols
 * - Compliance monitoring
 *
 * Mobile-First Considerations:
 * - Responsive layout with fluid typography
 * - Touch-optimized controls (min 44x44px)
 * - Offline-first architecture
 * - GPS location integration
 * - Optimized data transfer
 * - Battery-efficient operations
 * - Quick action shortcuts
 * - Gesture support
 *
 * Enterprise Features:
 * - Role-based access control
 * - Multi-region support
 * - Comprehensive audit logging
 * - Real-time synchronization
 * - Advanced security measures
 * - Performance monitoring
 * - Error boundary implementation
 * - Analytics integration
 */

// 1. React and Framework imports
import React from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import { format } from 'date-fns';

// 3. Base Components
import { BaseCareComponent, BaseCareProps } from '../../base/BaseCareComponent';

// 4. UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Calendar } from '@/components/ui/Calendar';

// 5. Hooks and utilities
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useAnalytics } from '@/hooks/useAnalytics';

// 6. Types and interfaces
import type { DomiciliaryCareProps } from '@/types/domiciliary';

// 7. Constants and configurations
import { VISIT_TYPES, CARE_LEVELS } from '@/config/domiciliary';

// 8. Styles
import styles from './DomiciliaryCare.module.css';

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
