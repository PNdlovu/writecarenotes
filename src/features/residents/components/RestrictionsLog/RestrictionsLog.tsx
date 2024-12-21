import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Typography, Alert } from 'antd';
import type { TableProps } from 'antd';
import type { Resident } from '../../types/resident.types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export interface Restriction {
  id: string;
  residentId: string;
  type: 'PHYSICAL' | 'CHEMICAL' | 'ENVIRONMENTAL' | 'SURVEILLANCE';
  details: string;
  approved: boolean;
  approvedBy?: {
    id: string;
    name: string;
    role: string;
  };
  startDate: Date;
  reviewDate: Date;
  lastReviewDate?: Date;
  alternatives: string[];
  rationale: string;
  riskAssessment: {
    risks: string[];
    mitigations: string[];
  };
  monitoring: {
    frequency: string;
    method: string;
    responsibleRole: string;
  };
  reviews: Array<{
    id: string;
    date: Date;
    reviewer: {
      id: string;
      name: string;
      role: string;
    };
    outcome: 'MAINTAINED' | 'MODIFIED' | 'DISCONTINUED';
    notes: string;
  }>;
}

interface RestrictionsLogProps {
  resident: Resident;
  restrictions: Restriction[];
  onAddRestriction: (restriction: Omit<Restriction, 'id'>) => void;
  onUpdateRestriction: (id: string, updates: Partial<Restriction>) => void;
  onReviewRestriction: (id: string, review: Restriction['reviews'][0]) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export const RestrictionsLog: React.FC<RestrictionsLogProps> = ({
  resident,
  restrictions,
  onAddRestriction,
  onUpdateRestriction,
  onReviewRestriction,
  currentUser,
}) => {
  const [form] = Form.useForm();
  const [isAddingRestriction, setIsAddingRestriction] = useState(false);
  const [selectedRestriction, setSelectedRestriction] = useState<Restriction | null>(null);

  const getTypeColor = (type: Restriction['type']) => {
    const colors: Record<Restriction['type'], string> = {
      PHYSICAL: 'red',
      CHEMICAL: 'purple',
      ENVIRONMENTAL: 'blue',
      SURVEILLANCE: 'orange'
    };
    return colors[type];
  };

  const columns: TableProps<Restriction>['columns'] = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => (
        <Text>{details.length > 50 ? `${details.substring(0, 50)}...` : details}</Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, restriction) => (
        <Space>
          <Tag color={restriction.approved ? 'green' : 'red'}>
            {restriction.approved ? 'Approved' : 'Pending Approval'}
          </Tag>
          {new Date() > restriction.reviewDate && (
            <Tag color="orange">Review Due</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Review Date',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, restriction) => (
        <Space>
          <Button
            type="link"
            onClick={() => setSelectedRestriction(restriction)}
          >
            View Details
          </Button>
          <Button
            type="link"
            onClick={() => handleReviewClick(restriction)}
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  const handleReviewClick = (restriction: Restriction) => {
    Modal.confirm({
      title: 'Review Restriction',
      content: (
        <Form>
          <Form.Item
            name="outcome"
            label="Review Outcome"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="MAINTAINED">Maintain</Option>
              <Option value="MODIFIED">Modify</Option>
              <Option value="DISCONTINUED">Discontinue</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="Review Notes"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = await form.validateFields();
        onReviewRestriction(restriction.id, {
          id: Math.random().toString(),
          date: new Date(),
          reviewer: currentUser,
          ...values,
        });
      },
    });
  };

  const handleAddRestriction = (values: any) => {
    onAddRestriction({
      residentId: resident.id,
      approved: false,
      startDate: new Date(),
      reviews: [],
      ...values,
    });
    setIsAddingRestriction(false);
    form.resetFields();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Important Notice"
        description="All restrictions must be the least restrictive option available and regularly reviewed to ensure they remain necessary and proportionate."
        type="warning"
        showIcon
      />

      <Card
        title="Restrictions Log"
        extra={
          <Button type="primary" onClick={() => setIsAddingRestriction(true)}>
            Add Restriction
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={restrictions}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Add Restriction"
        open={isAddingRestriction}
        onCancel={() => setIsAddingRestriction(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddRestriction}
        >
          <Form.Item
            name="type"
            label="Restriction Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="PHYSICAL">Physical Restraint</Option>
              <Option value="CHEMICAL">Chemical Restraint</Option>
              <Option value="ENVIRONMENTAL">Environmental Restriction</Option>
              <Option value="SURVEILLANCE">Surveillance</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="details"
            label="Details of Restriction"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="rationale"
            label="Rationale"
            rules={[{ required: true }]}
          >
            <TextArea 
              rows={4}
              placeholder="Explain why this restriction is necessary..."
            />
          </Form.Item>

          <Form.List name="alternatives">
            {(fields, { add, remove }) => (
              <>
                <Text strong>Alternatives Considered</Text>
                {fields.map(field => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...field}
                      rules={[{ required: true, message: 'Please input alternative or delete' }]}
                    >
                      <Input placeholder="Alternative approach" />
                    </Form.Item>
                    <Button onClick={() => remove(field.name)} type="link" danger>
                      Delete
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Add Alternative
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item
            name={['riskAssessment', 'risks']}
            label="Identified Risks"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name={['riskAssessment', 'mitigations']}
            label="Risk Mitigations"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name={['monitoring', 'frequency']}
            label="Monitoring Frequency"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={['monitoring', 'method']}
            label="Monitoring Method"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={['monitoring', 'responsibleRole']}
            label="Responsible Role"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="reviewDate"
            label="Review Date"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Restriction
              </Button>
              <Button onClick={() => setIsAddingRestriction(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Restriction Details"
        open={!!selectedRestriction}
        onCancel={() => setSelectedRestriction(null)}
        footer={null}
        width={800}
      >
        {selectedRestriction && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small" title="Basic Information">
              <p><strong>Type:</strong> {selectedRestriction.type}</p>
              <p><strong>Details:</strong> {selectedRestriction.details}</p>
              <p><strong>Rationale:</strong> {selectedRestriction.rationale}</p>
              <p><strong>Start Date:</strong> {selectedRestriction.startDate.toLocaleDateString()}</p>
              <p><strong>Review Date:</strong> {selectedRestriction.reviewDate.toLocaleDateString()}</p>
            </Card>

            <Card size="small" title="Alternatives Considered">
              <ul>
                {selectedRestriction.alternatives.map((alt, index) => (
                  <li key={index}>{alt}</li>
                ))}
              </ul>
            </Card>

            <Card size="small" title="Risk Assessment">
              <p><strong>Risks:</strong></p>
              <ul>
                {selectedRestriction.riskAssessment.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
              <p><strong>Mitigations:</strong></p>
              <ul>
                {selectedRestriction.riskAssessment.mitigations.map((mitigation, index) => (
                  <li key={index}>{mitigation}</li>
                ))}
              </ul>
            </Card>

            <Card size="small" title="Monitoring">
              <p><strong>Frequency:</strong> {selectedRestriction.monitoring.frequency}</p>
              <p><strong>Method:</strong> {selectedRestriction.monitoring.method}</p>
              <p><strong>Responsible Role:</strong> {selectedRestriction.monitoring.responsibleRole}</p>
            </Card>

            <Card size="small" title="Review History">
              <Table
                dataSource={selectedRestriction.reviews}
                columns={[
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    render: (date: Date) => date.toLocaleDateString(),
                  },
                  {
                    title: 'Reviewer',
                    render: (_, review) => `${review.reviewer.name} (${review.reviewer.role})`,
                  },
                  {
                    title: 'Outcome',
                    dataIndex: 'outcome',
                    render: (outcome) => (
                      <Tag color={
                        outcome === 'MAINTAINED' ? 'green' :
                        outcome === 'MODIFIED' ? 'orange' :
                        'red'
                      }>
                        {outcome}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Notes',
                    dataIndex: 'notes',
                  },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Space>
        )}
      </Modal>
    </Space>
  );
};


