/**
 * @writecarenotes.com
 * @fileoverview Client management page for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Client management interface for domiciliary care services,
 * integrating assessments, care packages, and visit scheduling.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ClientList } from '@/features/clients';
import { ClientAssessment } from '../components/clients/ClientAssessment';
import { CarePackage } from '../components/care/CarePackage';
import { VisitScheduler } from '../components/visits/VisitScheduler';
import type { Client, Assessment } from '@/types';
import type { DomiciliaryCarePlan } from '../types';

export const ClientManagement = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedCarePlan, setSelectedCarePlan] = useState<DomiciliaryCarePlan | null>(null);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Client Management</h1>
        <p className="text-gray-500">
          Manage domiciliary care clients and services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <Card.Title>Clients</Card.Title>
            </Card.Header>
            <Card.Body>
              <ClientList
                filters={{ serviceType: 'DOMICILIARY' }}
                onClientSelect={setSelectedClient}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <Card>
              <Card.Header>
                <Card.Title>{selectedClient.name}</Card.Title>
                <Card.Description>
                  Client ID: {selectedClient.id}
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Tabs defaultValue="overview">
                  <Tabs.List>
                    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                    <Tabs.Trigger value="assessment">Assessment</Tabs.Trigger>
                    <Tabs.Trigger value="care-package">Care Package</Tabs.Trigger>
                    <Tabs.Trigger value="visits">Visits</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="overview">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Card>
                        <Card.Header>
                          <Card.Title>Personal Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-sm text-gray-500">Address</dt>
                              <dd>{selectedClient.address}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Phone</dt>
                              <dd>{selectedClient.phone}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">NOK</dt>
                              <dd>{selectedClient.nextOfKin?.name}</dd>
                            </div>
                          </dl>
                        </Card.Body>
                      </Card>

                      <Card>
                        <Card.Header>
                          <Card.Title>Service Summary</Card.Title>
                        </Card.Header>
                        <Card.Body>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-sm text-gray-500">Status</dt>
                              <dd>{selectedCarePlan?.status || 'No Care Package'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Visit Frequency</dt>
                              <dd>{selectedCarePlan?.visitRequirements?.preferredTimes.length || 0} times per week</dd>
                            </div>
                          </dl>
                        </Card.Body>
                      </Card>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="assessment">
                    <div className="mt-4">
                      <ClientAssessment
                        clientId={selectedClient.id}
                        onAssessmentComplete={setSelectedAssessment}
                      />
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="care-package">
                    <div className="mt-4">
                      {selectedAssessment ? (
                        <CarePackage
                          clientId={selectedClient.id}
                          assessmentId={selectedAssessment.id}
                          onPackageCreated={setSelectedCarePlan}
                        />
                      ) : (
                        <Card>
                          <Card.Body>
                            <p className="text-center text-gray-500">
                              Please complete an assessment first
                            </p>
                          </Card.Body>
                        </Card>
                      )}
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="visits">
                    <div className="mt-4">
                      {selectedCarePlan ? (
                        <VisitScheduler
                          clientId={selectedClient.id}
                          carePlanId={selectedCarePlan.id}
                        />
                      ) : (
                        <Card>
                          <Card.Body>
                            <p className="text-center text-gray-500">
                              Please create a care package first
                            </p>
                          </Card.Body>
                        </Card>
                      )}
                    </div>
                  </Tabs.Content>
                </Tabs>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                <p className="text-center text-gray-500">
                  Select a client to view details
                </p>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 