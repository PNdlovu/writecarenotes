import React from 'react';
import { Card, List, Badge, Tag, Space, Button, Typography, notification } from 'antd';
import type { DoLS, DoLSAssessment, DoLSReview } from '../../types/dols.types';

const { Text, Title } = Typography;

interface Notification {
  id: string;
  type: 'WARNING' | 'URGENT' | 'INFO';
  title: string;
  message: string;
  dueDate?: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DoLSNotificationsProps {
  dolsList: DoLS[];
  onScheduleReview: (dolsId: string) => void;
  onRequestAssessment: (dolsId: string, type: DoLSAssessment['type']) => void;
  onUpdateRepresentative: (dolsId: string) => void;
}

export const DoLSNotifications: React.FC<DoLSNotificationsProps> = ({
  dolsList,
  onScheduleReview,
  onRequestAssessment,
  onUpdateRepresentative,
}) => {
  const generateNotifications = (dolsList: DoLS[]): Notification[] => {
    const notifications: Notification[] = [];
    const now = new Date();

    dolsList.forEach(dols => {
      // Check DoLS expiry
      const daysUntilExpiry = Math.ceil((dols.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 0) {
        notifications.push({
          id: `expiry-${dols.id}`,
          type: 'URGENT',
          title: 'DoLS Expired',
          message: `DoLS has expired for resident. Immediate action required.`,
          dueDate: dols.endDate,
          action: {
            label: 'Request Extension',
            onClick: () => handleRequestExtension(dols.id),
          },
        });
      } else if (daysUntilExpiry <= 30) {
        notifications.push({
          id: `expiry-warning-${dols.id}`,
          type: 'WARNING',
          title: 'DoLS Expiring Soon',
          message: `DoLS will expire in ${daysUntilExpiry} days.`,
          dueDate: dols.endDate,
          action: {
            label: 'Schedule Review',
            onClick: () => onScheduleReview(dols.id),
          },
        });
      }

      // Check missing assessments
      const requiredAssessments: DoLSAssessment['type'][] = [
        'AGE',
        'MENTAL_HEALTH',
        'MENTAL_CAPACITY',
        'NO_REFUSALS',
        'ELIGIBILITY',
        'BEST_INTERESTS'
      ];

      requiredAssessments.forEach(required => {
        const assessment = dols.assessments.find(a => a.type === required);
        if (!assessment) {
          notifications.push({
            id: `missing-assessment-${dols.id}-${required}`,
            type: 'WARNING',
            title: 'Missing Assessment',
            message: `${required.replace('_', ' ')} assessment is missing.`,
            action: {
              label: 'Request Assessment',
              onClick: () => onRequestAssessment(dols.id, required),
            },
          });
        }
      });

      // Check reviews
      if (dols.reviews.length > 0) {
        const latestReview = dols.reviews[dols.reviews.length - 1];
        const daysUntilNextReview = Math.ceil(
          (latestReview.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilNextReview <= 0) {
          notifications.push({
            id: `review-overdue-${dols.id}`,
            type: 'URGENT',
            title: 'Review Overdue',
            message: 'DoLS review is overdue.',
            dueDate: latestReview.nextReviewDate,
            action: {
              label: 'Schedule Review',
              onClick: () => onScheduleReview(dols.id),
            },
          });
        } else if (daysUntilNextReview <= 14) {
          notifications.push({
            id: `review-due-${dols.id}`,
            type: 'WARNING',
            title: 'Review Due Soon',
            message: `Review due in ${daysUntilNextReview} days.`,
            dueDate: latestReview.nextReviewDate,
            action: {
              label: 'Schedule Review',
              onClick: () => onScheduleReview(dols.id),
            },
          });
        }
      }

      // Check representative visits
      if (dols.representative && dols.representative.nextVisit) {
        const daysUntilNextVisit = Math.ceil(
          (dols.representative.nextVisit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilNextVisit <= 0) {
          notifications.push({
            id: `rep-visit-overdue-${dols.id}`,
            type: 'WARNING',
            title: 'Representative Visit Overdue',
            message: 'Representative visit is overdue.',
            dueDate: dols.representative.nextVisit,
            action: {
              label: 'Update Representative',
              onClick: () => onUpdateRepresentative(dols.id),
            },
          });
        } else if (daysUntilNextVisit <= 7) {
          notifications.push({
            id: `rep-visit-due-${dols.id}`,
            type: 'INFO',
            title: 'Representative Visit Due',
            message: `Representative visit due in ${daysUntilNextVisit} days.`,
            dueDate: dols.representative.nextVisit,
          });
        }
      }
    });

    return notifications;
  };

  const handleRequestExtension = (dolsId: string) => {
    notification.info({
      message: 'Extension Request',
      description: 'Please complete the extension request form and submit to the supervisory body.',
      duration: 0,
    });
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colors: Record<Notification['type'], string> = {
      URGENT: 'red',
      WARNING: 'orange',
      INFO: 'blue'
    };
    return colors[type];
  };

  const notifications = generateNotifications(dolsList);
  const urgentCount = notifications.filter(n => n.type === 'URGENT').length;
  const warningCount = notifications.filter(n => n.type === 'WARNING').length;

  return (
    <Card
      title={
        <Space>
          <Title level={4}>DoLS Notifications</Title>
          {urgentCount > 0 && (
            <Badge count={urgentCount} style={{ backgroundColor: '#f5222d' }}>
              <Tag color="red">Urgent</Tag>
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge count={warningCount} style={{ backgroundColor: '#faad14' }}>
              <Tag color="orange">Warnings</Tag>
            </Badge>
          )}
        </Space>
      }
    >
      <List
        dataSource={notifications}
        renderItem={notification => (
          <List.Item
            extra={
              notification.action && (
                <Button
                  type={notification.type === 'URGENT' ? 'primary' : 'default'}
                  danger={notification.type === 'URGENT'}
                  onClick={notification.action.onClick}
                >
                  {notification.action.label}
                </Button>
              )
            }
          >
            <List.Item.Meta
              title={
                <Space>
                  <Badge
                    status={
                      notification.type === 'URGENT' ? 'error' :
                      notification.type === 'WARNING' ? 'warning' :
                      'processing'
                    }
                  />
                  <Text strong>{notification.title}</Text>
                  {notification.dueDate && (
                    <Tag color={getNotificationColor(notification.type)}>
                      Due: {notification.dueDate.toLocaleDateString()}
                    </Tag>
                  )}
                </Space>
              }
              description={notification.message}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};


