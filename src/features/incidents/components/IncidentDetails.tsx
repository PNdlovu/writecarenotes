/**
 * @writecarenotes.com
 * @fileoverview Incident details component for viewing incident information
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React component for displaying detailed incident information.
 * Shows comprehensive incident data including timeline, involved
 * parties, actions taken, and related documents. Supports both
 * viewing and investigation modes with proper access controls.
 */

import React from 'react';
import { Card, Badge, Button, Tabs, Timeline } from '@/components/ui';
import { formatDate, formatTime } from '../utils/formatters';
import { Incident, Investigation, IncidentHistory } from '../types';

interface IncidentDetailsProps {
  incident: Incident;
  investigation?: Investigation;
  onStartInvestigation?: () => void;
  onEditIncident?: () => void;
  onAddAction?: () => void;
  onUploadDocument?: () => void;
  canEdit?: boolean;
  canInvestigate?: boolean;
}

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incident,
  investigation,
  onStartInvestigation,
  onEditIncident,
  onAddAction,
  onUploadDocument,
  canEdit = false,
  canInvestigate = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">
            Incident Report #{incident.id.slice(0, 8)}
          </h2>
          <p className="text-gray-500">
            Reported on {formatDate(incident.dateTime)} at {formatTime(incident.dateTime)}
          </p>
        </div>
        <div className="flex space-x-4">
          {canEdit && (
            <Button variant="secondary" onClick={onEditIncident}>
              Edit Incident
            </Button>
          )}
          {canInvestigate && !investigation && (
            <Button variant="primary" onClick={onStartInvestigation}>
              Start Investigation
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="investigation">Investigation</Tabs.Trigger>
          <Tabs.Trigger value="actions">Actions</Tabs.Trigger>
          <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
          <Tabs.Trigger value="timeline">Timeline</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="details">
          <Card>
            <Card.Header>
              <Card.Title>Incident Details</Card.Title>
            </Card.Header>
            <Card.Content>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-500">Type</dt>
                  <dd>{incident.type.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Severity</dt>
                  <dd>
                    <Badge variant={incident.severity.toLowerCase()}>
                      {incident.severity}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <Badge variant={incident.status.toLowerCase()}>
                      {incident.status.replace(/_/g, ' ')}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd>{incident.location}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Description</dt>
                  <dd className="whitespace-pre-wrap">{incident.description}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Immediate Actions Taken</dt>
                  <dd>
                    <ul className="list-disc pl-4">
                      {incident.immediateActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </Card.Content>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="investigation">
          <Card>
            <Card.Header>
              <Card.Title>Investigation Details</Card.Title>
            </Card.Header>
            <Card.Content>
              {investigation ? (
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-gray-500">Investigator</dt>
                    <dd>
                      {investigation.investigator.name} ({investigation.investigator.role})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Findings</dt>
                    <dd>
                      <ul className="list-disc pl-4">
                        {investigation.findings.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Root Causes</dt>
                    <dd>
                      <ul className="list-disc pl-4">
                        {investigation.rootCauses.map((cause, index) => (
                          <li key={index}>{cause}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Recommendations</dt>
                    <dd>
                      <ul className="list-disc pl-4">
                        {investigation.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-gray-500">No investigation has been started yet.</p>
              )}
            </Card.Content>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="actions">
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <Card.Title>Actions</Card.Title>
                {canEdit && (
                  <Button variant="secondary" onClick={onAddAction}>
                    Add Action
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Content>
              {incident.actions.length > 0 ? (
                <ul className="space-y-4">
                  {incident.actions.map((action) => (
                    <li key={action.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{action.description}</h4>
                          <p className="text-sm text-gray-500">
                            Assigned to: {action.assignedTo}
                          </p>
                        </div>
                        <Badge variant={action.status.toLowerCase()}>
                          {action.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No actions have been added yet.</p>
              )}
            </Card.Content>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="documents">
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <Card.Title>Documents</Card.Title>
                {canEdit && (
                  <Button variant="secondary" onClick={onUploadDocument}>
                    Upload Document
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Content>
              {incident.documents.length > 0 ? (
                <ul className="space-y-4">
                  {incident.documents.map((doc) => (
                    <li key={doc.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{doc.filename}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded by {doc.uploadedBy} on{' '}
                          {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                      <Button variant="link">Download</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No documents have been uploaded yet.</p>
              )}
            </Card.Content>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="timeline">
          <Card>
            <Card.Header>
              <Card.Title>Timeline</Card.Title>
            </Card.Header>
            <Card.Content>
              <Timeline>
                {incident.timeline.map((event, index) => (
                  <Timeline.Item key={index}>
                    <Timeline.Point />
                    <Timeline.Content>
                      <Timeline.Time>
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </Timeline.Time>
                      <Timeline.Title>{event.action}</Timeline.Title>
                      <Timeline.Body>
                        <p>{event.details}</p>
                        <p className="text-sm text-gray-500">By: {event.userId}</p>
                      </Timeline.Body>
                    </Timeline.Content>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card.Content>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}; 