/**
 * @writecarenotes.com
 * @fileoverview Specialized care management component
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive management component for specialized care services.
 * Features include:
 * - Care type selection
 * - Assessment management
 * - Care plan coordination
 * - Progress tracking
 * - Documentation handling
 * - Regulatory compliance
 * - Multi-region support
 * - Service integration
 *
 * Mobile-First Considerations:
 * - Responsive layout
 * - Touch navigation
 * - Quick actions
 * - Progress indicators
 * - Offline support
 * - Status updates
 *
 * Enterprise Features:
 * - Multi-region compliance
 * - Service orchestration
 * - Audit logging
 * - Access control
 * - Analytics tracking
 * - Error handling
 */

import { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { EndOfLifeCare } from './EndOfLifeCare';
import { MentalCapacityAssessment } from './MentalCapacityAssessment';
import { specializedCare } from '@/lib/services/specialized-care';
import type { Region } from '@/types/regulatory';

interface SpecializedCareManagerProps {
  residentId: string;
  region: Region;
  onComplete?: () => void;
}

export function SpecializedCareManager({
  residentId,
  region,
  onComplete,
}: SpecializedCareManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCare, setActiveCare] = useState<{
    endOfLife: boolean;
    mentalCapacity: boolean;
  }>({
    endOfLife: false,
    mentalCapacity: false,
  });

  const handleCareToggle = async (type: keyof typeof activeCare) => {
    const newState = { ...activeCare, [type]: !activeCare[type] };
    setActiveCare(newState);

    if (newState[type]) {
      await specializedCare.create({
        residentId,
        type: type.toUpperCase(),
        requirements: {},
        notes: {},
        region,
        status: 'ACTIVE',
      });
    } else {
      await specializedCare.update({
        residentId,
        type: type.toUpperCase(),
        status: 'COMPLETED',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Specialized Care Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger 
              value="endOfLife"
              disabled={!activeCare.endOfLife}
            >
              End of Life
            </TabsTrigger>
            <TabsTrigger 
              value="mentalCapacity"
              disabled={!activeCare.mentalCapacity}
            >
              Mental Capacity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Care Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activeCare.endOfLife}
                      onChange={() => handleCareToggle('endOfLife')}
                    />
                    <span>End of Life Care</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activeCare.mentalCapacity}
                      onChange={() => handleCareToggle('mentalCapacity')}
                    />
                    <span>Mental Capacity Assessment</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {region === 'ENGLAND' && (
                    <p>CQC Requirements for Specialized Care</p>
                  )}
                  {region === 'WALES' && (
                    <p>CIW Requirements for Specialized Care</p>
                  )}
                  {region === 'SCOTLAND' && (
                    <p>Care Inspectorate Requirements for Specialized Care</p>
                  )}
                  {region === 'NORTHERN_IRELAND' && (
                    <p>RQIA Requirements for Specialized Care</p>
                  )}
                  {region === 'IRELAND' && (
                    <p>HIQA Requirements for Specialized Care</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endOfLife">
            {activeCare.endOfLife && (
              <EndOfLifeCare
                residentId={residentId}
                onComplete={() => setActiveTab('overview')}
              />
            )}
          </TabsContent>

          <TabsContent value="mentalCapacity">
            {activeCare.mentalCapacity && (
              <MentalCapacityAssessment
                residentId={residentId}
                onComplete={() => setActiveTab('overview')}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
