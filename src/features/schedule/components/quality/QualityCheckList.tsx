import React, { useState } from 'react';
import { QualityCheck, Staff } from '../../types/handover';
import { Button, Card, Checkbox, Select, Badge } from '@/components/ui';
import { useHandoverSession } from '../../hooks/useHandoverSession';

interface QualityCheckListProps {
  sessionId: string;
  checks: QualityCheck[];
  currentStaff: Staff;
  onCheckComplete: (checkId: string, status: 'PASSED' | 'FAILED') => Promise<void>;
}

const REQUIRED_CHECKS = [
  {
    type: 'MEDICATION_REVIEW',
    description: 'All medication charts reviewed and signed',
    category: 'CLINICAL',
  },
  {
    type: 'RESIDENT_COUNT',
    description: 'Resident count verified and documented',
    category: 'SAFETY',
  },
  {
    type: 'INCIDENT_REVIEW',
    description: 'All incidents documented and reported',
    category: 'COMPLIANCE',
  },
  {
    type: 'STAFF_HANDOVER',
    description: 'All staff briefed on key updates',
    category: 'COMMUNICATION',
  },
  {
    type: 'EQUIPMENT_CHECK',
    description: 'Critical equipment checked and functional',
    category: 'SAFETY',
  },
];

export const QualityCheckList: React.FC<QualityCheckListProps> = ({
  sessionId,
  checks,
  currentStaff,
  onCheckComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const { addQualityCheck } = useHandoverSession(sessionId);

  const categories = ['ALL', ...new Set(REQUIRED_CHECKS.map(check => check.category))];

  const filteredChecks = checks.filter(check => 
    selectedCategory === 'ALL' || check.category === selectedCategory
  );

  const getCheckStatus = (type: string) => {
    const check = checks.find(c => c.type === type);
    return check?.status || 'PENDING';
  };

  const handleAddCheck = async (check: typeof REQUIRED_CHECKS[0]) => {
    await addQualityCheck({
      type: check.type,
      description: check.description,
      category: check.category,
      status: 'PENDING',
      checkedBy: currentStaff,
    });
  };

  const renderStatusBadge = (status: string) => {
    const colors = {
      PASSED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quality Checks</h3>
        <Select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-48"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4">
        {REQUIRED_CHECKS.filter(check => 
          selectedCategory === 'ALL' || check.category === selectedCategory
        ).map(check => {
          const status = getCheckStatus(check.type);
          const existingCheck = checks.find(c => c.type === check.type);

          return (
            <Card key={check.type} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{check.description}</div>
                  <div className="text-sm text-gray-500">
                    Category: {check.category}
                  </div>
                  {existingCheck?.checkedBy && (
                    <div className="text-sm text-gray-500">
                      Checked by: {existingCheck.checkedBy.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(status)}
                  {status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onCheckComplete(check.type, 'PASSED')}
                      >
                        Pass
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onCheckComplete(check.type, 'FAILED')}
                      >
                        Fail
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {status === 'FAILED' && existingCheck?.notes && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
                  <strong>Failure Notes:</strong> {existingCheck.notes}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Overall Progress: </span>
            {checks.filter(c => c.status === 'PASSED').length} of {REQUIRED_CHECKS.length} complete
          </div>
          {checks.some(c => c.status === 'FAILED') && (
            <Badge className="bg-red-100 text-red-800">
              Action Required
            </Badge>
          )}
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ 
              width: `${(checks.filter(c => c.status === 'PASSED').length / REQUIRED_CHECKS.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};
