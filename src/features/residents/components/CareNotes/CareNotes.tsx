import React, { useState } from 'react';
import { Card, List, Button, Input, Form, Select, DatePicker, Space, Tag, Typography, Modal } from 'antd';
import type { Resident } from '../../types/resident.types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export interface CareNote {
  id: string;
  residentId: string;
  category: 'GENERAL' | 'MEDICAL' | 'BEHAVIOR' | 'MOOD' | 'NUTRITION' | 'ACTIVITY' | 'INCIDENT';
  content: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  mood?: 'HAPPY' | 'NEUTRAL' | 'SAD' | 'AGITATED' | 'CALM';
  followUpRequired?: boolean;
  followUpDate?: Date;
  attachments?: Array<{
    id: string;
    type: 'IMAGE' | 'DOCUMENT';
    url: string;
  }>;
}

interface CareNotesProps {
  resident: Resident;
  careNotes: CareNote[];
  onAddNote: (note: Omit<CareNote, 'id' | 'createdAt'>) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  loading?: boolean;
}

export const CareNotes: React.FC<CareNotesProps> = ({
  resident,
  careNotes,
  onAddNote,
  currentUser,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isAddingNote, setIsAddingNote] = useState(false);

  const getCategoryColor = (category: CareNote['category']) => {
    const colors: Record<CareNote['category'], string> = {
      GENERAL: 'default',
      MEDICAL: 'red',
      BEHAVIOR: 'purple',
      MOOD: 'blue',
      NUTRITION: 'green',
      ACTIVITY: 'orange',
      INCIDENT: 'magenta'
    };
    return colors[category];
  };

  const getMoodEmoji = (mood?: CareNote['mood']) => {
    if (!mood) return '';
    const emojis: Record<NonNullable<CareNote['mood']>, string> = {
      HAPPY: '😊',
      NEUTRAL: '😐',
      SAD: '😢',
      AGITATED: '😤',
      CALM: '😌'
    };
    return emojis[mood];
  };

  const handleSubmit = (values: any) => {
    onAddNote({
      residentId: resident.id,
      createdBy: currentUser,
      ...values,
    });
    setIsAddingNote(false);
    form.resetFields();
  };

  const AddNoteModal = () => (
    <Modal
      title="Add Care Note"
      open={isAddingNote}
      onCancel={() => setIsAddingNote(false)}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          category: 'GENERAL',
          followUpRequired: false,
        }}
      >
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="GENERAL">General</Option>
            <Option value="MEDICAL">Medical</Option>
            <Option value="BEHAVIOR">Behavior</Option>
            <Option value="MOOD">Mood</Option>
            <Option value="NUTRITION">Nutrition</Option>
            <Option value="ACTIVITY">Activity</Option>
            <Option value="INCIDENT">Incident</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="mood"
          label="Resident's Mood"
        >
          <Select allowClear>
            <Option value="HAPPY">Happy 😊</Option>
            <Option value="NEUTRAL">Neutral 😐</Option>
            <Option value="SAD">Sad 😢</Option>
            <Option value="AGITATED">Agitated 😤</Option>
            <Option value="CALM">Calm 😌</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="Note Content"
          rules={[{ required: true, message: 'Please enter note content' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="followUpRequired"
          valuePropName="checked"
        >
          <Select>
            <Option value={false}>No Follow-up Required</Option>
            <Option value={true}>Follow-up Required</Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => 
            prevValues.followUpRequired !== currentValues.followUpRequired
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('followUpRequired') ? (
              <Form.Item
                name="followUpDate"
                label="Follow-up Date"
                rules={[{ required: true, message: 'Please select follow-up date' }]}
              >
                <DatePicker />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Add Note
            </Button>
            <Button onClick={() => setIsAddingNote(false)}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <Card
      title={`Care Notes - ${resident.firstName} ${resident.lastName}`}
      extra={
        <Button type="primary" onClick={() => setIsAddingNote(true)}>
          Add Note
        </Button>
      }
      loading={loading}
    >
      <List
        dataSource={careNotes}
        renderItem={(note) => (
          <List.Item>
            <Card style={{ width: '100%' }} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Tag color={getCategoryColor(note.category)}>
                      {note.category}
                    </Tag>
                    {note.mood && (
                      <Tag color="blue">
                        {getMoodEmoji(note.mood)} {note.mood}
                      </Tag>
                    )}
                    {note.followUpRequired && (
                      <Tag color="red">
                        Follow-up: {note.followUpDate?.toLocaleDateString()}
                      </Tag>
                    )}
                  </Space>
                  <Text type="secondary">
                    {note.createdAt.toLocaleString()}
                  </Text>
                </Space>

                <Text>{note.content}</Text>

                <Text type="secondary">
                  By: {note.createdBy.name} ({note.createdBy.role})
                </Text>

                {note.attachments && note.attachments.length > 0 && (
                  <Space>
                    {note.attachments.map(attachment => (
                      <Button
                        key={attachment.id}
                        type="link"
                        icon={attachment.type === 'IMAGE' ? '📷' : '📄'}
                        href={attachment.url}
                        target="_blank"
                      >
                        View {attachment.type.toLowerCase()}
                      </Button>
                    ))}
                  </Space>
                )}
              </Space>
            </Card>
          </List.Item>
        )}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} notes`,
        }}
      />

      <AddNoteModal />
    </Card>
  );
};


