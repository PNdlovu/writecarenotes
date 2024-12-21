import React, { useState } from 'react';
import { Table, Input, Select, Space, Button, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import type { Resident, CareType, ResidentStatus } from '../../types/resident.types';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface ResidentListProps {
  residents: Resident[];
  onViewResident: (resident: Resident) => void;
  onEditResident?: (resident: Resident) => void;
  loading?: boolean;
}

export const ResidentList: React.FC<ResidentListProps> = ({
  residents,
  onViewResident,
  onEditResident,
  loading = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [careTypeFilter, setCareTypeFilter] = useState<CareType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ResidentStatus | 'ALL'>('ALL');

  const getStatusColor = (status: ResidentStatus) => {
    const colors: Record<ResidentStatus, string> = {
      ACTIVE: 'green',
      DISCHARGED: 'grey',
      TEMPORARY: 'blue',
      HOSPITAL: 'orange',
      DECEASED: 'black'
    };
    return colors[status];
  };

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      searchText === '' ||
      `${resident.firstName} ${resident.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.nhsNumber?.includes(searchText) ||
      resident.roomNumber?.includes(searchText);

    const matchesCareType = careTypeFilter === 'ALL' || resident.careType === careTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || resident.status === statusFilter;

    return matchesSearch && matchesCareType && matchesStatus;
  });

  const columns: TableProps<Resident>['columns'] = [
    {
      title: 'Name',
      key: 'name',
      render: (_, resident) => (
        <Space direction="vertical" size={0}>
          <Text strong>{`${resident.title || ''} ${resident.firstName} ${resident.lastName}`}</Text>
          {resident.nhsNumber && <Text type="secondary">NHS: {resident.nhsNumber}</Text>}
        </Space>
      ),
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Room',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      width: 100,
    },
    {
      title: 'Care Type',
      dataIndex: 'careType',
      key: 'careType',
      render: (careType: CareType) => (
        <Tag color="blue">{careType.charAt(0) + careType.slice(1).toLowerCase().replace('_', ' ')}</Tag>
      ),
      filters: [
        { text: 'Residential', value: 'RESIDENTIAL' },
        { text: 'Nursing', value: 'NURSING' },
        { text: 'Dementia', value: 'DEMENTIA' },
        { text: 'Respite', value: 'RESPITE' },
        { text: 'Palliative', value: 'PALLIATIVE' },
        { text: 'Dual', value: 'DUAL' },
        { text: 'Specialist', value: 'SPECIALIST' },
      ],
      onFilter: (value, record) => record.careType === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ResidentStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Admission Date',
      dataIndex: 'admissionDate',
      key: 'admissionDate',
      render: (date: Date) => date.toLocaleDateString(),
      sorter: (a, b) => a.admissionDate.getTime() - b.admissionDate.getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, resident) => (
        <Space>
          <Button type="link" onClick={() => onViewResident(resident)}>
            View
          </Button>
          {onEditResident && (
            <Button type="link" onClick={() => onEditResident(resident)}>
              Edit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Search
            placeholder="Search by name, NHS number, or room"
            allowClear
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            defaultValue="ALL"
            style={{ width: 150 }}
            onChange={value => setCareTypeFilter(value as CareType | 'ALL')}
          >
            <Option value="ALL">All Care Types</Option>
            <Option value="RESIDENTIAL">Residential</Option>
            <Option value="NURSING">Nursing</Option>
            <Option value="DEMENTIA">Dementia</Option>
            <Option value="RESPITE">Respite</Option>
            <Option value="PALLIATIVE">Palliative</Option>
            <Option value="DUAL">Dual</Option>
            <Option value="SPECIALIST">Specialist</Option>
          </Select>
          <Select
            defaultValue="ALL"
            style={{ width: 150 }}
            onChange={value => setStatusFilter(value as ResidentStatus | 'ALL')}
          >
            <Option value="ALL">All Statuses</Option>
            <Option value="ACTIVE">Active</Option>
            <Option value="DISCHARGED">Discharged</Option>
            <Option value="TEMPORARY">Temporary</Option>
            <Option value="HOSPITAL">Hospital</Option>
            <Option value="DECEASED">Deceased</Option>
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredResidents}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredResidents.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} residents`,
        }}
      />
    </Space>
  );
};


