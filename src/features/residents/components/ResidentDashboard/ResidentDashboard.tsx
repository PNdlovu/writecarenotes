import React from 'react';
import { Card, Row, Col, Statistic, Timeline, List, Tag, Space, Button, Typography } from 'antd';
import type { Resident } from '../../types/resident.types';
import type { CareNote } from '../CareNotes/CareNotes';
import type { MedicationSchedule } from '../MedicationTracker/MedicationTracker';

const { Text, Title } = Typography;

interface ResidentDashboardProps {
  resident: Resident;
  recentCareNotes: CareNote[];
  upcomingMedications: MedicationSchedule[];
  todayActivities?: Array<{
    id: string;
    time: Date;
    activity: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  }>;
  vitalSigns?: Array<{
    type: string;
    value: number;
    unit: string;
    time: Date;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  }>;
  onViewProfile: () => void;
  onViewCareNotes: () => void;
  onViewMedications: () => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  resident,
  recentCareNotes,
  upcomingMedications,
  todayActivities,
  vitalSigns,
  onViewProfile,
  onViewCareNotes,
  onViewMedications,
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'green',
      SCHEDULED: 'blue',
      COMPLETED: 'green',
      CANCELLED: 'red',
      NORMAL: 'green',
      WARNING: 'orange',
      CRITICAL: 'red',
    };
    return colors[status] || 'default';
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={16}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space direction="vertical" size={0}>
                  <Title level={4}>{resident.firstName} {resident.lastName}</Title>
                  <Text type="secondary">Room: {resident.roomNumber}</Text>
                </Space>
                <Space>
                  <Tag color={getStatusColor(resident.status)}>{resident.status}</Tag>
                  <Tag color="blue">{resident.careType}</Tag>
                  <Button type="link" onClick={onViewProfile}>View Profile</Button>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Days in Care"
              value={Math.floor((new Date().getTime() - resident.admissionDate.getTime()) / (1000 * 60 * 60 * 24))}
              suffix="days"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Upcoming Medications" extra={<Button type="link" onClick={onViewMedications}>View All</Button>}>
            <Timeline>
              {upcomingMedications.slice(0, 3).map(schedule => {
                const timeDiff = schedule.scheduledTime.getTime() - new Date().getTime();
                const minutesUntil = Math.floor(timeDiff / (1000 * 60));
                
                return (
                  <Timeline.Item
                    key={schedule.id}
                    color={getStatusColor(schedule.status)}
                  >
                    <Text strong>{schedule.scheduledTime.toLocaleTimeString()}</Text>
                    <br />
                    <Text>{schedule.medicationId}</Text>
                    <br />
                    <Text type="secondary">in {minutesUntil} minutes</Text>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card title="Recent Care Notes" extra={<Button type="link" onClick={onViewCareNotes}>View All</Button>}>
            <List
              size="small"
              dataSource={recentCareNotes.slice(0, 3)}
              renderItem={note => (
                <List.Item>
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Space>
                      <Tag color={getStatusColor(note.category)}>{note.category}</Tag>
                      <Text type="secondary">{note.createdAt.toLocaleTimeString()}</Text>
                    </Space>
                    <Text>{note.content.substring(0, 100)}...</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {todayActivities && (
          <Col xs={24} sm={12} md={8}>
            <Card title="Today's Activities">
              <Timeline>
                {todayActivities.map(activity => (
                  <Timeline.Item
                    key={activity.id}
                    color={getStatusColor(activity.status)}
                  >
                    <Text strong>{activity.time.toLocaleTimeString()}</Text>
                    <br />
                    <Text>{activity.activity}</Text>
                    <Tag color={getStatusColor(activity.status)}>{activity.status}</Tag>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        )}

        {vitalSigns && (
          <Col xs={24} sm={12} md={8}>
            <Card title="Latest Vital Signs">
              <List
                size="small"
                dataSource={vitalSigns}
                renderItem={vital => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{vital.type}</Text>
                      <Space>
                        <Text strong>{vital.value} {vital.unit}</Text>
                        <Tag color={getStatusColor(vital.status)}>{vital.status}</Tag>
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        )}
      </Row>
    </Space>
  );
};


