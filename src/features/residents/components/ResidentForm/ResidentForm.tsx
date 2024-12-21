import React from 'react';
import { Form, Input, DatePicker, Select, Switch, Space, Button, Divider } from 'antd';
import type { Resident, CareType, MobilityStatus, CommunicationNeeds } from '../../types/resident.types';

const { Option } = Select;

interface ResidentFormProps {
  initialValues?: Partial<Resident>;
  onSubmit: (values: Partial<Resident>) => void;
  onCancel?: () => void;
}

export const ResidentForm: React.FC<ResidentFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const careTypes: CareType[] = [
    'RESIDENTIAL',
    'NURSING',
    'DEMENTIA',
    'RESPITE',
    'PALLIATIVE',
    'DUAL',
    'SPECIALIST'
  ];

  const mobilityLevels = [
    'INDEPENDENT',
    'REQUIRES_AID',
    'WHEELCHAIR',
    'BED_BOUND'
  ];

  const transferAssistanceLevels = [
    'NONE',
    'ONE_PERSON',
    'TWO_PERSON',
    'HOIST'
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
      style={{ maxWidth: 800 }}
    >
      <Divider>Personal Information</Divider>
      
      <Space direction="horizontal" size="middle" style={{ display: 'flex', marginBottom: 24 }}>
        <Form.Item name="title" label="Title">
          <Select style={{ width: 100 }}>
            <Option value="Mr">Mr</Option>
            <Option value="Mrs">Mrs</Option>
            <Option value="Miss">Miss</Option>
            <Option value="Ms">Ms</Option>
            <Option value="Dr">Dr</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input />
        </Form.Item>
      </Space>

      <Space direction="horizontal" size="middle" style={{ display: 'flex', marginBottom: 24 }}>
        <Form.Item
          name="dateOfBirth"
          label="Date of Birth"
          rules={[{ required: true, message: 'Please select date of birth' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="nhsNumber"
          label="NHS Number"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="roomNumber"
          label="Room Number"
        >
          <Input />
        </Form.Item>
      </Space>

      <Divider>Care Details</Divider>

      <Space direction="horizontal" size="middle" style={{ display: 'flex', marginBottom: 24 }}>
        <Form.Item
          name="careType"
          label="Care Type"
          rules={[{ required: true, message: 'Please select care type' }]}
        >
          <Select style={{ width: 200 }}>
            {careTypes.map(type => (
              <Option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="admissionDate"
          label="Admission Date"
          rules={[{ required: true, message: 'Please select admission date' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="dischargeDate"
          label="Discharge Date"
        >
          <DatePicker />
        </Form.Item>
      </Space>

      <Divider>Mobility & Communication</Divider>

      <Form.Item label="Mobility Status" style={{ marginBottom: 0 }}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Form.Item
            name={['mobilityStatus', 'level']}
            rules={[{ required: true, message: 'Please select mobility level' }]}
          >
            <Select placeholder="Select mobility level">
              {mobilityLevels.map(level => (
                <Option key={level} value={level}>
                  {level.replace('_', ' ')}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name={['mobilityStatus', 'transferAssistance']}>
            <Select placeholder="Select transfer assistance required">
              {transferAssistanceLevels.map(level => (
                <Option key={level} value={level}>
                  {level.replace('_', ' ')}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item label="Communication Needs" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Form.Item
            name={['communicationNeeds', 'primaryLanguage']}
            rules={[{ required: true, message: 'Please enter primary language' }]}
          >
            <Input placeholder="Primary Language" />
          </Form.Item>

          <Space>
            <Form.Item
              name={['communicationNeeds', 'hearingImpairment']}
              valuePropName="checked"
            >
              <Switch checkedChildren="Hearing Impaired" unCheckedChildren="Hearing Normal" />
            </Form.Item>

            <Form.Item
              name={['communicationNeeds', 'visualImpairment']}
              valuePropName="checked"
            >
              <Switch checkedChildren="Visually Impaired" unCheckedChildren="Vision Normal" />
            </Form.Item>

            <Form.Item
              name={['communicationNeeds', 'interpreterRequired']}
              valuePropName="checked"
            >
              <Switch checkedChildren="Interpreter Needed" unCheckedChildren="No Interpreter" />
            </Form.Item>
          </Space>
        </Space>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Save Resident
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};


