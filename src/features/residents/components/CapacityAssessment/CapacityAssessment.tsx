import React, { useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Space, Button, Radio, Divider, Typography, Alert } from 'antd';
import type { Resident } from '../../types/resident.types';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface CapacityAssessment {
  id: string;
  residentId: string;
  assessmentDate: Date;
  assessor: {
    id: string;
    name: string;
    role: string;
  };
  decisionType: string;
  hasCapacity: boolean;
  evidenceOfCapacity?: string[];
  evidenceOfIncapacity?: string[];
  supportProvided: string[];
  bestInterestsConsiderations?: string[];
  consultedParties?: Array<{
    name: string;
    role: string;
    opinion: string;
  }>;
  recommendations: string[];
  nextReviewDate: Date;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
  }>;
}

interface CapacityAssessmentProps {
  resident: Resident;
  currentAssessment?: CapacityAssessment;
  onSaveAssessment: (assessment: Omit<CapacityAssessment, 'id'>) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export const CapacityAssessment: React.FC<CapacityAssessmentProps> = ({
  resident,
  currentAssessment,
  onSaveAssessment,
  currentUser,
}) => {
  const [form] = Form.useForm();
  const [hasCapacity, setHasCapacity] = useState<boolean | undefined>(
    currentAssessment?.hasCapacity
  );

  const decisionTypes = [
    'PERSONAL_CARE',
    'MEDICAL_TREATMENT',
    'MEDICATION_MANAGEMENT',
    'FINANCIAL_DECISIONS',
    'ACCOMMODATION',
    'SOCIAL_CONTACTS',
    'ACTIVITIES',
    'SAFETY_MEASURES',
  ];

  const handleSubmit = (values: any) => {
    onSaveAssessment({
      residentId: resident.id,
      assessor: currentUser,
      ...values,
      assessmentDate: new Date(),
    });
    form.resetFields();
  };

  return (
    <Card title="Mental Capacity Assessment">
      <Alert
        message="Important Notice"
        description={
          <Text>
            This assessment follows the principles of the Mental Capacity Act 2005:
            <ul>
              <li>Assume capacity unless proven otherwise</li>
              <li>Support individuals to make their own decisions</li>
              <li>People have the right to make unwise decisions</li>
              <li>Best interests</li>
              <li>Least restrictive option</li>
            </ul>
          </Text>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={currentAssessment}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="decisionType"
          label="What is the specific decision to be made?"
          rules={[{ required: true }]}
        >
          <Select>
            {decisionTypes.map(type => (
              <Option key={type} value={type}>
                {type.replace('_', ' ')}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>Stage 1: Diagnostic Test</Divider>

        <Form.Item
          name="diagnosticAssessment"
          label="Is there an impairment of, or disturbance in the functioning of, the person's mind or brain?"
          rules={[{ required: true }]}
        >
          <TextArea
            rows={4}
            placeholder="Describe any diagnosed conditions, observed impairments, or disturbances..."
          />
        </Form.Item>

        <Divider>Stage 2: Functional Test</Divider>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={5}>Can the person:</Title>

          <Form.Item
            name="understandInformation"
            label="1. Understand information relevant to the decision?"
            rules={[{ required: true }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
              <TextArea
                rows={2}
                placeholder="Provide evidence..."
              />
            </Space>
          </Form.Item>

          <Form.Item
            name="retainInformation"
            label="2. Retain the information long enough to make the decision?"
            rules={[{ required: true }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
              <TextArea
                rows={2}
                placeholder="Provide evidence..."
              />
            </Space>
          </Form.Item>

          <Form.Item
            name="weighInformation"
            label="3. Weigh up the information as part of the decision-making process?"
            rules={[{ required: true }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
              <TextArea
                rows={2}
                placeholder="Provide evidence..."
              />
            </Space>
          </Form.Item>

          <Form.Item
            name="communicateDecision"
            label="4. Communicate their decision?"
            rules={[{ required: true }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
              <TextArea
                rows={2}
                placeholder="Provide evidence..."
              />
            </Space>
          </Form.Item>
        </Space>

        <Form.Item
          name="supportProvided"
          label="What support was provided to help the person make the decision?"
          rules={[{ required: true }]}
        >
          <TextArea
            rows={4}
            placeholder="List all support provided..."
          />
        </Form.Item>

        <Form.Item
          name="hasCapacity"
          label="Capacity Assessment Outcome"
          rules={[{ required: true }]}
        >
          <Radio.Group onChange={e => setHasCapacity(e.target.value)}>
            <Radio value={true}>Has Capacity</Radio>
            <Radio value={false}>Lacks Capacity</Radio>
          </Radio.Group>
        </Form.Item>

        {hasCapacity === false && (
          <>
            <Divider>Best Interests Decision Making</Divider>

            <Form.Item
              name="bestInterestsConsiderations"
              label="What factors have been considered in determining best interests?"
              rules={[{ required: true }]}
            >
              <TextArea
                rows={4}
                placeholder="Consider past and present wishes, beliefs and values, and other factors the person would likely consider if they had capacity..."
              />
            </Form.Item>

            <Form.List name="consultedParties">
              {(fields, { add, remove }) => (
                <>
                  <Title level={5}>Consulted Parties</Title>
                  {fields.map(field => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        rules={[{ required: true, message: 'Name is required' }]}
                      >
                        <Input placeholder="Name" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'role']}
                        rules={[{ required: true, message: 'Role is required' }]}
                      >
                        <Input placeholder="Role/Relationship" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'opinion']}
                        rules={[{ required: true, message: 'Opinion is required' }]}
                      >
                        <Input placeholder="Their opinion" />
                      </Form.Item>
                      <Button onClick={() => remove(field.name)} type="link" danger>
                        Delete
                      </Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Consulted Party
                  </Button>
                </>
              )}
            </Form.List>
          </>
        )}

        <Divider>Recommendations and Review</Divider>

        <Form.Item
          name="recommendations"
          label="Recommendations and Actions"
          rules={[{ required: true }]}
        >
          <TextArea
            rows={4}
            placeholder="List all recommendations and required actions..."
          />
        </Form.Item>

        <Form.Item
          name="nextReviewDate"
          label="Next Review Date"
          rules={[{ required: true }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Assessment
            </Button>
            <Button onClick={() => form.resetFields()}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};


