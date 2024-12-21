import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, TimePicker } from 'antd';
import type { TableProps } from 'antd';
import type { Resident } from '../../types/resident.types';

const { Option } = Select;
const { TextArea } = Input;

export interface Medication {
  id: string;
  residentId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: 'ORAL' | 'TOPICAL' | 'INJECTION' | 'INHALED' | 'OTHER';
  startDate: Date;
  endDate?: Date;
  instructions: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';
  prescribedBy: string;
  lastUpdated: Date;
  requiresConsent: boolean;
  consentStatus?: 'PENDING' | 'APPROVED' | 'DENIED';
  sideEffects?: string[];
  interactions?: string[];
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED' | 'REFUSED';
  administeredBy?: {
    id: string;
    name: string;
  };
  administeredAt?: Date;
  notes?: string;
}

interface MedicationTrackerProps {
  resident: Resident;
  medications: Medication[];
  schedule: MedicationSchedule[];
  onAddMedication: (medication: Omit<Medication, 'id' | 'lastUpdated'>) => void;
  onUpdateSchedule: (scheduleId: string, update: Partial<MedicationSchedule>) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  loading?: boolean;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  resident,
  medications,
  schedule,
  onAddMedication,
  onUpdateSchedule,
  currentUser,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MedicationSchedule | null>(null);

  const getStatusColor = (status: Medication['status'] | MedicationSchedule['status']) => {
    const colors: Record<string, string> = {
      ACTIVE: 'green',
      DISCONTINUED: 'red',
      COMPLETED: 'blue',
      SCHEDULED: 'blue',
      ADMINISTERED: 'green',
      MISSED: 'red',
      REFUSED: 'orange',
      PENDING: 'gold',
      APPROVED: 'green',
      DENIED: 'red'
    };
    return colors[status];
  };

  const medicationColumns: TableProps<Medication>['columns'] = [
    {
      title: 'Medication',
      dataIndex: 'name',
      key: 'name',
      render: (name, medication) => (
        <Space direction="vertical" size={0}>
          <span>{name}</span>
          <small>{medication.dosage}</small>
        </Space>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      width: 120,
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 150,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, medication) => (
        <Space>
          <Tag color={getStatusColor(medication.status)}>{medication.status}</Tag>
          {medication.requiresConsent && medication.consentStatus && (
            <Tag color={getStatusColor(medication.consentStatus)}>
              Consent: {medication.consentStatus}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, medication) => (
        <Space direction="vertical" size={0}>
          <small>Start: {medication.startDate.toLocaleDateString()}</small>
          {medication.endDate && (
            <small>End: {medication.endDate.toLocaleDateString()}</small>
          )}
        </Space>
      ),
    },
  ];

  const scheduleColumns: TableProps<MedicationSchedule>['columns'] = [
    {
      title: 'Time',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: (time: Date) => time.toLocaleTimeString(),
      sorter: (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime(),
    },
    {
      title: 'Medication',
      key: 'medication',
      render: (_, schedule) => {
        const medication = medications.find(m => m.id === schedule.medicationId);
        return medication ? (
          <Space direction="vertical" size={0}>
            <span>{medication.name}</span>
            <small>{medication.dosage}</small>
          </Space>
        ) : 'Unknown Medication';
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, schedule) => (
        <Tag color={getStatusColor(schedule.status)}>{schedule.status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, schedule) => (
        <Space>
          {schedule.status === 'SCHEDULED' && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => handleAdminister(schedule)}
              >
                Administer
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleMissed(schedule)}
              >
                Mark Missed
              </Button>
            </>
          )}
          <Button
            size="small"
            type="link"
            onClick={() => setSelectedSchedule(schedule)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdminister = (schedule: MedicationSchedule) => {
    onUpdateSchedule(schedule.id, {
      status: 'ADMINISTERED',
      administeredBy: currentUser,
      administeredAt: new Date(),
    });
  };

  const handleMissed = (schedule: MedicationSchedule) => {
    Modal.confirm({
      title: 'Mark as Missed',
      content: 'Are you sure you want to mark this medication as missed?',
      onOk: () => {
        onUpdateSchedule(schedule.id, {
          status: 'MISSED',
        });
      },
    });
  };

  const handleAddMedication = (values: any) => {
    onAddMedication({
      residentId: resident.id,
      ...values,
      status: 'ACTIVE',
    });
    setIsAddingMedication(false);
    form.resetFields();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title="Current Medications"
        extra={
          <Button type="primary" onClick={() => setIsAddingMedication(true)}>
            Add Medication
          </Button>
        }
        loading={loading}
      >
        <Table
          columns={medicationColumns}
          dataSource={medications.filter(m => m.status === 'ACTIVE')}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title="Today's Schedule" loading={loading}>
        <Table
          columns={scheduleColumns}
          dataSource={schedule}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="Add Medication"
        open={isAddingMedication}
        onCancel={() => setIsAddingMedication(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMedication}
        >
          <Form.Item
            name="name"
            label="Medication Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dosage"
            label="Dosage"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="route"
            label="Route"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="ORAL">Oral</Option>
              <Option value="TOPICAL">Topical</Option>
              <Option value="INJECTION">Injection</Option>
              <Option value="INHALED">Inhaled</Option>
              <Option value="OTHER">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Frequency"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Instructions"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="requiresConsent"
            label="Requires Consent"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Medication
              </Button>
              <Button onClick={() => setIsAddingMedication(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Medication Schedule Details"
        open={!!selectedSchedule}
        onCancel={() => setSelectedSchedule(null)}
        footer={null}
      >
        {selectedSchedule && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <p><strong>Status:</strong> {selectedSchedule.status}</p>
            {selectedSchedule.administeredBy && (
              <p><strong>Administered By:</strong> {selectedSchedule.administeredBy.name}</p>
            )}
            {selectedSchedule.administeredAt && (
              <p><strong>Administered At:</strong> {selectedSchedule.administeredAt.toLocaleString()}</p>
            )}
            {selectedSchedule.notes && (
              <p><strong>Notes:</strong> {selectedSchedule.notes}</p>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  );
};


