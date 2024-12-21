import React from 'react';
import { Card, Tabs, Typography, Badge, Space, Button } from 'antd';
import type { Resident } from '../../types/resident.types';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface ResidentProfileProps {
  resident: Resident;
  onEdit?: () => void;
  onAssessment?: () => void;
  onCareNotes?: () => void;
}

export const ResidentProfile: React.FC<ResidentProfileProps> = ({
  resident,
  onEdit,
  onAssessment,
  onCareNotes,
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'green',
      DISCHARGED: 'grey',
      TEMPORARY: 'blue',
      HOSPITAL: 'orange',
      DECEASED: 'black',
    };
    return colors[status] || 'default';
  };

  const getCareTypeDisplay = (careType: string) => {
    return careType.charAt(0) + careType.slice(1).toLowerCase().replace('_', ' ');
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Title level={4}>
              {resident.title} {resident.firstName} {resident.lastName}
            </Title>
            <Text type="secondary">NHS: {resident.nhsNumber || 'Not provided'}</Text>
          </div>
          <Space>
            <Badge status={getStatusColor(resident.status)} text={resident.status} />
            <Badge color="blue" text={getCareTypeDisplay(resident.careType)} />
          </Space>
        </Space>

        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card size="small" title="Personal Details">
                <p><strong>Date of Birth:</strong> {resident.dateOfBirth.toLocaleDateString()}</p>
                <p><strong>Room:</strong> {resident.roomNumber || 'Not assigned'}</p>
                <p><strong>Admission Date:</strong> {resident.admissionDate.toLocaleDateString()}</p>
                {resident.dischargeDate && (
                  <p><strong>Discharge Date:</strong> {resident.dischargeDate.toLocaleDateString()}</p>
                )}
              </Card>

              {resident.mobilityStatus && (
                <Card size="small" title="Mobility">
                  <p><strong>Level:</strong> {resident.mobilityStatus.level}</p>
                  {resident.mobilityStatus.transferAssistance && (
                    <p><strong>Transfer Assistance:</strong> {resident.mobilityStatus.transferAssistance}</p>
                  )}
                </Card>
              )}

              {resident.communicationNeeds && (
                <Card size="small" title="Communication">
                  <p><strong>Primary Language:</strong> {resident.communicationNeeds.primaryLanguage}</p>
                  {resident.communicationNeeds.interpreterRequired && (
                    <Badge status="warning" text="Interpreter Required" />
                  )}
                </Card>
              )}
            </Space>
          </TabPane>

          <TabPane tab="Medical" key="medical">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {resident.medicalConditions && (
                <Card size="small" title="Medical Conditions">
                  <ul>
                    {resident.medicalConditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {resident.allergies && (
                <Card size="small" title="Allergies">
                  <ul>
                    {resident.allergies.map((allergy, index) => (
                      <li key={index}>{allergy}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {resident.dnrStatus !== undefined && (
                <Card size="small" title="DNR Status">
                  <Badge
                    status={resident.dnrStatus ? 'error' : 'success'}
                    text={resident.dnrStatus ? 'DNR in Place' : 'No DNR'}
                  />
                </Card>
              )}
            </Space>
          </TabPane>

          <TabPane tab="Care Preferences" key="preferences">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {resident.culturalPreferences && (
                <Card size="small" title="Cultural Preferences">
                  {resident.culturalPreferences.religion && (
                    <p><strong>Religion:</strong> {resident.culturalPreferences.religion}</p>
                  )}
                  {resident.culturalPreferences.dietaryRestrictions && (
                    <>
                      <p><strong>Dietary Restrictions:</strong></p>
                      <ul>
                        {resident.culturalPreferences.dietaryRestrictions.map((restriction, index) => (
                          <li key={index}>{restriction}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>
              )}
            </Space>
          </TabPane>
        </Tabs>

        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          {onEdit && <Button onClick={onEdit}>Edit Profile</Button>}
          {onAssessment && <Button type="primary" onClick={onAssessment}>New Assessment</Button>}
          {onCareNotes && <Button onClick={onCareNotes}>Care Notes</Button>}
        </Space>
      </Space>
    </Card>
  );
};


