/**
 * @writecarenotes.com
 * @fileoverview Mobile-optimized route optimization for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-optimized component for managing domiciliary care staff routes,
 * with touch-friendly interface and offline support.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Form';
import Map from '@/components/ui/Map';
import { Sheet as BottomSheet } from '@/components/ui/Sheet';
import { useStaff } from '@/features/staff/hooks/useStaff';
import { useVisits } from '@/features/visits/hooks/useVisits';
import { useClients } from '@/features/clients/hooks/useClients';
import { useTerritory } from '@/features/territory/hooks/useTerritory';
import { MobileLayout } from '../layout/MobileLayout';
import type { Staff, Visit, Client, Territory } from '@/types';

export const MobileRouteOptimizer = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isVisitsOpen, setIsVisitsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const { staff } = useStaff();
  const { visits } = useVisits();
  const { clients } = useClients();
  const { territories, updateTerritory } = useTerritory();

  const handleVisitAssign = async (visitId: string) => {
    if (!selectedStaff) return;
    // Implement visit assignment logic
  };

  return (
    <MobileLayout
      title="Route Optimization"
      subtitle="Manage staff routes and territories"
      actions={[
        {
          label: 'View Visits',
          onClick: () => setIsVisitsOpen(true),
          variant: 'outline'
        }
      ]}
    >
      <div className="space-y-4">
        {/* Staff Selection */}
        <Card>
          <Card.Body>
            <Select
              value={selectedStaff || ''}
              onChange={(value) => setSelectedStaff(value)}
              placeholder="Select Staff Member"
            >
              {staff.map(member => (
                <Select.Option key={member.id} value={member.id}>
                  {member.name}
                </Select.Option>
              ))}
            </Select>
          </Card.Body>
        </Card>

        {/* Map View */}
        <div className="h-[calc(100vh-16rem)] rounded-lg overflow-hidden">
          <Map
            center={{ lat: 51.5074, lng: -0.1278 }}
            zoom={13}
            markers={[
              // Staff locations
              ...staff.map(member => ({
                id: member.id,
                position: member.location,
                type: 'staff'
              })),
              // Client locations
              ...clients.map(client => ({
                id: client.id,
                position: client.location,
                type: 'client'
              }))
            ]}
            territories={territories}
            onTerritoryUpdate={updateTerritory}
            isMobile={true}
          />
        </div>

        {/* Visits Bottom Sheet */}
        <BottomSheet
          isOpen={isVisitsOpen}
          onClose={() => setIsVisitsOpen(false)}
          snapPoints={['25%', '50%', '90%']}
        >
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Unassigned Visits</h3>
              <Button
                variant="ghost"
                onClick={() => setIsVisitsOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-2">
              {visits
                .filter(visit => !visit.staffId)
                .map(visit => (
                  <Card key={visit.id}>
                    <Card.Body className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{visit.client.name}</p>
                          <p className="text-sm text-gray-500">
                            {visit.scheduledTime}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVisitAssign(visit.id)}
                          disabled={!selectedStaff}
                        >
                          Assign
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
            </div>
          </div>
        </BottomSheet>

        {/* Territory Quick View */}
        <div className="space-y-2">
          {territories.map(territory => (
            <Card key={territory.id}>
              <Card.Body className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{territory.name}</h4>
                    <p className="text-sm text-gray-500">
                      {territory.staff.length} staff • {territory.clients.length} clients
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Implement territory focus on map
                    }}
                  >
                    View
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}; 